const Transaksi = require('../models/Transaksi')
const TransaksiDetail = require('../models/TransaksiDetail')
const Barang = require('../models/Barang')
const Periode = require('../models/Periode')
const { generateKodeTransaksi } = require('../services/codeGenerator')
const { paginate, paginationResponse, calculateProfit } = require('../utils/helpers')

/**
 * Get all Transaksi (paginated, filterable by periode and dapur)
 * GET /api/v1/transaksi
 */
const getAllTransaksi = async (req, res) => {
    try {
        const { page, limit, skip } = paginate(req.query.page, req.query.limit)
        const { periode_id, dapur_id, status, tanggal_mulai, tanggal_selesai } = req.query

        // Build query
        const query = {}
        if (periode_id) query.periode_id = periode_id
        if (dapur_id) query.dapur_id = dapur_id
        if (status) query.status = status
        if (tanggal_mulai || tanggal_selesai) {
            query.tanggal = {}
            if (tanggal_mulai) query.tanggal.$gte = new Date(tanggal_mulai)
            if (tanggal_selesai) query.tanggal.$lte = new Date(tanggal_selesai)
        }

        const [data, totalDocs] = await Promise.all([
            Transaksi.find(query)
                .populate('periode_id', 'nama_periode')
                .populate('dapur_id', 'kode_dapur nama_dapur')
                .populate('created_by', 'username')
                .sort({ tanggal: -1 })
                .skip(skip)
                .limit(limit),
            Transaksi.countDocuments(query)
        ])

        res.status(200).json({
            success: true,
            ...paginationResponse(data, totalDocs, page, limit)
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transaksi list',
            error: error.message
        })
    }
}

/**
 * Get Transaksi by ID with details
 * GET /api/v1/transaksi/:id
 */
const getTransaksiById = async (req, res) => {
    try {
        const transaksi = await Transaksi.findById(req.params.id)
            .populate('periode_id', 'nama_periode tanggal_mulai tanggal_selesai')
            .populate('dapur_id', 'kode_dapur nama_dapur alamat')
            .populate('created_by', 'username')

        if (!transaksi) {
            return res.status(404).json({
                success: false,
                message: 'Transaksi not found'
            })
        }

        // Get transaction details
        const details = await TransaksiDetail.find({ transaksi_id: transaksi._id })
            .populate('barang_id', 'nama_barang satuan')
            .populate('ud_id', 'kode_ud nama_ud')

        res.status(200).json({
            success: true,
            data: {
                ...transaksi.toObject(),
                items: details
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transaksi',
            error: error.message
        })
    }
}

/**
 * Create new Transaksi
 * POST /api/v1/transaksi
 */
const createTransaksi = async (req, res) => {
    try {
        const { periode_id, dapur_id, tanggal, items } = req.body

        if (!periode_id || !dapur_id) {
            return res.status(400).json({
                success: false,
                message: 'periode_id and dapur_id are required'
            })
        }

        // Check if periode is closed
        const periode = await Periode.findById(periode_id)
        if (!periode) {
            return res.status(404).json({
                success: false,
                message: 'Periode not found'
            })
        }
        if (periode.isClosed) {
            return res.status(400).json({
                success: false,
                message: 'Cannot create transaksi in a closed periode'
            })
        }

        // Generate kode_transaksi
        const kode_transaksi = await generateKodeTransaksi(tanggal || new Date())

        // Create transaksi header
        const transaksi = await Transaksi.create({
            kode_transaksi,
            periode_id,
            dapur_id,
            tanggal: tanggal || new Date(),
            created_by: req.user._id
        })

        // Add items if provided
        let totalHargaJual = 0
        let totalHargaModal = 0

        if (items && items.length > 0) {
            const detailsToCreate = []

            for (const item of items) {
                const barang = await Barang.findById(item.barang_id)
                if (!barang) continue

                const { subtotal_jual, subtotal_modal, keuntungan } = calculateProfit(
                    barang.harga_jual,
                    barang.harga_modal,
                    item.qty
                )

                detailsToCreate.push({
                    transaksi_id: transaksi._id,
                    barang_id: barang._id,
                    ud_id: barang.ud_id,
                    qty: item.qty,
                    harga_jual: barang.harga_jual,
                    harga_modal: barang.harga_modal,
                    subtotal_jual,
                    subtotal_modal,
                    keuntungan
                })

                totalHargaJual += subtotal_jual
                totalHargaModal += subtotal_modal
            }

            await TransaksiDetail.insertMany(detailsToCreate)

            // Update transaksi totals
            transaksi.total_harga_jual = totalHargaJual
            transaksi.total_harga_modal = totalHargaModal
            transaksi.total_keuntungan = totalHargaJual - totalHargaModal
            await transaksi.save()
        }

        const populatedTransaksi = await Transaksi.findById(transaksi._id)
            .populate('periode_id', 'nama_periode')
            .populate('dapur_id', 'kode_dapur nama_dapur')
            .populate('created_by', 'username')

        res.status(201).json({
            success: true,
            message: 'Transaksi created successfully',
            data: populatedTransaksi
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create transaksi',
            error: error.message
        })
    }
}

/**
 * Update Transaksi
 * PUT /api/v1/transaksi/:id
 */
const updateTransaksi = async (req, res) => {
    try {
        const { periode_id, dapur_id, tanggal, items } = req.body

        const transaksi = await Transaksi.findById(req.params.id)
        if (!transaksi) {
            return res.status(404).json({
                success: false,
                message: 'Transaksi not found'
            })
        }

        // Cannot update completed or cancelled transaksi
        if (transaksi.status !== 'draft') {
            return res.status(400).json({
                success: false,
                message: 'Cannot update a completed or cancelled transaksi'
            })
        }

        // Update header fields
        if (periode_id) transaksi.periode_id = periode_id
        if (dapur_id) transaksi.dapur_id = dapur_id
        if (tanggal) transaksi.tanggal = tanggal

        // Update items if provided
        if (items && items.length > 0) {
            // Delete existing details
            await TransaksiDetail.deleteMany({ transaksi_id: transaksi._id })

            const detailsToCreate = []
            let totalHargaJual = 0
            let totalHargaModal = 0

            for (const item of items) {
                const barang = await Barang.findById(item.barang_id)
                if (!barang) continue

                const { subtotal_jual, subtotal_modal, keuntungan } = calculateProfit(
                    barang.harga_jual,
                    barang.harga_modal,
                    item.qty
                )

                detailsToCreate.push({
                    transaksi_id: transaksi._id,
                    barang_id: barang._id,
                    ud_id: barang.ud_id,
                    qty: item.qty,
                    harga_jual: barang.harga_jual,
                    harga_modal: barang.harga_modal,
                    subtotal_jual,
                    subtotal_modal,
                    keuntungan
                })

                totalHargaJual += subtotal_jual
                totalHargaModal += subtotal_modal
            }

            await TransaksiDetail.insertMany(detailsToCreate)

            transaksi.total_harga_jual = totalHargaJual
            transaksi.total_harga_modal = totalHargaModal
            transaksi.total_keuntungan = totalHargaJual - totalHargaModal
        }

        await transaksi.save()

        const populatedTransaksi = await Transaksi.findById(transaksi._id)
            .populate('periode_id', 'nama_periode')
            .populate('dapur_id', 'kode_dapur nama_dapur')
            .populate('created_by', 'username')

        res.status(200).json({
            success: true,
            message: 'Transaksi updated successfully',
            data: populatedTransaksi
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update transaksi',
            error: error.message
        })
    }
}

/**
 * Complete Transaksi
 * POST /api/v1/transaksi/:id/complete
 */
const completeTransaksi = async (req, res) => {
    try {
        const transaksi = await Transaksi.findById(req.params.id)
        if (!transaksi) {
            return res.status(404).json({
                success: false,
                message: 'Transaksi not found'
            })
        }

        if (transaksi.status !== 'draft') {
            return res.status(400).json({
                success: false,
                message: 'Only draft transaksi can be completed'
            })
        }

        // Recalculate totals from details
        const details = await TransaksiDetail.find({ transaksi_id: transaksi._id })

        let totalHargaJual = 0
        let totalHargaModal = 0

        for (const detail of details) {
            totalHargaJual += detail.subtotal_jual
            totalHargaModal += detail.subtotal_modal
        }

        transaksi.total_harga_jual = totalHargaJual
        transaksi.total_harga_modal = totalHargaModal
        transaksi.total_keuntungan = totalHargaJual - totalHargaModal
        transaksi.status = 'completed'

        await transaksi.save()

        const populatedTransaksi = await Transaksi.findById(transaksi._id)
            .populate('periode_id', 'nama_periode')
            .populate('dapur_id', 'kode_dapur nama_dapur')
            .populate('created_by', 'username')

        res.status(200).json({
            success: true,
            message: 'Transaksi completed successfully',
            data: populatedTransaksi
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to complete transaksi',
            error: error.message
        })
    }
}

/**
 * Cancel Transaksi
 * DELETE /api/v1/transaksi/:id
 */
const cancelTransaksi = async (req, res) => {
    try {
        const transaksi = await Transaksi.findById(req.params.id)
        if (!transaksi) {
            return res.status(404).json({
                success: false,
                message: 'Transaksi not found'
            })
        }

        if (transaksi.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Transaksi is already cancelled'
            })
        }

        transaksi.status = 'cancelled'
        await transaksi.save()

        res.status(200).json({
            success: true,
            message: 'Transaksi cancelled successfully',
            data: transaksi
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to cancel transaksi',
            error: error.message
        })
    }
}

module.exports = {
    getAllTransaksi,
    getTransaksiById,
    createTransaksi,
    updateTransaksi,
    completeTransaksi,
    cancelTransaksi
}
