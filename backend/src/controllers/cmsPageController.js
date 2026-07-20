const CMSPage = require('../models/CMSPage');

// Default page contents to seed on first request if not present in DB
const DEFAULT_PAGES = {
  'shipping-returns': {
    title: 'Shipping & Returns Policy',
    metaTitle: 'Shipping & Returns Policy — Fabish',
    metaDescription: 'Learn about Fabish shipping timelines, charges, and our returns & refund policy.',
    content: `<h2>Shipping Policy</h2>
<p>Welcome to FABISH! We are committed to delivering your premium organic skincare products in perfect condition and as quickly as possible.</p>
<h3>Delivery Timelines</h3>
<ul>
  <li><strong>Metro Cities:</strong> 2 - 4 business days.</li>
  <li><strong>Other Cities &amp; Towns:</strong> 3 - 6 business days.</li>
  <li><strong>Remote Locations:</strong> 5 - 8 business days.</li>
</ul>
<h3>Shipping Charges</h3>
<p>We offer <strong>FREE standard shipping</strong> on all orders above ₹1,000. For orders below ₹1,000, a flat shipping fee of ₹100 applies.</p>
<hr />
<h2>Returns &amp; Refunds Policy</h2>
<p>Due to the personal and organic nature of our products, we accept returns under specific conditions to maintain hygiene standards.</p>
<h3>Conditions for Returns</h3>
<ul>
  <li>Product must be unused, unopened, and in its original retail packaging.</li>
  <li>Return requests must be initiated within <strong>7 days</strong> of delivery.</li>
  <li>Damaged/defective shipments or incorrect items delivered are eligible for free replacement or full refund. Please share unboxing images/videos with support.</li>
</ul>
<h3>How to Initiate a Return</h3>
<p>Please contact our support team at <strong>support@fabish.in</strong> with your Order ID and reason for return. Once approved, we will arrange a reverse pickup from your address.</p>`,
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    metaTitle: 'Privacy Policy — Fabish',
    metaDescription: 'Understand how Fabish collects, uses, and protects your personal data.',
    content: `<h2>Privacy Policy</h2>
<p>At FABISH, we value your trust and are committed to protecting your personal information. This Privacy Policy describes how we collect, use, and share your personal data when you visit or shop on our website.</p>
<h3>Information We Collect</h3>
<p>When you purchase products or register an account, we collect the personal information you give us, such as your name, billing address, shipping address, email address, and phone number.</p>
<h3>How We Use Your Information</h3>
<ul>
  <li>To process payments and fulfill your orders (including shipping arrangements and order confirmations).</li>
  <li>To communicate with you regarding your orders or queries.</li>
  <li>To send you promotional offers and newsletters (only if you opt-in).</li>
  <li>To protect against fraudulent transactions and ensure site security.</li>
</ul>
<h3>Data Security</h3>
<p>We implement industry-standard security measures, including Secure Sockets Layer (SSL) encryption, to protect your personal data. We do not store your credit card or payment credentials on our servers; payments are processed securely via our authorized payment gateway partners (Razorpay).</p>
<h3>Contact Us</h3>
<p>If you have any questions about our privacy practices, please contact us at <strong>privacy@fabish.in</strong>.</p>`,
  },
  'terms-conditions': {
    title: 'Terms & Conditions',
    metaTitle: 'Terms & Conditions — Fabish',
    metaDescription: 'Read the terms and conditions governing your use of Fabish products and services.',
    content: `<h2>Terms &amp; Conditions</h2>
<p>Welcome to Fabish. By accessing or using our website and purchasing our products, you agree to be bound by these Terms &amp; Conditions. Please read them carefully.</p>
<h3>1. Acceptance of Terms</h3>
<p>By using this website, you confirm that you are at least 18 years of age and agree to comply with these terms. If you do not agree to these terms, please discontinue use of our website.</p>
<h3>2. Products and Pricing</h3>
<p>All prices displayed on our website are in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. We reserve the right to change product prices at any time without prior notice.</p>
<h3>3. Orders and Payments</h3>
<p>Orders are subject to product availability. We reserve the right to cancel any order if the product is out of stock or if the order information is incorrect. Payment must be made in full at the time of placing the order.</p>
<h3>4. Intellectual Property</h3>
<p>All content on this website, including but not limited to text, images, logos, and design, is the exclusive property of Fabish and is protected by applicable intellectual property laws.</p>
<h3>5. Limitation of Liability</h3>
<p>Fabish shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website. Our liability is limited to the purchase price of the relevant product.</p>
<h3>6. Governing Law</h3>
<p>These Terms &amp; Conditions shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Chennai, Tamil Nadu.</p>
<h3>7. Contact</h3>
<p>For any questions regarding these terms, please contact us at <strong>legal@fabish.in</strong>.</p>`,
  },
};

const cmsPageController = {
  /**
   * Get a CMS page by slug.
   * If page does not exist in DB, it auto-seeds from DEFAULT_PAGES.
   */
  getPageBySlug: async (req, res, next) => {
    try {
      const { slug } = req.params;
      let page = await CMSPage.findOne({ slug });

      if (!page) {
        const defaultPage = DEFAULT_PAGES[slug];
        if (!defaultPage) {
          return res.status(404).json({
            success: false,
            message: `Page not found: ${slug}`,
          });
        }

        // Auto-create page in DB using default values for future edits
        page = await CMSPage.create({
          slug,
          title: defaultPage.title,
          content: defaultPage.content,
          metaTitle: defaultPage.metaTitle || '',
          metaDescription: defaultPage.metaDescription || '',
          currentVersion: 1,
        });
      }

      res.status(200).json({
        success: true,
        data: page,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update or create a CMS page by slug.
   * Saves version history before overwriting. Admin only.
   */
  updatePage: async (req, res, next) => {
    try {
      const { slug } = req.params;
      const { title, content, metaTitle, metaDescription } = req.body;

      let page = await CMSPage.findOne({ slug });

      if (page) {
        // Save current state to history before overwriting
        const historyEntry = {
          title: page.title,
          content: page.content,
          updatedBy: 'Admin',
          updatedAt: page.updatedAt,
          version: page.currentVersion || 1,
        };

        page = await CMSPage.findOneAndUpdate(
          { slug },
          {
            ...(title !== undefined && { title }),
            ...(content !== undefined && { content }),
            ...(metaTitle !== undefined && { metaTitle }),
            ...(metaDescription !== undefined && { metaDescription }),
            $push: { versionHistory: historyEntry },
            $inc: { currentVersion: 1 },
          },
          { new: true, runValidators: true }
        );
      } else {
        page = await CMSPage.create({
          slug,
          title: title || slug,
          content: content || '',
          metaTitle: metaTitle || '',
          metaDescription: metaDescription || '',
          currentVersion: 1,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Page updated successfully',
        data: page,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get version history for a CMS page. Admin only.
   */
  getVersionHistory: async (req, res, next) => {
    try {
      const { slug } = req.params;
      const page = await CMSPage.findOne(
        { slug },
        { versionHistory: 1, slug: 1, title: 1, currentVersion: 1 }
      );

      if (!page) {
        return res.status(404).json({ success: false, message: 'Page not found' });
      }

      res.status(200).json({
        success: true,
        data: {
          slug: page.slug,
          title: page.title,
          currentVersion: page.currentVersion,
          history: (page.versionHistory || []).slice().reverse(), // most recent first
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = cmsPageController;
