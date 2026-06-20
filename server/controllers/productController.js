const Product = require('../models/Product');
const ProductGroup = require('../models/ProductGroup');

const SORT_STRATEGIES = {
  'price-asc': (a, b) => a.lowestPrice - b.lowestPrice,
  'price-desc': (a, b) => b.lowestPrice - a.lowestPrice,
  'rating': (a, b) => b.avgRating - a.avgRating,
};

const DEFAULT_SORT = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);
const ITEMS_PER_PAGE = 12;
const MAX_PRICE_CAP = 1000000;

function buildFilterQuery(params) {
  const { keyword, category, isFeatured, minPrice, maxPrice } = params;
  const query = {};

  if (keyword) query.name = { $regex: keyword, $options: 'i' };
  if (category) query.category = category;
  if (isFeatured === 'true') query.isFeatured = true;

  const priceFloor = Number(minPrice) || 0;
  const priceCeil = Number(maxPrice) || MAX_PRICE_CAP;
  if (minPrice || maxPrice) {
    query.lowestPrice = { $gte: priceFloor, $lte: priceCeil };
  }

  return query;
}

exports.getProducts = async (req, res, next) => {
  try {
    const { sort, page = 1, limit = ITEMS_PER_PAGE } = req.query;
    const filterQuery = buildFilterQuery(req.query);

    const productGroups = await ProductGroup.find(filterQuery).populate({
      path: 'sellers',
      match: { approvalStatus: 'approved' },
      options: { limit: 1 },
    });

    const approvedGroups = productGroups.filter(
      (group) => group.sellers && group.sellers.length > 0
    );

    const total = approvedGroups.length;

    const sortStrategy = SORT_STRATEGIES[sort] || DEFAULT_SORT;
    const sortedGroups = [...approvedGroups].sort(sortStrategy);

    const startIndex = (Number(page) - 1) * Number(limit);
    const paginatedGroups = sortedGroups.slice(startIndex, startIndex + Number(limit));

    res.json({
      products: paginatedGroups,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await ProductGroup.distinct('category');
    res.json({ categories });
  } catch (error) {
    next(error);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const productGroup = await ProductGroup.findById(req.params.id);
    if (!productGroup) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const sellers = await Product.find({
      productGroup: req.params.id,
      approvalStatus: 'approved',
    })
      .populate('seller', 'name email')
      .sort({ price: 1 });

    const productWithSellers = {
      ...productGroup.toObject(),
      sellers,
    };

    res.json({ product: productWithSellers });
  } catch (error) {
    next(error);
  }
};

async function updateGroupReviewStats(productGroupId) {
  const allSellers = await Product.find({
    productGroup: productGroupId,
    approvalStatus: 'approved',
  });

  const totalReviews = allSellers.reduce(
    (sum, seller) => sum + seller.numReviews,
    0
  );

  const weightedRatingSum = allSellers.reduce(
    (sum, seller) => sum + seller.ratings * seller.numReviews,
    0
  );

  const avgRating = totalReviews > 0
    ? Math.round((weightedRatingSum / totalReviews) * 10) / 10
    : 0;

  await ProductGroup.findByIdAndUpdate(productGroupId, {
    totalReviews,
    avgRating,
  });
}

exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment, sellerId } = req.body;

    const sellerListing = await Product.findById(sellerId);
    if (!sellerListing) {
      return res.status(404).json({ message: 'Seller listing not found' });
    }

    const newReview = {
      user: req.user.id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    sellerListing.reviews.push(newReview);
    sellerListing.numReviews = sellerListing.reviews.length;
    sellerListing.ratings =
      sellerListing.reviews.reduce((sum, review) => sum + review.rating, 0) /
      sellerListing.numReviews;

    await sellerListing.save();

    await updateGroupReviewStats(sellerListing.productGroup);

    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    next(error);
  }
};
