require('dotenv').config()
const jwt = require('jsonwebtoken')
const User = require('../models/User')

/**
 * Generate JWT token
 */
const generateToken = (user) => {
    const payload = {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
    }

    const options = {
        expiresIn: '7d'
    }

    return jwt.sign(payload, process.env.SECRET_KEY, options)
}

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.SECRET_KEY)
    } catch (error) {
        console.log(`Error verifying token: ${error.message}`)
        return null
    }
}

/**
 * Authentication middleware
 */
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.bearer || req.headers.authorization?.replace('Bearer ', '')

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            })
        }

        const decoded = verifyToken(token)
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token.'
            })
        }

        const user = await User.findById(decoded._id)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            })
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'User account is deactivated.'
            })
        }

        req.user = user
        next()
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Authentication error.',
            error: error.message
        })
    }
}

/**
 * Role-based authorization middleware
 */
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            })
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(' or ')}`
            })
        }

        next()
    }
}

/**
 * Admin only middleware
 */
const adminOnly = authorizeRoles('admin')

/**
 * UD Operator access middleware (allows admin and ud_operator)
 */
const udOperatorAccess = authorizeRoles('admin', 'ud_operator')

module.exports = {
    generateToken,
    verifyToken,
    authMiddleware,
    authorizeRoles,
    adminOnly,
    udOperatorAccess
}
