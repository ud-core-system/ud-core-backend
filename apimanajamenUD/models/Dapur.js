const mongoose = require('mongoose')

const dapurSchema = new mongoose.Schema({
    kode_dapur: {
        type: String,
        required: true,
        unique: true
    },
    nama_dapur: {
        type: String,
        required: true
    },
    alamat: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

// Text index for search
dapurSchema.index({ nama_dapur: 'text' })

module.exports = mongoose.model('UDDapur', dapurSchema)
