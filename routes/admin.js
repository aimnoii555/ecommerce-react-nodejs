const express = require('express')
const { authCheck } = require('../middlewares/AuthCheck')
const { changeOrderStatus, getOrderAdmin } = require('../controllers/admin')
const router = express.Router()

router.put('/admin/order-status', authCheck, changeOrderStatus)
router.get('/admin/orders', authCheck, getOrderAdmin)


module.exports = router
