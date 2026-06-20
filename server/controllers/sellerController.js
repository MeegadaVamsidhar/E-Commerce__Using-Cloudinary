const User = require('../models/User');
const Product = require('../models/Product');
const ProductGroup = require('../models/ProductGroup');
const Order = require('../models/Order');

exports.applyForSeller = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.isSeller) return res.status(400).json({ message: 'Already a seller' });

    const { storeName, storeDescription, bankDetails } = req.body;
    if (!storeName || !storeDescription) return res.status(400).json({ message: 'Store name and description required' });

    user.isSeller = true;
    user.sellerInfo = {
      storeName,
      storeDescription,
      bankDetails,
      status: 'pending',
      appliedAt: Date.now()
    };
    user.role = 'seller';
    await user.save();

    res.status(201).json({ message: 'Seller application submitted. Awaiting admin approval.', sellerInfo: user.sellerInfo });
  } catch (error) { next(error); }
};

exports.getSellerDashboard = async (req, res, next) => {
  try {
    const seller = await User.findById(req.user.id);
    if (!seller.isSeller) return res.status(403).json({ message: 'Not a seller' });

    const products = await Product.find({ seller: seller._id });
    const orders = await Order.find({ 'orderItems.seller': seller._id }).sort('-createdAt').limit(10);

    const totalRevenue = orders.reduce((sum, order) => {
      return sum + order.orderItems
        .filter(item => item.seller && item.seller.toString() === seller._id.toString())
        .reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
    }, 0);

    const totalCommission = orders.reduce((sum, order) => {
      return sum + order.orderItems
        .filter(item => item.seller && item.seller.toString() === seller._id.toString())
        .reduce((itemSum, item) => itemSum + ((item.price * item.quantity) * seller.sellerInfo.commissionRate / 100), 0);
    }, 0);

    res.json({
      seller: {
        storeName: seller.sellerInfo.storeName,
        storeDescription: seller.sellerInfo.storeDescription,
        commissionRate: seller.sellerInfo.commissionRate,
        status: seller.sellerInfo.status,
      },
      stats: {
        totalProducts: products.length,
        approvedProducts: products.filter(p => p.approvalStatus === 'approved').length,
        pendingProducts: products.filter(p => p.approvalStatus === 'pending').length,
        totalOrders: orders.length,
        totalRevenue,
        totalCommission,
        totalEarnings: totalRevenue - totalCommission,
      },
      products,
      recentOrders: orders,
    });
  } catch (error) { next(error); }
};

exports.getSellerProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ seller: req.user.id }).sort('-createdAt');
    res.json({ products });
  } catch (error) { next(error); }
};

exports.createSellerProduct = async (req, res, next) => {
  try {
    const seller = await User.findById(req.user.id);
    if (!seller.isSeller || seller.sellerInfo.status !== 'approved') {
      return res.status(403).json({ message: 'Seller account not approved yet' });
    }

    const { name, category, brand, description, images, videos } = req.body;
    const existingGroup = await ProductGroup.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }, category });

    let productGroup;
    if (existingGroup) {
      productGroup = existingGroup;
      productGroup.sellerCount += 1;
      await productGroup.save();
    } else {
      productGroup = await ProductGroup.create({
        name,
        description,
        category,
        brand,
        images: images || [],
        videos: videos || [],
        sellerCount: 1,
      });
    }

    const product = await Product.create({
      productGroup: productGroup._id,
      name,
      category,
      brand,
      price: Number(req.body.price),
      originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : undefined,
      stock: Number(req.body.stock),
      seller: seller._id,
      approvalStatus: 'pending',
    });

    await updateGroupStats(productGroup._id);

    res.status(201).json({ product, message: 'Product submitted for approval' });
  } catch (error) { next(error); }
};

exports.updateSellerProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, seller: req.user.id });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    Object.assign(product, req.body);
    product.approvalStatus = 'pending';
    await product.save();

    await updateGroupStats(product.productGroup);

    res.json({ product, message: 'Product updated and resubmitted for approval' });
  } catch (error) { next(error); }
};

exports.deleteSellerProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, seller: req.user.id });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const group = await ProductGroup.findById(product.productGroup);
    if (group) {
      group.sellerCount = Math.max(0, group.sellerCount - 1);
      if (group.sellerCount === 0) {
        await ProductGroup.findByIdAndDelete(group._id);
      } else {
        await updateGroupStats(group._id);
      }
    }

    res.json({ message: 'Product deleted' });
  } catch (error) { next(error); }
};

exports.getSellerOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ 'orderItems.seller': req.user.id }).sort('-createdAt');
    res.json({ orders });
  } catch (error) { next(error); }
};

async function updateGroupStats(groupId) {
  const sellers = await Product.find({ productGroup: groupId, approvalStatus: 'approved' });
  const prices = sellers.map(s => s.price);
  const totalReviews = sellers.reduce((sum, s) => sum + s.numReviews, 0);
  const avgRating = totalReviews > 0
    ? sellers.reduce((sum, s) => sum + (s.ratings * s.numReviews), 0) / totalReviews
    : 0;

  await ProductGroup.findByIdAndUpdate(groupId, {
    sellerCount: sellers.length,
    lowestPrice: prices.length ? Math.min(...prices) : 0,
    highestPrice: prices.length ? Math.max(...prices) : 0,
    avgRating: Math.round(avgRating * 10) / 10,
    totalReviews,
  });
}
