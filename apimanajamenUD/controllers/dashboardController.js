const Transaksi = require('../models/Transaksi')
const TransaksiDetail = require('../models/TransaksiDetail')
const UD = require('../models/UD')
const Barang = require('../models/Barang')
const Dapur = require('../models/Dapur')
const Periode = require('../models/Periode')

/**
 * Get dashboard summary stats
 * GET /api/v1/dashboard/summary
 */
const getSummary = async (req, res) => {
    try {
        const { periode_id } = req.query

        // Build query for transaksi
        const transaksiQuery = { status: 'completed' }
        if (periode_id) transaksiQuery.periode_id = periode_id

        // Get counts
        const [
            totalUD,
            totalBarang,
            totalDapur,
            totalPeriode,
            transaksiStats
        ] = await Promise.all([
            UD.countDocuments({ isActive: true }),
            Barang.countDocuments({ isActive: true }),
            Dapur.countDocuments({ isActive: true }),
            Periode.countDocuments({ isActive: true }),
            Transaksi.aggregate([
                { $match: transaksiQuery },
                {
                    $group: {
                        _id: null,
                        totalTransaksi: { $sum: 1 },
                        totalHargaJual: { $sum: '$total_harga_jual' },
                        totalHargaModal: { $sum: '$total_harga_modal' },
                        totalKeuntungan: { $sum: '$total_keuntungan' }
                    }
                }
            ])
        ])

        const stats = transaksiStats[0] || {
            totalTransaksi: 0,
            totalHargaJual: 0,
            totalHargaModal: 0,
            totalKeuntungan: 0
        }

        res.status(200).json({
            success: true,
            data: {
                totalUD,
                totalBarang,
                totalDapur,
                totalPeriode,
                totalTransaksi: stats.totalTransaksi,
                totalPenjualan: stats.totalHargaJual,
                totalModal: stats.totalHargaModal,
                totalKeuntungan: stats.totalKeuntungan
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard summary',
            error: error.message
        })
    }
}

/**
 * Get recent transactions
 * GET /api/v1/dashboard/recent
 */
const getRecentTransactions = async (req, res) => {
    try {
        const { limit = 10 } = req.query

        const recentTransaksi = await Transaksi.find()
            .populate('periode_id', 'nama_periode')
            .populate('dapur_id', 'kode_dapur nama_dapur')
            .populate('created_by', 'username')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))

        res.status(200).json({
            success: true,
            data: recentTransaksi
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recent transactions',
            error: error.message
        })
    }
}

/**
 * Get sales by UD
 * GET /api/v1/dashboard/sales-by-ud
 */
const getSalesByUD = async (req, res) => {
    try {
        const { periode_id } = req.query

        const matchStage = { status: 'completed' }
        if (periode_id) matchStage.periode_id = periode_id

        const salesByUD = await TransaksiDetail.aggregate([
            {
                $lookup: {
                    from: 'transaksis',
                    localField: 'transaksi_id',
                    foreignField: '_id',
                    as: 'transaksi'
                }
            },
            { $unwind: '$transaksi' },
            { $match: { 'transaksi.status': 'completed' } },
            {
                $group: {
                    _id: '$ud_id',
                    totalJual: { $sum: '$subtotal_jual' },
                    totalModal: { $sum: '$subtotal_modal' },
                    totalKeuntungan: { $sum: '$keuntungan' },
                    totalQty: { $sum: '$qty' }
                }
            },
            {
                $lookup: {
                    from: 'uds',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'ud'
                }
            },
            { $unwind: '$ud' },
            {
                $project: {
                    _id: 1,
                    kode_ud: '$ud.kode_ud',
                    nama_ud: '$ud.nama_ud',
                    totalJual: 1,
                    totalModal: 1,
                    totalKeuntungan: 1,
                    totalQty: 1
                }
            },
            { $sort: { totalJual: -1 } }
        ])

        res.status(200).json({
            success: true,
            data: salesByUD
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sales by UD',
            error: error.message
        })
    }
}

module.exports = {
    getSummary,
    getRecentTransactions,
    getSalesByUD
}
