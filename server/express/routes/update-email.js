// import express
const express = require('express')

// 1. create express router
const router  = express.Router()

// 2. import controller
const connController = require('../controllers/updateEmail')

// 3. create route
router.post('/update-email', connController.updateEmail)

// 4. export route for server.js
module.exports = router