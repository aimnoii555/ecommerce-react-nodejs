const express = require('express')
const router = express.Router()
const { register,login,currentUser } = require('../controllers/auth')

const { authCheck,checkAdmin } = require('../middlewares/AuthCheck')

router.post('/register',register)
router.post('/login',login)
router.post('/current-user',authCheck,currentUser)
router.post('/current-admin',authCheck,checkAdmin,currentUser)


module.exports = router
