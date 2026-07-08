const Blog = require('../models/Blog');

class BlogRepository {
  async findById(id) {
    return await Blog.findById(id).lean();
  }

  async findBySlug(slug) {
    return await Blog.findOne({ slug }).lean();
  }

  async create(blogData) {
    return await Blog.create(blogData);
  }

  async update(id, updateData) {
    return await Blog.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return await Blog.findByIdAndDelete(id);
  }

  async findAll() {
    return await Blog.find({}).sort({ date: -1 }).lean();
  }
}

module.exports = new BlogRepository();
