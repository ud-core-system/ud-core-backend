const Periode = require('../models/Periode')
const { paginate, paginationResponse } = require('../utils/helpers')

/**
 * Get all Periode
 * GET /api/v1/periode
 */
const getAllPeriode = async (req, res) => {
    try {
        const { page, limit, skip } = paginate(req.query.page, req.query.limit)
        const { isActive, isClosed } = req.query

        // Build query
        const query = {}
        if (isActive !== undefined) {
            query.isActive = isActive === 'true'
        }
        if (isClosed !== undefined) {
            query.isClosed = isClosed === 'true'
        }

        const [data, totalDocs] = await Promise.all([
            Periode.find(query).sort({ tanggal_mulai: -1 }).skip(skip).limit(limit),
            Periode.countDocuments(query)
        ])

        res.status(200).json({
            success: true,
            ...paginationResponse(data, totalDocs, page, limit)
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch periode list',
            error: error.message
        })
    }
}

/**
 * Get Periode by ID
 * GET /api/v1/periode/:id
 */
const getPeriodeById = async (req, res) => {
    try {
        const periode = await Periode.findById(req.params.id)

        if (!periode) {
            return res.status(404).json({
                success: false,
                message: 'Periode not found'
            })
        }

        res.status(200).json({
            success: true,
            data: periode
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch periode',
            error: error.message
        })
    }
}

/**
 * Create new Periode
 * POST /api/v1/periode
 */
const createPeriode = async (req, res) => {
    try {
        const { nama_periode, tanggal_mulai, tanggal_selesai } = req.body

        if (!nama_periode || !tanggal_mulai || !tanggal_selesai) {
            return res.status(400).json({
                success: false,
                message: 'nama_periode, tanggal_mulai, and tanggal_selesai are required'
            })
        }

        // Validate dates
        const startDate = new Date(tanggal_mulai)
        const endDate = new Date(tanggal_selesai)

        if (endDate <= startDate) {
            return res.status(400).json({
                success: false,
                message: 'tanggal_selesai must be after tanggal_mulai'
            })
        }

        const periode = await Periode.create({
            nama_periode,
            tanggal_mulai: startDate,
            tanggal_selesai: endDate
        })

        res.status(201).json({
            success: true,
            message: 'Periode created successfully',
            data: periode
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create periode',
            error: error.message
        })
    }
}

/**
 * Update Periode
 * PUT /api/v1/periode/:id
 */
const updatePeriode = async (req, res) => {
    try {
        const { nama_periode, tanggal_mulai, tanggal_selesai, isActive } = req.body

        const periode = await Periode.findById(req.params.id)
        if (!periode) {
            return res.status(404).json({
                success: false,
                message: 'Periode not found'
            })
        }

        // Cannot update closed periode
        if (periode.isClosed) {
            return res.status(400).json({
                success: false,
                message: 'Cannot update a closed periode'
            })
        }

        // Update fields
        if (nama_periode) periode.nama_periode = nama_periode
        if (tanggal_mulai) periode.tanggal_mulai = new Date(tanggal_mulai)
        if (tanggal_selesai) periode.tanggal_selesai = new Date(tanggal_selesai)
        if (isActive !== undefined) periode.isActive = isActive

        await periode.save()

        res.status(200).json({
            success: true,
            message: 'Periode updated successfully',
            data: periode
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update periode',
            error: error.message
        })
    }
}

/**
 * Close/Lock Periode
 * PUT /api/v1/periode/:id/close
 */
const closePeriode = async (req, res) => {
    try {
        const periode = await Periode.findById(req.params.id)
        if (!periode) {
            return res.status(404).json({
                success: false,
                message: 'Periode not found'
            })
        }

        if (periode.isClosed) {
            return res.status(400).json({
                success: false,
                message: 'Periode is already closed'
            })
        }

        periode.isClosed = true
        await periode.save()

        res.status(200).json({
            success: true,
            message: 'Periode closed successfully',
            data: periode
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to close periode',
            error: error.message
        })
    }
}

/**
 * Delete Periode
 * DELETE /api/v1/periode/:id
 */
const deletePeriode = async (req, res) => {
    try {
        const periode = await Periode.findById(req.params.id)
        if (!periode) {
            return res.status(404).json({
                success: false,
                message: 'Periode not found'
            })
        }

        if (periode.isClosed) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete a closed periode'
            })
        }

        await periode.deleteOne()

        res.status(200).json({
            success: true,
            message: 'Periode deleted successfully'
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete periode',
            error: error.message
        })
    }
}

module.exports = {
    getAllPeriode,
    getPeriodeById,
    createPeriode,
    updatePeriode,
    closePeriode,
    deletePeriode
}
