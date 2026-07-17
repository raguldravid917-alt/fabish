const categoryRepository = require('../repositories/categoryRepository');
const uploadService = require('./uploadService');
const Category = require('../models/Category');

const getSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

class CategoryService {
  async getCategories(includeDeleted = false) {
    return await categoryRepository.findAll(includeDeleted);
  }

  async getCategoryBySlug(slug) {
    let normalizedSlug = slug;
    if (slug === 'lotion') normalizedSlug = 'body-lotion';
    else if (slug === 'cleanse') normalizedSlug = 'cleanser';
    else if (slug === 'serums') normalizedSlug = 'serum';

    const category = await categoryRepository.findBySlug(normalizedSlug);
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  }

  async createCategory(categoryData, file = null) {
    const slug = getSlug(categoryData.name);
    const existing = await categoryRepository.findBySlug(slug);
    if (existing) {
      throw new Error('Category already exists');
    }

    let imageUrl = '';
    if (file) {
      const uploadResult = await uploadService.uploadFile(file, 'fabish/categories');
      imageUrl = uploadResult.secure_url;
    } else if (categoryData.image) {
      imageUrl = categoryData.image;
    }

    let parentCategoryVal = categoryData.parentCategory;
    if (parentCategoryVal === 'null' || parentCategoryVal === '' || parentCategoryVal === 'undefined') {
      parentCategoryVal = null;
    }

    const payload = {
      ...categoryData,
      slug,
      image: imageUrl,
      parentCategory: parentCategoryVal,
    };

    return await categoryRepository.create(payload);
  }

  async updateCategory(id, categoryData, file = null) {
    const category = await Category.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    let imageUrl = categoryData.image !== undefined ? categoryData.image : category.image;

    if (file) {
      // Upload new image to Cloudinary folder 'fabish/categories'
      const uploadResult = await uploadService.uploadFile(file, 'fabish/categories');
      imageUrl = uploadResult.secure_url;

      // Delete old image from Cloudinary
      if (category.image) {
        await uploadService.deleteImage(category.image);
      }
    }

    let parentCategoryVal = categoryData.parentCategory;
    if (parentCategoryVal === 'null' || parentCategoryVal === '' || parentCategoryVal === 'undefined') {
      parentCategoryVal = null;
    }

    const payload = { 
      ...categoryData,
      image: imageUrl,
      parentCategory: parentCategoryVal,
    };

    if (categoryData.name && categoryData.name !== category.name) {
      payload.slug = getSlug(categoryData.name);
      const existing = await categoryRepository.findBySlug(payload.slug);
      if (existing && existing._id.toString() !== id) {
        throw new Error('Category name already exists');
      }
    }

    return await categoryRepository.update(id, payload);
  }

  async deleteCategory(id) {
    const category = await Category.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    // Delete image from Cloudinary
    if (category.image) {
      await uploadService.deleteImage(category.image);
    }

    // Clear parentCategory references on child categories
    await Category.updateMany({ parentCategory: id }, { parentCategory: null });

    // Hard delete category record
    return await Category.findByIdAndDelete(id);
  }

  async restoreCategory(id) {
    const result = await categoryRepository.restore(id);
    if (!result) {
      throw new Error('Category not found');
    }
    return result;
  }
}

module.exports = new CategoryService();
