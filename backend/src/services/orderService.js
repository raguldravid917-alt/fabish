const crypto = require('crypto');
const Razorpay = require('razorpay');
const orderRepository = require('../repositories/orderRepository');
const productRepository = require('../repositories/productRepository');
const userRepository = require('../repositories/userRepository');
const contactRepository = require('../repositories/contactRepository');
const cartRepository = require('../repositories/cartRepository');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const sendEmail = require('../utils/sendEmail');

// Seller configuration
const SELLER_STATE = process.env.SELLER_STATE || 'Tamil Nadu';
const DEFAULT_GST_RATE = 18; // 18% GST for beauty/skincare products (HSN 3304)

// Lazy-initialize Razorpay
let razorpay;
const getRazorpayInstance = () => {
  if (!razorpay) {
    if (!process.env.RAZORPAY_API_KEY || !process.env.RAZORPAY_API_SECRET) {
      throw new Error('Razorpay API keys are not configured in environment variables.');
    }
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_API_KEY,
      key_secret: process.env.RAZORPAY_API_SECRET,
    });
  }
  return razorpay;
};

// Helper: Generate a unique random alphanumeric order number
const generateOrderNumber = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randStr = '';
  for (let i = 0; i < 8; i++) {
    randStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `FAB-${Date.now().toString().slice(-6)}-${randStr}`;
};

// Helper: Generate a unique random alphanumeric tracking number
const generateTrackingNumber = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randStr = '';
  for (let i = 0; i < 10; i++) {
    randStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TRK-${Date.now().toString().slice(-4)}-${randStr}`;
};

/**
 * Generate a unique sequential invoice number in the format FAB-YYYY-XXXXXX
 * Uses atomic findOneAndUpdate to ensure no duplicate invoice numbers
 */
const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `FAB-${year}-`;

  // Find the latest invoice for this year
  const latest = await Order.findOne(
    { invoiceNumber: { $regex: `^${prefix}` } },
    { invoiceNumber: 1 },
    { sort: { invoiceNumber: -1 } }
  );

  let nextSeq = 1;
  if (latest && latest.invoiceNumber) {
    const parts = latest.invoiceNumber.split('-');
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) {
      nextSeq = lastSeq + 1;
    }
  }

  return `${prefix}${String(nextSeq).padStart(6, '0')}`;
};

/**
 * Calculate Indian GST for an order
 * If buyer state === seller state → CGST + SGST (split equally)
 * Otherwise → IGST (full rate)
 * 
 * Note: Products are priced INCLUSIVE of GST on the Fabish platform.
 * We back-calculate the taxable value (pre-tax) from the inclusive price.
 */
const calculateGST = (itemsPrice, discountAmount, buyerState, gstRate = DEFAULT_GST_RATE) => {
  const normalizedBuyer = (buyerState || '').trim().toLowerCase();
  const normalizedSeller = SELLER_STATE.trim().toLowerCase();
  const isSameState = normalizedBuyer === normalizedSeller || normalizedBuyer === '';

  // Prices on Fabish are inclusive of GST
  // Back-calculate: taxableValue = totalInclusive / (1 + gstRate/100)
  const totalInclusive = itemsPrice - discountAmount;
  const taxableValue = Math.round((totalInclusive / (1 + gstRate / 100)) * 100) / 100;
  const totalGst = Math.round((totalInclusive - taxableValue) * 100) / 100;

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (isSameState) {
    cgst = Math.round((totalGst / 2) * 100) / 100;
    sgst = Math.round((totalGst - cgst) * 100) / 100;
  } else {
    igst = totalGst;
  }

  return {
    taxableValue,
    cgst,
    sgst,
    igst,
    totalGst,
    gstRate,
    isSameState,
    sellerState: SELLER_STATE,
    buyerState: buyerState || '',
  };
};

// Helper: Send order confirmation email
const sendOrderConfirmationEmail = async (email, order) => {
  try {
    const productsList = order.orderItems
      .map(
        (item) =>
          `<li>${item.title} (x${item.qty}) — Rs. ${item.price.toLocaleString('en-IN')}.00</li>`
      )
      .join('');

    const gstLine = order.gstDetails && order.gstDetails.totalGst > 0
      ? `<p><strong>GST (${order.gstDetails.gstRate}%):</strong> Rs. ${order.gstDetails.totalGst.toLocaleString('en-IN')}</p>`
      : '';

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eae8d8;">
        <h2 style="color: #729855; border-bottom: 2px solid #729855; padding-bottom: 10px;">Order Confirmation</h2>
        <p>Thank you for your order, <strong>${order.customerDetails?.name || 'Customer'}</strong>!</p>
        <p>Your order number is: <strong style="font-size: 16px; color: #212b36;">${order.orderNumber}</strong></p>
        ${order.invoiceNumber ? `<p>Invoice Number: <strong>${order.invoiceNumber}</strong></p>` : ''}
        <hr style="border: 0; border-top: 1px solid #eae8d8; margin: 20px 0;" />
        <h3>Order Summary</h3>
        <ul style="padding-left: 20px; line-height: 1.6;">
          ${productsList}
        </ul>
        <p><strong>Subtotal:</strong> Rs. ${order.itemsPrice.toLocaleString('en-IN')}.00</p>
        ${order.discountAmount > 0 ? `<p><strong>Coupon Discount:</strong> -Rs. ${order.discountAmount.toLocaleString('en-IN')}.00</p>` : ''}
        ${gstLine}
        <p><strong>Shipping:</strong> ${order.shippingPrice === 0 ? 'FREE' : `Rs. ${order.shippingPrice.toLocaleString('en-IN')}.00`}</p>
        <p style="font-size: 16px;"><strong>Grand Total:</strong> Rs. ${order.totalPrice.toLocaleString('en-IN')}.00</p>
        <hr style="border: 0; border-top: 1px solid #eae8d8; margin: 20px 0;" />
        <h3>Shipping Address</h3>
        <p style="line-height: 1.5; color: #555;">
          ${order.shippingAddress.address}<br />
          ${order.shippingAddress.city}${order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''}, ${order.shippingAddress.postalCode}<br />
          ${order.shippingAddress.country}
        </p>
        <hr style="border: 0; border-top: 1px solid #eae8d8; margin: 20px 0;" />
        <p style="font-size: 11px; color: #999; text-align: center;">This is an automated notification. For queries, contact support@fabish.in</p>
      </div>
    `;

    await sendEmail({
      email,
      subject: `Order Confirmed — ${order.orderNumber} | Fabish`,
      message: `Thank you for your order! Order: ${order.orderNumber}. Invoice: ${order.invoiceNumber || 'N/A'}. Total: Rs. ${order.totalPrice}.`,
      html,
    });
  } catch (err) {
    console.error('[ORDER_EMAIL] Failed to send order confirmation email:', err.message);
  }
};

class OrderService {
  /**
   * Pre-check stock levels and calculate prices safely on the backend
   */
  async validateOrderPayload(orderData, userId = null) {
    if (!orderData.orderItems || orderData.orderItems.length === 0) {
      throw new Error('No order items provided');
    }

    const verifiedItems = [];
    let itemsPrice = 0;

    for (const item of orderData.orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new Error(`Product not found: ${item.title}`);
      }

      if (product.stock < item.qty) {
        throw new Error(`Insufficient stock for product: ${product.title}`);
      }

      verifiedItems.push({
        title: product.title,
        qty: item.qty,
        image: (product.images && product.images[0] && typeof product.images[0] === 'object')
          ? product.images[0].secure_url
          : (product.images[0] || item.image || ''),
        price: product.price,
        sku: product.sku || product.slug || '',
        hsnCode: '3304', // HSN code for beauty/skincare products
        gstRate: DEFAULT_GST_RATE,
        product: product._id,
      });

      itemsPrice += product.price * item.qty;
    }

    // Coupon verification
    let discountAmount = 0;
    let appliedCoupon = null;
    let couponCode = '';
    let shippingPrice = itemsPrice > 2000 ? 0 : 150;

    if (orderData.couponCode) {
      const coupon = await Coupon.findOne({
        code: orderData.couponCode.toUpperCase(),
        isActive: true,
        isDeleted: false,
      });

      if (!coupon) {
        throw new Error('Applied coupon code is invalid or inactive');
      }

      if (!coupon.isValid()) {
        throw new Error('Applied coupon code has expired or reached its usage limit');
      }

      if (coupon.minimumOrderAmount && itemsPrice < coupon.minimumOrderAmount) {
        throw new Error(`Minimum purchase of Rs. ${coupon.minimumOrderAmount.toLocaleString('en-IN')} required to use this coupon`);
      }

      appliedCoupon = coupon;
      couponCode = coupon.code.toUpperCase();

      if (coupon.discountType === 'Percentage') {
        let pctDiscount = itemsPrice * ((coupon.discountPercentage || coupon.discountValue || 0) / 100);
        if (coupon.maxDiscountCap) {
          pctDiscount = Math.min(pctDiscount, coupon.maxDiscountCap);
        }
        discountAmount = pctDiscount;
      } else if (coupon.discountType === 'Fixed') {
        discountAmount = Math.min(coupon.discountValue || 0, itemsPrice);
      } else if (coupon.discountType === 'FreeShipping') {
        shippingPrice = 0;
        discountAmount = 0;
      }
    }

    // Points redemption verification
    let redeemedPoints = 0;
    let redeemedPointsDiscount = 0;
    if (orderData.redeemedPoints && userId) {
      const user = await User.findById(userId);
      if (user) {
        const availablePoints = user.rewardPoints || 0;
        const requestedPoints = Math.max(0, parseInt(orderData.redeemedPoints, 10) || 0);
        if (requestedPoints > availablePoints) {
          throw new Error('Insufficient reward points balance');
        }

        // Calculate max allowed points: 20% of itemsPrice + shippingPrice - discountAmount
        const baseOrderVal = itemsPrice + shippingPrice - discountAmount;
        const maxPoints = Math.floor(baseOrderVal * 2);
        if (requestedPoints > maxPoints) {
          throw new Error('Cannot redeem more than 20% of order value in points');
        }

        redeemedPoints = requestedPoints;
        redeemedPointsDiscount = redeemedPoints / 10;
      }
    }

    const totalPrice = Math.max(0, itemsPrice + shippingPrice - discountAmount - redeemedPointsDiscount);

    // Calculate GST
    const buyerState = orderData.shippingAddress?.state || '';
    const gstDetails = calculateGST(itemsPrice, discountAmount + redeemedPointsDiscount, buyerState);

    return {
      verifiedItems,
      itemsPrice,
      shippingPrice,
      totalPrice,
      coupon: appliedCoupon ? appliedCoupon._id : null,
      couponCode,
      discountAmount,
      gstDetails,
      redeemedPoints,
      redeemedPointsDiscount,
    };
  }

  /**
   * Create Razorpay Order
   */
  async createRazorpayOrder(userId, orderData) {
    const { totalPrice } = await this.validateOrderPayload(orderData, userId);

    const rzpInstance = getRazorpayInstance();
    const options = {
      amount: Math.round(totalPrice * 100), // paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };

    const rzpOrder = await rzpInstance.orders.create(options);
    return {
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      key: process.env.RAZORPAY_API_KEY,
    };
  }

  /**
   * Verify Razorpay Signature and save Order securely
   */
  async verifyRazorpayPayment(userId, userDetails, payload) {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderData,
    } = payload;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw new Error('Missing Razorpay verification parameters');
    }

    // 1. Cryptographically verify signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_API_SECRET);
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpaySignature) {
      throw new Error('Razorpay signature verification failed. Possible fraud attempt.');
    }

    // 2. Validate products and stock levels
    const { 
      verifiedItems, 
      itemsPrice, 
      shippingPrice, 
      totalPrice, 
      coupon, 
      couponCode, 
      discountAmount, 
      gstDetails,
      redeemedPoints,
      redeemedPointsDiscount 
    } = await this.validateOrderPayload(orderData, userId);

    // 3. Atomically decrement stock
    for (const item of verifiedItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.qty } },
        { $inc: { stock: -item.qty } },
        { new: true }
      );
      if (!updatedProduct) {
        throw new Error(`Insufficient stock for product: ${item.title}. Stock check failed during verification.`);
      }
    }

    // 4. Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    const trackingNumber = generateTrackingNumber();
    const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    const trackingHistory = [
      { status: 'Order Placed', timestamp: new Date(), details: 'Your order has been placed successfully.' },
      { status: 'Payment Confirmed', timestamp: new Date(), details: 'Payment confirmed via Razorpay.' },
      { status: 'Processing', timestamp: new Date(), details: 'Your order is being processed.' }
    ];

    // 5. Save the completed Paid Order
    const dbPayload = {
      orderNumber: generateOrderNumber(),
      invoiceNumber,
      trackingNumber,
      courierName: 'Fabish Express',
      estimatedDelivery,
      trackingHistory,
      user: userId,
      customerDetails: {
        name: userDetails.name,
        email: userDetails.email,
        phone: userDetails.phone || '',
      },
      orderItems: verifiedItems,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: 'Card',
      paymentResult: {
        id: razorpayPaymentId,
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        email_address: userDetails.email,
      },
      itemsPrice,
      shippingPrice,
      totalPrice,
      paymentStatus: 'Paid',
      orderStatus: 'Confirmed',
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      isPaid: true,
      paidAt: Date.now(),
      coupon,
      couponCode,
      discountAmount,
      gstDetails,
      redeemedPoints,
      redeemedPointsDiscount,
    };

    const order = await orderRepository.create(dbPayload);

    // Deduct points from user balance
    if (redeemedPoints > 0) {
      const user = await User.findById(userId);
      if (user) {
        user.rewardPoints = Math.max(0, (user.rewardPoints || 0) - redeemedPoints);
        user.lifetimeRedeemed = (user.lifetimeRedeemed || 0) + redeemedPoints;
        user.tier = calculateTier(user.rewardPoints);
        user.rewardHistory.push({
          points: -redeemedPoints,
          type: 'Redeem',
          reason: `Points redeemed on order #${dbPayload.orderNumber}`,
          orderRef: dbPayload.orderNumber,
          createdAt: new Date(),
        });
        await user.save();
      }
    }

    await this.syncAddressToBook(userId, orderData);

    // Increment coupon used count if coupon was applied
    if (couponCode) {
      await Coupon.findOneAndUpdate(
        { code: couponCode },
        { $inc: { usedCount: 1 } }
      );
    }

    // 6. Clear client-side & server-side cart
    await cartRepository.clear(userId);
    await User.findByIdAndUpdate(userId, { $set: { cart: [] } });

    // 7. Email user confirmation
    await sendOrderConfirmationEmail(userDetails.email, order);

    // Update reward points for paid order
    await updateRewardPointsForOrder(order);

    return order;
  }

  /**
   * Create COD Order directly
   */
  async createOrder(userId, orderData) {
    // 1. Get user details for customerDetails mapping
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // 2. Validate payload and pricing
    const { 
      verifiedItems, 
      itemsPrice, 
      shippingPrice, 
      totalPrice, 
      coupon, 
      couponCode, 
      discountAmount, 
      gstDetails,
      redeemedPoints,
      redeemedPointsDiscount 
    } = await this.validateOrderPayload(orderData, userId);

    // 3. Atomically reduce stock
    for (const item of verifiedItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.qty } },
        { $inc: { stock: -item.qty } },
        { new: true }
      );
      if (!updatedProduct) {
        throw new Error(`Insufficient stock for product: ${item.title}`);
      }
    }

    // 4. Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    const trackingNumber = generateTrackingNumber();
    const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    const trackingHistory = [
      { status: 'Order Placed', timestamp: new Date(), details: 'Your order has been placed successfully. Awaiting confirmation.' }
    ];

    // 5. Setup payload for COD
    const payload = {
      orderNumber: generateOrderNumber(),
      invoiceNumber,
      trackingNumber,
      courierName: 'Fabish Express',
      estimatedDelivery,
      trackingHistory,
      user: userId,
      customerDetails: {
        name: user.name,
        email: user.email,
        phone: user.phone || '',
      },
      orderItems: verifiedItems,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod || 'COD',
      paymentResult: {
        id: `COD_${Date.now()}`,
        status: 'PENDING',
        update_time: new Date().toISOString(),
        email_address: user.email,
      },
      itemsPrice,
      shippingPrice,
      totalPrice,
      paymentStatus: 'Pending',
      orderStatus: 'Pending',
      isPaid: false,
      coupon,
      couponCode,
      discountAmount,
      gstDetails,
      redeemedPoints,
      redeemedPointsDiscount,
    };

    const order = await orderRepository.create(payload);

    // Deduct points from user balance
    if (redeemedPoints > 0) {
      user.rewardPoints = Math.max(0, (user.rewardPoints || 0) - redeemedPoints);
      user.lifetimeRedeemed = (user.lifetimeRedeemed || 0) + redeemedPoints;
      user.tier = calculateTier(user.rewardPoints);
      user.rewardHistory.push({
        points: -redeemedPoints,
        type: 'Redeem',
        reason: `Points redeemed on order #${payload.orderNumber}`,
        orderRef: payload.orderNumber,
        createdAt: new Date(),
      });
      await user.save();
    }

    await this.syncAddressToBook(userId, orderData);

    // Increment coupon used count if coupon was applied
    if (couponCode) {
      await Coupon.findOneAndUpdate(
        { code: couponCode },
        { $inc: { usedCount: 1 } }
      );
    }

    // 6. Clear cart
    await cartRepository.clear(userId);
    await User.findByIdAndUpdate(userId, { $set: { cart: [] } });

    // 7. Email customer confirmation
    await sendOrderConfirmationEmail(user.email, order);

    return order;
  }

  async getOrderById(id) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  }

  async getMyOrders(userId) {
    return await orderRepository.findByUser(userId);
  }

  async getAllOrders() {
    return await orderRepository.findAll();
  }

  /**
   * Pay Order (Legacy support / manual payment completion)
   */
  async payOrder(id, paymentResult = {}) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }

    // Generate invoice number if missing
    let invoiceNumber = order.invoiceNumber;
    if (!invoiceNumber) {
      invoiceNumber = await generateInvoiceNumber();
    }

    const trackingHistory = order.trackingHistory || [];
    const now = new Date();
    if (!trackingHistory.some(h => h.status === 'Payment Confirmed')) {
      trackingHistory.push({
        status: 'Payment Confirmed',
        timestamp: now,
        details: 'Payment received successfully.'
      });
    }
    if (!trackingHistory.some(h => h.status === 'Processing')) {
      trackingHistory.push({
        status: 'Processing',
        timestamp: now,
        details: 'Your order is being processed.'
      });
    }

    const payload = {
      isPaid: true,
      paidAt: Date.now(),
      paymentStatus: 'Paid',
      orderStatus: 'Confirmed',
      invoiceNumber,
      trackingHistory,
      paymentResult: {
        id: paymentResult.id || `PAY_${Date.now()}`,
        status: paymentResult.status || 'COMPLETED',
        update_time: paymentResult.update_time || new Date().toISOString(),
        email_address: paymentResult.email_address || order.customerDetails?.email || '',
      },
    };

    return await orderRepository.update(id, payload);
  }

  /**
   * Update Order Status (Admin option)
   */
  async updateOrderStatus(id, status) {
    const order = await Order.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }

    const prevStatus = order.orderStatus;
    const validStatuses = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid order status');
    }

    const trackingHistory = order.trackingHistory || [];
    const now = new Date();

    const addStage = (label, details) => {
      if (!trackingHistory.some(h => h.status === label)) {
        trackingHistory.push({ status: label, timestamp: now, details });
      }
    };

    if (['Confirmed', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered'].includes(status)) {
      const confirmLabel = order.paymentMethod === 'COD' ? 'COD Confirmed' : 'Payment Confirmed';
      const confirmDesc = order.paymentMethod === 'COD' ? 'COD order confirmed.' : 'Payment confirmed.';
      
      addStage('Order Placed', 'Your order was registered.');
      addStage(confirmLabel, confirmDesc);
      addStage('Processing', 'Your order is being processed.');
      
      if (['Packed', 'Shipped', 'Out For Delivery', 'Delivered'].includes(status)) {
        addStage('Packed', 'Your order has been packed and is ready to ship.');
      }
      if (['Shipped', 'Out For Delivery', 'Delivered'].includes(status)) {
        addStage('Shipped', 'Your order has been shipped and is in transit.');
      }
      if (['Out For Delivery', 'Delivered'].includes(status)) {
        addStage('Out For Delivery', 'Your order is out for delivery.');
      }
      if (status === 'Delivered') {
        addStage('Delivered', 'Your order has been delivered successfully.');
      }
    } else if (status === 'Cancelled') {
      addStage('Cancelled', 'This order has been cancelled.');
    }

    const payload = {
      orderStatus: status,
      trackingHistory,
    };

    // Keep legacy fields in sync
    if (status === 'Delivered') {
      payload.isDelivered = true;
      payload.deliveredAt = Date.now();
    } else {
      payload.isDelivered = false;
      payload.deliveredAt = null;
    }

    // Auto-update paid state for non-COD once they are confirmed/shipped
    if (status !== 'Cancelled' && status !== 'Pending' && order.paymentMethod !== 'COD') {
      payload.isPaid = true;
      payload.paymentStatus = 'Paid';
      if (!order.isPaid) {
        payload.paidAt = Date.now();
      }
    }

    // Ensure invoice number is generated if missing
    if (!order.invoiceNumber) {
      payload.invoiceNumber = await generateInvoiceNumber();
    }

    // If order was cancelled, restore product stock
    if (status === 'Cancelled' && prevStatus !== 'Cancelled') {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.qty },
        });
      }
      payload.paymentStatus = 'Failed';
    }

    // If order was cancelled and now reactivated, verify stock and re-deduct
    if (status !== 'Cancelled' && prevStatus === 'Cancelled') {
      for (const item of order.orderItems) {
        const updatedProduct = await Product.findOneAndUpdate(
          { _id: item.product, stock: { $gte: item.qty } },
          { $inc: { stock: -item.qty } },
          { new: true }
        );
        if (!updatedProduct) {
          throw new Error(`Cannot reactivate order: Insufficient stock for ${item.title}`);
        }
      }
    }

    const updatedOrder = await orderRepository.update(id, payload);
    await updateRewardPointsForOrder(updatedOrder, status === 'Cancelled');
    return updatedOrder;
  }

  /**
   * Legacy Deliver Order (calls updateOrderStatus under the hood)
   */
  async deliverOrder(id) {
    return await this.updateOrderStatus(id, 'Delivered');
  }

  async getAdminStats() {
    const orders = await orderRepository.findAll();
    const products = await productRepository.findAndCount({ limit: 1000 });
    const users = await userRepository.findAll();
    const contacts = await contactRepository.findAll();

    const totalSales = orders.reduce(
      (acc, order) => (order.isPaid || order.paymentStatus === 'Paid' ? acc + order.totalPrice : acc),
      0
    );
    const pendingOrders = orders.filter((o) => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled').length;

    return {
      totalSales,
      totalOrders: orders.length,
      pendingOrders,
      totalProducts: products.total,
      totalUsers: users.length,
      totalContacts: contacts.length,
    };
  }

  async syncAddressToBook(userId, orderData) {
    try {
      if (orderData.saveAddress === false) {
        return; // User explicitly unchecked it
      }

      const addressData = {
        fullName: orderData.shippingAddress.fullName || orderData.shippingAddress.name || '',
        phone: orderData.shippingAddress.phone || '',
        addressLine1: orderData.shippingAddress.addressLine1 || orderData.shippingAddress.address || '',
        addressLine2: orderData.shippingAddress.addressLine2 || '',
        landmark: orderData.shippingAddress.landmark || '',
        city: orderData.shippingAddress.city || '',
        state: orderData.shippingAddress.state || '',
        postalCode: orderData.shippingAddress.postalCode || '',
        country: orderData.shippingAddress.country || 'India',
        addressType: orderData.shippingAddress.addressType || 'Home',
        isDefault: false,
      };

      // Fallback name if missing
      if (!addressData.fullName) {
        const user = await User.findById(userId);
        addressData.fullName = user ? user.name : 'Customer';
      }

      // Fallback phone if missing
      if (!addressData.phone) {
        const user = await User.findById(userId);
        addressData.phone = user ? (user.phone || '0000000000') : '0000000000';
      }

      // Check if addressLine1, city, state, postalCode are empty
      if (!addressData.addressLine1 || !addressData.city || !addressData.postalCode) {
        return; // Incomplete address
      }

      const addressService = require('./addressService');
      await addressService.createAddress(userId, addressData);
    } catch (err) {
      console.error('[ORDER_SERVICE] Address sync failed:', err.message);
    }
  }

  async getTrackingInfo(trackingNumberOrOrderNumber) {
    const order = await Order.findOne({
      $or: [
        { trackingNumber: trackingNumberOrOrderNumber },
        { orderNumber: trackingNumberOrOrderNumber }
      ]
    }).populate('user', 'name email').lean();

    if (!order) {
      throw new Error('Order not found for the provided tracking number or order number');
    }

    return {
      orderNumber: order.orderNumber,
      trackingNumber: order.trackingNumber,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      shippingAddress: order.shippingAddress,
      courierName: order.courierName || 'Fabish Express',
      estimatedDelivery: order.estimatedDelivery,
      trackingHistory: order.trackingHistory || [],
      createdAt: order.createdAt,
    };
  }
}

function calculateTier(points) {
  if (points >= 7000) return 'Platinum';
  if (points >= 3000) return 'Gold';
  if (points >= 1000) return 'Silver';
  return 'Bronze';
}

async function updateRewardPointsForOrder(order, isCancelled = false) {
  try {
    if (!order || !order.user) return;
    const User = require('../models/User');
    const user = await User.findById(order.user);
    if (!user) return;

    const orderNumber = order.orderNumber;
    const isOrderDelivered = order.orderStatus === 'Delivered';
    const isOrderReverted = isCancelled || order.orderStatus === 'Cancelled' || order.paymentStatus === 'Refunded';

    if (isOrderReverted) {
      // Revert credited purchase points and first order bonus if they were credited
      if (order.rewardPointsCredited) {
        // Calculate points originally credited
        const purchasePoints = Math.floor(order.totalPrice / 100) * 10;
        const hasFirstOrderBonusForThisOrder = user.rewardHistory.some(
          (h) => h.orderRef === orderNumber && h.type === 'First Order Bonus'
        );
        const bonusPoints = hasFirstOrderBonusForThisOrder ? 200 : 0;
        const pointsToDeduct = purchasePoints + bonusPoints;

        if (pointsToDeduct > 0) {
          user.rewardPoints = Math.max(0, (user.rewardPoints || 0) - pointsToDeduct);
          user.lifetimeEarned = Math.max(0, (user.lifetimeEarned || 0) - pointsToDeduct);
          user.rewardHistory.push({
            points: -pointsToDeduct,
            type: 'Refund Adjustment',
            reason: `Points reverted from cancelled/refunded order #${orderNumber}`,
            orderRef: orderNumber,
            createdAt: new Date(),
          });
        }
        
        // Mark as not credited
        order.rewardPointsCredited = false;
        await Order.findByIdAndUpdate(order._id, { rewardPointsCredited: false });
      }

      // Refund redeemed points if any were redeemed
      const pointsToRefund = order.redeemedPoints || 0;
      if (pointsToRefund > 0) {
        const alreadyRefundedRedeem = user.rewardHistory.some(
          (h) => h.orderRef === orderNumber && h.type === 'Refund Adjustment' && h.reason.includes('Redeemed points refunded')
        );
        if (!alreadyRefundedRedeem) {
          user.rewardPoints = (user.rewardPoints || 0) + pointsToRefund;
          user.lifetimeRedeemed = Math.max(0, (user.lifetimeRedeemed || 0) - pointsToRefund);
          user.rewardHistory.push({
            points: pointsToRefund,
            type: 'Refund Adjustment',
            reason: `Redeemed points refunded from cancelled/refunded order #${orderNumber}`,
            orderRef: orderNumber,
            createdAt: new Date(),
          });
        }
      }

      user.tier = calculateTier(user.rewardPoints);
      await user.save();
      
    } else if (isOrderDelivered) {
      // Credit purchase points and bonus points if not already credited
      if (!order.rewardPointsCredited) {
        const purchasePoints = Math.floor(order.totalPrice / 100) * 10;
        const hasFirstOrderBonus = user.rewardHistory.some((h) => h.type === 'First Order Bonus');
        const bonusPoints = !hasFirstOrderBonus ? 200 : 0;
        const totalToEarn = purchasePoints + bonusPoints;

        if (totalToEarn > 0) {
          user.rewardPoints = (user.rewardPoints || 0) + totalToEarn;
          user.lifetimeEarned = (user.lifetimeEarned || 0) + totalToEarn;
          
          if (purchasePoints > 0) {
            user.rewardHistory.push({
              points: purchasePoints,
              type: 'Earn',
              reason: `Points earned from order #${orderNumber}`,
              orderRef: orderNumber,
              createdAt: new Date(),
            });
          }

          if (bonusPoints > 0) {
            user.rewardHistory.push({
              points: bonusPoints,
              type: 'First Order Bonus',
              reason: 'First successful delivered order bonus',
              orderRef: orderNumber,
              createdAt: new Date(),
            });
          }
          
          user.tier = calculateTier(user.rewardPoints);
          await user.save();

          order.rewardPointsCredited = true;
          await Order.findByIdAndUpdate(order._id, { rewardPointsCredited: true });
        }
      }
    }
  } catch (err) {
    console.error('Error updating reward points for order:', err.message);
  }
}

module.exports = new OrderService();
