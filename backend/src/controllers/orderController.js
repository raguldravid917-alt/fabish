const orderService = require('../services/orderService');
const { HTTP_STATUS } = require('../constants');

class OrderController {
  // @desc    Create a new order (COD)
  // @route   POST /api/orders
  // @access  Private
  async createOrder(req, res, next) {
    try {
      const order = await orderService.createOrder(req.user._id, req.body);
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: order,
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(error);
    }
  }

  // @desc    Create Razorpay Order
  // @route   POST /api/orders/razorpay
  // @access  Private
  async createRazorpayOrder(req, res, next) {
    try {
      const result = await orderService.createRazorpayOrder(req.user._id, req.body);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(error);
    }
  }

  // @desc    Verify Razorpay Payment & Save Order
  // @route   POST /api/orders/verify
  // @access  Private
  async verifyRazorpayPayment(req, res, next) {
    try {
      const order = await orderService.verifyRazorpayPayment(req.user._id, req.user, req.body);
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: order,
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(error);
    }
  }

  // @desc    Get order by ID
  // @route   GET /api/orders/:id
  // @access  Private
  async getOrderById(req, res, next) {
    try {
      const order = await orderService.getOrderById(req.params.id);
      
      // Authorization check: User can only see their own orders unless they are admin
      if (!req.user.isAdmin && order.user._id.toString() !== req.user._id.toString()) {
        res.status(HTTP_STATUS.FORBIDDEN);
        throw new Error('Not authorized to access this order');
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: order,
      });
    } catch (error) {
      if (res.statusCode === HTTP_STATUS.OK) {
        res.status(HTTP_STATUS.NOT_FOUND);
      }
      next(error);
    }
  }

  // @desc    Get logged in user orders
  // @route   GET /api/orders/myorders
  // @access  Private
  async getMyOrders(req, res, next) {
    try {
      const orders = await orderService.getMyOrders(req.user._id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get all orders (admin)
  // @route   GET /api/orders
  // @access  Private/Admin
  async getAllOrders(req, res, next) {
    try {
      const orders = await orderService.getAllOrders();
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Update order to paid (mock payment completion)
  // @route   PUT /api/orders/:id/pay
  // @access  Private
  async payOrder(req, res, next) {
    try {
      const updatedOrder = await orderService.payOrder(req.params.id, req.body);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: updatedOrder,
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(error);
    }
  }

  // @desc    Update order to delivered
  // @route   PUT /api/orders/:id/deliver
  // @access  Private/Admin
  async deliverOrder(req, res, next) {
    try {
      const updatedOrder = await orderService.deliverOrder(req.params.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: updatedOrder,
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(error);
    }
  }

  // @desc    Update order status
  // @route   PUT /api/orders/:id/status
  // @access  Private/Admin
  async updateOrderStatus(req, res, next) {
    try {
      const { status } = req.body;
      if (!status) {
        res.status(HTTP_STATUS.BAD_REQUEST);
        throw new Error('Order status is required');
      }
      const updatedOrder = await orderService.updateOrderStatus(req.params.id, status);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: updatedOrder,
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(error);
    }
  }

  // @desc    Get dashboard analytics (admin)
  // @route   GET /api/orders/stats
  // @access  Private/Admin
  async getStats(req, res, next) {
    try {
      const stats = await orderService.getAdminStats();
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
