const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const Blog = require('../models/Blog');

const SITE_URL = process.env.FRONTEND_URL || 'https://fabish-black.vercel.app';

/**
 * GET /api/sitemap.xml
 * Dynamically generated XML sitemap for SEO crawlers.
 * Includes: static pages + products + categories + blogs
 */
router.get('/', async (req, res) => {
  try {
    const now = new Date().toISOString().split('T')[0];

    // Static pages
    const staticUrls = [
      { loc: `${SITE_URL}/`, changefreq: 'daily', priority: '1.0', lastmod: now },
      { loc: `${SITE_URL}/collections/all`, changefreq: 'weekly', priority: '0.8', lastmod: now },
      { loc: `${SITE_URL}/blogs/news`, changefreq: 'weekly', priority: '0.7', lastmod: now },
      { loc: `${SITE_URL}/pages/about-us`, changefreq: 'monthly', priority: '0.5', lastmod: now },
      { loc: `${SITE_URL}/pages/contact`, changefreq: 'monthly', priority: '0.5', lastmod: now },
      { loc: `${SITE_URL}/pages/faq`, changefreq: 'monthly', priority: '0.3', lastmod: now },
    ];

    // Fetch published products
    const products = await Product.find(
      { status: 'Published', isDeleted: { $ne: true } },
      { slug: 1, updatedAt: 1 }
    ).lean();

    // Fetch published categories
    const categories = await Category.find(
      { status: 'Published', isDeleted: { $ne: true } },
      { slug: 1, updatedAt: 1 }
    ).lean();

    // Fetch all blogs
    const blogs = await Blog.find({}, { slug: 1, updatedAt: 1 }).lean();

    // Build XML entries
    const toEntry = (url) => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`;

    const productEntries = products.map((p) =>
      toEntry({
        loc: `${SITE_URL}/products/${p.slug}`,
        lastmod: (p.updatedAt || new Date()).toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '0.9',
      })
    );

    const categoryEntries = categories.map((c) =>
      toEntry({
        loc: `${SITE_URL}/collections/${c.slug}`,
        lastmod: (c.updatedAt || new Date()).toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '0.8',
      })
    );

    const blogEntries = blogs.map((b) =>
      toEntry({
        loc: `${SITE_URL}/blogs/${b.slug}`,
        lastmod: (b.updatedAt || new Date()).toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: '0.6',
      })
    );

    const staticEntries = staticUrls.map(toEntry);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries.join('')}
${categoryEntries.join('')}
${productEntries.join('')}
${blogEntries.join('')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(xml);
  } catch (err) {
    console.error('[SITEMAP] Error generating sitemap:', err.message);
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><error>Sitemap generation failed</error>');
  }
});

module.exports = router;
