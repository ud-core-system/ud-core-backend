const express = require('express')
const router = express.Router()
const {
    getAllDapur,
    getDapurById,
    createDapur,
    updateDapur,
    deleteDapur
} = require('../controllers/dapurController')
const { authMiddleware, adminOnly } = require('../middlewares/authMiddleware')
const { logActivity } = require('../middlewares/activityLogger')

// All routes require authentication
router.use(authMiddleware)

// GET /api/v1/dapur - List all dapur
router.get('/', getAllDapur)

// GET /api/v1/dapur/:id - Get dapur by ID
router.get('/:id', getDapurById)

// POST /api/v1/dapur - Create new dapur (admin only)
router.post('/', adminOnly, logActivity('CREATE', 'DAPUR'), createDapur)

// PUT /api/v1/dapur/:id - Update dapur (admin only)
router.put('/:id', adminOnly, logActivity('UPDATE', 'DAPUR'), updateDapur)

// DELETE /api/v1/dapur/:id - Delete dapur (admin only)
router.delete('/:id', adminOnly, logActivity('DELETE', 'DAPUR'), deleteDapur)

module.exports = router
