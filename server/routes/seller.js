const express = require('express');
const router = express.Router();
const { applyForSeller, getSellerDashboard, getSellerProducts, createSellerProduct, updateSellerProduct, deleteSellerProduct, getSellerOrders } = require('../controllers/sellerController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/apply', applyForSeller);
router.get('/dashboard', getSellerDashboard);
router.get('/products', getSellerProducts);
router.post('/products', createSellerProduct);
router.put('/products/:id', updateSellerProduct);
router.delete('/products/:id', deleteSellerProduct);
router.get('/orders', getSellerOrders);

module.exports = router;
