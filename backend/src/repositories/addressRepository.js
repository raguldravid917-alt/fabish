const Address = require('../models/Address');

class AddressRepository {
  async findByUser(userId) {
    // Sort so defaults are at the top, followed by newest
    return await Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 }).lean();
  }

  async findById(id) {
    return await Address.findById(id).lean();
  }

  async create(userId, addressData) {
    // 1. Duplicate detection
    const existing = await Address.findOne({
      user: userId,
      fullName: addressData.fullName,
      phone: addressData.phone,
      addressLine1: addressData.addressLine1,
      addressLine2: addressData.addressLine2 || '',
      landmark: addressData.landmark || '',
      city: addressData.city,
      state: addressData.state,
      postalCode: addressData.postalCode,
      country: addressData.country || 'India',
    });

    if (existing) {
      if (addressData.isDefault && !existing.isDefault) {
        await Address.updateMany({ user: userId }, { isDefault: false });
        const updated = await Address.findByIdAndUpdate(existing._id, { isDefault: true }, { new: true });
        return updated;
      }
      return existing;
    }

    // 2. Auto default if it is the first address
    const count = await Address.countDocuments({ user: userId });
    if (count === 0) {
      addressData.isDefault = true;
    }

    // 3. Clear other defaults if this is marked default
    if (addressData.isDefault) {
      await Address.updateMany({ user: userId }, { isDefault: false });
    }

    return await Address.create({ ...addressData, user: userId });
  }

  async update(id, userId, updateData) {
    if (updateData.isDefault) {
      await Address.updateMany({ user: userId }, { isDefault: false });
    }
    return await Address.findOneAndUpdate(
      { _id: id, user: userId },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );
  }

  async delete(id) {
    return await Address.findByIdAndDelete(id);
  }

  async setDefault(id, userId) {
    await Address.updateMany({ user: userId }, { isDefault: false });
    return await Address.findOneAndUpdate(
      { _id: id, user: userId },
      { isDefault: true },
      { new: true }
    );
  }
}

module.exports = new AddressRepository();
