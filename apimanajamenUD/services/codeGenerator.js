const UD = require('../models/UD')
const Dapur = require('../models/Dapur')
const Transaksi = require('../models/Transaksi')

/**
 * Generate unique code for UD
 * Format: UD-XXX-001 where XXX is extracted from nama_ud
 */
const generateKodeUD = async (namaUD) => {
    // Extract abbreviation from nama_ud (take first letters of each word, max 3)
    const words = namaUD.split(' ').filter(w => w.length > 0)
    let abbreviation = words.map(w => w[0].toUpperCase()).join('').slice(0, 3)

    // If abbreviation is less than 3 chars, pad with last word's letters
    if (abbreviation.length < 3 && words.length > 0) {
        const lastWord = words[words.length - 1].toUpperCase()
        abbreviation = (abbreviation + lastWord).slice(0, 3)
    }

    // Default to 'UDX' if no valid abbreviation
    if (!abbreviation) abbreviation = 'UDX'

    // Find the latest UD with similar prefix
    const prefix = `UD-${abbreviation}-`
    const latestUD = await UD.findOne({ kode_ud: { $regex: `^${prefix}` } })
        .sort({ kode_ud: -1 })

    let nextNumber = 1
    if (latestUD) {
        const currentNumber = parseInt(latestUD.kode_ud.split('-')[2]) || 0
        nextNumber = currentNumber + 1
    }

    return `${prefix}${String(nextNumber).padStart(3, '0')}`
}

/**
 * Generate unique code for Dapur
 * Format: DAPUR-XXX-001 where XXX is extracted from nama_dapur
 */
const generateKodeDapur = async (namaDapur) => {
    // Extract abbreviation from nama_dapur (take first letters of each word, max 3)
    const words = namaDapur.split(' ').filter(w => w.length > 0)
    let abbreviation = words.map(w => w[0].toUpperCase()).join('').slice(0, 3)

    // If abbreviation is less than 3 chars, pad with last word's letters
    if (abbreviation.length < 3 && words.length > 0) {
        const lastWord = words[words.length - 1].toUpperCase()
        abbreviation = (abbreviation + lastWord).slice(0, 3)
    }

    // Default to 'DPR' if no valid abbreviation
    if (!abbreviation) abbreviation = 'DPR'

    // Find the latest Dapur with similar prefix
    const prefix = `DAPUR-${abbreviation}-`
    const latestDapur = await Dapur.findOne({ kode_dapur: { $regex: `^${prefix}` } })
        .sort({ kode_dapur: -1 })

    let nextNumber = 1
    if (latestDapur) {
        const currentNumber = parseInt(latestDapur.kode_dapur.split('-')[2]) || 0
        nextNumber = currentNumber + 1
    }

    return `${prefix}${String(nextNumber).padStart(3, '0')}`
}

/**
 * Generate unique code for Transaksi
 * Format: TRX-YYYYMMDD-001
 */
const generateKodeTransaksi = async (tanggal = new Date()) => {
    const date = new Date(tanggal)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}${month}${day}`

    const prefix = `TRX-${dateStr}-`

    // Find the latest transaksi for this date
    const latestTransaksi = await Transaksi.findOne({ kode_transaksi: { $regex: `^${prefix}` } })
        .sort({ kode_transaksi: -1 })

    let nextNumber = 1
    if (latestTransaksi) {
        const currentNumber = parseInt(latestTransaksi.kode_transaksi.split('-')[2]) || 0
        nextNumber = currentNumber + 1
    }

    return `${prefix}${String(nextNumber).padStart(3, '0')}`
}

module.exports = {
    generateKodeUD,
    generateKodeDapur,
    generateKodeTransaksi
}
