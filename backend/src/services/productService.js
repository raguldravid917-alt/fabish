const mongoose = require('mongoose');
const productRepository = require('../repositories/productRepository');
const Product = require('../models/Product');
const Category = require('../models/Category');
const uploadService = require('./uploadService');
const { PRODUCT_STATUS } = require('../constants');

// Local slugify helper
const getSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const getCategoryAndDescendants = async (categorySlugOrId) => {
  let targetCat;
  if (mongoose.Types.ObjectId.isValid(categorySlugOrId)) {
    targetCat = await Category.findById(categorySlugOrId);
  } else {
    targetCat = await Category.findOne({ slug: categorySlugOrId, isDeleted: false });
    if (!targetCat && typeof categorySlugOrId === 'string' && categorySlugOrId.endsWith('s')) {
      const singularSlug = categorySlugOrId.slice(0, -1);
      targetCat = await Category.findOne({ slug: singularSlug, isDeleted: false });
    }
  }

  if (!targetCat) return [];

  const allCats = await Category.find({ isDeleted: false });
  const childrenMap = {};
  allCats.forEach(c => {
    const parentId = c.parentCategory ? c.parentCategory.toString() : null;
    if (parentId) {
      if (!childrenMap[parentId]) childrenMap[parentId] = [];
      childrenMap[parentId].push(c);
    }
  });

  const ids = [targetCat._id];
  const queue = [targetCat._id.toString()];
  while (queue.length > 0) {
    const currentId = queue.shift();
    const children = childrenMap[currentId] || [];
    children.forEach(child => {
      ids.push(child._id);
      queue.push(child._id.toString());
    });
  }

  return ids;
};

class ProductService {
  async getProducts(queryParams) {
    const page = Number(queryParams.page) || 1;
    const limit = Number(queryParams.limit) || 12;

    const filter = {};
    const sort = {};

    // Search query (using Mongo text search index)
    if (queryParams.keyword) {
      filter.$text = { $search: queryParams.keyword };
    }

    // Category filter resolving slug or ID including descendants
    if (queryParams.category && queryParams.category !== 'all') {
      const categoryIds = await getCategoryAndDescendants(queryParams.category);
      if (categoryIds.length > 0) {
        filter.category = { $in: categoryIds };
      } else {
        // Force query to return empty since category was not found
        filter.category = new mongoose.Types.ObjectId();
      }
    }

    // Brand filter
    if (queryParams.brand) {
      filter.brand = queryParams.brand;
    }

    // Featured filter
    if (queryParams.featured) {
      filter.featured = queryParams.featured === 'true';
    }

    // BestSeller filter
    if (queryParams.bestSeller) {
      filter.bestSeller = queryParams.bestSeller === 'true';
    }

    // NewArrival filter
    if (queryParams.newArrival) {
      filter.newArrival = queryParams.newArrival === 'true';
    }

    // Trending filter
    if (queryParams.trending) {
      filter.trending = queryParams.trending === 'true';
    }

    // Explicit status filter for admins
    if (queryParams.status) {
      filter.status = queryParams.status;
    }

    // Price range filters
    if (queryParams.minPrice || queryParams.maxPrice) {
      filter.price = {};
      if (queryParams.minPrice) {
        filter.price.$gte = Number(queryParams.minPrice);
      }
      if (queryParams.maxPrice) {
        filter.price.$lte = Number(queryParams.maxPrice);
      }
    }

    // Tags query
    if (queryParams.tag) {
      filter.tags = queryParams.tag;
    }

    // Sorting options mapping
    if (queryParams.sort) {
      switch (queryParams.sort) {
        case 'price-ascending':
        case 'priceAsc':
          sort.price = 1;
          break;
        case 'price-descending':
        case 'priceDesc':
          sort.price = -1;
          break;
        case 'title-ascending':
        case 'titleAsc':
          sort.title = 1;
          break;
        case 'title-descending':
        case 'titleDesc':
          sort.title = -1;
          break;
        case 'created-ascending':
          sort.createdAt = 1;
          break;
        case 'created-descending':
        case 'newest':
          sort.createdAt = -1;
          break;
        case 'rating':
          sort.ratings = -1;
          break;
        default:
          sort.createdAt = -1;
      }
    } else {
      sort.createdAt = -1;
    }

    return await productRepository.findAndCount({ filter, sort, page, limit });
  }

  async getProductById(id) {
    const product = await productRepository.findById(id);
    if (!product || product.status === PRODUCT_STATUS.DELETED) {
      throw new Error('Product not found');
    }
    return product;
  }

  async getProductBySlug(slug) {
    const product = await productRepository.findBySlug(slug);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  async createProduct(productData, files = [], userId) {
    const slug = getSlug(productData.title);
    
    // Check duplicate slug
    const existingProduct = await productRepository.findBySlug(slug);
    if (existingProduct) {
      throw new Error('Product title already exists (slug conflict)');
    }

    // Resolve Category ID from slug or verify valid ObjectId
    let categoryId = productData.category;
    if (!mongoose.Types.ObjectId.isValid(productData.category)) {
      const cat = await Category.findOne({ slug: productData.category, isDeleted: false });
      if (!cat) {
        throw new Error(`Category with slug '${productData.category}' does not exist`);
      }
      categoryId = cat._id;
    }

    // Parse tag/variant arrays if sent as strings (typical in multipart FormDatas)
    let parsedTags = productData.tags || [];
    if (typeof parsedTags === 'string') {
      parsedTags = parsedTags.split(',').map((t) => t.trim()).filter(Boolean);
    }
    let parsedVariants = productData.variants || [];
    if (typeof parsedVariants === 'string') {
      parsedVariants = parsedVariants.split(',').map((v) => v.trim()).filter(Boolean);
    }

    // Upload files to Cloudinary ('fabish/products' folder)
    let imageUrls = [];
    if (files && files.length) {
      imageUrls = await uploadService.uploadMultiple(files, 'fabish/products');
    }

    const payload = {
      ...productData,
      title: productData.title.trim(),
      slug,
      category: categoryId,
      images: imageUrls,
      thumbnail: imageUrls[0]?.secure_url || '',
      tags: parsedTags,
      variants: parsedVariants,
      comparePrice: Number(productData.comparePrice) || 0.0,
      price: Number(productData.price),
      stock: Number(productData.stock) || 0,
      featured: productData.featured === true || productData.featured === 'true',
      bestSeller: productData.bestSeller === true || productData.bestSeller === 'true',
      newArrival: productData.newArrival === true || productData.newArrival === 'true',
      trending: productData.trending === true || productData.trending === 'true',
      seoTitle: productData.seoTitle || productData.title.trim(),
      seoDescription: productData.seoDescription || productData.description?.slice(0, 150),
      createdBy: userId,
      updatedBy: userId,
    };

    return await productRepository.create(payload);
  }

  async updateProduct(id, productData, files = [], userId) {
    const product = await Product.findById(id);
    if (!product || product.status === PRODUCT_STATUS.DELETED) {
      throw new Error('Product not found');
    }

    // Resolve Category ID
    let categoryId = product.category;
    if (productData.category) {
      if (mongoose.Types.ObjectId.isValid(productData.category)) {
        categoryId = productData.category;
      } else {
        const cat = await Category.findOne({ slug: productData.category, isDeleted: false });
        if (!cat) {
          throw new Error(`Category with slug '${productData.category}' does not exist`);
        }
        categoryId = cat._id;
      }
    }

    // Parse tag/variant arrays
    let parsedTags = productData.tags;
    if (typeof parsedTags === 'string') {
      parsedTags = parsedTags.split(',').map((t) => t.trim()).filter(Boolean);
    }
    let parsedVariants = productData.variants;
    if (typeof parsedVariants === 'string') {
      parsedVariants = parsedVariants.split(',').map((v) => v.trim()).filter(Boolean);
    }

    // Handle kept images vs newly uploaded files
    let keptImages = [];
    const existingImagesData = productData.existingImages || productData.images;
    if (existingImagesData) {
      keptImages = typeof existingImagesData === 'string' 
        ? JSON.parse(existingImagesData) 
        : existingImagesData;
    } else {
      keptImages = product.images || [];
    }

    // Upload new files
    let newUploaded = [];
    if (files && files.length) {
      newUploaded = await uploadService.uploadMultiple(files, 'fabish/products');
    }

    const finalImages = [...keptImages, ...newUploaded];

    // Automatical deletion of removed/unused images from Cloudinary
    const originalImages = product.images || [];
    const removedImages = originalImages.filter(orig => 
      !finalImages.some(fin => fin.public_id === orig.public_id)
    );

    for (const img of removedImages) {
      await uploadService.deleteImage(img.public_id);
    }

    const payload = {
      ...productData,
      category: categoryId,
      images: finalImages,
      thumbnail: finalImages[0]?.secure_url || '',
      updatedBy: userId,
    };

    if (parsedTags) payload.tags = parsedTags;
    if (parsedVariants) payload.variants = parsedVariants;
    if (productData.price !== undefined) payload.price = Number(productData.price);
    if (productData.comparePrice !== undefined) payload.comparePrice = Number(productData.comparePrice);
    if (productData.stock !== undefined) payload.stock = Number(productData.stock);
    if (productData.featured !== undefined) payload.featured = productData.featured === true || productData.featured === 'true';
    if (productData.bestSeller !== undefined) payload.bestSeller = productData.bestSeller === true || productData.bestSeller === 'true';
    if (productData.newArrival !== undefined) payload.newArrival = productData.newArrival === true || productData.newArrival === 'true';
    if (productData.trending !== undefined) payload.trending = productData.trending === true || productData.trending === 'true';

    if (productData.title && productData.title.trim() !== product.title) {
      payload.title = productData.title.trim();
      payload.slug = getSlug(payload.title);
      const existing = await productRepository.findBySlug(payload.slug);
      if (existing && existing._id.toString() !== id) {
        throw new Error('Product title already exists (slug conflict)');
      }
    }

    return await productRepository.update(id, payload);
  }

  async deleteProduct(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid product ID format');
    }
    const product = await Product.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    // Absolute deletion of Cloudinary media files
    for (const img of product.images || []) {
      await uploadService.deleteImage(img.public_id);
    }

    // Absolute hard delete of record from Mongo
    return await Product.findByIdAndDelete(id);
  }

  async restoreProduct(id) {
    const restoredProduct = await productRepository.restore(id);
    if (!restoredProduct) {
      throw new Error('Product not found');
    }
    return restoredProduct;
  }

  async updateFeaturedStatus(id, featured) {
    return await productRepository.update(id, { featured });
  }

  async updateTrendingStatus(id, trending) {
    return await productRepository.update(id, { trending });
  }

  async updateBestSellerStatus(id, bestSeller) {
    return await productRepository.update(id, { bestSeller });
  }

  async updateNewArrivalStatus(id, newArrival) {
    return await productRepository.update(id, { newArrival });
  }

  async updateStatus(id, status) {
    if (!Object.values(PRODUCT_STATUS).includes(status)) {
      throw new Error('Invalid status');
    }
    return await productRepository.update(id, { status });
  }

  async bulkDelete(ids) {
    // Delete files from Cloudinary for all deleted products
    const products = await Product.find({ _id: { $in: ids } });
    for (const product of products) {
      for (const img of product.images || []) {
        await uploadService.deleteImage(img.public_id);
      }
    }
    return await Product.deleteMany({ _id: { $in: ids } });
  }

  async bulkPublish(ids) {
    return await productRepository.bulkUpdateStatus(ids, PRODUCT_STATUS.PUBLISHED);
  }

  async bulkHide(ids) {
    return await productRepository.bulkUpdateStatus(ids, PRODUCT_STATUS.HIDDEN);
  }
}

module.exports = new ProductService();
