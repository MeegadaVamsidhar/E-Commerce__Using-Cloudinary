const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  public_id: String,
  url: String,
}, { _id: false });

const videoSchema = new mongoose.Schema({
  public_id: String,
  url: String,
  thumbnail: String,
  duration: Number,
}, { _id: false });

const productGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    brand: { type: String, trim: true },
    images: [mediaSchema],
    videos: [videoSchema],
    isFeatured: { type: Boolean, default: false, index: true },
    sellerCount: { type: Number, default: 0 },
    lowestPrice: { type: Number, default: 0 },
    highestPrice: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productGroupSchema.virtual('sellers', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'productGroup',
});

productGroupSchema.set('toJSON', { virtuals: true });
productGroupSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ProductGroup', productGroupSchema);
