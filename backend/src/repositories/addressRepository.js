const Address = require('../models/Address');

class AddressRepository {
  async findByUser(userId) {
    return await Address.find({ user: userId }).lean();
  }

  async findById(id) {
    return await Address.findById(id).lean();
  }

  async create(userId, addressData) {
    // If setting default, unset others first
    if (addressData.isDefault) {
      await Address.updateMany({ user: userId }, { isDefault: false });
    }
    return await Address.create({ ...addressData, user: userId });
  }

  async update(id, userId, updateData) {
    if (updateData.isDefault) {
      await Address.updateMany({ user: userId }, { isDefault: false });
    }
    return await Address.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return await Address.findByIdAndDelete(id);
  }
}

module.exports = new AddressRepository();
