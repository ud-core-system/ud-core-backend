const User = require('../models/User')
const Setting = require('../models/Setting')
const UD = require('../models/UD')

/**
 * Seed initial data if it doesn't exist
 */
const seedInitialData = async () => {
    try {
        console.log('--- Initial Seeding ---')

        // 1. Seed Global Settings
        let setting = await Setting.findOne()
        if (!setting) {
            setting = await Setting.create({
                isRegistrationAllowed: true
            })
            console.log('✅ Default settings created')
        } else {
            console.log('ℹ️ Settings already exist')
        }

        // 2. Seed SuperUser
        const superUserEmail = 'suport.udrembiga@gmail.com'
        const existingSuperUser = await User.findOne({ email: superUserEmail })

        if (!existingSuperUser) {
            await User.create({
                username: 'suport.udrembiga',
                email: superUserEmail,
                password: 'suport.udrembiga14#',
                role: 'superuser',
                isActive: true
            })
            console.log(`✅ SuperUser created (${superUserEmail})`)
        } else {
            // Ensure existing one has superuser role
            if (existingSuperUser.role !== 'superuser') {
                existingSuperUser.role = 'superuser'
                await existingSuperUser.save()
                console.log('✅ Existing user promoted to SuperUser')
            } else {
                console.log('ℹ️ SuperUser already exists')
            }
        }

        // 3. Seed Initial UDs
        const initialUDs = [
            {
                kode_ud: "UD-UAS-001",
                nama_ud: "UD. AMANAH SUMBER MAKMUR",
                alamat: "SELAPARANG KOTA MATARAM",
                nama_pemilik: "AN. ULUL AZMI",
                bank: "MANDIRI",
                no_rekening: "161 00 1613642 1 ",
                kbli: [],
                isActive: true
            },
            {
                kode_ud: "UD-UES-001",
                nama_ud: "UD EMPAT SAUDARA CEMERLANG",
                alamat: "",
                nama_pemilik: "AN. AMALKA",
                bank: "MANDIRI",
                no_rekening: "161 00 1613646 2",
                kbli: [],
                isActive: true
            },
            {
                kode_ud: "UD-PPM-001",
                nama_ud: "UD PILAR PANGAN MANDIRI",
                alamat: "",
                nama_pemilik: "AN. FARHAN MUHAMMAD",
                bank: "MANDIRI",
                no_rekening: "161 00 1613648 8",
                kbli: [],
                isActive: true
            },
            {
                kode_ud: "UD-UBM-001",
                nama_ud: "UD BANYU MAS",
                alamat: "SELAPARANG - KOTA MATARAM",
                nama_pemilik: "",
                bank: "",
                no_rekening: "",
                kbli: [],
                isActive: true
            }
        ]

        for (const udData of initialUDs) {
            const existingUD = await UD.findOne({ kode_ud: udData.kode_ud })
            if (!existingUD) {
                await UD.create(udData)
                console.log(`✅ UD created: ${udData.nama_ud} (${udData.kode_ud})`)
            } else {
                console.log(`ℹ️ UD already exists: ${udData.nama_ud} (${udData.kode_ud})`)
            }
        }

        console.log('--- Seeding Completed ---')
    } catch (error) {
        console.error('❌ Seeding failed:', error.message)
    }
}

module.exports = { seedInitialData }
