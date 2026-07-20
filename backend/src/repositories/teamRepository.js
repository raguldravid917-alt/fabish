const TeamMember = require('../models/TeamMember');

class TeamRepository {
  async findAll({ includeInactive = false } = {}) {
    const filter = includeInactive ? {} : { isActive: true };
    return await TeamMember.find(filter).sort({ order: 1, createdAt: 1 }).lean();
  }

  async findById(id) {
    return await TeamMember.findById(id).lean();
  }

  async create(data) {
    return await TeamMember.create(data);
  }

  async update(id, data) {
    return await TeamMember.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id) {
    return await TeamMember.findByIdAndDelete(id);
  }

  async getDistinctDepartments() {
    return await TeamMember.distinct('department', { isActive: true });
  }
}

module.exports = new TeamRepository();
