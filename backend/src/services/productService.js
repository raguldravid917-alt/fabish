const mongoose = require('mongoose');
const productRepository = require('../repositories/productRepository');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Badge = require('../models/Badge');
const Variant = require('../models/Variant');
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
    if (queryParams.featured !== undefined && queryParams.featured !== '') {
      filter.featured = queryParams.featured === 'true' || queryParams.featured === true;
    }

    // BestSeller filter
    if (queryParams.bestSeller !== undefined && queryParams.bestSeller !== '') {
      filter.bestSeller = queryParams.bestSeller === 'true' || queryParams.bestSeller === true;
    }

    // NewArrival filter
    if (queryParams.newArrival !== undefined && queryParams.newArrival !== '') {
      filter.newArrival = queryParams.newArrival === 'true' || queryParams.newArrival === true;
    }

    // Trending filter
    if (queryParams.trending !== undefined && queryParams.trending !== '') {
      filter.trending = queryParams.trending === 'true' || queryParams.trending === true;
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

  async checkDuplicateName(title, excludeId) {
    const slug = getSlug(title);
    const filter = { slug, status: { $ne: PRODUCT_STATUS.DELETED } };
    if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
      filter._id = { $ne: excludeId };
    }
    const count = await Product.countDocuments(filter);
    return count > 0;
  }

  async createProduct(productData, files = [], userId) {
    const slug = productData.slug ? getSlug(productData.slug) : getSlug(productData.title);

    // Check duplicate slug
    const existingProduct = await productRepository.findBySlug(slug);
    if (existingProduct) {
      throw new Error('Product slug already exists (conflict)');
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

    // Parse tags array
    let parsedTags = productData.tags || [];
    if (typeof parsedTags === 'string') {
      try {
        parsedTags = JSON.parse(parsedTags);
      } catch (e) {
        parsedTags = parsedTags.split(',').map((t) => t.trim()).filter(Boolean);
      }
    }

    // Parse badges array and resolve featured / bestseller / newarrival / trending flags
    let parsedBadges = productData.badges || [];
    if (typeof parsedBadges === 'string') {
      try {
        parsedBadges = JSON.parse(parsedBadges);
      } catch (e) {
        parsedBadges = parsedBadges.split(',').map((b) => b.trim()).filter(Boolean);
      }
    }

    const badgeDocs = await Badge.find({ _id: { $in: parsedBadges } });
    const badgeSlugs = badgeDocs.map(b => b.slug);

    // Parse variants array
    let parsedVariants = productData.variants || [];
    if (typeof parsedVariants === 'string') {
      try {
        parsedVariants = JSON.parse(parsedVariants);
      } catch (e) {
        parsedVariants = [];
      }
    }

    // Upload files to Cloudinary ('fabish/products' folder)
    let imageUrls = [];
    if (files && files.length) {
      imageUrls = await uploadService.uploadMultiple(files, 'fabish/products');
    }

    const payload = {
      title: productData.title.trim(),
      productName: productData.title.trim(),
      slug,
      description: productData.description,
      category: categoryId,
      images: imageUrls,
      thumbnail: imageUrls[0]?.secure_url || '',
      tags: parsedTags,
      badges: parsedBadges,
      variants: [], // Save variants references after they are created below
      comparePrice: Number(productData.comparePrice) || 0.0,
      price: Number(productData.price),
      stock: Number(productData.stock) || 0,
      featured: badgeSlugs.includes('featured'),
      bestSeller: badgeSlugs.includes('bestseller'),
      newArrival: badgeSlugs.includes('newarrival'),
      trending: badgeSlugs.includes('trending'),
      seoTitle: productData.seoTitle || productData.title.trim(),
      seoDescription: productData.seoDescription || productData.description?.slice(0, 150),
      createdBy: userId,
      updatedBy: userId,
    };

    const newProduct = await Product.create(payload);

    // Create variant documents referencing this product
    const createdVariantIds = [];
    if (Array.isArray(parsedVariants) && parsedVariants.length > 0) {
      for (const v of parsedVariants) {
        if (!v || (typeof v !== 'object' && typeof v !== 'string')) continue;

        const variantName = typeof v === 'object' ? v.name : v;
        const variantSku = typeof v === 'object' ? (v.sku || '') : '';
        const variantPrice = typeof v === 'object' ? (Number(v.price) || payload.price || 0) : (payload.price || 0);
        const variantStock = typeof v === 'object' ? (Number(v.stock) || 0) : 0;

        const variantDoc = await Variant.create({
          product: newProduct._id,
          name: variantName,
          sku: variantSku,
          price: variantPrice,
          stock: variantStock
        });
        createdVariantIds.push(variantDoc._id);
      }
    }

    if (createdVariantIds.length > 0) {
      newProduct.variants = createdVariantIds;
      await newProduct.save();
    }

    return await productRepository.findById(newProduct._id);
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

    // Parse tags array
    let parsedTags = productData.tags;
    if (typeof parsedTags === 'string') {
      try {
        parsedTags = JSON.parse(parsedTags);
      } catch (e) {
        parsedTags = parsedTags.split(',').map((t) => t.trim()).filter(Boolean);
      }
    }

    // Handle kept images vs newly uploaded files
    let keptImages = [];
    const existingImagesData = productData.existingImages || productData.images;

    // 🔍 DEBUG LOGS
    console.log("--- UPDATE PRODUCT DEBUG START ---");
    console.log("Raw existingImagesData from request:", existingImagesData);
    console.log("Type of existingImagesData:", typeof existingImagesData);

    if (existingImagesData) {
      if (typeof existingImagesData === 'string') {
        try {
          keptImages = JSON.parse(existingImagesData);
        } catch (error) {
          keptImages = [];
        }
      } else {
        keptImages = existingImagesData;
      }
    } else {
      keptImages = product.images || [];
    }

    console.log("Parsed keptImages array:", keptImages);

    // Upload new files
    let newUploaded = [];
    if (files && files.length) {
      newUploaded = await uploadService.uploadMultiple(files, 'fabish/products');
    }
    console.log("Newly uploaded files (if any):", newUploaded);

    const finalImages = [...keptImages, ...newUploaded];
    console.log("Combined Final Images:", finalImages);

    // 🟩 Robust helper to extract unique ID
    const getImgId = (img) => {
      if (!img) return null;
      if (typeof img === 'string') return img;
      return img.public_id || img.secure_url || img.url;
    };

    // 🟩 Safety Filter: Only delete images that were actually removed by user in frontend
    const originalImages = product.images || [];
    const removedImages = originalImages.filter(orig => {
      const origId = getImgId(orig);
      return !finalImages.some(fin => getImgId(fin) === origId);
    });

    console.log("Images scheduled for actual deletion:", removedImages);

    for (const img of removedImages) {
      if (img && img.public_id) {
        await uploadService.deleteImage(img.public_id);
      }
    }

    const payload = {
      description: productData.description,
      category: categoryId,
      images: finalImages,
      thumbnail: (finalImages[0]?.secure_url || finalImages[0] || ''),
      updatedBy: userId,
    };

    if (parsedTags) payload.tags = parsedTags;

    // Resolve dynamic badges and their boolean flags
    let parsedBadges = productData.badges;
    if (parsedBadges !== undefined) {
      if (typeof parsedBadges === 'string') {
        try {
          parsedBadges = JSON.parse(parsedBadges);
        } catch (e) {
          parsedBadges = parsedBadges.split(',').map((b) => b.trim()).filter(Boolean);
        }
      }
      const badgeDocs = await Badge.find({ _id: { $in: parsedBadges } });
      const badgeSlugs = badgeDocs.map(b => b.slug);
      payload.badges = parsedBadges;
      payload.featured = badgeSlugs.includes('featured');
      payload.bestSeller = badgeSlugs.includes('bestseller');
      payload.newArrival = badgeSlugs.includes('newarrival');
      payload.trending = badgeSlugs.includes('trending');
    }

    // Resolve variants updates
    let parsedVariants = productData.variants;
    if (typeof parsedVariants === 'string') {
      try {
        parsedVariants = JSON.parse(parsedVariants);
      } catch (e) {
        parsedVariants = undefined;
      }
    }
    if (Array.isArray(parsedVariants)) {
      const existingVariants = await Variant.find({ product: id });
      const updatedVariantIds = [];
      for (const v of parsedVariants) {
        if (!v || (typeof v !== 'object' && typeof v !== 'string')) continue;

        const variantId = typeof v === 'object' ? v._id : null;
        const variantName = typeof v === 'object' ? v.name : v;
        const variantSku = typeof v === 'object' ? (v.sku || '') : '';
        const variantPrice = typeof v === 'object' ? (Number(v.price) || payload.price || product.price || 0) : (payload.price || product.price || 0);
        const variantStock = typeof v === 'object' ? (Number(v.stock) || 0) : 0;

        if (variantId && mongoose.Types.ObjectId.isValid(variantId)) {
          // Update existing variant
          await Variant.findByIdAndUpdate(variantId, {
            name: variantName,
            sku: variantSku,
            price: variantPrice,
            stock: variantStock
          });
          updatedVariantIds.push(variantId);
        } else {
          // Create new variant
          const newVar = await Variant.create({
            product: id,
            name: variantName,
            sku: variantSku,
            price: variantPrice,
            stock: variantStock
          });
          updatedVariantIds.push(newVar._id);
        }
      }
      const removedVariantIds = existingVariants
        .map(ev => ev._id.toString())
        .filter(evId => !updatedVariantIds.map(vid => vid.toString()).includes(evId));
      await Variant.deleteMany({ _id: { $in: removedVariantIds } });
      payload.variants = updatedVariantIds;
    }

    if (productData.price !== undefined) payload.price = Number(productData.price);
    if (productData.comparePrice !== undefined) payload.comparePrice = Number(productData.comparePrice);
    if (productData.stock !== undefined) payload.stock = Number(productData.stock);

    // Resolve title / productName / slug updates
    if (productData.slug) {
      payload.slug = getSlug(productData.slug);
      const existing = await Product.findOne({ slug: payload.slug, _id: { $ne: id } });
      if (existing) {
        throw new Error('Product slug already exists (conflict)');
      }
    } else if (productData.title && productData.title.trim() !== product.title) {
      payload.title = productData.title.trim();
      payload.productName = payload.title;
      payload.slug = getSlug(payload.title);
      const existing = await Product.findOne({ slug: payload.slug, _id: { $ne: id } });
      if (existing) {
        throw new Error('Product slug already exists (conflict)');
      }
    } else if (productData.title) {
      payload.title = productData.title.trim();
      payload.productName = payload.title;
    }

    const updated = await productRepository.update(id, payload);
    console.log("Successfully saved product in DB:", updated);
    console.log("--- UPDATE PRODUCT DEBUG END ---");
    return updated;
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

    // Delete associated variants
    await Variant.deleteMany({ product: id });

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

    // Delete associated variants
    await Variant.deleteMany({ product: { $in: ids } });

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
