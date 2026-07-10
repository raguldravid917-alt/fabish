const addressService = require('../services/addressService');
const { HTTP_STATUS } = require('../constants');

class AddressController {
  // @desc    Get user addresses
  // @route   GET /api/addresses
  // @access  Private
  async getAddresses(req, res, next) {
    try {
      const addresses = await addressService.getAddresses(req.user._id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: addresses,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get address by ID
  // @route   GET /api/addresses/:id
  // @access  Private
  async getAddressById(req, res, next) {
    try {
      const address = await addressService.getAddressById(req.params.id);
      if (address.user.toString() !== req.user._id.toString()) {
        res.status(HTTP_STATUS.FORBIDDEN);
        throw new Error('Unauthorized access to this address');
      }
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: address,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Create user address
  // @route   POST /api/addresses
  // @access  Private
  async createAddress(req, res, next) {
    try {
      const address = await addressService.createAddress(req.user._id, req.body);
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Address created successfully',
        data: address,
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(error);
    }
  }

  // @desc    Update user address
  // @route   PUT /api/addresses/:id
  // @access  Private
  async updateAddress(req, res, next) {
    try {
      const address = await addressService.updateAddress(
        req.params.id,
        req.user._id,
        req.body
      );
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Address updated successfully',
        data: address,
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(error);
    }
  }

  // @desc    Delete user address
  // @route   DELETE /api/addresses/:id
  // @access  Private
  async deleteAddress(req, res, next) {
    try {
      await addressService.deleteAddress(req.params.id, req.user._id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Address deleted successfully',
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(error);
    }
  }

  // @desc    Set default user address
  // @route   PATCH /api/addresses/default or PATCH /api/addresses/:id/default
  // @access  Private
  async setDefaultAddress(req, res, next) {
    try {
      const addressId = req.body.addressId || req.params.id;
      if (!addressId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Address ID is required',
        });
      }
      const address = await addressService.setDefaultAddress(addressId, req.user._id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Address set as default successfully',
        data: address,
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(error);
    }
  }
}

module.exports = new AddressController();
