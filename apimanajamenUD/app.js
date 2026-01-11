const express = require('express')
const router = express.Router()

// Import routes
const authRoutes = require('./routes/authRoutes')
const udRoutes = require('./routes/udRoutes')
const barangRoutes = require('./routes/barangRoutes')
const dapurRoutes = require('./routes/dapurRoutes')
const periodeRoutes = require('./routes/periodeRoutes')
const transaksiRoutes = require('./routes/transaksiRoutes')
const activityLogRoutes = require('./routes/activityLogRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')

// Import middleware
const { errorHandler, notFound } = require('./middlewares/errorHandler')

// Mount routes
router.use('/auth', authRoutes)
router.use('/ud', udRoutes)
router.use('/barang', barangRoutes)
router.use('/dapur', dapurRoutes)
router.use('/periode', periodeRoutes)
router.use('/transaksi', transaksiRoutes)
router.use('/activity', activityLogRoutes)
router.use('/dashboard', dashboardRoutes)

// Export the router for use in main app
module.exports = {
    router,
    errorHandler,
    notFound
}
