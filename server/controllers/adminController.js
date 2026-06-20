const Product = require('../models/Product');
const ProductGroup = require('../models/ProductGroup');
const Order = require('../models/Order');
const User = require('../models/User');
const Notification = require('../models/Notification');

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getStartOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getStartOfLastMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

function getEndOfLastMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

const EXCLUDED_CANCELLED = { orderStatus: { $ne: 'Cancelled' } };

function calculateOrderItemRevenue(order) {
  return order.orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

async function updateGroupStats(productGroupId) {
  const approvedSellers = await Product.find({
    productGroup: productGroupId,
    approvalStatus: 'approved',
  });

  const prices = approvedSellers.map((s) => s.price);
  const totalReviews = approvedSellers.reduce((sum, s) => sum + s.numReviews, 0);

  const weightedRatingSum = approvedSellers.reduce(
    (sum, s) => sum + s.ratings * s.numReviews,
    0
  );
  const avgRating = totalReviews > 0 ? weightedRatingSum / totalReviews : 0;

  await ProductGroup.findByIdAndUpdate(productGroupId, {
    sellerCount: approvedSellers.length,
    lowestPrice: prices.length ? Math.min(...prices) : 0,
    highestPrice: prices.length ? Math.max(...prices) : 0,
    avgRating: Math.round(avgRating * 10) / 10,
    totalReviews,
  });
}

function computePeriodStart(period) {
  const now = new Date();
  switch (period) {
    case 'week':
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return weekAgo;
    case 'year':
      return new Date(now.getFullYear(), 0, 1);
    case 'month':
    default:
      return new Date(now.getFullYear(), now.getMonth(), 1);
  }
}

function millisToHours(millis) {
  return millis / (1000 * 60 * 60);
}

function millisToDays(millis) {
  return millis / (1000 * 60 * 60 * 24);
}

// ─── Top-Level Aggregation Pipelines ───────────────────────────────────────────

const TOP_PRODUCTS_PIPELINE = [
  { $match: EXCLUDED_CANCELLED },
  { $unwind: '$orderItems' },
  {
    $group: {
      _id: '$orderItems.product',
      totalSold: { $sum: '$orderItems.quantity' },
      revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
    },
  },
  { $sort: { totalSold: -1 } },
  { $limit: 5 },
  { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'productData' } },
  { $addFields: { product: { $arrayElemAt: ['$productData', 0] } } },
  { $lookup: { from: 'productgroups', localField: 'product.productGroup', foreignField: '_id', as: 'groupData' } },
  { $addFields: { group: { $arrayElemAt: ['$groupData', 0] } } },
  {
    $project: {
      _id: 0,
      productId: '$_id',
      name: { $ifNull: ['$product.name', 'Unknown'] },
      image: { $ifNull: [{ $arrayElemAt: ['$group.images.url', 0] }, null] },
      totalSold: 1,
      revenue: 1,
    },
  },
];

function topSellingItemsPipeline(startDate) {
  return [
    { $match: { createdAt: { $gte: startDate }, ...EXCLUDED_CANCELLED } },
    { $unwind: '$orderItems' },
    {
      $group: {
        _id: '$orderItems.product',
        totalSold: { $sum: '$orderItems.quantity' },
        revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 },
    { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'productData' } },
    { $addFields: { product: { $arrayElemAt: ['$productData', 0] } } },
    { $lookup: { from: 'productgroups', localField: 'product.productGroup', foreignField: '_id', as: 'groupData' } },
    { $addFields: { group: { $arrayElemAt: ['$groupData', 0] } } },
    {
      $project: {
        _id: 0,
        productId: '$_id',
        name: { $ifNull: ['$product.name', 'Unknown'] },
        image: { $ifNull: [{ $arrayElemAt: ['$group.images.url', 0] }, null] },
        totalSold: 1,
        revenue: 1,
      },
    },
  ];
}

// ─── Admin Stats ───────────────────────────────────────────────────────────────

exports.getAdminStats = async (request, response, next) => {
  try {
    const today = new Date();

    const [revenueResult] = await Order.aggregate([
      { $match: EXCLUDED_CANCELLED },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueResult?.total || 0;

    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });

    const [thisMonth] = await Order.aggregate([
      { $match: { ...EXCLUDED_CANCELLED, createdAt: { $gte: getStartOfMonth(today) } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    const [lastMonth] = await Order.aggregate([
      {
        $match: {
          ...EXCLUDED_CANCELLED,
          createdAt: {
            $gte: getStartOfLastMonth(today),
            $lt: getEndOfLastMonth(today),
          },
        },
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    const lastMonthTotal = lastMonth?.total || 0;
    const thisMonthTotal = thisMonth?.total || 0;
    const revenueGrowth =
      lastMonthTotal > 0
        ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
        : 0;

    const [orderStatusBreakdown] = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]);

    const topProducts = await Order.aggregate(TOP_PRODUCTS_PIPELINE);

    const lowStockProducts = await Product.find({
      stock: { $lte: 10, $gt: 0 },
    })
      .select('name stock price')
      .sort('stock')
      .limit(10);

    const outOfStockProducts = await Product.countDocuments({ stock: 0 });
    const totalNotifications = await Notification.countDocuments();
    const pendingNotifications = await Notification.countDocuments({ notified: false });

    response.json({
      stats: {
        totalRevenue,
        totalOrders,
        totalUsers,
        pendingOrders,
        thisMonthRevenue: thisMonthTotal,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        orderStatusBreakdown,
        topProducts,
        lowStockProducts,
        outOfStockProducts,
        totalNotifications,
        pendingNotifications,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Product CRUD ──────────────────────────────────────────────────────────────

exports.getAdminProducts = async (request, response, next) => {
  try {
    const products = await ProductGroup.find().sort('-createdAt');
    response.json({ products });
  } catch (error) {
    next(error);
  }
};

exports.createAdminProduct = async (request, response, next) => {
  try {
    const {
      name,
      description,
      category,
      brand,
      images,
      videos,
      price,
      originalPrice,
      stock,
      isFeatured,
    } = request.body;

    const productGroup = await ProductGroup.create({
      name,
      description,
      category,
      brand,
      images: images || [],
      videos: videos || [],
      isFeatured,
    });

    const sellerListing = await Product.create({
      productGroup: productGroup._id,
      name,
      category,
      brand,
      price,
      originalPrice,
      stock,
      seller: request.user.id,
      approvalStatus: 'approved',
    });

    const result = {
      ...productGroup.toObject(),
      sellers: [sellerListing],
    };

    response.status(201).json({ product: result });
  } catch (error) {
    next(error);
  }
};

exports.updateAdminProduct = async (request, response, next) => {
  try {
    const updatedGroup = await ProductGroup.findByIdAndUpdate(
      request.params.id,
      request.body,
      { new: true }
    );

    if (request.body.stock && request.body.stock > 0) {
      const pendingNotifications = await Notification.find({
        product: request.params.id,
        notified: false,
      }).populate('user', 'email name');

      for (const notification of pendingNotifications) {
        notification.notified = true;
        notification.notifiedAt = Date.now();
        await notification.save();
      }
    }

    response.json({ product: updatedGroup });
  } catch (error) {
    next(error);
  }
};

exports.deleteAdminProduct = async (request, response, next) => {
  try {
    await Product.deleteMany({ productGroup: request.params.id });
    await ProductGroup.findByIdAndDelete(request.params.id);
    response.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ─── Order Management ──────────────────────────────────────────────────────────

exports.getAdminOrders = async (request, response, next) => {
  try {
    const { status, limit = 50 } = request.query;
    const filterQuery = status ? { orderStatus: status } : {};

    const orders = await Order.find(filterQuery)
      .populate('user', 'name')
      .sort('-createdAt')
      .limit(Number(limit));

    const total = await Order.countDocuments(filterQuery);

    response.json({ orders, total });
  } catch (error) {
    next(error);
  }
};

exports.updateAdminOrder = async (request, response, next) => {
  try {
    const order = await Order.findById(request.params.id);
    if (!order) {
      return response.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = request.body.status;
    if (request.body.status === 'Delivered') {
      order.deliveredAt = Date.now();
    }

    await order.save();
    response.json({ order });
  } catch (error) {
    next(error);
  }
};

// ─── User Management ───────────────────────────────────────────────────────────

exports.getAdminUsers = async (request, response, next) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    response.json({ users });
  } catch (error) {
    next(error);
  }
};

exports.getPendingSellers = async (request, response, next) => {
  try {
    const sellers = await User.find({ 'sellerInfo.status': 'pending' })
      .select('-password')
      .sort('-sellerInfo.appliedAt');
    response.json({ sellers });
  } catch (error) {
    next(error);
  }
};

exports.approveSeller = async (request, response, next) => {
  try {
    const user = await User.findById(request.params.id);
    if (!user || !user.isSeller) {
      return response.status(404).json({ message: 'Seller not found' });
    }

    user.sellerInfo.status = 'approved';
    user.sellerInfo.approvedAt = Date.now();
    user.role = 'seller';
    await user.save();

    response.json({ message: 'Seller approved', user });
  } catch (error) {
    next(error);
  }
};

exports.rejectSeller = async (request, response, next) => {
  try {
    const user = await User.findById(request.params.id);
    if (!user || !user.isSeller) {
      return response.status(404).json({ message: 'Seller not found' });
    }

    user.sellerInfo.status = 'rejected';
    user.role = 'user';
    await user.save();

    response.json({ message: 'Seller rejected', user });
  } catch (error) {
    next(error);
  }
};

// ─── Product Approval ──────────────────────────────────────────────────────────

exports.getPendingProducts = async (request, response, next) => {
  try {
    const products = await Product.find({ approvalStatus: 'pending' })
      .populate('seller', 'name email sellerInfo')
      .sort('-createdAt');
    response.json({ products });
  } catch (error) {
    next(error);
  }
};

exports.approveProduct = async (request, response, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      request.params.id,
      { approvalStatus: 'approved', rejectionReason: '' },
      { new: true }
    );

    if (product && product.productGroup) {
      await updateGroupStats(product.productGroup);
    }

    response.json({ message: 'Product approved', product });
  } catch (error) {
    next(error);
  }
};

exports.rejectProduct = async (request, response, next) => {
  try {
    const reason = request.body.reason || 'No reason provided';

    const product = await Product.findByIdAndUpdate(
      request.params.id,
      { approvalStatus: 'rejected', rejectionReason: reason },
      { new: true }
    );

    if (product && product.productGroup) {
      await updateGroupStats(product.productGroup);
    }

    response.json({ message: 'Product rejected', product });
  } catch (error) {
    next(error);
  }
};

// ─── Notifications ─────────────────────────────────────────────────────────────

exports.getNotifications = async (request, response, next) => {
  try {
    const { productId, status } = request.query;
    const filterQuery = {};

    if (productId) filterQuery.product = productId;
    if (status === 'pending') filterQuery.notified = false;
    if (status === 'sent') filterQuery.notified = true;

    const notifications = await Notification.find(filterQuery)
      .populate('user', 'name email')
      .populate('product', 'name price images')
      .sort('-createdAt');

    response.json({ notifications });
  } catch (error) {
    next(error);
  }
};

exports.markNotificationSent = async (request, response, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      request.params.id,
      { notified: true, notifiedAt: Date.now() },
      { new: true }
    );
    response.json({ message: 'Notification marked as sent', notification });
  } catch (error) {
    next(error);
  }
};

// ─── Inventory ─────────────────────────────────────────────────────────────────

exports.getInventoryStats = async (request, response, next) => {
  try {
    const productGroups = await ProductGroup.find().select(
      'name category brand images sellerCount lowestPrice highestPrice avgRating totalReviews'
    );

    const approvedSellers = await Product.find({ approvalStatus: 'approved' })
      .populate('seller', 'name email sellerInfo')
      .select('name category brand price stock seller productGroup ratings numReviews');

    const inventoryByCategory = {};

    for (const listing of approvedSellers) {
      const category = listing.category;
      if (!inventoryByCategory[category]) {
        inventoryByCategory[category] = {
          totalStock: 0,
          totalValue: 0,
          sellerCount: 0,
          products: [],
        };
      }
      inventoryByCategory[category].totalStock += listing.stock;
      inventoryByCategory[category].totalValue += listing.price * listing.stock;
      inventoryByCategory[category].products.push(listing);
    }

    for (const categoryData of Object.values(inventoryByCategory)) {
      const uniqueSellerIds = new Set(
        categoryData.products.map((p) => p.seller?._id.toString())
      );
      categoryData.sellerCount = uniqueSellerIds.size;
    }

    const lowStockListings = approvedSellers.filter(
      (s) => s.stock <= 10 && s.stock > 0
    );
    const outOfStockListings = approvedSellers.filter((s) => s.stock === 0);

    const totalStock = approvedSellers.reduce((sum, s) => sum + s.stock, 0);
    const totalInventoryValue = approvedSellers.reduce(
      (sum, s) => sum + s.price * s.stock,
      0
    );

    response.json({
      groups: productGroups.length,
      totalListings: approvedSellers.length,
      totalStock,
      totalInventoryValue,
      lowStockListings,
      outOfStockListings,
      inventoryByCategory,
      groups: productGroups,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Sales ──────────────────────────────────────────────────────────────────────

exports.getSalesStats = async (request, response, next) => {
  try {
    const { period = 'month' } = request.query;
    const startDate = computePeriodStart(period);

    const orders = await Order.find({
      createdAt: { $gte: startDate },
      ...EXCLUDED_CANCELLED,
    })
      .populate('user', 'name')
      .sort('-createdAt');

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const dailyRevenue = {};
    const dailyOrders = {};

    for (const order of orders) {
      const dateKey = new Date(order.createdAt).toLocaleDateString('en-IN');
      dailyRevenue[dateKey] = (dailyRevenue[dateKey] || 0) + order.totalPrice;
      dailyOrders[dateKey] = (dailyOrders[dateKey] || 0) + 1;
    }

    const sellerSales = {};
    for (const order of orders) {
      for (const item of order.orderItems) {
        const sellerId = item.seller?.toString();
        if (!sellerId) continue;

        if (!sellerSales[sellerId]) {
          sellerSales[sellerId] = {
            totalSales: 0,
            totalItems: 0,
            totalRevenue: 0,
            orders: 0,
          };
        }
        sellerSales[sellerId].totalRevenue += item.price * item.quantity;
        sellerSales[sellerId].totalItems += item.quantity;
        sellerSales[sellerId].orders += 1;
      }
    }

    const sellerDetails = await Promise.all(
      Object.entries(sellerSales).map(async ([sellerId, data]) => {
        const seller = await User.findById(sellerId).select('name email sellerInfo');
        const commissionRate = seller?.sellerInfo?.commissionRate || 10;
        const commissionAmount = (data.totalRevenue * commissionRate) / 100;

        return {
          sellerId,
          ...data,
          commission: commissionAmount,
          sellerEarnings: data.totalRevenue - commissionAmount,
          sellerName: seller?.sellerInfo?.storeName || seller?.name || 'Unknown',
          commissionRate,
        };
      })
    );

    const revenueChartData = Object.entries(dailyRevenue).map(
      ([date, revenue]) => ({
        date,
        revenue,
        orders: dailyOrders[date] || 0,
      })
    );

    const topSellingItemsData = await Order.aggregate(
      topSellingItemsPipeline(startDate)
    );

    response.json({
      totalRevenue,
      totalOrders,
      avgOrderValue,
      revenueChartData,
      sellerSales: sellerDetails.sort(
        (a, b) => b.totalRevenue - a.totalRevenue
      ),
      topSellingItems: topSellingItemsData,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Delivery ───────────────────────────────────────────────────────────────────

exports.getDeliveryStats = async (request, response, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name')
      .sort('-createdAt');

    const totalOrders = orders.length;

    const [statusBreakdown] = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
          totalValue: { $sum: '$totalPrice' },
        },
      },
    ]);

    const pendingOrders = orders.filter((o) => o.orderStatus === 'Pending');
    const processingOrders = orders.filter((o) => o.orderStatus === 'Processing');
    const shippedOrders = orders.filter((o) => o.orderStatus === 'Shipped');
    const deliveredOrders = orders.filter((o) => o.orderStatus === 'Delivered');
    const cancelledOrders = orders.filter((o) => o.orderStatus === 'Cancelled');

    const totalDeliveryTime = deliveredOrders.reduce((sum, order) => {
      if (order.deliveredAt && order.createdAt) {
        return sum + (new Date(order.deliveredAt) - new Date(order.createdAt));
      }
      return sum;
    }, 0);

    const avgDeliveryTime =
      deliveredOrders.length > 0
        ? totalDeliveryTime / deliveredOrders.length
        : 0;

    const onTimeDeliveries = deliveredOrders.filter((order) => {
      if (!order.deliveredAt) return false;
      return millisToDays(
        new Date(order.deliveredAt) - new Date(order.createdAt)
      ) <= 7;
    });

    const delayedDeliveries = deliveredOrders.filter((order) => {
      if (!order.deliveredAt) return false;
      return millisToDays(
        new Date(order.deliveredAt) - new Date(order.createdAt)
      ) > 7;
    });

    const deliveryPerformance = {
      onTime: onTimeDeliveries.length,
      delayed: delayedDeliveries.length,
      onTimePercentage:
        deliveredOrders.length > 0
          ? Math.round((onTimeDeliveries.length / deliveredOrders.length) * 100)
          : 0,
    };

    const recentShipments = orders
      .filter(
        (o) =>
          o.orderStatus === 'Shipped' || o.orderStatus === 'Processing'
      )
      .slice(0, 10);

    response.json({
      totalOrders,
      statusBreakdown,
      pendingCount: pendingOrders.length,
      processingCount: processingOrders.length,
      shippedCount: shippedOrders.length,
      deliveredCount: deliveredOrders.length,
      cancelledCount: cancelledOrders.length,
      avgDeliveryTime: Math.round(millisToHours(avgDeliveryTime) * 10) / 10,
      deliveryPerformance,
      recentShipments,
      pendingOrders,
      shippedOrders: shippedOrders.slice(0, 10),
    });
  } catch (error) {
    next(error);
  }
};

// ─── Commissions ────────────────────────────────────────────────────────────────

exports.getCommissionStats = async (request, response, next) => {
  try {
    const orders = await Order.find(EXCLUDED_CANCELLED);

    const sellerCommissionMap = {};

    for (const order of orders) {
      for (const item of order.orderItems) {
        const sellerId = item.seller?.toString();
        if (!sellerId) continue;

        const itemRevenue = item.price * item.quantity;

        if (!sellerCommissionMap[sellerId]) {
          sellerCommissionMap[sellerId] = {
            totalRevenue: 0,
            totalCommission: 0,
            totalEarnings: 0,
            ordersCount: 0,
            itemsSold: 0,
            pendingPayout: 0,
            paidPayout: 0,
          };
        }
        sellerCommissionMap[sellerId].totalRevenue += itemRevenue;
        sellerCommissionMap[sellerId].itemsSold += item.quantity;
        sellerCommissionMap[sellerId].ordersCount += 1;
      }
    }

    const allSellers = await User.find({ isSeller: true }).select(
      'name email sellerInfo'
    );

    const commissionData = await Promise.all(
      Object.entries(sellerCommissionMap).map(async ([sellerId, data]) => {
        const seller = allSellers.find(
          (s) => s._id.toString() === sellerId
        );
        const commissionRate = seller?.sellerInfo?.commissionRate || 10;
        const commissionAmount = (data.totalRevenue * commissionRate) / 100;

        return {
          sellerId,
          ...data,
          commissionRate,
          totalCommission: commissionAmount,
          totalEarnings: data.totalRevenue - commissionAmount,
          sellerName:
            seller?.sellerInfo?.storeName || seller?.name || 'Unknown',
          sellerEmail: seller?.email || '',
          sellerStatus: seller?.sellerInfo?.status || 'unknown',
        };
      })
    );

    const totalPlatformCommission = commissionData.reduce(
      (sum, entry) => sum + entry.totalCommission,
      0
    );
    const totalSellerEarnings = commissionData.reduce(
      (sum, entry) => sum + entry.totalEarnings,
      0
    );
    const totalGrossRevenue = commissionData.reduce(
      (sum, entry) => sum + entry.totalRevenue,
      0
    );

    const sortedByCommission = [...commissionData].sort(
      (a, b) => b.totalCommission - a.totalCommission
    );
    const sortedByEarnings = [...commissionData].sort(
      (a, b) => b.totalEarnings - a.totalEarnings
    );

    const sellersWithNoSales = allSellers
      .filter((s) => !sellerCommissionMap[s._id.toString()])
      .map((s) => ({
        sellerId: s._id,
        sellerName: s.sellerInfo?.storeName || s.name,
        sellerEmail: s.email,
        commissionRate: s.sellerInfo?.commissionRate || 10,
        status: s.sellerInfo?.status,
      }));

    response.json({
      totalGrossRevenue,
      totalPlatformCommission,
      totalSellerEarnings,
      platformMargin:
        totalGrossRevenue > 0
          ? Math.round((totalPlatformCommission / totalGrossRevenue) * 1000) / 10
          : 0,
      commissionData: sortedByCommission,
      topEarners: sortedByEarnings.slice(0, 5),
      sellersWithNoSales,
    });
  } catch (error) {
    next(error);
  }
};
