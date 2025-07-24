const exporess = require('express')
const router = exporess.Router()
const { create,getCategory,deleteCategory, editCategory } = require('../controllers/category')
const { authCheck,checkAdmin  } = require('../middlewares/AuthCheck')

router.post('/category',authCheck,checkAdmin,create)
router.get('/category',getCategory)
router.delete('/category/:id',authCheck,checkAdmin,deleteCategory)
router.put('/category/:id',authCheck,checkAdmin,editCategory)

module.exports = router
