const mongoose = require('mongoose')

const transaksiSchema = new mongoose.Schema({
    kode_transaksi: {
        type: String,
        required: true,
        unique: true
    },
    periode_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UDPeriode',
        required: true
    },
    dapur_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UDDapur',
        required: true
    },
    tanggal: {
        type: Date,
        required: true,
        default: Date.now
    },
    total_harga_jual: {
        type: Number,
        default: 0
    },
    total_harga_modal: {
        type: Number,
        default: 0
    },
    total_keuntungan: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['draft', 'completed', 'cancelled'],
        default: 'draft'
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UDUser',
        required: true
    }
}, {
    timestamps: true
})

// Indexes for filtering
transaksiSchema.index({ periode_id: 1, dapur_id: 1 })
transaksiSchema.index({ tanggal: -1 })
transaksiSchema.index({ status: 1 })
transaksiSchema.index({ created_by: 1 })

module.exports = mongoose.model('UDTransaksi', transaksiSchema)
