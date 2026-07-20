const blogService = require('../services/blogService');
const Blog = require('../models/Blog');
const { HTTP_STATUS } = require('../constants');

class BlogController {
  // @desc    Get all blog posts with search, category filter, pagination, and featured filter
  // @route   GET /api/blogs
  // @access  Public
  async getBlogs(req, res, next) {
    try {
      const {
        page = 1,
        limit = 12,
        category,
        search,
        featured,
        tag,
      } = req.query;

      const filter = {};
      if (category && category !== 'All') filter.category = category;
      if (featured === 'true') filter.featured = true;
      if (tag) filter.tags = { $in: [tag] };
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { excerpt: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { author: { $regex: search, $options: 'i' } },
        ];
      }

      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
      const skip = (pageNum - 1) * limitNum;

      const [blogs, total] = await Promise.all([
        Blog.find(filter)
          .sort({ featured: -1, date: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Blog.countDocuments(filter),
      ]);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Blogs retrieved successfully',
        data: blogs,
        blogs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get distinct blog categories
  // @route   GET /api/blogs/categories
  // @access  Public
  async getCategories(req, res, next) {
    try {
      const categories = await Blog.distinct('category');
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: categories.filter(Boolean).sort(),
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get blog post by slug
  // @route   GET /api/blogs/:slug
  // @access  Public
  async getBlogBySlug(req, res, next) {
    try {
      const blog = await blogService.getBlogBySlug(req.params.slug);

      // Fetch related articles (same category, exclude current)
      let related = [];
      if (blog.category) {
        related = await Blog.find({
          category: blog.category,
          _id: { $ne: blog._id },
        })
          .sort({ date: -1 })
          .limit(3)
          .lean();
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { blog, related },
      });
    } catch (error) {
      res.status(HTTP_STATUS.NOT_FOUND);
      next(error);
    }
  }

  // @desc    Create new blog post (admin only)
  // @route   POST /api/blogs
  // @access  Private/Admin
  async createBlog(req, res, next) {
    try {
      const file = req.file || null;
      const blog = await blogService.createBlog(req.body, file);
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Blog post created successfully',
        data: blog,
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(error);
    }
  }

  // @desc    Update blog post (admin only)
  // @route   PUT /api/blogs/:id
  // @access  Private/Admin
  async updateBlog(req, res, next) {
    try {
      const file = req.file || null;
      const blog = await blogService.updateBlog(req.params.id, req.body, file);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Blog post updated successfully',
        data: blog,
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(error);
    }
  }

  // @desc    Delete blog post (admin only)
  // @route   DELETE /api/blogs/:id
  // @access  Private/Admin
  async deleteBlog(req, res, next) {
    try {
      await blogService.deleteBlog(req.params.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Blog post deleted successfully',
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(error);
    }
  }
}

module.exports = new BlogController();
