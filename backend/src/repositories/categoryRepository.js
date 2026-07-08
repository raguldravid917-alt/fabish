const Category = require('../models/Category');

class CategoryRepository {
  async findById(id) {
    return await Category.findById(id).lean();
  }

  async findBySlug(slug) {
    return await Category.findOne({ slug, isDeleted: false }).lean();
  }

  async create(categoryData) {
    return await Category.create(categoryData);
  }

  async update(id, updateData) {
    return await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async softDelete(id) {
    return await Category.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
  }

  async restore(id) {
    return await Category.findByIdAndUpdate(
      id,
      { isDeleted: false },
      { new: true }
    );
  }

  async findAll(includeDeleted = false) {
    const filter = includeDeleted ? {} : { isDeleted: false };
    return await Category.find(filter).lean();
  }

  async delete(id) {
    return await Category.findByIdAndDelete(id);
  }
}

module.exports = new CategoryRepository();
