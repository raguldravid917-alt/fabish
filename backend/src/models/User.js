const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../constants');

const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String, default: '' },
  landmark: { type: String, default: '' },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true, default: 'India' },
  addressType: { type: String, enum: ['Home', 'Office', 'Other'], default: 'Home' },
  isDefault: { type: Boolean, default: false }
});

const rewardHistorySchema = new mongoose.Schema({
  points: { type: Number, required: true },
  type: {
    type: String,
    enum: ['Earn', 'Redeem', 'Refund Adjustment', 'Registration Bonus', 'First Order Bonus'],
    required: true
  },
  reason: { type: String, required: true },
  orderRef: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: false, // Made optional to support passwordless Google OAuth
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    googleId: {
      type: String,
      default: null, // Added to identify Google users uniquely
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CUSTOMER,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    rewardPoints: {
      type: Number,
      default: 0,
    },
    lifetimeEarned: {
      type: Number,
      default: 0,
    },
    lifetimeRedeemed: {
      type: Number,
      default: 0,
    },
    tier: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
      default: 'Bronze',
    },
    rewardHistory: [rewardHistorySchema],
    phone: {
      type: String,
      default: '',
    },
    addresses: [addressSchema],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      }
    ],
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        quantity: {
          type: Number,
          default: 1,
        }
      }
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpire: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt before save (only if password exists)
userSchema.pre('save', async function (next) {
  if (!this.password || !this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false; // Prevent empty password matching for Google users
  return await bcrypt.compare(enteredPassword, this.password);
};

// Auto-sync isAdmin and role fields
userSchema.pre('save', function (next) {
  if (this.role === ROLES.ADMIN) {
    this.isAdmin = true;
  } else if (this.isAdmin) {
    this.role = ROLES.ADMIN;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);