const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrder, createRZPOrder, verifyRZPPayment } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { validateOrder } = require('../middleware/validation');

router.post('/', protect, validateOrder, createOrder);
router.get('/me', protect, getMyOrders);
router.get('/:id', protect, getOrder);
router.post('/razorpay', protect, createRZPOrder);
router.post('/razorpay/verify', protect, verifyRZPPayment);

module.exports = router;
