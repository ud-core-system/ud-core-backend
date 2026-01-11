const express = require('express')
const router = express.Router()
const {
    getAllBarang,
    searchBarang,
    getBarangById,
    createBarang,
    updateBarang,
    deleteBarang
} = require('../controllers/barangController')
const { authMiddleware } = require('../middlewares/authMiddleware')
const { logActivity } = require('../middlewares/activityLogger')

// All routes require authentication
router.use(authMiddleware)

// GET /api/v1/barang - List all barang
router.get('/', getAllBarang)

// GET /api/v1/barang/search - Search barang (autocomplete)
router.get('/search', searchBarang)

// GET /api/v1/barang/:id - Get barang by ID
router.get('/:id', getBarangById)

// POST /api/v1/barang - Create new barang
router.post('/', logActivity('CREATE', 'BARANG'), createBarang)

// PUT /api/v1/barang/:id - Update barang
router.put('/:id', logActivity('UPDATE', 'BARANG'), updateBarang)

// DELETE /api/v1/barang/:id - Soft delete barang
router.delete('/:id', logActivity('DELETE', 'BARANG'), deleteBarang)

module.exports = router
