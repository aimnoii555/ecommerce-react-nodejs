const express = require('express')
const { authCheck } = require('../middlewares/AuthCheck')
const { payment } = require('../controllers/payment')
const router = express.Router()

router.post('/user/create-payment', authCheck, payment)


module.exports = router
