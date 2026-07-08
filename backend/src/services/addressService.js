const addressRepository = require('../repositories/addressRepository');

class AddressService {
  async getAddresses(userId) {
    return await addressRepository.findByUser(userId);
  }

  async getAddressById(id) {
    const address = await addressRepository.findById(id);
    if (!address) {
      throw new Error('Address not found');
    }
    return address;
  }

  async createAddress(userId, addressData) {
    return await addressRepository.create(userId, addressData);
  }

  async updateAddress(id, userId, updateData) {
    const address = await addressRepository.findById(id);
    if (!address || address.user.toString() !== userId.toString()) {
      throw new Error('Address not found or unauthorized');
    }
    return await addressRepository.update(id, userId, updateData);
  }

  async deleteAddress(id, userId) {
    const address = await addressRepository.findById(id);
    if (!address || address.user.toString() !== userId.toString()) {
      throw new Error('Address not found or unauthorized');
    }
    return await addressRepository.delete(id);
  }
}

module.exports = new AddressService();
