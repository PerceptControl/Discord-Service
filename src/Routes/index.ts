import express = require('express')
export const router = express.Router()
router.use('/api', require('./lobby'))
