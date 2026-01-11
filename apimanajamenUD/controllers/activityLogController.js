const ActivityLog = require('../models/ActivityLog')
const { paginate, paginationResponse } = require('../utils/helpers')

/**
 * Get all activity logs (paginated)
 * GET /api/v1/activity
 */
const getAllActivityLogs = async (req, res) => {
    try {
        const { page, limit, skip } = paginate(req.query.page, req.query.limit)
        const { action, module, user_id, start_date, end_date } = req.query

        // Build query
        const query = {}
        if (action) query.action = action
        if (module) query.module = module
        if (user_id) query.user_id = user_id
        if (start_date || end_date) {
            query.createdAt = {}
            if (start_date) query.createdAt.$gte = new Date(start_date)
            if (end_date) query.createdAt.$lte = new Date(end_date)
        }

        const [data, totalDocs] = await Promise.all([
            ActivityLog.find(query)
                .populate('user_id', 'username email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            ActivityLog.countDocuments(query)
        ])

        res.status(200).json({
            success: true,
            ...paginationResponse(data, totalDocs, page, limit)
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch activity logs',
            error: error.message
        })
    }
}

/**
 * Get activity logs by user
 * GET /api/v1/activity/user/:user_id
 */
const getActivityLogsByUser = async (req, res) => {
    try {
        const { page, limit, skip } = paginate(req.query.page, req.query.limit)
        const { user_id } = req.params

        const query = { user_id }

        const [data, totalDocs] = await Promise.all([
            ActivityLog.find(query)
                .populate('user_id', 'username email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            ActivityLog.countDocuments(query)
        ])

        res.status(200).json({
            success: true,
            ...paginationResponse(data, totalDocs, page, limit)
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user activity logs',
            error: error.message
        })
    }
}

module.exports = {
    getAllActivityLogs,
    getActivityLogsByUser
}
