const express = require('express')
const router = express.Router()
const {
    getAllTransaksi,
    getTransaksiById,
    createTransaksi,
    updateTransaksi,
    completeTransaksi,
    cancelTransaksi
} = require('../controllers/transaksiController')
const { authMiddleware } = require('../middlewares/authMiddleware')
const { logActivity } = require('../middlewares/activityLogger')

// All routes require authentication
router.use(authMiddleware)

// GET /api/v1/transaksi - List all transaksi
router.get('/', getAllTransaksi)

// GET /api/v1/transaksi/:id - Get transaksi by ID with details
router.get('/:id', getTransaksiById)

// POST /api/v1/transaksi - Create new transaksi
router.post('/', logActivity('CREATE', 'TRANSAKSI'), createTransaksi)

// PUT /api/v1/transaksi/:id - Update transaksi
router.put('/:id', logActivity('UPDATE', 'TRANSAKSI'), updateTransaksi)

// POST /api/v1/transaksi/:id/complete - Complete transaksi
router.post('/:id/complete', logActivity('UPDATE', 'TRANSAKSI'), completeTransaksi)

// DELETE /api/v1/transaksi/:id - Cancel transaksi
router.delete('/:id', logActivity('DELETE', 'TRANSAKSI'), cancelTransaksi)

module.exports = router
