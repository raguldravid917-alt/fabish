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

// Helper: Send email confirmation
const sendOrderConfirmationEmail = async (email, order) => {
  try {
    const productsList = order.orderItems
      .map(
        (item) =>
          `<li>${item.title} (x${item.qty}) - Rs. ${item.price.toLocaleString('en-IN')}.00</li>`
      )
      .join('');

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eae8d8;">
        <h2 style="color: #729855; border-bottom: 2px solid #729855; padding-bottom: 10px;">Order Confirmation</h2>
        <p>Thank you for your order, <strong>${order.customerDetails?.name || 'Customer'}</strong>!</p>
        <p>Your order number is: <strong style="font-size: 16px; color: #212b36;">${order.orderNumber}</strong></p>
        <hr style="border: 0; border-top: 1px solid #eae8d8; margin: 20px 0;" />
        <h3>Order Summary</h3>
        <ul style="padding-left: 20px; line-height: 1.6;">
          ${productsList}
        </ul>
        <p><strong>Total Price:</strong> Rs. ${order.totalPrice.toLocaleString('en-IN')}.00</p>
        <hr style="border: 0; border-top: 1px solid #eae8d8; margin: 20px 0;" />
        <h3>Shipping Address</h3>
        <p style="line-height: 1.5; color: #555;">
          ${order.shippingAddress.address}<br />
          ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br />
          ${order.shippingAddress.country}
        </p>
        <hr style="border: 0; border-top: 1px solid #eae8d8; margin: 20px 0;" />
        <p style="font-size: 11px; color: #999; text-align: center;">This is an automated notification. If you have any questions, feel free to reply to this email.</p>
      </div>
    `;

    await sendEmail({
      email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      message: `Thank you for your order! Order Number: ${order.orderNumber}. Total: Rs. ${order.totalPrice}.`,
      html,
    });
  } catch (error) {
    console.error('Failed to send order confirmation email:', error.message);
  }
};

class OrderService {
  /**
   * Pre-check stock levels and calculate prices safely on the backend
   */
  async validateOrderPayload(orderData) {
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

    const totalPrice = Math.max(0, itemsPrice + shippingPrice - discountAmount);

    return {
      verifiedItems,
      itemsPrice,
      shippingPrice,
      totalPrice,
      coupon: appliedCoupon ? appliedCoupon._id : null,
      couponCode,
      discountAmount,
    };
  }

  /**
   * Create Razorpay Order
   */
  async createRazorpayOrder(userId, orderData) {
    const { totalPrice } = await this.validateOrderPayload(orderData);

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
    const { verifiedItems, itemsPrice, shippingPrice, totalPrice, coupon, couponCode, discountAmount } =
      await this.validateOrderPayload(orderData);

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

    // 4. Save the completed Paid Order
    const dbPayload = {
      orderNumber: generateOrderNumber(),
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
    };

    const order = await orderRepository.create(dbPayload);

    // Increment coupon used count if coupon was applied
    if (couponCode) {
      await Coupon.findOneAndUpdate(
        { code: couponCode },
        { $inc: { usedCount: 1 } }
      );
    }

    // 5. Clear client-side & server-side cart
    await cartRepository.clear(userId);
    await User.findByIdAndUpdate(userId, { $set: { cart: [] } });

    // 6. Email user confirmation
    await sendOrderConfirmationEmail(userDetails.email, order);

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
    const { verifiedItems, itemsPrice, shippingPrice, totalPrice, coupon, couponCode, discountAmount } =
      await this.validateOrderPayload(orderData);

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

    // 4. Setup payload for COD
    const payload = {
      orderNumber: generateOrderNumber(),
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
    };

    const order = await orderRepository.create(payload);

    // Increment coupon used count if coupon was applied
    if (couponCode) {
      await Coupon.findOneAndUpdate(
        { code: couponCode },
        { $inc: { usedCount: 1 } }
      );
    }

    // 5. Clear cart
    await cartRepository.clear(userId);
    await User.findByIdAndUpdate(userId, { $set: { cart: [] } });

    // 6. Email customer confirmation
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
   * Pay Order (Legacy support / mock payment)
   */
  async payOrder(id, paymentResult = {}) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }

    const payload = {
      isPaid: true,
      paidAt: Date.now(),
      paymentStatus: 'Paid',
      orderStatus: 'Confirmed',
      paymentResult: {
        id: paymentResult.id || `MOCK_PAY_${Date.now()}`,
        status: paymentResult.status || 'COMPLETED',
        update_time: paymentResult.update_time || new Date().toISOString(),
        email_address: paymentResult.email_address || order.user?.email || 'customer@example.com',
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

    const payload = {
      orderStatus: status,
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

    return await orderRepository.update(id, payload);
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
}

module.exports = new OrderService();
