const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    customerDetails: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: '' },
    },
    orderItems: [
      {
        title: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        sku: { type: String, default: '' },
        hsnCode: { type: String, default: '3304' }, // HSN for beauty/skincare products
        gstRate: { type: Number, default: 18 },     // GST % for this line item
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, default: '' },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
      default: 'Card',
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
      index: true,
    },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },
    deliveredAt: {
      type: Date,
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      default: null,
    },
    couponCode: {
      type: String,
      default: '',
    },
    discountAmount: {
      type: Number,
      required: true,
      default: 0.0,
    },
    // GST details for Indian Tax Invoice
    gstDetails: {
      taxableValue: { type: Number, default: 0 },   // Pre-tax subtotal (itemsPrice - discount)
      cgst: { type: Number, default: 0 },            // CGST amount (same state)
      sgst: { type: Number, default: 0 },            // SGST amount (same state)
      igst: { type: Number, default: 0 },            // IGST amount (inter-state)
      totalGst: { type: Number, default: 0 },        // Total GST collected
      gstRate: { type: Number, default: 18 },        // GST % rate applied
      isSameState: { type: Boolean, default: true }, // Same state = CGST+SGST, else IGST
      sellerState: { type: String, default: 'Tamil Nadu' },
      buyerState: { type: String, default: '' },
    },
    trackingNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    courierName: {
      type: String,
      default: 'Fabish Express',
    },
    estimatedDelivery: {
      type: Date,
    },
    trackingHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        details: { type: String, default: '' },
      }
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
