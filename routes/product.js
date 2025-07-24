const express = require('express')
const router = express.Router();
const { createProdocut, getProduct, getProductById, deleteProduct, searchFilters, updateProduct, getProductBy, removeImg, createImg } = require('../controllers/product')
const { authCheck, checkAdmin } = require('../middlewares/AuthCheck')

router.post('/product', authCheck, createProdocut)
router.get('/products/:count', getProduct)
router.delete('/product/:id', deleteProduct)
router.post('/product_by_id/:id', getProductById)
router.put('/product/:id', updateProduct) // Assuming you want to update the product by ID
router.post('/search/filters', searchFilters)
router.post('/productby', getProductBy) // Assuming you want to get product by ID

router.post('/images', authCheck, checkAdmin, createImg)
router.post('/remove-img', authCheck, checkAdmin, removeImg)


module.exports = router;
