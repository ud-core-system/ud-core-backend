const mongoose = require('mongoose')

const barangSchema = new mongoose.Schema({
    nama_barang: {
        type: String,
        required: true
    },
    satuan: {
        type: String,
        enum: ['pcs', 'kg', 'ltr', 'dus', 'tray', 'gln', 'unit'],
        default: 'pcs'
    },
    harga_jual: {
        type: Number,
        required: true
    },
    harga_modal: {
        type: Number,
        default: 0
    },
    ud_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UDUD',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

// Text index for search/autocomplete
barangSchema.index({ nama_barang: 'text' })

// Compound index for filtering by UD
barangSchema.index({ ud_id: 1, isActive: 1 })

module.exports = mongoose.model('UDBarang', barangSchema)
