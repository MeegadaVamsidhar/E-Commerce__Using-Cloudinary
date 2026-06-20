const User = require('../models/User');

exports.getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    res.json({ products: user.wishlist || [] });
  } catch (error) { next(error); }
};

exports.toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user.id);
    const index = user.wishlist.indexOf(productId);
    let action = '';

    if (index === -1) {
      user.wishlist.push(productId);
      action = 'added';
    } else {
      user.wishlist.splice(index, 1);
      action = 'removed';
    }

    await user.save();
    const updatedUser = await User.findById(req.user.id).populate('wishlist');
    res.json({ action, products: updatedUser.wishlist });
  } catch (error) { next(error); }
};
