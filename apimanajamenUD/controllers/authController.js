const User = require('../models/User')
const { generateToken } = require('../middlewares/authMiddleware')
const { createActivityLog } = require('../middlewares/activityLogger')

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
const register = async (req, res) => {
    try {
        const { username, email, password, role, ud_id } = req.body

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

        // Create new user
        const user = await User.create({
            username,
            email,
            password,
            role: role || 'ud_operator',
            ud_id
        })

        // Generate token
        const token = generateToken(user)

        // Log activity
        await createActivityLog({
            user_id: user._id,
            action: 'CREATE',
            module: 'USER',
            description: `User registered: ${user.username}`,
            target_id: user._id,
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
        })

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user,
                token
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to register user',
            error: error.message
        })
    }
}

/**
 * Login user
 * POST /api/v1/auth/login
 */
const login = async (req, res) => {
    try {
        const { username, password } = req.body

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            })
        }

        // Find user by username or email
        const user = await User.findOne({
            $or: [{ username }, { email: username }]
        })

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            })
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'User account is deactivated'
            })
        }

        // Verify password
        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            })
        }

        // Update last login
        user.lastLogin = new Date()
        await user.save()

        // Generate token
        const token = generateToken(user)

        // Log activity
        await createActivityLog({
            user_id: user._id,
            action: 'LOGIN',
            module: 'USER',
            description: `User logged in: ${user.username}`,
            target_id: user._id,
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
        })

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user,
                token
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to login',
            error: error.message
        })
    }
}

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
const logout = async (req, res) => {
    try {
        // Log activity
        if (req.user) {
            await createActivityLog({
                user_id: req.user._id,
                action: 'LOGOUT',
                module: 'USER',
                description: `User logged out: ${req.user.username}`,
                target_id: req.user._id,
                ip_address: req.ip,
                user_agent: req.get('User-Agent')
            })
        }

        res.status(200).json({
            success: true,
            message: 'Logout successful'
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to logout',
            error: error.message
        })
    }
}

/**
 * Get current user
 * GET /api/v1/auth/me
 */
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('ud_id')

        res.status(200).json({
            success: true,
            data: user
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get user info',
            error: error.message
        })
    }
}

module.exports = {
    register,
    login,
    logout,
    getMe
}
