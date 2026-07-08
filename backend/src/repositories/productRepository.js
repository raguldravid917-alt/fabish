const Product = require('../models/Product');
const { PRODUCT_STATUS } = require('../constants');

class ProductRepository {
  async findById(id) {
    return await Product.findById(id).populate('category').lean();
  }

  async findBySlug(slug) {
    return await Product.findOne({ slug, status: { $ne: PRODUCT_STATUS.DELETED } }).populate('category').lean();
  }

  async create(productData) {
    const product = await Product.create(productData);
    return await Product.findById(product._id).populate('category').lean();
  }

  async update(id, updateData) {
    return await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('category');
  }

  async softDelete(id) {
    return await Product.findByIdAndUpdate(
      id,
      { status: PRODUCT_STATUS.DELETED },
      { new: true }
    );
  }

  async restore(id) {
    return await Product.findByIdAndUpdate(
      id,
      { status: PRODUCT_STATUS.PUBLISHED },
      { new: true }
    );
  }

  async bulkUpdateStatus(ids, status) {
    return await Product.updateMany(
      { _id: { $in: ids } },
      { $set: { status } }
    );
  }

  async bulkDelete(ids) {
    return await Product.updateMany(
      { _id: { $in: ids } },
      { $set: { status: PRODUCT_STATUS.DELETED } }
    );
  }

  async findAndCount({ filter = {}, sort = {}, page = 1, limit = 12 }) {
    const skip = (page - 1) * limit;
    
    // Ignore soft deleted items by default in general listing unless requested
    if (!filter.status) {
      filter.status = { $ne: PRODUCT_STATUS.DELETED };
    }

    const count = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('category')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      products,
      total: count,
      pages: Math.ceil(count / limit),
    };
  }
}

module.exports = new ProductRepository();
