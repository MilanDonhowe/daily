//  Filename: app.js
//  Description: Express server logic

require('dotenv').config()

// import database interface
const {initDatabaseInterface, getDBReference} = require('./db.js')

// import API router
const API = require('./api.js')

// import express & other stuff
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const app = express()
const PORT = process.env.PORT || 3000
const HOST = process.env.WEBSITE_HOSTNAME || "localhost"



/*
===================================================
================ API ENDPOINTS ====================
===================================================
*/

// Defined in api.js
app.use('/api', API)

/*
===================================================
================ STATIC ASSETS ====================
===================================================
*/

// Let default route serve the index.html file
app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'))
})

// Serve the rest of the static files
app.use(express.static(path.join(__dirname, '../public')))

// re-direct other requests to static 404 page
app.get('*', async (req, res) => {
    res.redirect(`http://${HOST}:${PORT}#404`)
})

try {
    initDatabaseInterface(() => { 

        app.listen(PORT, () => {
            console.log(`Backend server running @ http://${HOST}:${PORT}`)
        })

    })
} catch (err) {
    console.log(`Error Caught: ${err}`)
}

