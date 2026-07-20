const PartnerApplication = require('../models/PartnerApplication');

class PartnerRepository {
  async create(data) {
    return await PartnerApplication.create(data);
  }

  async findById(id) {
    return await PartnerApplication.findById(id).lean();
  }

  async findAll({ page = 1, limit = 20, status, type, search } = {}) {
    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (type && type !== 'All') filter.type = type;
    if (search) {
      filter.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { contactName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await PartnerApplication.countDocuments(filter);
    const applications = await PartnerApplication.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return { applications, total, page, pages: Math.ceil(total / limit) };
  }

  async update(id, data) {
    return await PartnerApplication.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id) {
    return await PartnerApplication.findByIdAndDelete(id);
  }
}

module.exports = new PartnerRepository();
