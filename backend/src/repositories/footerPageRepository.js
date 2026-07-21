const FooterPage = require('../models/FooterPage');

/**
 * FooterPageRepository — data access layer for FooterPage documents.
 * All business logic lives in the service layer above this.
 */
class FooterPageRepository {
  /**
   * Get public-facing footer pages (Published, showInFooter=true, not deleted).
   */
  async findPublic() {
    return await FooterPage.find({
      status: 'Published',
      showInFooter: true,
      isDeleted: false,
    })
      .sort({ displayOrder: 1, createdAt: 1 })
      .select('title slug shortDescription displayOrder featuredImage url')
      .lean();
  }

  /**
   * Find a single page by slug (public, only active non-deleted pages).
   */
  async findBySlug(slug) {
    return await FooterPage.findOne({ slug, isDeleted: false }).lean();
  }

  /**
   * Find any page by slug regardless of status (admin use).
   */
  async findBySlugAdmin(slug) {
    return await FooterPage.findOne({ slug }).lean();
  }

  /**
   * Find by ID (admin use — includes soft-deleted).
   */
  async findById(id) {
    return await FooterPage.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean();
  }

  /**
   * Paginated admin list with search, sort, and status filters.
   * @param {object} opts
   */
  async findAll({
    page = 1,
    limit = 10,
    search = '',
    status = '',
    showInFooter = '',
    includeDeleted = false,
    sortField = 'displayOrder',
    sortOrder = 'asc',
  } = {}) {
    const filter = {};

    if (!includeDeleted) {
      filter.isDeleted = false;
    } else {
      filter.isDeleted = true;
    }

    if (status) filter.status = status;
    if (showInFooter !== '') filter.showInFooter = showInFooter === 'true';
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
      ];
    }

    const sort = { [sortField]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (page - 1) * limit;

    const [pages, total] = await Promise.all([
      FooterPage.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name')
        .populate('updatedBy', 'name')
        .lean(),
      FooterPage.countDocuments(filter),
    ]);

    return { pages, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Create a new footer page.
   */
  async create(data) {
    const page = new FooterPage(data);
    return await page.save();
  }

  /**
   * Update a footer page by ID.
   */
  async update(id, data) {
    return await FooterPage.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();
  }

  /**
   * Soft delete: mark as deleted without removing from DB.
   */
  async softDelete(id, userId = null) {
    return await FooterPage.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date(), updatedBy: userId },
      { new: true }
    ).lean();
  }

  /**
   * Restore a soft-deleted page.
   */
  async restore(id, userId = null) {
    return await FooterPage.findByIdAndUpdate(
      id,
      { isDeleted: false, deletedAt: null, updatedBy: userId },
      { new: true }
    ).lean();
  }

  /**
   * Permanent hard delete.
   */
  async hardDelete(id) {
    return await FooterPage.findByIdAndDelete(id);
  }

  /**
   * Update displayOrder for multiple pages (drag-and-drop reorder).
   * @param {Array<{id: string, displayOrder: number}>} orderedItems
   */
  async reorder(orderedItems) {
    const ops = orderedItems.map(({ id, displayOrder }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { displayOrder } },
      },
    }));
    return await FooterPage.bulkWrite(ops);
  }

  /**
   * Bulk update status for multiple pages.
   */
  async bulkUpdateStatus(ids, status, userId = null) {
    const update = { status, updatedBy: userId };
    if (status === 'Published') update.publishedDate = new Date();
    return await FooterPage.updateMany({ _id: { $in: ids } }, update);
  }

  /**
   * Bulk soft delete.
   */
  async bulkSoftDelete(ids, userId = null) {
    return await FooterPage.updateMany(
      { _id: { $in: ids } },
      { isDeleted: true, deletedAt: new Date(), updatedBy: userId }
    );
  }

  /**
   * Toggle showInFooter status for a single page.
   */
  async toggleFooterVisibility(id, showInFooter, userId = null) {
    return await FooterPage.findByIdAndUpdate(
      id,
      { showInFooter, updatedBy: userId },
      { new: true }
    ).lean();
  }

  /**
   * Check if a slug already exists (optionally excluding one ID).
   */
  async slugExists(slug, excludeId = null) {
    const filter = { slug };
    if (excludeId) filter._id = { $ne: excludeId };
    const count = await FooterPage.countDocuments(filter);
    return count > 0;
  }

  /**
   * Find the highest displayOrder value (for auto-ordering new pages).
   */
  async getMaxDisplayOrder() {
    const result = await FooterPage.findOne({ isDeleted: false })
      .sort({ displayOrder: -1 })
      .select('displayOrder')
      .lean();
    return result ? result.displayOrder : 0;
  }
}

module.exports = new FooterPageRepository();
