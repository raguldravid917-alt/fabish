const contactService = require('../services/contactService');
const { HTTP_STATUS } = require('../constants');

class ContactController {
  // @desc    Submit a contact inquiry
  // @route   POST /api/contact
  // @access  Public
  async createInquiry(req, res, next) {
    try {
      const inquiry = await contactService.createInquiry(req.body);
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Inquiry submitted successfully',
        data: inquiry,
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(error);
    }
  }

  // @desc    Get all inquiries (admin only)
  // @route   GET /api/contact
  // @access  Private/Admin
  async getInquiries(req, res, next) {
    try {
      const inquiries = await contactService.getInquiries();
      res.status(HTTP_STATUS.OK).json(inquiries); // Admin dashboard expects list directly
    } catch (error) {
      next(error);
    }
  }

  // @desc    Update inquiry status (admin only)
  // @route   PATCH /api/contact/:id
  // @access  Private/Admin
  async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      const inquiry = await contactService.updateInquiryStatus(req.params.id, status);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: `Inquiry status updated to ${status}`,
        data: inquiry,
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(error);
    }
  }

  // @desc    Delete inquiry (admin only)
  // @route   DELETE /api/contact/:id
  // @access  Private/Admin
  async deleteInquiry(req, res, next) {
    try {
      await contactService.deleteInquiry(req.params.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Inquiry deleted successfully',
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(error);
    }
  }
}

module.exports = new ContactController();
