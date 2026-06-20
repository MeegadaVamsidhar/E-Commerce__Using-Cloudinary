const Cart = require('../models/Cart');
const ProductGroup = require('../models/ProductGroup');

exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart) cart = await Cart.create({ user: req.user.id, items: [] });

    // Enrich cart items with product group images and convenience fields
    for (const item of cart.items) {
      if (item.product && item.product.productGroup) {
        const group = await ProductGroup.findById(item.product.productGroup);
        if (group) {
          item.product.images = group.images;
          item.image = group.images?.[0]?.url || '';
          item.productGroup = group;
        }
      }
    }

    res.json({ cart });
  } catch (error) { next(error); }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) cart = new Cart({ user: req.user.id, items: [] });

    const existingItem = cart.items.find(i => i.product.toString() === productId);
    if (existingItem) existingItem.quantity += quantity;
    else cart.items.push({ product: productId, quantity });

    await cart.save();
    cart = await Cart.findById(cart._id).populate('items.product');

    // Enrich with product group images and convenience fields
    for (const item of cart.items) {
      if (item.product && item.product.productGroup) {
        const group = await ProductGroup.findById(item.product.productGroup);
        if (group) {
          item.product.images = group.images;
          item.image = group.images?.[0]?.url || '';
          item.productGroup = group;
        }
      }
    }

    res.json({ cart });
  } catch (error) { next(error); }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const cart = await Cart.findOneAndUpdate(
      { user: req.user.id, 'items._id': itemId },
      { $set: { 'items.$.quantity': quantity } },
      { new: true }
    ).populate('items.product');

    // Enrich with product group images and convenience fields
    for (const item of cart.items) {
      if (item.product && item.product.productGroup) {
        const group = await ProductGroup.findById(item.product.productGroup);
        if (group) {
          item.product.images = group.images;
          item.image = group.images?.[0]?.url || '';
          item.productGroup = group;
        }
      }
    }

    res.json({ cart });
  } catch (error) { next(error); }
};

exports.removeCartItem = async (req, res, next) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user.id },
      { $pull: { items: { _id: req.params.itemId } } },
      { new: true }
    ).populate('items.product');

    // Enrich with product group images
    for (const item of cart.items) {
      if (item.product && item.product.productGroup) {
        const group = await ProductGroup.findById(item.product.productGroup);
        if (group) item.product.images = group.images;
      }
    }

    res.json({ cart });
  } catch (error) { next(error); }
};

exports.clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user.id }, { $set: { items: [] } });
    res.json({ message: 'Cart cleared' });
  } catch (error) { next(error); }
};
