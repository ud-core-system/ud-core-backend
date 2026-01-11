const express = require('express')
const router = express.Router()
const {
    getAllUD,
    getUDById,
    createUD,
    updateUD,
    deleteUD
} = require('../controllers/udController')
const { authMiddleware, adminOnly } = require('../middlewares/authMiddleware')
const { logActivity } = require('../middlewares/activityLogger')

// All routes require authentication
router.use(authMiddleware)

// GET /api/v1/ud - List all UD
router.get('/', getAllUD)

// GET /api/v1/ud/:id - Get UD by ID
router.get('/:id', getUDById)

// POST /api/v1/ud - Create new UD (admin only)
router.post('/', adminOnly, logActivity('CREATE', 'UD'), createUD)

// PUT /api/v1/ud/:id - Update UD (admin only)
router.put('/:id', adminOnly, logActivity('UPDATE', 'UD'), updateUD)

// DELETE /api/v1/ud/:id - Soft delete UD (admin only)
router.delete('/:id', adminOnly, logActivity('DELETE', 'UD'), deleteUD)

module.exports = router
