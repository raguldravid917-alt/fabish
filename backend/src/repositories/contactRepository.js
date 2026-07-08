const Contact = require('../models/Contact');

class ContactRepository {
  async create(contactData) {
    return await Contact.create(contactData);
  }

  async findAll() {
    return await Contact.find({}).sort({ createdAt: -1 }).lean();
  }

  async updateStatus(id, status) {
    return await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
  }

  async delete(id) {
    return await Contact.findByIdAndDelete(id);
  }
}

module.exports = new ContactRepository();
