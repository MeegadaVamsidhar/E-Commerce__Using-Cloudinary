const express = require('express');
const router = express.Router();
const { getProducts, getProduct, addReview, getCategories } = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { validateReview } = require('../middleware/validation');

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProduct);
router.post('/:id/reviews', protect, validateReview, addReview);

module.exports = router;
