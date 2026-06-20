const express = require('express');
const router = express.Router();
const { subscribeNotification, unsubscribeNotification, getUserNotifications } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/subscribe/:productId', subscribeNotification);
router.delete('/unsubscribe/:productId', unsubscribeNotification);
router.get('/my', getUserNotifications);

module.exports = router;
