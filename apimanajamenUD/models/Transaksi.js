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
    },
    items: [{
        barang_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'UDBarang'
        },
        ud_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'UDUD'
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
            required: true
        },
        subtotal_jual: {
            type: Number,
            required: true
        },
        subtotal_modal: {
            type: Number,
            required: true
        },
        keuntungan: {
            type: Number,
            required: true
        }
    }]
}, {
    timestamps: true
})

// Indexes for filtering
transaksiSchema.index({ periode_id: 1, dapur_id: 1 })
transaksiSchema.index({ tanggal: -1 })
transaksiSchema.index({ status: 1 })
transaksiSchema.index({ created_by: 1 })

module.exports = mongoose.model('UDTransaksi', transaksiSchema)
