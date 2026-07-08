const blogRepository = require('../repositories/blogRepository');

const getSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

class BlogService {
  async getBlogs() {
    return await blogRepository.findAll();
  }

  async getBlogBySlug(slug) {
    const blog = await blogRepository.findBySlug(slug);
    if (!blog) {
      throw new Error('Blog post not found');
    }
    return blog;
  }

  async createBlog(blogData) {
    const slug = getSlug(blogData.title);
    const existing = await blogRepository.findBySlug(slug);
    if (existing) {
      throw new Error('Blog with similar title already exists');
    }

    const payload = {
      ...blogData,
      slug,
    };

    return await blogRepository.create(payload);
  }

  async updateBlog(id, blogData) {
    const blog = await blogRepository.findById(id);
    if (!blog) {
      throw new Error('Blog post not found');
    }

    const payload = { ...blogData };

    if (blogData.title && blogData.title !== blog.title) {
      payload.slug = getSlug(blogData.title);
      const existing = await blogRepository.findBySlug(payload.slug);
      if (existing && existing._id.toString() !== id) {
        throw new Error('Blog with similar title already exists');
      }
    }

    return await blogRepository.update(id, payload);
  }

  async deleteBlog(id) {
    const result = await blogRepository.delete(id);
    if (!result) {
      throw new Error('Blog post not found');
    }
    return result;
  }
}

module.exports = new BlogService();
