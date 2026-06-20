const Notification = require('../models/Notification');
const Product = require('../models/Product');

exports.subscribeNotification = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.stock > 0) return res.status(400).json({ message: 'Product is in stock' });

    const existing = await Notification.findOne({ user: req.user._id, product: productId });
    if (existing) return res.status(400).json({ message: 'Already subscribed for notifications' });

    const notification = await Notification.create({
      user: req.user._id,
      product: productId,
      email: req.user.email
    });

    res.status(201).json({ message: 'You will be notified when this product is back in stock', notification });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'Already subscribed' });
    next(error);
  }
};

exports.unsubscribeNotification = async (req, res, next) => {
  try {
    const { productId } = req.params;
    await Notification.deleteOne({ user: req.user._id, product: productId });
    res.json({ message: 'Unsubscribed from notifications' });
  } catch (error) { next(error); }
};

exports.getUserNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).populate('product', 'name price images stock').sort('-createdAt');
    res.json({ notifications });
  } catch (error) { next(error); }
};
