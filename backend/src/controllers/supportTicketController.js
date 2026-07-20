const supportTicketService = require('../services/supportTicketService');
const { HTTP_STATUS } = require('../constants');

class SupportTicketController {
  /**
   * @route   POST /api/support
   * @access  Public
   */
  async createTicket(req, res, next) {
    try {
      const files = req.files || [];
      const ticket = await supportTicketService.createTicket(
        {
          ...req.body,
          userId: req.user?._id || null,
        },
        files
      );

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Support ticket created successfully. We\'ll get back to you soon!',
        data: ticket,
      });
    } catch (err) {
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(err);
    }
  }

  /**
   * @route   GET /api/support/my-tickets
   * @access  Private (authenticated user)
   */
  async getMyTickets(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result = await supportTicketService.getMyTickets(
        req.user?._id,
        req.user?.email,
        { page: parseInt(page), limit: parseInt(limit) }
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @route   GET /api/support
   * @access  Admin
   */
  async getAllTickets(req, res, next) {
    try {
      const { page = 1, limit = 20, status, category, priority, search } = req.query;
      const result = await supportTicketService.getAllTickets({
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        category,
        priority,
        search,
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @route   GET /api/support/stats
   * @access  Admin
   */
  async getStats(req, res, next) {
    try {
      const stats = await supportTicketService.getStats();
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: stats,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @route   GET /api/support/:id
   * @access  Admin
   */
  async getTicketById(req, res, next) {
    try {
      const ticket = await supportTicketService.getTicketById(req.params.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: ticket,
      });
    } catch (err) {
      res.status(HTTP_STATUS.NOT_FOUND);
      next(err);
    }
  }

  /**
   * @route   PUT /api/support/:id/status
   * @access  Admin
   */
  async updateTicketStatus(req, res, next) {
    try {
      const { status, adminNotes, replyMessage } = req.body;
      const adminName = req.user?.name || 'Support Team';

      const updated = await supportTicketService.updateTicketStatus(req.params.id, {
        status,
        adminNotes,
        replyMessage,
        adminName,
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Ticket updated successfully',
        data: updated,
      });
    } catch (err) {
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(err);
    }
  }

  /**
   * @route   DELETE /api/support/:id
   * @access  Admin
   */
  async deleteTicket(req, res, next) {
    try {
      await supportTicketService.deleteTicket(req.params.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Ticket deleted successfully',
      });
    } catch (err) {
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(err);
    }
  }
}

module.exports = new SupportTicketController();
