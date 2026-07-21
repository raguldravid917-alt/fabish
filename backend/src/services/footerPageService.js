const footerPageRepository = require('../repositories/footerPageRepository');
const uploadService = require('./uploadService');

/**
 * Simple in-memory TTL cache for public footer page listings.
 * Invalidated on any write operation.
 */
const cache = {
  data: null,
  timestamp: 0,
  TTL: 60 * 1000, // 60 seconds
  get() {
    if (this.data && Date.now() - this.timestamp < this.TTL) return this.data;
    return null;
  },
  set(data) {
    this.data = data;
    this.timestamp = Date.now();
  },
  invalidate() {
    this.data = null;
    this.timestamp = 0;
  },
};

/**
 * Generate a URL-safe slug from a string.
 */
const generateSlug = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

class FooterPageService {
  /**
   * Get all public footer pages (Published + showInFooter + not deleted).
   * Results are cached for 60 seconds.
   */
  async getPublicPages() {
    const cached = cache.get();
    if (cached) return cached;

    const pages = await footerPageRepository.findPublic();
    cache.set(pages);
    return pages;
  }

  /**
   * Get a single page by slug (public).
   * Returns null if not found, throws if inactive.
   */
  async getPageBySlug(slug) {
    const page = await footerPageRepository.findBySlug(slug);
    return page;
  }

  /**
   * Admin: Paginated list with filters.
   */
  async adminListPages(params) {
    return await footerPageRepository.findAll(params);
  }

  /**
   * Admin: Get single page by ID.
   */
  async getById(id) {
    const page = await footerPageRepository.findById(id);
    if (!page) throw new Error('Footer page not found');
    return page;
  }

  /**
   * Create a new footer page.
   */
  async createPage(data, files = {}, userId = null) {
    // Generate slug from title if not provided
    let slug = data.slug ? generateSlug(data.slug) : generateSlug(data.title);
    if (!slug) throw new Error('Could not generate a valid slug');

    // Ensure slug uniqueness
    if (await footerPageRepository.slugExists(slug)) {
      slug = `${slug}-${Date.now()}`;
    }

    // Handle image uploads
    const featuredImage = await this._handleImageUpload(
      files.featuredImage?.[0] || null,
      data.existingFeaturedImageUrl || '',
      'fabish/footer-pages'
    );
    const bannerImage = await this._handleImageUpload(
      files.bannerImage?.[0] || null,
      data.existingBannerImageUrl || '',
      'fabish/footer-pages'
    );

    // Auto-assign displayOrder if not provided
    const maxOrder = await footerPageRepository.getMaxDisplayOrder();

    const payload = {
      title: data.title.trim(),
      slug,
      shortDescription: data.shortDescription?.trim() || '',
      content: data.content || '',
      featuredImage: {
        url: featuredImage.url,
        publicId: featuredImage.publicId,
        alt: data.featuredImageAlt || data.title,
      },
      bannerImage: {
        url: bannerImage.url,
        publicId: bannerImage.publicId,
        alt: data.bannerImageAlt || data.title,
      },
      seoTitle: data.seoTitle?.trim() || '',
      seoDescription: data.seoDescription?.trim() || '',
      seoKeywords: this._parseKeywords(data.seoKeywords),
      status: data.status || 'Draft',
      showInFooter: data.showInFooter !== undefined
        ? data.showInFooter === true || data.showInFooter === 'true'
        : true,
      displayOrder: parseInt(data.displayOrder) || maxOrder + 1,
      publishedDate: data.status === 'Published' ? new Date() : null,
      createdBy: userId,
      updatedBy: userId,
    };

    const page = await footerPageRepository.create(payload);
    cache.invalidate();
    return page;
  }

  /**
   * Update an existing footer page.
   */
  async updatePage(id, data, files = {}, userId = null) {
    const existing = await footerPageRepository.findById(id);
    if (!existing) throw new Error('Footer page not found');

    // Slug handling
    let slug = existing.slug;
    if (data.slug && data.slug !== existing.slug) {
      const newSlug = generateSlug(data.slug);
      if (await footerPageRepository.slugExists(newSlug, id)) {
        throw new Error('This slug is already taken by another page');
      }
      slug = newSlug;
    }

    // Image handling
    const featuredImage = await this._handleImageUpload(
      files.featuredImage?.[0] || null,
      data.existingFeaturedImageUrl,
      'fabish/footer-pages',
      existing.featuredImage
    );
    const bannerImage = await this._handleImageUpload(
      files.bannerImage?.[0] || null,
      data.existingBannerImageUrl,
      'fabish/footer-pages',
      existing.bannerImage
    );

    const payload = {
      ...(data.title !== undefined && { title: data.title.trim() }),
      slug,
      ...(data.shortDescription !== undefined && { shortDescription: data.shortDescription.trim() }),
      ...(data.content !== undefined && { content: data.content }),
      featuredImage: {
        url: featuredImage.url,
        publicId: featuredImage.publicId,
        alt: data.featuredImageAlt || existing.featuredImage?.alt || '',
      },
      bannerImage: {
        url: bannerImage.url,
        publicId: bannerImage.publicId,
        alt: data.bannerImageAlt || existing.bannerImage?.alt || '',
      },
      ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle.trim() }),
      ...(data.seoDescription !== undefined && { seoDescription: data.seoDescription.trim() }),
      ...(data.seoKeywords !== undefined && { seoKeywords: this._parseKeywords(data.seoKeywords) }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.showInFooter !== undefined && {
        showInFooter: data.showInFooter === true || data.showInFooter === 'true',
      }),
      ...(data.displayOrder !== undefined && { displayOrder: parseInt(data.displayOrder) || 0 }),
      updatedBy: userId,
    };

    // Set publishedDate when first publishing
    if (data.status === 'Published' && existing.status !== 'Published') {
      payload.publishedDate = new Date();
    }

    const updated = await footerPageRepository.update(id, payload);
    cache.invalidate();
    return updated;
  }

  /**
   * Toggle page status (Published ↔ Draft).
   */
  async toggleStatus(id, status, userId = null) {
    const page = await footerPageRepository.findById(id);
    if (!page) throw new Error('Footer page not found');

    const update = { status, updatedBy: userId };
    if (status === 'Published') update.publishedDate = new Date();

    const updated = await footerPageRepository.update(id, update);
    cache.invalidate();
    return updated;
  }

  /**
   * Toggle showInFooter visibility.
   */
  async toggleFooterVisibility(id, showInFooter, userId = null) {
    const page = await footerPageRepository.findById(id);
    if (!page) throw new Error('Footer page not found');
    const updated = await footerPageRepository.toggleFooterVisibility(id, showInFooter, userId);
    cache.invalidate();
    return updated;
  }

  /**
   * Reorder pages via drag-and-drop.
   * @param {Array<{id: string, displayOrder: number}>} orderedItems
   */
  async reorderPages(orderedItems) {
    await footerPageRepository.reorder(orderedItems);
    cache.invalidate();
  }

  /**
   * Duplicate a page with modified title and new slug.
   */
  async duplicatePage(id, userId = null) {
    const source = await footerPageRepository.findById(id);
    if (!source) throw new Error('Footer page not found');

    const newSlug = await this._uniqueSlug(`${source.slug}-copy`);
    const maxOrder = await footerPageRepository.getMaxDisplayOrder();

    const payload = {
      title: `${source.title} (Copy)`,
      slug: newSlug,
      shortDescription: source.shortDescription,
      content: source.content,
      featuredImage: { url: source.featuredImage?.url || '', publicId: '', alt: source.featuredImage?.alt || '' },
      bannerImage: { url: source.bannerImage?.url || '', publicId: '', alt: source.bannerImage?.alt || '' },
      seoTitle: source.seoTitle,
      seoDescription: source.seoDescription,
      seoKeywords: source.seoKeywords,
      status: 'Draft',
      showInFooter: false,
      displayOrder: maxOrder + 1,
      publishedDate: null,
      isDeleted: false,
      createdBy: userId,
      updatedBy: userId,
    };

    const duplicated = await footerPageRepository.create(payload);
    cache.invalidate();
    return duplicated;
  }

  /**
   * Soft delete a page.
   */
  async softDelete(id, userId = null) {
    const page = await footerPageRepository.findById(id);
    if (!page) throw new Error('Footer page not found');
    const deleted = await footerPageRepository.softDelete(id, userId);
    cache.invalidate();
    return deleted;
  }

  /**
   * Restore a soft-deleted page.
   */
  async restore(id, userId = null) {
    const updated = await footerPageRepository.restore(id, userId);
    cache.invalidate();
    return updated;
  }

  /**
   * Hard delete a page and clean up its images.
   */
  async hardDelete(id) {
    const page = await footerPageRepository.findById(id);
    if (!page) throw new Error('Footer page not found');

    // Clean up Cloudinary images
    if (page.featuredImage?.publicId) {
      await uploadService.deleteImage(page.featuredImage.publicId).catch(() => {});
    }
    if (page.bannerImage?.publicId) {
      await uploadService.deleteImage(page.bannerImage.publicId).catch(() => {});
    }

    await footerPageRepository.hardDelete(id);
    cache.invalidate();
  }

  /**
   * Bulk actions: delete, publish, unpublish.
   */
  async bulkAction(action, ids, userId = null) {
    if (!ids || !ids.length) throw new Error('No pages selected');

    switch (action) {
      case 'delete':
        await footerPageRepository.bulkSoftDelete(ids, userId);
        break;
      case 'publish':
        await footerPageRepository.bulkUpdateStatus(ids, 'Published', userId);
        break;
      case 'unpublish':
        await footerPageRepository.bulkUpdateStatus(ids, 'Draft', userId);
        break;
      default:
        throw new Error(`Unknown bulk action: ${action}`);
    }

    cache.invalidate();
  }

  /* ── Private helpers ─────────────────────────────────────────── */

  /**
   * Upload a new image or fall back to existing/empty.
   */
  async _handleImageUpload(file, existingUrl, folder, currentData = null) {
    if (file) {
      const result = await uploadService.uploadFile(file, folder);
      // Delete old image if it was Cloudinary-hosted
      if (currentData?.publicId && !currentData.publicId.startsWith('local/')) {
        await uploadService.deleteImage(currentData.publicId).catch(() => {});
      }
      return { url: result.secure_url, publicId: result.public_id };
    }

    // Admin explicitly cleared the image
    if (existingUrl === '') {
      if (currentData?.publicId) {
        await uploadService.deleteImage(currentData.publicId).catch(() => {});
      }
      return { url: '', publicId: '' };
    }

    // Keep existing
    return {
      url: currentData?.url || existingUrl || '',
      publicId: currentData?.publicId || '',
    };
  }

  /**
   * Parse SEO keywords — accepts comma-string or array.
   */
  _parseKeywords(input) {
    if (!input) return [];
    if (Array.isArray(input)) return input.map((k) => k.trim()).filter(Boolean);
    if (typeof input === 'string') {
      return input
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);
    }
    return [];
  }

  /**
   * Ensure a slug is unique by appending a counter if necessary.
   */
  async _uniqueSlug(base) {
    let candidate = generateSlug(base);
    let counter = 1;
    while (await footerPageRepository.slugExists(candidate)) {
      candidate = `${generateSlug(base)}-${counter++}`;
    }
    return candidate;
  }
}

module.exports = new FooterPageService();
