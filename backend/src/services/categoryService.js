const categoryRepository = require('../repositories/categoryRepository');
const uploadService = require('./uploadService');
const Category = require('../models/Category');
const Product = require('../models/Product');

const getSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

class CategoryService {
  async getCategories(includeDeleted = false) {
    const categories = await categoryRepository.findAll(includeDeleted);
    try {
      const counts = await Product.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);
      const directCountMap = {};
      counts.forEach((c) => {
        if (c._id) {
          directCountMap[c._id.toString()] = c.count;
        }
      });

      // Build parent -> children map to include descendant category counts
      const childrenMap = {};
      categories.forEach((cat) => {
        const catObj = cat.toObject ? cat.toObject() : cat;
        const pId = catObj.parentCategory
          ? typeof catObj.parentCategory === 'object'
            ? catObj.parentCategory._id
            : catObj.parentCategory
          : null;
        if (pId) {
          const pIdStr = pId.toString();
          if (!childrenMap[pIdStr]) childrenMap[pIdStr] = [];
          const catIdStr = catObj._id ? catObj._id.toString() : catObj.id;
          if (catIdStr) childrenMap[pIdStr].push(catIdStr);
        }
      });

      const getDescendantTotal = (catIdStr, visited = new Set()) => {
        if (!catIdStr || visited.has(catIdStr)) return 0;
        visited.add(catIdStr);

        let total = directCountMap[catIdStr] || 0;
        const children = childrenMap[catIdStr] || [];
        for (const childIdStr of children) {
          total += getDescendantTotal(childIdStr, visited);
        }
        return total;
      };

      return categories.map((cat) => {
        const catObj = cat.toObject ? cat.toObject() : { ...cat };
        const catIdStr = catObj._id ? catObj._id.toString() : null;
        return {
          ...catObj,
          productCount: catIdStr ? getDescendantTotal(catIdStr) : (directCountMap[catObj.slug] || 0),
        };
      });
    } catch (err) {
      console.error('Error calculating category product counts:', err);
      return categories.map((cat) => ({ ...cat, productCount: 0 }));
    }
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
