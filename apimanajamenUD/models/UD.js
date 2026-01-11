const mongoose = require('mongoose')

const udSchema = new mongoose.Schema({
    kode_ud: {
        type: String,
        required: true,
        unique: true
    },
    nama_ud: {
        type: String,
        required: true
    },
    alamat: {
        type: String
    },
    nama_pemilik: {
        type: String
    },
    bank: {
        type: String
    },
    no_rekening: {
        type: String
    },
    kbli: [{
        type: String
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

// Text index for search
udSchema.index({ nama_ud: 'text', nama_pemilik: 'text' })

module.exports = mongoose.model('UDUD', udSchema)
