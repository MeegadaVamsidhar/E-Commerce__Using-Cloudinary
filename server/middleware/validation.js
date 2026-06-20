const validateRegistration = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please provide a valid email address');
  }

  // Password strength: min 8 chars, uppercase, lowercase, number, special char
  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters');
  } else if (!PASSWORD_REGEX.test(password)) {
    errors.push('Password must contain uppercase, lowercase, number, and special character (@$!%*?&)');
  }

  if (password && password.length > 128) {
    errors.push('Password must not exceed 128 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors.join('. ') });
  }

  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) {
    errors.push('Email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors.join('. ') });
  }

  next();
};

const validateReview = (req, res, next) => {
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  if (!comment || typeof comment !== 'string' || comment.trim().length < 3) {
    return res.status(400).json({ message: 'Comment must be at least 3 characters' });
  }

  if (comment.length > 500) {
    return res.status(400).json({ message: 'Comment must not exceed 500 characters' });
  }

  req.body.comment = comment.trim();
  next();
};

const validateOrder = (req, res, next) => {
  const { orderItems, shippingAddress } = req.body;
  const errors = [];

  if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
    errors.push('Order must contain at least one item');
  }

  if (!shippingAddress) {
    errors.push('Shipping address is required');
  } else {
    const requiredFields = ['street', 'city', 'state', 'zip', 'country', 'phone'];
    for (const field of requiredFields) {
      if (!shippingAddress[field] || shippingAddress[field].trim() === '') {
        errors.push(`Shipping address ${field} is required`);
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors.join('. ') });
  }

  next();
};

const validateProfileUpdate = (req, res, next) => {
  const { newPassword, currentPassword } = req.body;
  const errors = [];

  // If updating password, validate both fields
  if (newPassword) {
    if (!currentPassword) {
      errors.push('Current password is required to change password');
    }

    const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    if (newPassword.length < 8) {
      errors.push('New password must be at least 8 characters');
    } else if (!PASSWORD_REGEX.test(newPassword)) {
      errors.push('New password must contain uppercase, lowercase, number, and special character (@$!%*?&)');
    }

    if (newPassword.length > 128) {
      errors.push('Password must not exceed 128 characters');
    }

    if (newPassword === currentPassword) {
      errors.push('New password must be different from current password');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors.join('. ') });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateReview,
  validateOrder,
  validateProfileUpdate
};
