const SupportTicket = require('../models/SupportTicket');

class SupportTicketRepository {
  async create(data) {
    return await SupportTicket.create(data);
  }

  async findById(id) {
    return await SupportTicket.findById(id).lean();
  }

  async findByIdAndUpdate(id, update, options = { new: true, runValidators: true }) {
    return await SupportTicket.findByIdAndUpdate(id, update, options);
  }

  async findAll({ page = 1, limit = 20, status, category, priority, search } = {}) {
    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (category && category !== 'All') filter.category = category;
    if (priority && priority !== 'All') filter.priority = priority;
    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { ticketNumber: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await SupportTicket.countDocuments(filter);
    const tickets = await SupportTicket.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return { tickets, total, page, pages: Math.ceil(total / limit) };
  }

  async findByUser(userId, { page = 1, limit = 10 } = {}) {
    const filter = { user: userId };
    const total = await SupportTicket.countDocuments(filter);
    const tickets = await SupportTicket.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return { tickets, total, page, pages: Math.ceil(total / limit) };
  }

  async findByEmail(email, { page = 1, limit = 10 } = {}) {
    const filter = { email: email.toLowerCase() };
    const total = await SupportTicket.countDocuments(filter);
    const tickets = await SupportTicket.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return { tickets, total, page, pages: Math.ceil(total / limit) };
  }

  async delete(id) {
    return await SupportTicket.findByIdAndDelete(id);
  }

  async getStats() {
    return await SupportTicket.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
  }
}

module.exports = new SupportTicketRepository();
