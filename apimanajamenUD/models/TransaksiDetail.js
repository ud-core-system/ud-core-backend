const mongoose = require('mongoose')

const transaksiDetailSchema = new mongoose.Schema({
    transaksi_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UDTransaksi',
        required: true
    },
    barang_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UDBarang',
        required: true
    },
    ud_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UDUD',
        required: true
    },
    qty: {
        type: Number,
        required: true
    },
    harga_jual: {
        type: Number,
        required: true
    },
    harga_modal: {
        type: Number,
        default: 0
    },
    subtotal_jual: {
        type: Number,
        required: true
    },
    subtotal_modal: {
        type: Number,
        default: 0
    },
    keuntungan: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
})

// Compound index for efficient queries
transaksiDetailSchema.index({ transaksi_id: 1, ud_id: 1 })
transaksiDetailSchema.index({ barang_id: 1 })

module.exports = mongoose.model('UDTransaksiDetail', transaksiDetailSchema)
