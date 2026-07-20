const partnerService = require('../services/partnerService');
const { HTTP_STATUS } = require('../constants');

class PartnerController {
  /**
   * @route   GET /api/partnerships/types
   * @access  Public
   */
  async getTypes(req, res, next) {
    try {
      const types = partnerService.getPartnershipTypes();
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: types,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @route   POST /api/partnerships/apply
   * @access  Public
   */
  async applyForPartnership(req, res, next) {
    try {
      let dynamicFields = req.body.dynamicFields;
      if (typeof dynamicFields === 'string') {
        try {
          dynamicFields = JSON.parse(dynamicFields);
        } catch {
          dynamicFields = [];
        }
      }

      const application = await partnerService.submitApplication({
        ...req.body,
        dynamicFields: dynamicFields || [],
      });

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Your application has been submitted! We\'ll review it within 5–7 business days.',
        data: { id: application._id, type: application.type, businessName: application.businessName },
      });
    } catch (err) {
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(err);
    }
  }

  /**
   * @route   GET /api/partnerships
   * @access  Admin
   */
  async getAllApplications(req, res, next) {
    try {
      const { page = 1, limit = 20, status, type, search } = req.query;
      const result = await partnerService.getAllApplications({
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        type,
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
   * @route   GET /api/partnerships/:id
   * @access  Admin
   */
  async getApplicationById(req, res, next) {
    try {
      const app = await partnerService.getApplicationById(req.params.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: app,
      });
    } catch (err) {
      res.status(HTTP_STATUS.NOT_FOUND);
      next(err);
    }
  }

  /**
   * @route   PUT /api/partnerships/:id/status
   * @access  Admin
   */
  async updateStatus(req, res, next) {
    try {
      const { status, adminNotes } = req.body;
      const reviewedBy = req.user?.name || 'Admin';

      const updated = await partnerService.updateApplicationStatus(req.params.id, {
        status,
        adminNotes,
        reviewedBy,
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Application status updated',
        data: updated,
      });
    } catch (err) {
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(err);
    }
  }

  /**
   * @route   DELETE /api/partnerships/:id
   * @access  Admin
   */
  async deleteApplication(req, res, next) {
    try {
      await partnerService.deleteApplication(req.params.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Application deleted successfully',
      });
    } catch (err) {
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(err);
    }
  }
}

module.exports = new PartnerController();
