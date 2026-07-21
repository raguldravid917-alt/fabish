/**
 * seedFooterPages.js
 * Run: node backend/utils/seedFooterPages.js
 *
 * Seeds the initial 5 footer pages into MongoDB so the storefront footer
 * is immediately populated with content that admins can later edit.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const DB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!DB_URI) {
  console.error('❌ MONGO_URI not found in .env');
  process.exit(1);
}

const footerPageSchema = new mongoose.Schema(
  {
    title: String,
    slug: { type: String, unique: true, index: true },
    shortDescription: String,
    content: String,
    featuredImage: { url: String, publicId: String, alt: String },
    bannerImage: { url: String, publicId: String, alt: String },
    seoTitle: String,
    seoDescription: String,
    seoKeywords: [String],
    status: { type: String, default: 'Published' },
    showInFooter: { type: Boolean, default: true },
    displayOrder: Number,
    publishedDate: Date,
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
    createdBy: mongoose.Schema.Types.ObjectId,
    updatedBy: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true }
);

const FooterPage = mongoose.models.FooterPage || mongoose.model('FooterPage', footerPageSchema);

const SEED_PAGES = [
  {
    title: 'Shipping & Return',
    slug: 'shipping-returns',
    shortDescription: 'Understand our delivery timelines, shipping charges, and returns policy.',
    content: `<h2>Shipping Policy</h2>
<p>We are committed to delivering your premium organic skincare products in perfect condition and as quickly as possible.</p>
<h3>Delivery Timelines</h3>
<ul>
  <li><strong>Metro Cities:</strong> 2 - 4 business days.</li>
  <li><strong>Other Cities &amp; Towns:</strong> 3 - 6 business days.</li>
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
</ul>`,
    seoTitle: 'Shipping & Returns Policy — Fabish',
    seoDescription: 'Learn about Fabish shipping timelines, charges, and our returns & refund policy.',
    seoKeywords: ['shipping', 'delivery', 'returns', 'refunds'],
    displayOrder: 6,
  },
  {
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    shortDescription: 'Learn how Fabish handles, stores, and protects your account details and payment data.',
    content: `<h2>Privacy Policy</h2>
<p>At FABISH, we value your trust and are committed to protecting your personal information. This Privacy Policy describes how we collect, use, and share your personal data when you visit or shop on our website.</p>
<h3>Information We Collect</h3>
<p>When you purchase products or register an account, we collect the personal information you give us, such as your name, billing address, shipping address, email address, and phone number.</p>
<h3>Data Security</h3>
<p>We implement industry-standard security measures, including Secure Sockets Layer (SSL) encryption, to protect your personal data.</p>`,
    seoTitle: 'Privacy Policy — Fabish',
    seoDescription: 'Understand how Fabish collects, uses, and protects your personal data.',
    seoKeywords: ['privacy', 'data protection', 'legal'],
    displayOrder: 7,
  },
  {
    title: 'Promotions & Offers',
    slug: 'promotions',
    shortDescription: 'Check out our latest sales campaigns, active coupon codes, and special seasonal discounts.',
    content: `<h2>Active Brand Offers</h2>
<p>Here you will find our latest seasonal offers and special shopping discounts. Use them during checkout to enjoy savings on our premium organic skincare lines!</p>`,
    seoTitle: 'Offers & Promotions — Fabish',
    seoDescription: 'Find the latest coupon codes, active discounts, and promotional campaigns at Fabish.',
    seoKeywords: ['offers', 'coupons', 'discounts', 'promotions'],
    displayOrder: 8,
  },
  {
    title: 'Support Request',
    slug: 'support-request',
    shortDescription: 'Get in touch with our support team for any queries, complaints, or assistance with your orders.',
    content: `<h2>How Can We Help You?</h2>
<p>At Fabish, your satisfaction is our top priority. Whether you have a question about an order, a product, or our services, our support team is here to help.</p>
<h3>Contact Methods</h3>
<ul>
  <li><strong>Email:</strong> support@fabish.in — We respond within 24 hours.</li>
  <li><strong>Phone:</strong> +91 98765 43210 — Mon–Sat, 10AM–6PM IST.</li>
  <li><strong>Live Chat:</strong> Available on the website during business hours.</li>
</ul>
<h3>Common Topics</h3>
<ul>
  <li>Order status and tracking</li>
  <li>Return and refund requests</li>
  <li>Product information and ingredients</li>
  <li>Payment and billing queries</li>
  <li>Account and login issues</li>
</ul>
<p>For fastest resolution, please have your <strong>Order ID</strong> ready when contacting us.</p>`,
    seoTitle: 'Support Request — Fabish',
    seoDescription: 'Contact Fabish support for help with orders, returns, payments, and product queries.',
    seoKeywords: ['support', 'help', 'contact', 'fabish support'],
    displayOrder: 1,
  },
  {
    title: 'Our Team',
    slug: 'our-team',
    shortDescription: 'Meet the passionate people behind Fabish who are dedicated to bringing you the finest organic skincare.',
    content: `<h2>The People Behind Fabish</h2>
<p>Fabish was born from a shared passion for clean, effective, and sustainably sourced skincare. Our team of skincare experts, chemists, and customer experience specialists work tirelessly to bring you products that are as good for your skin as they are for the planet.</p>
<h3>Our Values</h3>
<ul>
  <li><strong>Transparency:</strong> We believe in full ingredient disclosure and honest marketing.</li>
  <li><strong>Sustainability:</strong> From sourcing to packaging, we minimize our environmental footprint.</li>
  <li><strong>Efficacy:</strong> Every formula is rigorously tested to deliver real, visible results.</li>
</ul>
<p>Visit our <a href="/pages/about-us">About Us</a> page to learn more about the Fabish story.</p>`,
    seoTitle: 'Our Team — Fabish',
    seoDescription: 'Meet the Fabish team — skincare experts, scientists, and customer experience specialists passionate about organic beauty.',
    seoKeywords: ['fabish team', 'about fabish', 'skincare experts'],
    displayOrder: 2,
  },
  {
    title: 'Partnership',
    slug: 'partnership',
    shortDescription: 'Explore business partnership opportunities with Fabish — from retail distribution to co-branding.',
    content: `<h2>Partner With Fabish</h2>
<p>We are always looking for like-minded businesses and individuals who share our commitment to clean beauty and sustainable practices. Whether you are a retailer, influencer, or brand, we would love to explore how we can grow together.</p>
<h3>Partnership Types</h3>
<ul>
  <li><strong>Retail Distribution:</strong> Stock Fabish products in your store or salon.</li>
  <li><strong>Affiliate Program:</strong> Earn commission by promoting Fabish through your platform.</li>
  <li><strong>Co-Branding:</strong> Create exclusive product collections under your brand.</li>
  <li><strong>Corporate Gifting:</strong> Bulk orders with custom packaging for employee or client gifting.</li>
</ul>
<h3>How to Apply</h3>
<p>Fill out our <a href="/pages/contact">partnership inquiry form</a> or email us at <strong>partnerships@fabish.in</strong> with your proposal. Our team will respond within 3–5 business days.</p>`,
    seoTitle: 'Partnership Opportunities — Fabish',
    seoDescription: 'Join the Fabish partner network. Explore retail, affiliate, co-branding, and corporate gifting opportunities.',
    seoKeywords: ['fabish partnership', 'affiliate', 'retailer', 'business opportunity'],
    displayOrder: 3,
  },
  {
    title: 'Terms & Conditions',
    slug: 'terms-and-conditions',
    shortDescription: 'Read the terms and conditions governing your use of Fabish products and services.',
    content: `<h2>Terms &amp; Conditions</h2>
<p>Welcome to Fabish. By accessing or using our website and purchasing our products, you agree to be bound by these Terms &amp; Conditions. Please read them carefully.</p>
<h3>1. Acceptance of Terms</h3>
<p>By using this website, you confirm that you are at least 18 years of age and agree to comply with these terms. If you do not agree, please discontinue use of our website.</p>
<h3>2. Products and Pricing</h3>
<p>All prices are in Indian Rupees (INR) and inclusive of applicable taxes unless stated otherwise. We reserve the right to change prices at any time without prior notice.</p>
<h3>3. Orders and Payments</h3>
<p>Orders are subject to product availability. We reserve the right to cancel any order if the product is out of stock or if order information is incorrect. Payment must be made in full at the time of placing the order.</p>
<h3>4. Intellectual Property</h3>
<p>All content on this website, including text, images, logos, and design, is the exclusive property of Fabish and is protected by applicable intellectual property laws.</p>
<h3>5. Limitation of Liability</h3>
<p>Fabish shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website.</p>
<h3>6. Governing Law</h3>
<p>These Terms &amp; Conditions shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Chennai, Tamil Nadu.</p>
<h3>7. Contact</h3>
<p>For any questions regarding these terms, contact us at <strong>legal@fabish.in</strong>.</p>`,
    seoTitle: 'Terms & Conditions — Fabish',
    seoDescription: 'Read the terms and conditions governing your use of Fabish products, website, and services.',
    seoKeywords: ['terms and conditions', 'fabish terms', 'legal', 'policy'],
    displayOrder: 4,
  },
  {
    title: 'Latest News',
    slug: 'latest-news',
    shortDescription: 'Stay up to date with the latest news, product launches, and announcements from Fabish.',
    content: `<h2>Fabish in the News</h2>
<p>Stay connected with everything happening at Fabish — from exciting product launches to behind-the-scenes stories and industry news.</p>
<h3>Recent Highlights</h3>
<ul>
  <li><strong>New Launch:</strong> Introducing our revolutionary Vitamin C Brightening Serum — now available online.</li>
  <li><strong>Award:</strong> Fabish wins "Best Organic Skincare Brand 2024" at the Indian Beauty Awards.</li>
  <li><strong>Community:</strong> Join our growing community of 50,000+ skincare enthusiasts on Instagram.</li>
</ul>
<p>For in-depth articles, tips, and industry insights, visit our <a href="/blogs/news">Blog</a>.</p>`,
    seoTitle: 'Latest News — Fabish',
    seoDescription: 'Catch up on the latest Fabish news, product launches, awards, and brand stories.',
    seoKeywords: ['fabish news', 'latest updates', 'product launch', 'skincare news'],
    displayOrder: 5,
  },
  {
    title: 'Press Release',
    slug: 'press-release',
    shortDescription: 'Stay updated with the latest brand announcements, product launches, and company news from Fabish.',
    content: `<h2>Fabish Brand Announcements</h2>
<p>Welcome to the official Fabish press room. Here you will find our latest press releases, corporate announcements, and product launch news. For media inquiries, please reach out to press@fabish.com.</p>`,
    seoTitle: 'Press Releases — Fabish Cosmetics',
    seoDescription: 'Read official corporate announcements and media updates from Fabish.',
    seoKeywords: ['press release', 'news', 'media kit', 'announcements'],
    displayOrder: 9,
    showInFooter: false,
  },
];

async function seed() {
  try {
    await mongoose.connect(DB_URI);
    console.log('✅ Connected to MongoDB');

    let created = 0;
    let skipped = 0;

    for (const page of SEED_PAGES) {
      const exists = await FooterPage.findOne({ slug: page.slug });
      if (exists) {
        console.log(`⏭  Skipped (already exists): ${page.slug}`);
        skipped++;
        continue;
      }

      await FooterPage.create({
        ...page,
        status: 'Published',
        featuredImage: { url: '', publicId: '', alt: '' },
        bannerImage: { url: '', publicId: '', alt: '' },
        publishedDate: new Date(),
        isDeleted: false,
      });
      console.log(`✅ Created: ${page.title} (/${page.slug})`);
      created++;
    }

    console.log(`\n🎉 Seeding complete: ${created} created, ${skipped} skipped.`);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
