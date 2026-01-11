const express = require('express')
const router = express.Router()
const {
    getAllActivityLogs,
    getActivityLogsByUser
} = require('../controllers/activityLogController')
const { authMiddleware, adminOnly } = require('../middlewares/authMiddleware')

// All routes require authentication and admin role
router.use(authMiddleware)
router.use(adminOnly)

// GET /api/v1/activity - List all activity logs
router.get('/', getAllActivityLogs)

// GET /api/v1/activity/user/:user_id - Get activity logs by user
router.get('/user/:user_id', getActivityLogsByUser)

module.exports = router
