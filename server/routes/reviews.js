const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createReview, getProductReviews, deleteReview } = require('../controllers/reviewController');

router.get('/:productId', getProductReviews);
router.post('/:productId', protect, createReview);
router.delete('/:productId/:reviewId', protect, deleteReview);

module.exports = router;
