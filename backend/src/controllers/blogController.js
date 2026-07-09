const blogService = require('../services/blogService');
const { HTTP_STATUS } = require('../constants');

class BlogController {
  // @desc    Get all blog posts
  // @route   GET /api/blogs
  // @access  Public
  async getBlogs(req, res, next) {
    try {
      const blogs = await blogService.getBlogs();
      
      if (!blogs || blogs.length === 0) {
        return res.status(HTTP_STATUS.OK).json({
          success: true,
          data: [],
        });
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Blogs retrieved successfully',
        data: blogs,
        blogs: blogs,
        pagination: {
          page: 1,
          pages: 1,
          total: blogs.length,
        },
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
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: blog,
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
