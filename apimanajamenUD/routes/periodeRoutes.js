const express = require('express')
const router = express.Router()
const {
    getAllPeriode,
    getPeriodeById,
    createPeriode,
    updatePeriode,
    closePeriode,
    deletePeriode
} = require('../controllers/periodeController')
const { authMiddleware, adminOnly } = require('../middlewares/authMiddleware')
const { logActivity } = require('../middlewares/activityLogger')

// All routes require authentication
router.use(authMiddleware)

// GET /api/v1/periode - List all periode
router.get('/', getAllPeriode)

// GET /api/v1/periode/:id - Get periode by ID
router.get('/:id', getPeriodeById)

// POST /api/v1/periode - Create new periode (admin only)
router.post('/', adminOnly, logActivity('CREATE', 'PERIODE'), createPeriode)

// PUT /api/v1/periode/:id - Update periode (admin only)
router.put('/:id', adminOnly, logActivity('UPDATE', 'PERIODE'), updatePeriode)

// PUT /api/v1/periode/:id/close - Close/lock periode (admin only)
router.put('/:id/close', adminOnly, logActivity('UPDATE', 'PERIODE'), closePeriode)

// DELETE /api/v1/periode/:id - Delete periode (admin only)
router.delete('/:id', adminOnly, logActivity('DELETE', 'PERIODE'), deletePeriode)

module.exports = router
