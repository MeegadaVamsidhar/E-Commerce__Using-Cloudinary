const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createStripeIntent,
  createRazorpayOrder,
  verifyRazorpayPayment,
  stripeWebhook,
} = require('../controllers/paymentController');

router.post('/stripe/create-intent', protect, createStripeIntent);
router.post('/razorpay/create-order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

module.exports = router;
