const express = require('express')
const router = express.Router()
const {
    getSummary,
    getRecentTransactions,
    getSalesByUD
} = require('../controllers/dashboardController')
const { authMiddleware } = require('../middlewares/authMiddleware')

// All routes require authentication
router.use(authMiddleware)

// GET /api/v1/dashboard/summary - Get dashboard summary stats
router.get('/summary', getSummary)

// GET /api/v1/dashboard/recent - Get recent transactions
router.get('/recent', getRecentTransactions)

// GET /api/v1/dashboard/sales-by-ud - Get sales by UD
router.get('/sales-by-ud', getSalesByUD)

module.exports = router
