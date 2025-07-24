const exporess = require('express');
const router = exporess.Router();
const { authCheck, checkAdmin } = require('../middlewares/AuthCheck');
const { getAllUsers, changeUserStatus, changeUserRole, userCart, getUserCart, emptyCart, saveAddress, createOrder, getUserOrder } = require('../controllers/user')

router.get('/users',authCheck,checkAdmin,getAllUsers)
router.post('/change-status',authCheck,checkAdmin,changeUserStatus)
router.post('/change-role',authCheck,checkAdmin,changeUserRole)

router.post('/user/cart',authCheck,userCart)
router.get('/user/cart',authCheck,getUserCart)
router.delete('/user/cart',authCheck,emptyCart)

router.post('/user/address',authCheck,saveAddress)

router.post('/user/order',authCheck,createOrder)
router.get('/user/order',authCheck,getUserOrder)


module.exports = router
