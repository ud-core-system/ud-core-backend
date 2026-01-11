require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

// Import apimanajamenUD
const { router: apiManajemenUDRouter, errorHandler, notFound } = require('./apimanajamenUD/app')

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Mount API routes
app.use('/api/v1', apiManajemenUDRouter)

// Error handling
app.use(notFound)
app.use(errorHandler)

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
        // 🧠 Monitoring memory usage (optional)
        setInterval(() => {
            const used = process.memoryUsage();
            console.log(`[MEMORY] Heap: ${(used.heapUsed / 1024 / 1024).toFixed(2)} MB`);
        }, 3600000); // 1 hour
    })
    .catch(err => console.error(err))
