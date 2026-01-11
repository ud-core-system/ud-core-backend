const mongoose = require('mongoose')

const activityLogSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UDUser',
        required: true
    },
    action: {
        type: String,
        enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW'],
        required: true
    },
    module: {
        type: String,
        enum: ['USER', 'UD', 'BARANG', 'DAPUR', 'PERIODE', 'TRANSAKSI'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    target_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    ip_address: {
        type: String
    },
    user_agent: {
        type: String
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
})

// Indexes for efficient querying
activityLogSchema.index({ user_id: 1, createdAt: -1 })
activityLogSchema.index({ module: 1, action: 1 })
activityLogSchema.index({ createdAt: -1 })

module.exports = mongoose.model('UDActivityLog', activityLogSchema)
