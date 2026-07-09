const blogRepository = require('../repositories/blogRepository');
const uploadService = require('./uploadService');

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

  async createBlog(blogData, file = null) {
    if (!blogData.title || !blogData.title.trim()) {
      throw new Error('Please add a blog title');
    }
    if (!blogData.content || !blogData.content.trim()) {
      throw new Error('Please add blog content');
    }

    const slug = getSlug(blogData.title);
    const existing = await blogRepository.findBySlug(slug);
    if (existing) {
      throw new Error('Blog with similar title already exists');
    }

    let imageUrl = '';
    if (file) {
      const uploadResult = await uploadService.uploadFile(file, 'fabish/blogs');
      imageUrl = uploadResult.secure_url;
    } else if (blogData.image) {
      imageUrl = blogData.image;
    }

    let tagsArray = [];
    if (blogData.tags) {
      if (typeof blogData.tags === 'string') {
        tagsArray = blogData.tags.split(',').map(t => t.trim()).filter(Boolean);
      } else if (Array.isArray(blogData.tags)) {
        tagsArray = blogData.tags.map(t => t.trim()).filter(Boolean);
      }
    }

    const payload = {
      ...blogData,
      slug,
      image: imageUrl,
      tags: tagsArray,
    };

    return await blogRepository.create(payload);
  }

  async updateBlog(id, blogData, file = null) {
    const blog = await blogRepository.findById(id);
    if (!blog) {
      throw new Error('Blog post not found');
    }

    if (blogData.title !== undefined && (!blogData.title || !blogData.title.trim())) {
      throw new Error('Please add a blog title');
    }
    if (blogData.content !== undefined && (!blogData.content || !blogData.content.trim())) {
      throw new Error('Please add blog content');
    }

    let imageUrl = blog.image;
    if (file) {
      if (blog.image) {
        await uploadService.deleteImage(blog.image);
      }
      const uploadResult = await uploadService.uploadFile(file, 'fabish/blogs');
      imageUrl = uploadResult.secure_url;
    } else if (blogData.image === '') {
      if (blog.image) {
        await uploadService.deleteImage(blog.image);
      }
      imageUrl = '';
    } else if (blogData.image) {
      imageUrl = blogData.image;
    }

    let tagsArray;
    if (blogData.tags !== undefined) {
      if (typeof blogData.tags === 'string') {
        tagsArray = blogData.tags.split(',').map(t => t.trim()).filter(Boolean);
      } else if (Array.isArray(blogData.tags)) {
        tagsArray = blogData.tags.map(t => t.trim()).filter(Boolean);
      }
    }

    const payload = { 
      ...blogData,
      image: imageUrl,
    };
    if (tagsArray !== undefined) {
      payload.tags = tagsArray;
    }

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
    const blog = await blogRepository.findById(id);
    if (!blog) {
      throw new Error('Blog post not found');
    }
    if (blog.image) {
      await uploadService.deleteImage(blog.image);
    }
    const result = await blogRepository.delete(id);
    return result;
  }
}

module.exports = new BlogService();
