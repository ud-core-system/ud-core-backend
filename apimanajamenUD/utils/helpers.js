/**
 * Pagination helper
 */
const paginate = (page = 1, limit = 10) => {
    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
    const skip = (pageNum - 1) * limitNum

    return {
        page: pageNum,
        limit: limitNum,
        skip
    }
}

/**
 * Build pagination response
 */
const paginationResponse = (data, totalDocs, page, limit) => {
    return {
        data,
        pagination: {
            totalDocuments: totalDocs,
            totalPages: Math.ceil(totalDocs / limit),
            currentPage: page,
            limit,
            hasNext: page * limit < totalDocs,
            hasPrev: page > 1
        }
    }
}

/**
 * Format currency (IDR)
 */
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount)
}

/**
 * Calculate profit
 */
const calculateProfit = (hargaJual, hargaModal, qty) => {
    const subtotalJual = hargaJual * qty
    const subtotalModal = hargaModal * qty
    const keuntungan = subtotalJual - subtotalModal

    return {
        subtotal_jual: subtotalJual,
        subtotal_modal: subtotalModal,
        keuntungan
    }
}

/**
 * Sanitize search query
 */
const sanitizeSearch = (query) => {
    if (!query) return ''
    return query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

module.exports = {
    paginate,
    paginationResponse,
    formatCurrency,
    calculateProfit,
    sanitizeSearch
}
