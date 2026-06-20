const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const ProductGroup = require('../models/ProductGroup');

// @desc   Create or update product review
// @route  POST /api/reviews/:productId
// @access Private
const createReview = asyncHandler(async (req, res) => {
  const { rating, comment, sellerId } = req.body;
  const targetSellerId = sellerId || req.params.productId;
  
  const product = await Product.findById(targetSellerId);

  if (!product) {
    res.status(404);
    throw new Error('Seller listing not found');
  }

  // Check if already reviewed this seller
  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    alreadyReviewed.rating = Number(rating);
    alreadyReviewed.comment = comment;
    alreadyReviewed.name = req.user.name;
  } else {
    product.reviews.push({
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    });
    product.numReviews = product.reviews.length;
  }

  product.ratings =
    product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

  await product.save();

  // Update group stats
  const allSellers = await Product.find({ productGroup: product.productGroup, approvalStatus: 'approved' });
  const totalReviews = allSellers.reduce((sum, s) => sum + s.numReviews, 0);
  const avgRating = totalReviews > 0
    ? allSellers.reduce((sum, s) => sum + (s.ratings * s.numReviews), 0) / totalReviews
    : 0;

  await ProductGroup.findByIdAndUpdate(product.productGroup, {
    totalReviews,
    avgRating: Math.round(avgRating * 10) / 10,
  });

  res.status(201).json({ success: true, message: 'Review added' });
});

// @desc   Get product reviews
// @route  GET /api/reviews/:productId
// @access Public
const getProductReviews = asyncHandler(async (req, res) => {
  // Could be a product group ID or seller product ID
  let sellers = await Product.find({ productGroup: req.params.productId, approvalStatus: 'approved' })
    .populate('seller', 'name');

  if (sellers.length === 0) {
    // Try as a seller product ID
    const product = await Product.findById(req.params.productId)
      .populate('seller', 'name');
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    sellers = [product];
  }

  const allReviews = sellers.flatMap(s => s.reviews);
  const totalReviews = sellers.reduce((sum, s) => sum + s.numReviews, 0);
  const avgRating = totalReviews > 0
    ? sellers.reduce((sum, s) => sum + (s.ratings * s.numReviews), 0) / totalReviews
    : 0;

  res.json({ success: true, reviews: allReviews, ratings: avgRating, numReviews: totalReviews });
});

// @desc   Delete review
// @route  DELETE /api/reviews/:productId/:reviewId
// @access Private
const deleteReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const review = product.reviews.id(req.params.reviewId);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this review');
  }

  product.reviews.pull(req.params.reviewId);
  product.numReviews = product.reviews.length;
  product.ratings = product.reviews.length
    ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
    : 0;

  await product.save();

  // Update group stats
  const allSellers = await Product.find({ productGroup: product.productGroup, approvalStatus: 'approved' });
  const totalReviews = allSellers.reduce((sum, s) => sum + s.numReviews, 0);
  const avgRating = totalReviews > 0
    ? allSellers.reduce((sum, s) => sum + (s.ratings * s.numReviews), 0) / totalReviews
    : 0;

  await ProductGroup.findByIdAndUpdate(product.productGroup, {
    totalReviews,
    avgRating: Math.round(avgRating * 10) / 10,
  });

  res.json({ success: true, message: 'Review deleted' });
});

module.exports = { createReview, getProductReviews, deleteReview };
