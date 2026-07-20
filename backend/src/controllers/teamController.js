const teamService = require('../services/teamService');
const { HTTP_STATUS } = require('../constants');

class TeamController {
  /**
   * @route   GET /api/team
   * @access  Public
   */
  async getTeam(req, res, next) {
    try {
      const members = await teamService.getTeamMembers();
      const departments = await teamService.getDepartments();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { members, departments },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @route   GET /api/team/admin
   * @access  Admin
   */
  async getAllTeam(req, res, next) {
    try {
      const members = await teamService.getAllTeamMembers();
      const departments = await teamService.getDepartments();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { members, departments },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @route   POST /api/team
   * @access  Admin
   */
  async createMember(req, res, next) {
    try {
      const file = req.file || null;
      const member = await teamService.createMember(req.body, file);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Team member added successfully',
        data: member,
      });
    } catch (err) {
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(err);
    }
  }

  /**
   * @route   PUT /api/team/:id
   * @access  Admin
   */
  async updateMember(req, res, next) {
    try {
      const file = req.file || null;
      const member = await teamService.updateMember(req.params.id, req.body, file);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Team member updated successfully',
        data: member,
      });
    } catch (err) {
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(err);
    }
  }

  /**
   * @route   DELETE /api/team/:id
   * @access  Admin
   */
  async deleteMember(req, res, next) {
    try {
      await teamService.deleteMember(req.params.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Team member removed successfully',
      });
    } catch (err) {
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(err);
    }
  }
}

module.exports = new TeamController();
