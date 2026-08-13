const express = require('express');
const upload = require('../middlewares/upload');
const validatorMiddleware = require("../middlewares/validatorMiddleware");

const { getAllProducts, createProduct, getProduct, deleteProduct, updateProduct, deleteProductImage, addProductImage } = require('../controllers/productController');

const { createProductValidator, checkIdParamValidator } = require('../validator/productValidator');



const router = express.Router();

router.route('/')
    .get(getAllProducts)
    .post(upload.array("images", 4), createProductValidator, validatorMiddleware, createProduct);
router.route('/:id')
    .get(checkIdParamValidator, getProduct)
    .put(checkIdParamValidator, updateProduct)
    .delete(checkIdParamValidator, deleteProduct);
router.route('/:id/images')
    .post(upload.array("images", 4), checkIdParamValidator, addProductImage)
    .delete(checkIdParamValidator, deleteProductImage);

module.exports = router;