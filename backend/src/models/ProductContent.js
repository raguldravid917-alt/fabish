const mongoose = require('mongoose');

// ─── Section Config (Layout / Order / Enable-Disable) ────────────────────────
const ProductSectionConfigSchema = new mongoose.Schema({
  product:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  sectionType: { type: String, required: true },
  isEnabled:   { type: Boolean, default: true },
  order:       { type: Number, default: 0 }
}, { timestamps: true });

// ─── Highlights ───────────────────────────────────────────────────────────────
const ProductHighlightSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  text:    { type: String, required: true },
  order:   { type: Number, default: 0 }
}, { timestamps: true });

// ─── Key Benefits ─────────────────────────────────────────────────────────────
const ProductBenefitSchema = new mongoose.Schema({
  product:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  icon:        { type: String, default: '' },
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  order:       { type: Number, default: 0 }
}, { timestamps: true });

// ─── Ingredients / Materials ──────────────────────────────────────────────────
const ProductIngredientSchema = new mongoose.Schema({
  product:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  name:        { type: String, required: true },
  description: { type: String, default: '' },
  order:       { type: Number, default: 0 }
}, { timestamps: true });

// ─── Product Specifications ───────────────────────────────────────────────────
const ProductSpecificationSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  key:     { type: String, required: true },
  value:   { type: String, required: true },
  order:   { type: Number, default: 0 }
}, { timestamps: true });

// ─── How-to-Use Steps ─────────────────────────────────────────────────────────
const ProductUsageStepSchema = new mongoose.Schema({
  product:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  title:       { type: String, default: '' },
  instruction: { type: String, required: true },
  order:       { type: Number, default: 0 }
}, { timestamps: true });

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const ProductFAQSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  question: { type: String, required: true },
  answer:   { type: String, required: true },
  order:    { type: Number, default: 0 }
}, { timestamps: true });

// ─── Text Sections (Rich / Policy Blocks) ────────────────────────────────────
const ProductTextSectionSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  sectionType: {
    type: String,
    required: true,
    enum: [
      // Original 6
      'shipping', 'returns', 'warranty', 'storage', 'safety', 'additional',
      // New 7
      'richDescription', 'activeIngredients', 'skinType', 'suitableFor',
      'countryOfOrigin', 'shelfLife', 'care'
    ]
  },
  content: { type: String, default: '' }
}, { timestamps: true });

// ─── Frequently Bought Together ───────────────────────────────────────────────
const ProductFrequentlyBoughtTogetherSchema = new mongoose.Schema({
  product:       { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  bundleProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }
}, { timestamps: true });

// ─── NEW: Certifications ──────────────────────────────────────────────────────
const ProductCertificationSchema = new mongoose.Schema({
  product:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  name:        { type: String, required: true },           // e.g. "Cruelty-Free"
  icon:        { type: String, default: 'Award' },         // Lucide icon key
  description: { type: String, default: '' },
  order:       { type: Number, default: 0 }
}, { timestamps: true });

// ─── NEW: Trust Badges ────────────────────────────────────────────────────────
const ProductTrustBadgeSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  title:   { type: String, required: true },               // e.g. "Money-Back Guarantee"
  icon:    { type: String, default: 'Shield' },            // Lucide icon key
  order:   { type: Number, default: 0 }
}, { timestamps: true });

// ─── NEW: Offers / Coupons / Bundles ─────────────────────────────────────────
const ProductOfferSchema = new mongoose.Schema({
  product:       { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  type:          { type: String, enum: ['coupon', 'bundle', 'combo', 'limited'], required: true },
  title:         { type: String, required: true },
  description:   { type: String, default: '' },
  code:          { type: String, default: '' },            // Coupon code (optional)
  discountValue: { type: String, default: '' },            // e.g. "10%" or "₹100 off"
  validUntil:    { type: Date, default: null },
  isActive:      { type: Boolean, default: true },
  order:         { type: Number, default: 0 }
}, { timestamps: true });

// ─── NEW: Why You'll Love It ──────────────────────────────────────────────────
const ProductWhyLoveSchema = new mongoose.Schema({
  product:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  icon:        { type: String, default: 'Heart' },         // Lucide icon key
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  order:       { type: Number, default: 0 }
}, { timestamps: true });

// ─── NEW: Care Instructions ───────────────────────────────────────────────────
const ProductCareInstructionSchema = new mongoose.Schema({
  product:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  instruction: { type: String, required: true },
  order:       { type: Number, default: 0 }
}, { timestamps: true });

// ─── Indexes for performance ──────────────────────────────────────────────────
ProductSectionConfigSchema.index({ product: 1, sectionType: 1 }, { unique: true, sparse: true });
ProductTextSectionSchema.index({ product: 1, sectionType: 1 });

// ─── Exports ──────────────────────────────────────────────────────────────────
module.exports = {
  ProductSectionConfig:          mongoose.model('ProductSectionConfig', ProductSectionConfigSchema),
  ProductHighlight:              mongoose.model('ProductHighlight', ProductHighlightSchema),
  ProductBenefit:                mongoose.model('ProductBenefit', ProductBenefitSchema),
  ProductIngredient:             mongoose.model('ProductIngredient', ProductIngredientSchema),
  ProductSpecification:          mongoose.model('ProductSpecification', ProductSpecificationSchema),
  ProductUsageStep:              mongoose.model('ProductUsageStep', ProductUsageStepSchema),
  ProductFAQ:                    mongoose.model('ProductFAQ', ProductFAQSchema),
  ProductTextSection:            mongoose.model('ProductTextSection', ProductTextSectionSchema),
  ProductFrequentlyBoughtTogether: mongoose.model('ProductFrequentlyBoughtTogether', ProductFrequentlyBoughtTogetherSchema),
  // New models
  ProductCertification:          mongoose.model('ProductCertification', ProductCertificationSchema),
  ProductTrustBadge:             mongoose.model('ProductTrustBadge', ProductTrustBadgeSchema),
  ProductOffer:                  mongoose.model('ProductOffer', ProductOfferSchema),
  ProductWhyLove:                mongoose.model('ProductWhyLove', ProductWhyLoveSchema),
  ProductCareInstruction:        mongoose.model('ProductCareInstruction', ProductCareInstructionSchema),
};
