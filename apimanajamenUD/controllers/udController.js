const UD = require('../models/UD')
const { generateKodeUD } = require('../services/codeGenerator')
const { paginate, paginationResponse } = require('../utils/helpers')

/**
 * Get all UD (paginated)
 * GET /api/v1/ud
 */
const getAllUD = async (req, res) => {
    try {
        const { page, limit, skip } = paginate(req.query.page, req.query.limit)
        const { search, isActive } = req.query

        // Build query
        const query = {}
        if (search) {
            query.$or = [
                { nama_ud: { $regex: search, $options: 'i' } },
                { nama_pemilik: { $regex: search, $options: 'i' } },
                { kode_ud: { $regex: search, $options: 'i' } }
            ]
        }
        if (isActive !== undefined) {
            query.isActive = isActive === 'true'
        }

        const [data, totalDocs] = await Promise.all([
            UD.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            UD.countDocuments(query)
        ])

        res.status(200).json({
            success: true,
            ...paginationResponse(data, totalDocs, page, limit)
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch UD list',
            error: error.message
        })
    }
}

/**
 * Get UD by ID
 * GET /api/v1/ud/:id
 */
const getUDById = async (req, res) => {
    try {
        const ud = await UD.findById(req.params.id)

        if (!ud) {
            return res.status(404).json({
                success: false,
                message: 'UD not found'
            })
        }

        res.status(200).json({
            success: true,
            data: ud
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch UD',
            error: error.message
        })
    }
}

/**
 * Create new UD
 * POST /api/v1/ud
 */
const createUD = async (req, res) => {
    try {
        const { nama_ud, alamat, nama_pemilik, bank, no_rekening, kbli } = req.body

        if (!nama_ud) {
            return res.status(400).json({
                success: false,
                message: 'nama_ud is required'
            })
        }

        // Generate unique kode_ud
        const kode_ud = await generateKodeUD(nama_ud)

        const ud = await UD.create({
            kode_ud,
            nama_ud,
            alamat,
            nama_pemilik,
            bank,
            no_rekening,
            kbli: kbli || []
        })

        res.status(201).json({
            success: true,
            message: 'UD created successfully',
            data: ud
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create UD',
            error: error.message
        })
    }
}

/**
 * Update UD
 * PUT /api/v1/ud/:id
 */
const updateUD = async (req, res) => {
    try {
        const { nama_ud, alamat, nama_pemilik, bank, no_rekening, kbli, isActive } = req.body

        const ud = await UD.findById(req.params.id)
        if (!ud) {
            return res.status(404).json({
                success: false,
                message: 'UD not found'
            })
        }

        // Update fields
        if (nama_ud) ud.nama_ud = nama_ud
        if (alamat !== undefined) ud.alamat = alamat
        if (nama_pemilik !== undefined) ud.nama_pemilik = nama_pemilik
        if (bank !== undefined) ud.bank = bank
        if (no_rekening !== undefined) ud.no_rekening = no_rekening
        if (kbli) ud.kbli = kbli
        if (isActive !== undefined) ud.isActive = isActive

        await ud.save()

        res.status(200).json({
            success: true,
            message: 'UD updated successfully',
            data: ud
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update UD',
            error: error.message
        })
    }
}

/**
 * Delete UD
 * DELETE /api/v1/ud/:id
 */
const deleteUD = async (req, res) => {
    try {
        const ud = await UD.findById(req.params.id)
        if (!ud) {
            return res.status(404).json({
                success: false,
                message: 'UD not found'
            })
        }

        await ud.deleteOne()

        res.status(200).json({
            success: true,
            message: 'UD deleted successfully'
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete UD',
            error: error.message
        })
    }
}

module.exports = {
    getAllUD,
    getUDById,
    createUD,
    updateUD,
    deleteUD
}
