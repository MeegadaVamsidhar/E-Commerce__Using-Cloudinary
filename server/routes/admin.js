const express = require('express');
const router = express.Router();
const { getAdminStats, getAdminProducts, createAdminProduct, updateAdminProduct, deleteAdminProduct, getAdminOrders, updateAdminOrder, getAdminUsers, approveSeller, rejectSeller, approveProduct, rejectProduct, getPendingProducts, getPendingSellers, getNotifications, markNotificationSent, getInventoryStats, getSalesStats, getDeliveryStats, getCommissionStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/products', getAdminProducts);
router.post('/products', createAdminProduct);
router.put('/products/:id', updateAdminProduct);
router.delete('/products/:id', deleteAdminProduct);
router.get('/orders', getAdminOrders);
router.put('/orders/:id', updateAdminOrder);
router.get('/users', getAdminUsers);
router.get('/sellers/pending', getPendingSellers);
router.put('/sellers/:id/approve', approveSeller);
router.put('/sellers/:id/reject', rejectSeller);
router.get('/products/pending', getPendingProducts);
router.put('/products/:id/approve', approveProduct);
router.put('/products/:id/reject', rejectProduct);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/sent', markNotificationSent);

router.get('/inventory', getInventoryStats);
router.get('/sales', getSalesStats);
router.get('/delivery', getDeliveryStats);
router.get('/commissions', getCommissionStats);

module.exports = router;
