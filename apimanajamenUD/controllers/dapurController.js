const Dapur = require('../models/Dapur')
const { generateKodeDapur } = require('../services/codeGenerator')
const { paginate, paginationResponse } = require('../utils/helpers')

/**
 * Get all Dapur
 * GET /api/v1/dapur
 */
const getAllDapur = async (req, res) => {
    try {
        const { page, limit, skip } = paginate(req.query.page, req.query.limit)
        const { search, isActive } = req.query

        // Build query
        const query = {}
        if (search) {
            query.$or = [
                { nama_dapur: { $regex: search, $options: 'i' } },
                { kode_dapur: { $regex: search, $options: 'i' } }
            ]
        }
        if (isActive !== undefined) {
            query.isActive = isActive === 'true'
        }

        const [data, totalDocs] = await Promise.all([
            Dapur.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Dapur.countDocuments(query)
        ])

        res.status(200).json({
            success: true,
            ...paginationResponse(data, totalDocs, page, limit)
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dapur list',
            error: error.message
        })
    }
}

/**
 * Get Dapur by ID
 * GET /api/v1/dapur/:id
 */
const getDapurById = async (req, res) => {
    try {
        const dapur = await Dapur.findById(req.params.id)

        if (!dapur) {
            return res.status(404).json({
                success: false,
                message: 'Dapur not found'
            })
        }

        res.status(200).json({
            success: true,
            data: dapur
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dapur',
            error: error.message
        })
    }
}

/**
 * Create new Dapur
 * POST /api/v1/dapur
 */
const createDapur = async (req, res) => {
    try {
        const { nama_dapur, alamat } = req.body

        if (!nama_dapur) {
            return res.status(400).json({
                success: false,
                message: 'nama_dapur is required'
            })
        }

        // Generate unique kode_dapur
        const kode_dapur = await generateKodeDapur(nama_dapur)

        const dapur = await Dapur.create({
            kode_dapur,
            nama_dapur,
            alamat
        })

        res.status(201).json({
            success: true,
            message: 'Dapur created successfully',
            data: dapur
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create dapur',
            error: error.message
        })
    }
}

/**
 * Update Dapur
 * PUT /api/v1/dapur/:id
 */
const updateDapur = async (req, res) => {
    try {
        const { nama_dapur, alamat, isActive } = req.body

        const dapur = await Dapur.findById(req.params.id)
        if (!dapur) {
            return res.status(404).json({
                success: false,
                message: 'Dapur not found'
            })
        }

        // Update fields
        if (nama_dapur) dapur.nama_dapur = nama_dapur
        if (alamat !== undefined) dapur.alamat = alamat
        if (isActive !== undefined) dapur.isActive = isActive

        await dapur.save()

        res.status(200).json({
            success: true,
            message: 'Dapur updated successfully',
            data: dapur
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update dapur',
            error: error.message
        })
    }
}

/**
 * Delete Dapur
 * DELETE /api/v1/dapur/:id
 */
const deleteDapur = async (req, res) => {
    try {
        const dapur = await Dapur.findById(req.params.id)
        if (!dapur) {
            return res.status(404).json({
                success: false,
                message: 'Dapur not found'
            })
        }

        await dapur.deleteOne()

        res.status(200).json({
            success: true,
            message: 'Dapur deleted successfully'
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete dapur',
            error: error.message
        })
    }
}

module.exports = {
    getAllDapur,
    getDapurById,
    createDapur,
    updateDapur,
    deleteDapur
}
