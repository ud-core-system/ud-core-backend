const User = require('../models/User')
const { paginate, paginationResponse } = require('../utils/helpers')

/**
 * Get all users (paginated)
 * GET /api/v1/user
 */
const getAllUsers = async (req, res) => {
    try {
        const { page, limit, skip } = paginate(req.query.page, req.query.limit)
        const { search, role, isActive } = req.query

        // Build query
        const query = {}
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ]
        }
        if (role) {
            query.role = role
        }
        if (isActive !== undefined) {
            query.isActive = isActive === 'true'
        }

        const [data, totalDocs] = await Promise.all([
            User.find(query).populate('ud_id').sort({ createdAt: -1 }).skip(skip).limit(limit),
            User.countDocuments(query)
        ])

        res.status(200).json({
            success: true,
            ...paginationResponse(data, totalDocs, page, limit)
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user list',
            error: error.message
        })
    }
}

/**
 * Get user by ID
 * GET /api/v1/user/:id
 */
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('ud_id')

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        res.status(200).json({
            success: true,
            data: user
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: error.message
        })
    }
}

/**
 * Create new user
 * POST /api/v1/user
 */
const createUser = async (req, res) => {
    try {
        const { username, email, password, role, ud_id } = req.body

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email, and password are required'
            })
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        })

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or username already exists'
            })
        }

        const user = await User.create({
            username,
            email,
            password,
            role: role || 'ud_operator',
            ud_id
        })

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: user
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create user',
            error: error.message
        })
    }
}

/**
 * Update user
 * PUT /api/v1/user/:id
 */
const updateUser = async (req, res) => {
    try {
        const { username, email, password, role, ud_id, isActive } = req.body

        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        // Update fields
        if (username) user.username = username
        if (email) user.email = email
        if (password) user.password = password // Will be hashed via pre-save hook
        if (role) user.role = role
        if (ud_id !== undefined) user.ud_id = ud_id
        if (isActive !== undefined) user.isActive = isActive

        await user.save()

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: user
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update user',
            error: error.message
        })
    }
}

/**
 * Delete user
 * DELETE /api/v1/user/:id
 */
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        await user.deleteOne()

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: error.message
        })
    }
}

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
}
