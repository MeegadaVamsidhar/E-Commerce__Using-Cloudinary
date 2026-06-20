const Order = require('../models/Order');
const Product = require('../models/Product');
const Razorpay = require('razorpay');
const crypto = require('crypto');

let rzp;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
} catch (error) {
  console.error("Razorpay Initialization failed. Check your keys in .env");
}

exports.createOrder = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;
    
    const enrichedItems = await Promise.all(orderItems.map(async (item) => {
      const product = await Product.findById(item.product).populate('seller', '_id');
      return {
        ...item,
        seller: product?.seller?._id || null,
      };
    }));

    const order = await Order.create({
      orderItems: enrichedItems, shippingAddress, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice,
      user: req.user.id, 
      isPaid: paymentInfo.status === 'paid',
      paidAt: paymentInfo.status === 'paid' ? Date.now() : undefined
    });
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }
    res.status(201).json({ order });
  } catch (error) { next(error); }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort('-createdAt');
    res.json({ orders });
  } catch (error) { next(error); }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ order });
  } catch (error) { next(error); }
};

exports.createRZPOrder = async (req, res, next) => {
  try {
    if (!rzp) return res.status(500).json({ message: 'Razorpay keys are missing in the server configuration' });
    const { amount } = req.body;
    const options = { amount: Math.round(amount), currency: 'INR', receipt: `receipt_${Date.now()}` };
    const order = await rzp.orders.create(options);
    res.json({ order, key: process.env.RAZORPAY_KEY_ID });
  } catch (error) { next(error); }
};

exports.verifyRZPPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
    if (expectedSignature === razorpay_signature) res.json({ success: true, message: 'Payment verified' });
    else res.status(400).json({ message: 'Invalid payment signature' });
  } catch (error) { next(error); }
};
