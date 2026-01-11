const Barang = require('../models/Barang')
const { paginate, paginationResponse, sanitizeSearch } = require('../utils/helpers')

/**
 * Get all Barang (paginated, filterable by UD)
 * GET /api/v1/barang
 */
const getAllBarang = async (req, res) => {
    try {
        const { page, limit, skip } = paginate(req.query.page, req.query.limit)
        const { ud_id, search, isActive } = req.query

        // Build query
        const query = {}
        if (ud_id) query.ud_id = ud_id
        if (search) {
            query.nama_barang = { $regex: sanitizeSearch(search), $options: 'i' }
        }
        if (isActive !== undefined) {
            query.isActive = isActive === 'true'
        }

        const [data, totalDocs] = await Promise.all([
            Barang.find(query)
                .populate('ud_id', 'kode_ud nama_ud')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Barang.countDocuments(query)
        ])

        res.status(200).json({
            success: true,
            ...paginationResponse(data, totalDocs, page, limit)
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch barang list',
            error: error.message
        })
    }
}

/**
 * Search barang (autocomplete)
 * GET /api/v1/barang/search
 */
const searchBarang = async (req, res) => {
    try {
        const { q, ud_id, limit = 10 } = req.query

        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query (q) is required'
            })
        }

        const query = {
            nama_barang: { $regex: sanitizeSearch(q), $options: 'i' },
            isActive: true
        }
        if (ud_id) query.ud_id = ud_id

        const data = await Barang.find(query)
            .populate('ud_id', 'kode_ud nama_ud')
            .limit(parseInt(limit))
            .select('nama_barang satuan harga_jual harga_modal ud_id')

        res.status(200).json({
            success: true,
            data
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to search barang',
            error: error.message
        })
    }
}

/**
 * Get Barang by ID
 * GET /api/v1/barang/:id
 */
const getBarangById = async (req, res) => {
    try {
        const barang = await Barang.findById(req.params.id)
            .populate('ud_id', 'kode_ud nama_ud')

        if (!barang) {
            return res.status(404).json({
                success: false,
                message: 'Barang not found'
            })
        }

        res.status(200).json({
            success: true,
            data: barang
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch barang',
            error: error.message
        })
    }
}

/**
 * Create new Barang
 * POST /api/v1/barang
 */
const createBarang = async (req, res) => {
    try {
        const { nama_barang, satuan, harga_jual, harga_modal, ud_id } = req.body

        if (!nama_barang || !harga_jual || !ud_id) {
            return res.status(400).json({
                success: false,
                message: 'nama_barang, harga_jual, and ud_id are required'
            })
        }

        const barang = await Barang.create({
            nama_barang,
            satuan,
            harga_jual,
            harga_modal: harga_modal || 0,
            ud_id
        })

        const populatedBarang = await Barang.findById(barang._id)
            .populate('ud_id', 'kode_ud nama_ud')

        res.status(201).json({
            success: true,
            message: 'Barang created successfully',
            data: populatedBarang
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create barang',
            error: error.message
        })
    }
}

/**
 * Update Barang
 * PUT /api/v1/barang/:id
 */
const updateBarang = async (req, res) => {
    try {
        const { nama_barang, satuan, harga_jual, harga_modal, ud_id, isActive } = req.body

        const barang = await Barang.findById(req.params.id)
        if (!barang) {
            return res.status(404).json({
                success: false,
                message: 'Barang not found'
            })
        }

        // Update fields
        if (nama_barang) barang.nama_barang = nama_barang
        if (satuan) barang.satuan = satuan
        if (harga_jual !== undefined) barang.harga_jual = harga_jual
        if (harga_modal !== undefined) barang.harga_modal = harga_modal
        if (ud_id) barang.ud_id = ud_id
        if (isActive !== undefined) barang.isActive = isActive

        await barang.save()

        const populatedBarang = await Barang.findById(barang._id)
            .populate('ud_id', 'kode_ud nama_ud')

        res.status(200).json({
            success: true,
            message: 'Barang updated successfully',
            data: populatedBarang
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update barang',
            error: error.message
        })
    }
}

/**
 * Delete Barang
 * DELETE /api/v1/barang/:id
 */
const deleteBarang = async (req, res) => {
    try {
        const barang = await Barang.findById(req.params.id)
        if (!barang) {
            return res.status(404).json({
                success: false,
                message: 'Barang not found'
            })
        }

        await barang.deleteOne()

        res.status(200).json({
            success: true,
            message: 'Barang deleted successfully'
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete barang',
            error: error.message
        })
    }
}

module.exports = {
    getAllBarang,
    searchBarang,
    getBarangById,
    createBarang,
    updateBarang,
    deleteBarang
}
