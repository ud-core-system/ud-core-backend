const mongoose = require('mongoose')

const periodeSchema = new mongoose.Schema({
    nama_periode: {
        type: String,
        required: true
    },
    tanggal_mulai: {
        type: Date,
        required: true
    },
    tanggal_selesai: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isClosed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

// Index for date range queries
periodeSchema.index({ tanggal_mulai: 1, tanggal_selesai: 1 })
periodeSchema.index({ isActive: 1, isClosed: 1 })

module.exports = mongoose.model('UDPeriode', periodeSchema)
