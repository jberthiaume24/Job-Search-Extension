// import express
const express = require('express')

// 1. create express router
const router  = express.Router()

// 2. import controller
const connController = require('../controllers/emailRoute')

// 3. create route
router.post('/email-route', connController.emailRoute)

// 4. export route for server.js
module.exports = router