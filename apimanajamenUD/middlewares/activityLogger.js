const ActivityLog = require('../models/ActivityLog')

/**
 * Activity logger middleware factory
 * @param {string} action - Action type: CREATE, UPDATE, DELETE, LOGIN, LOGOUT, VIEW
 * @param {string} module - Module name: USER, UD, BARANG, DAPUR, PERIODE, TRANSAKSI
 */
const logActivity = (action, module) => {
    return async (req, res, next) => {
        // Store original json method
        const originalJson = res.json

        // Override json method to log after successful response
        res.json = function (data) {
            // Only log on successful responses
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const targetId = data?.data?._id || req.params?.id || null

                ActivityLog.create({
                    user_id: req.user?._id,
                    action,
                    module,
                    description: `${action} ${module}: ${targetId || 'N/A'}`,
                    target_id: targetId,
                    ip_address: req.ip || req.connection?.remoteAddress,
                    user_agent: req.get('User-Agent'),
                    metadata: {
                        method: req.method,
                        path: req.originalUrl,
                        body: action !== 'VIEW' ? req.body : undefined
                    }
                }).catch(err => console.error('Activity log error:', err))
            }

            // Call original json method
            return originalJson.call(this, data)
        }

        next()
    }
}

/**
 * Manual activity logging function
 */
const createActivityLog = async ({
    user_id,
    action,
    module,
    description,
    target_id = null,
    ip_address = null,
    user_agent = null,
    metadata = {}
}) => {
    try {
        await ActivityLog.create({
            user_id,
            action,
            module,
            description,
            target_id,
            ip_address,
            user_agent,
            metadata
        })
    } catch (error) {
        console.error('Failed to create activity log:', error.message)
    }
}

module.exports = {
    logActivity,
    createActivityLog
}
