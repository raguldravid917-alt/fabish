const mongoose = require('mongoose');
const { PRODUCT_STATUS } = require('../constants');

const imageSchema = new mongoose.Schema({
  secure_url: {
    type: String,
    required: [true, 'secure_url is required for product images'],
  },
  public_id: {
    type: String,
    required: [true, 'public_id is required for product images'],
  },
  width: Number,
  height: Number,
  format: String,
  bytes: Number,
}, { _id: false });

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a product title'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a product description'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a product price'],
      min: [0, 'Price must be a positive number'],
      default: 0.0,
    },
    comparePrice: {
      type: Number,
      min: [0, 'Compare price must be a positive number'],
      default: 0.0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please specify a category reference'],
      index: true,
    },
    subcategory: {
      type: String,
      trim: true,
      default: '',
    },
    brand: {
      type: String,
      trim: true,
      default: 'Fabish',
    },
    images: {
      type: [imageSchema],
      required: true,
      default: [],
    },
    thumbnail: {
      type: String,
      default: '',
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 10,
    },
    sku: {
      type: String,
      trim: true,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    variants: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    bestSeller: {
      type: Boolean,
      default: false,
    },
    newArrival: {
      type: Boolean,
      default: false,
    },
    trending: {
      type: Boolean,
      default: false,
    },
    ratings: {
      type: Number,
      required: true,
      default: 0.0,
    },
    reviewsCount: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUS),
      default: PRODUCT_STATUS.PUBLISHED,
      index: true,
    },
    seoTitle: {
      type: String,
      trim: true,
      default: '',
    },
    seoDescription: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Create compound and text indexes for search optimizations
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ price: 1, ratings: -1 });

module.exports = mongoose.model('Product', productSchema);
