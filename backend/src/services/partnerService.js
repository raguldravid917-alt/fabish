const partnerRepository = require('../repositories/partnerRepository');
const emailService = require('./emailService');

/**
 * Partnership type definitions with dynamic form fields.
 * Each type has a label, description, icon key, and form fields.
 */
const PARTNERSHIP_TYPES = [
  {
    type: 'Distributor',
    label: 'Distributor',
    description: 'Distribute Fabish products across regions or retail networks.',
    icon: 'truck',
    fields: [
      { key: 'region', label: 'Region / Territory', type: 'text', required: true, placeholder: 'e.g., Tamil Nadu, Karnataka' },
      { key: 'experience', label: 'Years of Distribution Experience', type: 'number', required: true },
      { key: 'currentBrands', label: 'Current Brands You Distribute', type: 'text', required: false, placeholder: 'e.g., Brand A, Brand B' },
      { key: 'warehouseCapacity', label: 'Warehouse Capacity (sq. ft.)', type: 'text', required: false },
    ],
  },
  {
    type: 'Wholesale',
    label: 'Wholesale',
    description: 'Purchase Fabish products in bulk at wholesale pricing for retail.',
    icon: 'package',
    fields: [
      { key: 'storeType', label: 'Store Type', type: 'select', required: true, options: ['Online Store', 'Physical Store', 'Both'], placeholder: '' },
      { key: 'monthlyVolume', label: 'Expected Monthly Order Volume (units)', type: 'number', required: true },
      { key: 'gstNumber', label: 'GST Registration Number', type: 'text', required: false },
    ],
  },
  {
    type: 'Influencer',
    label: 'Influencer',
    description: 'Collaborate with Fabish as a brand ambassador or content creator.',
    icon: 'star',
    fields: [
      { key: 'platform', label: 'Primary Platform', type: 'select', required: true, options: ['Instagram', 'YouTube', 'TikTok', 'Facebook', 'Twitter', 'Other'] },
      { key: 'handle', label: 'Social Media Handle / URL', type: 'text', required: true, placeholder: '@yourhandle' },
      { key: 'followers', label: 'Follower Count', type: 'number', required: true },
      { key: 'niche', label: 'Content Niche', type: 'text', required: true, placeholder: 'e.g., Beauty, Lifestyle, Fashion' },
      { key: 'avgEngagement', label: 'Average Engagement Rate (%)', type: 'text', required: false },
    ],
  },
  {
    type: 'Affiliate',
    label: 'Affiliate',
    description: 'Earn commissions by promoting Fabish products through your channels.',
    icon: 'link',
    fields: [
      { key: 'promotionChannel', label: 'Primary Promotion Channel', type: 'text', required: true, placeholder: 'e.g., Blog, Website, Email list' },
      { key: 'audienceSize', label: 'Monthly Audience Size', type: 'number', required: false },
      { key: 'existingPrograms', label: 'Other Affiliate Programs You Are Part Of', type: 'text', required: false },
    ],
  },
  {
    type: 'Vendor',
    label: 'Vendor Onboarding',
    description: 'Supply raw materials, packaging, or manufacturing services to Fabish.',
    icon: 'building',
    fields: [
      { key: 'supplyCategory', label: 'What do you supply?', type: 'text', required: true, placeholder: 'e.g., Raw materials, Packaging, Printing' },
      { key: 'certifications', label: 'Quality Certifications', type: 'text', required: false, placeholder: 'e.g., ISO 9001, GMP' },
      { key: 'minOrderQty', label: 'Minimum Order Quantity', type: 'text', required: false },
      { key: 'leadTime', label: 'Lead Time (days)', type: 'number', required: false },
    ],
  },
];

class PartnerService {
  /**
   * Get all partnership types with their form schemas (public).
   */
  getPartnershipTypes() {
    return PARTNERSHIP_TYPES;
  }

  /**
   * Submit a partnership application (public).
   */
  async submitApplication(data) {
    const { type, businessName, contactName, email, phone, website, message, dynamicFields } = data;

    // Validate partnership type
    const validType = PARTNERSHIP_TYPES.find((t) => t.type === type);
    if (!validType) throw new Error('Invalid partnership type');

    const payload = {
      type,
      businessName: businessName?.trim(),
      contactName: contactName?.trim(),
      email: email?.trim().toLowerCase(),
      phone: phone?.trim() || '',
      website: website?.trim() || '',
      message: message?.trim() || '',
      dynamicFields: Array.isArray(dynamicFields) ? dynamicFields : [],
    };

    const application = await partnerRepository.create(payload);

    // Send confirmation email (non-blocking)
    emailService
      .sendPartnershipConfirmationEmail({
        to: application.email,
        contactName: application.contactName,
        businessName: application.businessName,
        type: application.type,
      })
      .catch(() => {});

    return application;
  }

  /**
   * Get all applications (admin).
   */
  async getAllApplications(filters = {}) {
    return await partnerRepository.findAll(filters);
  }

  /**
   * Get single application by ID (admin).
   */
  async getApplicationById(id) {
    const app = await partnerRepository.findById(id);
    if (!app) throw new Error('Application not found');
    return app;
  }

  /**
   * Update application status + notes (admin).
   */
  async updateApplicationStatus(id, { status, adminNotes, reviewedBy }) {
    const app = await partnerRepository.findById(id);
    if (!app) throw new Error('Application not found');

    const update = {
      ...(status && { status }),
      ...(adminNotes !== undefined && { adminNotes }),
      ...(reviewedBy && { reviewedBy }),
      reviewedAt: new Date(),
    };

    return await partnerRepository.update(id, update);
  }

  /**
   * Delete an application (admin).
   */
  async deleteApplication(id) {
    const app = await partnerRepository.findById(id);
    if (!app) throw new Error('Application not found');
    return await partnerRepository.delete(id);
  }
}

module.exports = new PartnerService();
