const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

const bankDetailsSchema = new mongoose.Schema({
  accountHolder: String,
  accountNumber: String,
  ifsc: String,
  bankName: String,
}, { _id: false });

const sellerInfoSchema = new mongoose.Schema({
  storeName: String,
  storeDescription: String,
  commissionRate: { type: Number, default: 10 },
  bankDetails: bankDetailsSchema,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  appliedAt: Date,
  approvedAt: Date,
}, { _id: false });

const avatarSchema = new mongoose.Schema({
  public_id: String,
  url: String,
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ['user', 'admin', 'seller'],
      default: 'user',
    },
    avatar: avatarSchema,
    phone: String,
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    isSeller: { type: Boolean, default: false },
    sellerInfo: sellerInfoSchema,
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
