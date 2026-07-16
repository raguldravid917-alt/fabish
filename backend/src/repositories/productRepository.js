const Product = require('../models/Product');
const { PRODUCT_STATUS } = require('../constants');

class ProductRepository {
  logMalformedProduct(prod) {
    if (!prod) return;
    if (prod.variants && Array.isArray(prod.variants)) {
      prod.variants.forEach((v, idx) => {
        if (v && typeof v === 'string') {
          console.warn(`[WARNING] Malformed product detected! Product "${prod.title}" (ID: ${prod._id}) contains string variant "${v}" at index ${idx} instead of populated Object.`);
        }
      });
    }
    if (prod.badges && Array.isArray(prod.badges)) {
      prod.badges.forEach((b, idx) => {
        if (b && typeof b === 'string') {
          console.warn(`[WARNING] Malformed product detected! Product "${prod.title}" (ID: ${prod._id}) contains string badge ID "${b}" at index ${idx} instead of populated Object.`);
        }
      });
    }
  }

  async findById(id) {
    try {
      const product = await Product.findById(id).populate('category').populate('variants').populate('badges').lean();
      if (product) this.logMalformedProduct(product);
      return product;
    } catch (err) {
      console.error(`[DB ERROR] findById failed for ID '${id}':`, err.message);
      throw err;
    }
  }

  async findBySlug(slug) {
    try {
      const product = await Product.findOne({ slug, status: { $ne: PRODUCT_STATUS.DELETED } }).populate('category').populate('variants').populate('badges').lean();
      if (product) this.logMalformedProduct(product);
      return product;
    } catch (err) {
      console.error(`[DB ERROR] findBySlug failed for slug '${slug}':`, err.message);
      throw err;
    }
  }

  async create(productData) {
    try {
      const product = await Product.create(productData);
      const created = await Product.findById(product._id).populate('category').populate('variants').populate('badges').lean();
      if (created) this.logMalformedProduct(created);
      return created;
    } catch (err) {
      console.error('[DB ERROR] create failed:', err.message);
      throw err;
    }
  }

  async update(id, updateData) {
    try {
      const updated = await Product.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).populate('category').populate('variants').populate('badges');
      if (updated) this.logMalformedProduct(updated);
      return updated;
    } catch (err) {
      console.error(`[DB ERROR] update failed for ID '${id}':`, err.message);
      throw err;
    }
  }

  async softDelete(id) {
    try {
      return await Product.findByIdAndUpdate(
        id,
        { status: PRODUCT_STATUS.DELETED },
        { new: true }
      );
    } catch (err) {
      console.error(`[DB ERROR] softDelete failed for ID '${id}':`, err.message);
      throw err;
    }
  }

  async restore(id) {
    try {
      return await Product.findByIdAndUpdate(
        id,
        { status: PRODUCT_STATUS.PUBLISHED },
        { new: true }
      );
    } catch (err) {
      console.error(`[DB ERROR] restore failed for ID '${id}':`, err.message);
      throw err;
    }
  }

  async bulkUpdateStatus(ids, status) {
    try {
      return await Product.updateMany(
        { _id: { $in: ids } },
        { $set: { status } }
      );
    } catch (err) {
      console.error('[DB ERROR] bulkUpdateStatus failed:', err.message);
      throw err;
    }
  }

  async bulkDelete(ids) {
    try {
      return await Product.updateMany(
        { _id: { $in: ids } },
        { $set: { status: PRODUCT_STATUS.DELETED } }
      );
    } catch (err) {
      console.error('[DB ERROR] bulkDelete failed:', err.message);
      throw err;
    }
  }

  async findAndCount({ filter = {}, sort = {}, page = 1, limit = 12 }) {
    try {
      const sanitizedPage = Math.max(1, Math.floor(Number(page)) || 1);
      const sanitizedLimit = Math.min(100, Math.max(1, Math.floor(Number(limit)) || 12));
      const skip = (sanitizedPage - 1) * sanitizedLimit;
      
      // Ignore soft deleted items by default in general listing unless requested
      if (!filter.status) {
        filter.status = { $ne: PRODUCT_STATUS.DELETED };
      }

      const count = await Product.countDocuments(filter);
      const products = await Product.find(filter)
        .populate('category')
        .populate('variants')
        .populate('badges')
        .sort(sort)
        .skip(skip)
        .limit(sanitizedLimit)
        .lean();

      if (products && Array.isArray(products)) {
        products.forEach(p => this.logMalformedProduct(p));
      }

      return {
        products,
        total: count,
        pages: Math.ceil(count / sanitizedLimit),
      };
    } catch (err) {
      console.error('[DB ERROR] findAndCount failed:', err.message);
      throw err;
    }
  }
}

module.exports = new ProductRepository();
