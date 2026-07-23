const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Category = require('../src/models/Category');
const Blog = require('../src/models/Blog');
const Order = require('../src/models/Order');
const Review = require('../src/models/Review');
const Contact = require('../src/models/Contact');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fabish');
    console.log('MongoDB Connected for Seeding...');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const users = [
  {
    name: 'Admin User',
    email: 'admin@fabish.com',
    password: 'admin123',
    isAdmin: true,
    role: 'Admin',
  },
  {
    name: 'John Doe',
    email: 'john@gmail.com',
    password: 'password123',
    isAdmin: false,
    role: 'Customer',
  },
  {
    name: 'Jane Smith',
    email: 'jane@gmail.com',
    password: 'password123',
    isAdmin: false,
    role: 'Customer',
  }
];

// Exact 27 Categories
const categoriesToSeed = [
  { name: 'Cleansers', slug: 'cleansers', image: '/assets/homepage/9.jpg', description: 'Bio-active gentle cleansers engineered to dissolve makeup and impurities without stripping barrier moisture.', seoTitle: 'Fabish Cleansers — Bio-Active Gentle Facial Cleansers', seoDescription: 'Shop Fabish organic face cleansers formulated with green tea, cica, and cold-pressed botanical oils.' },
  { name: 'Face Wash', slug: 'face-wash', image: '/assets/homepage/6.jpg', description: 'Deep cleansing foaming and gel face washes for daily morning and evening skin renewal.', seoTitle: 'Fabish Face Wash — Organic Rice Water & Tea Tree Wash', seoDescription: 'Explore Fabish foaming and gel face washes enriched with bio-fermented botanicals.' },
  { name: 'Serums', slug: 'serums', image: '/assets/homepage/P12.jpg', description: 'Clinical strength active serums targeting hyperpigmentation, fine lines, and hydration.', seoTitle: 'Fabish Serums — Vitamin C, Niacinamide & Retinol Actives', seoDescription: 'High-potency botanical serums featuring 15% Vitamin C, 10% Niacinamide, and Encapsulated Retinol.' },
  { name: 'Moisturizers', slug: 'moisturizers', image: '/assets/homepage/P1.jpg', description: 'Hydrating gels and ceramide creams that lock in 24-hour moisture and restore barrier integrity.', seoTitle: 'Fabish Moisturizers — Ceramide Barrier & Moisture Creams', seoDescription: 'Nourish skin with Fabish hyaluronic moisture gels and rich ceramide barrier repair creams.' },
  { name: 'Sunscreen SPF', slug: 'sunscreen-spf', image: '/assets/homepage/16.jpg', description: 'Non-nano broad spectrum mineral sunscreens with SPF50+ PA++++ broad protection.', seoTitle: 'Fabish Sunscreen SPF — Mineral Broad Spectrum Defense', seoDescription: 'Shield skin against UVA/UVB rays and blue light with lightweight Fabish mineral sunscreens.' },
  { name: 'Toners', slug: 'toners', image: '/assets/homepage/3.jpg', description: 'pH balancing botanical essences and AHA/BHA exfoliating clarifying toners.', seoTitle: 'Fabish Toners — Balancing Floral Essences & AHA/BHA', seoDescription: 'Restore skin equilibrium and refine pore appearance with Fabish botanical toners.' },
  { name: 'Face Masks', slug: 'face-masks', image: '/assets/homepage/23.jpg', description: 'Overnight repair masks, kaolin clay detox masks, and bio-cellulose sheet treatments.', seoTitle: 'Fabish Face Masks — Clay, Overnight & Bio-Cellulose Sheet Masks', seoDescription: 'Revitalize dull skin with Fabish deep cleansing clay and overnight repair face masks.' },
  { name: 'Eye Care', slug: 'eye-care', image: '/assets/homepage/P11.jpg', description: 'Concentrated caffeine and peptide eye creams that diminish dark circles and puffiness.', seoTitle: 'Fabish Eye Care — Peptide & Caffeine Dark Circle Creams', seoDescription: 'Smooth crow’s feet and brighten tired eyes with Fabish clinical peptide eye gels.' },
  { name: 'Lip Care', slug: 'lip-care', image: '/assets/homepage/20.jpg', description: 'Nourishing butter balms and overnight berry lip masks for soft, supple lips.', seoTitle: 'Fabish Lip Care — Shea Butter Balms & Berry Lip Masks', seoDescription: 'Repair chapped lips with Fabish organic jojoba and cold-pressed shea butter balms.' },
  { name: 'Acne Care', slug: 'acne-care', image: '/assets/homepage/14.jpg', description: 'Targeted 2% BHA Salicylic Acid serums and tea tree spot gels for acne clarification.', seoTitle: 'Fabish Acne Care — Salicylic Acid 2% BHA Spot Treatments', seoDescription: 'Clear blemishes and unclog pores with Fabish targeted acne care solutions.' },
  { name: 'Brightening', slug: 'brightening', image: '/assets/homepage/P10.jpg', description: 'Luminous brightening complexes featuring Alpha Arbutin, Kojic Acid, and Vitamin C.', seoTitle: 'Fabish Brightening — Luminous Tone Correcting Skincare', seoDescription: 'Fade dark spots and even skin tone with Fabish bio-active brightening formulations.' },
  { name: 'Anti Aging', slug: 'anti-aging', image: '/assets/homepage/1.jpg', description: 'Encapsulated retinol, copper peptides, and phyto-collagen age-defense treatments.', seoTitle: 'Fabish Anti Aging — Encapsulated Retinol & Copper Peptides', seoDescription: 'Firm sagging skin and reduce wrinkle depth with Fabish luxury anti-aging treatments.' },
  { name: 'Sensitive Skin', slug: 'sensitive-skin', image: '/assets/homepage/2.jpg', description: 'Ultra-gentle Cica, Centella Asiatica, and colloidal oat calming formulas for reactive skin.', seoTitle: 'Fabish Sensitive Skin — Soothing Cica & Oat Barrier Care', seoDescription: 'Calm redness and repair delicate skin barriers with Fabish dermatologically tested care.' },
  { name: 'Body Care', slug: 'body-care', image: '/assets/homepage/14.jpg', description: 'Luxurious cold-pressed body oils, smoothing body scrubs, and soothing treatments.', seoTitle: 'Fabish Body Care — Botanical Body Oils & Exfoliating Scrubs', seoDescription: 'Transform body texture with Fabish nourishing organic oils and smoothing treatments.' },
  { name: 'Body Lotion', slug: 'body-lotion', image: '/assets/homepage/P14.jpg', description: 'Fast-absorbing 24-hour hydration body lotions enriched with cocoa butter and ceramides.', seoTitle: 'Fabish Body Lotion — 24H Hydration Cocoa & Ceramide Lotions', seoDescription: 'Deeply hydrate dry skin with Fabish non-greasy organic body lotions.' },
  { name: 'Body Wash', slug: 'body-wash', image: '/assets/homepage/9.jpg', description: 'Sulfate-free refreshing shower gels with eucalyptus, lavender, and citrus oils.', seoTitle: 'Fabish Body Wash — Sulfate-Free Botanical Shower Gels', seoDescription: 'Gently cleanse body skin with Fabish essential oil infused shower gels.' },
  { name: 'Hair Care', slug: 'hair-care', image: '/assets/homepage/P13.jpg', description: 'Scalp health treatments, cold-pressed hair oils, and strengthening botanical hair care.', seoTitle: 'Fabish Hair Care — Argan & Rosemary Scalp Treatments', seoDescription: 'Nourish hair roots and promote scalp wellness with Fabish organic hair care.' },
  { name: 'Shampoo', slug: 'shampoo', image: '/assets/homepage/P13-2.jpg', description: 'Sulfate-free biotin and argan oil shampoos for voluminous, strong hair.', seoTitle: 'Fabish Shampoo — Biotin & Moroccan Argan Sulfate-Free Wash', seoDescription: 'Strengthen weak strands and add volume with Fabish organic shampoos.' },
  { name: 'Conditioner', slug: 'conditioner', image: '/assets/homepage/P13.jpg', description: 'Silk protein and jojoba conditioners that detangle, smooth frizz, and seal moisture.', seoTitle: 'Fabish Conditioner — Silk Protein & Jojoba Smoothing Conditioner', seoDescription: 'Softened coarse hair and seal split ends with Fabish botanical conditioners.' },
  { name: 'Hair Serum', slug: 'hair-serum', image: '/assets/homepage/P12.jpg', description: 'Lightweight heat-protecting hair serums that impart high-shine gloss.', seoTitle: 'Fabish Hair Serum — Anti-Frizz Heat Shield Gloss Drops', seoDescription: 'Tame flyaways and protect hair from styling damage with Fabish hair serums.' },
  { name: 'Beard Care', slug: 'beard-care', image: '/assets/homepage/12.jpg', description: 'Cedarwood and jojoba conditioning oils for soft, manageable beard hair.', seoTitle: 'Fabish Beard Care — Cedarwood & Argan Beard Conditioning Oil', seoDescription: 'Condition facial hair and soothe underlying skin with Fabish beard oils.' },
  { name: 'Men\'s Grooming', slug: 'mens-grooming', image: '/assets/homepage/11.jpg', description: 'High-performance 3-in-1 face washes, moisturizers, and soothing aftershave balms.', seoTitle: 'Fabish Men\'s Grooming — Performance Skincare & Shave Care', seoDescription: 'Streamline men’s daily skincare routine with Fabish botanical grooming products.' },
  { name: 'Organic Essentials', slug: 'organic-essentials', image: '/assets/homepage/21.jpg', description: 'Wild-harvested, cold-pressed daily skincare staples free from 1,400+ toxins.', seoTitle: 'Fabish Organic Essentials — 100% Bio-Active Clean Beauty', seoDescription: 'Pure botanical oils and rosewater mists for uncompromised clean beauty.' },
  { name: 'Travel Minis', slug: 'travel-minis', image: '/assets/homepage/4.jpg', description: 'TSA-approved mini bottles of bestselling Fabish cleansers, serums, and creams.', seoTitle: 'Fabish Travel Minis — TSA-Approved Portable Skincare Kits', seoDescription: 'Maintain your radiant skincare routine anywhere with Fabish travel minis.' },
  { name: 'Gift Sets', slug: 'gift-sets', image: '/assets/homepage/Rectangle_338.jpg', description: 'Luxury gift boxes featuring complete skincare routines for special occasions.', seoTitle: 'Fabish Gift Sets — Luxury Botanical Skincare Gift Boxes', seoDescription: 'Surprise loved ones with Fabish curated luxury beauty boxes.' },
  { name: 'New Arrivals', slug: 'new-arrivals', image: '/assets/homepage/P14-2.jpg', description: 'Discover the latest 2026 bio-fermented skincare innovations and sunscreens.', seoTitle: 'Fabish New Arrivals — Latest 2026 Skincare Innovations', seoDescription: 'Explore newly released Fabish botanical serums, creams, and sun care.' },
  { name: 'Best Sellers', slug: 'best-sellers', image: '/assets/homepage/P1.jpg', description: 'Top-rated 5-star customer favorites and viral beauty serums.', seoTitle: 'Fabish Best Sellers — Most Loved Skincare Favorites', seoDescription: 'Shop Fabish award-winning bestsellers loved by 100,000+ customers.' }
];

// Helper to generate 120 products dynamically covering all 27 categories
const generateProducts = () => {
  const prods = [];
  const categorySlugs = categoriesToSeed.map(c => c.slug);

  const productTemplates = [
    { name: 'Rice Water Brightening Cleanser', cat: 'cleansers', sub: 'Cleansers', price: 899, compare: 1299, img: ['/assets/homepage/6.jpg', '/assets/homepage/9.jpg'] },
    { name: 'Gentle Foaming Hydrating Cleanser', cat: 'cleansers', sub: 'Cleansers', price: 799, compare: 1099, img: ['/assets/homepage/9.jpg', '/assets/homepage/6.jpg'] },
    { name: 'Centella Asiatica Soothing Cleanser', cat: 'cleansers', sub: 'Cleansers', price: 949, compare: 1299, img: ['/assets/homepage/1.jpg', '/assets/homepage/2.jpg'] },
    { name: 'Salicylic Acid 2% BHA Acne Cleanser', cat: 'face-wash', sub: 'Face Wash', price: 749, compare: 999, img: ['/assets/homepage/9.jpg', '/assets/homepage/6.jpg'] },
    { name: 'Green Tea Clarifying Face Wash', cat: 'face-wash', sub: 'Face Wash', price: 699, compare: 899, img: ['/assets/homepage/6.jpg', '/assets/homepage/14.jpg'] },
    { name: 'Vitamin C Glow Foaming Face Wash', cat: 'face-wash', sub: 'Face Wash', price: 799, compare: 1099, img: ['/assets/homepage/P10.jpg', '/assets/homepage/6.jpg'] },
    { name: 'Vitamin C 15% Brightening Serum', cat: 'serums', sub: 'Serums', price: 1299, compare: 1799, img: ['/assets/homepage/P12.jpg', '/assets/homepage/P10.jpg'], featured: true, bestSeller: true },
    { name: 'Niacinamide 10% + Zinc Oil Control Serum', cat: 'serums', sub: 'Serums', price: 999, compare: 1399, img: ['/assets/homepage/P12.jpg', '/assets/homepage/P1.jpg'], bestSeller: true },
    { name: 'Hyaluronic Acid 2% + B5 Hydration Serum', cat: 'serums', sub: 'Serums', price: 1099, compare: 1499, img: ['/assets/homepage/P12.jpg', '/assets/homepage/3.jpg'] },
    { name: 'Encapsulated Retinol 0.5% Night Renewal Serum', cat: 'serums', sub: 'Serums', price: 1499, compare: 1999, img: ['/assets/homepage/P12.jpg', '/assets/homepage/P11.jpg'] },
    { name: 'Copper Peptide 1% Collagen Rebuilding Serum', cat: 'serums', sub: 'Serums', price: 1799, compare: 2399, img: ['/assets/homepage/P12.jpg', '/assets/homepage/P14.jpg'] },
    { name: 'Ceramide Barrier Repair Cream', cat: 'moisturizers', sub: 'Moisturizers', price: 1399, compare: 1899, img: ['/assets/homepage/P1.jpg', '/assets/homepage/1.jpg'], featured: true, bestSeller: true },
    { name: 'Hyaluronic Moisture Water Gel Cream', cat: 'moisturizers', sub: 'Moisturizers', price: 1199, compare: 1599, img: ['/assets/homepage/P1.jpg', '/assets/homepage/P14.jpg'] },
    { name: 'Centella Cica Soothing Barrier Moisturizer', cat: 'moisturizers', sub: 'Moisturizers', price: 1249, compare: 1699, img: ['/assets/homepage/2.jpg', '/assets/homepage/P1.jpg'] },
    { name: 'Daily Mineral Sunscreen SPF50+ PA++++', cat: 'sunscreen-spf', sub: 'Sunscreen SPF', price: 999, compare: 1399, img: ['/assets/homepage/16.jpg', '/assets/homepage/17.jpg'], featured: true, bestSeller: true },
    { name: 'Water Resistant Hydrating Sunscreen Gel SPF50', cat: 'sunscreen-spf', sub: 'Sunscreen SPF', price: 1099, compare: 1499, img: ['/assets/homepage/17.jpg', '/assets/homepage/16.jpg'] },
    { name: 'Ultra-Light Invisible Sun Fluid SPF60', cat: 'sunscreen-spf', sub: 'Sunscreen SPF', price: 1199, compare: 1599, img: ['/assets/homepage/16.jpg', '/assets/homepage/P14.jpg'] },
    { name: 'Green Tea Balancing Facial Toner', cat: 'toners', sub: 'Toners', price: 799, compare: 1099, img: ['/assets/homepage/3.jpg', '/assets/homepage/4.jpg'] },
    { name: 'Glycolic Acid 7% Exfoliating Glow Toner', cat: 'toners', sub: 'Toners', price: 899, compare: 1199, img: ['/assets/homepage/4.jpg', '/assets/homepage/3.jpg'] },
    { name: 'Kaolin Clay Deep Detoxifying Mask', cat: 'face-masks', sub: 'Face Masks', price: 899, compare: 1299, img: ['/assets/homepage/23.jpg', '/assets/homepage/14.jpg'] },
    { name: 'Overnight Sleeping Moisture Mask', cat: 'face-masks', sub: 'Face Masks', price: 1099, compare: 1499, img: ['/assets/homepage/20.jpg', '/assets/homepage/23.jpg'] },
    { name: 'Peptide & Caffeine Dark Circle Eye Cream', cat: 'eye-care', sub: 'Eye Care', price: 1199, compare: 1599, img: ['/assets/homepage/P11.jpg', '/assets/homepage/P12.jpg'] },
    { name: 'Retinol Anti-Wrinkle Eye Contour Cream', cat: 'eye-care', sub: 'Eye Care', price: 1399, compare: 1799, img: ['/assets/homepage/P11.jpg', '/assets/homepage/P1.jpg'] },
    { name: 'Shea Butter Strawberry Lip Sleeping Mask', cat: 'lip-care', sub: 'Lip Care', price: 599, compare: 799, img: ['/assets/homepage/20.jpg', '/assets/homepage/21.jpg'] },
    { name: 'Salicylic Acid 2% BHA Spot Treatment Gel', cat: 'acne-care', sub: 'Acne Care', price: 699, compare: 899, img: ['/assets/homepage/14.jpg', '/assets/homepage/9.jpg'] },
    { name: 'Alpha Arbutin 2% Dark Spot Corrector', cat: 'brightening', sub: 'Brightening', price: 1199, compare: 1599, img: ['/assets/homepage/P10.jpg', '/assets/homepage/P12.jpg'] },
    { name: 'Encapsulated Retinol 1% Age Renewal Cream', cat: 'anti-aging', sub: 'Anti Aging', price: 1699, compare: 2299, img: ['/assets/homepage/1.jpg', '/assets/homepage/P11.jpg'] },
    { name: 'Colloidal Oat Barrier Relief Treatment', cat: 'sensitive-skin', sub: 'Sensitive Skin', price: 999, compare: 1399, img: ['/assets/homepage/2.jpg', '/assets/homepage/P1.jpg'] },
    { name: 'Cold-Pressed Botanical Body Treatment Oil', cat: 'body-care', sub: 'Body Care', price: 1299, compare: 1699, img: ['/assets/homepage/14.jpg', '/assets/homepage/12.jpg'] },
    { name: 'Cocoa Butter 24H Nourishing Body Lotion', cat: 'body-lotion', sub: 'Body Lotion', price: 699, compare: 999, img: ['/assets/homepage/P14.jpg', '/assets/homepage/P14-2.jpg'] },
    { name: 'Eucalyptus Refreshing Shower Gel', cat: 'body-wash', sub: 'Body Wash', price: 599, compare: 799, img: ['/assets/homepage/9.jpg', '/assets/homepage/14.jpg'] },
    { name: 'Moroccan Argan Repair Hair Care Oil', cat: 'hair-care', sub: 'Hair Care', price: 999, compare: 1399, img: ['/assets/homepage/P13.jpg', '/assets/homepage/12.jpg'] },
    { name: 'Biotin Volumizing Sulfate-Free Shampoo', cat: 'shampoo', sub: 'Shampoo', price: 899, compare: 1199, img: ['/assets/homepage/P13-2.jpg', '/assets/homepage/P13.jpg'] },
    { name: 'Silk Protein Smoothing Hair Conditioner', cat: 'conditioner', sub: 'Conditioner', price: 849, compare: 1149, img: ['/assets/homepage/P13.jpg', '/assets/homepage/P13-2.jpg'] },
    { name: 'Rosemary & Redensyl Scalp Growth Drops', cat: 'hair-serum', sub: 'Hair Serum', price: 1299, compare: 1699, img: ['/assets/homepage/P12.jpg', '/assets/homepage/12.jpg'] },
    { name: 'Cedarwood & Jojoba Beard Conditioning Oil', cat: 'beard-care', sub: 'Beard Care', price: 799, compare: 1099, img: ['/assets/homepage/12.jpg', '/assets/homepage/11.jpg'] },
    { name: 'Men 3-in-1 Charcoal Face & Body Wash', cat: 'mens-grooming', sub: 'Men\'s Grooming', price: 699, compare: 999, img: ['/assets/homepage/11.jpg', '/assets/homepage/12.jpg'] },
    { name: '100% Pure Steam Distilled Rosewater Mist', cat: 'organic-essentials', sub: 'Organic Essentials', price: 549, compare: 749, img: ['/assets/homepage/21.jpg', '/assets/homepage/3.jpg'] },
    { name: 'Travel Skincare Bestsellers Kit (4 Minis)', cat: 'travel-minis', sub: 'Travel Minis', price: 1299, compare: 1799, img: ['/assets/homepage/4.jpg', '/assets/homepage/P1.jpg'] },
    { name: 'Royal Botanical Glow Luxury Gift Box', cat: 'gift-sets', sub: 'Gift Sets', price: 2999, compare: 4299, img: ['/assets/homepage/Rectangle_338.jpg', '/assets/homepage/Rectangle_342.jpg'], featured: true },
    { name: 'Bio-Fermented Peptide Radiance Concentrate', cat: 'new-arrivals', sub: 'New Arrivals', price: 1599, compare: 2199, img: ['/assets/homepage/P14-2.jpg', '/assets/homepage/P12.jpg'], newArrival: true },
    { name: 'Cold-Pressed Wild Mulberry Brightening Oil', cat: 'best-sellers', sub: 'Best Sellers', price: 1399, compare: 1899, img: ['/assets/homepage/P1.jpg', '/assets/homepage/P10.jpg'], bestSeller: true }
  ];

  // Clone templates to reach 120+ unique items across all 27 categories
  let counter = 1;
  categorySlugs.forEach(slug => {
    const matchingTemplates = productTemplates.filter(t => t.cat === slug);
    const countToMake = Math.max(4, 6 - matchingTemplates.length);

    for (let i = 0; i < countToMake; i++) {
      const base = productTemplates[i % productTemplates.length];
      const title = `Fabish ${base.name.replace('Fabish ', '')} (Batch #${counter})`;
      const itemSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      prods.push({
        title,
        slug: itemSlug,
        category: slug,
        subcategory: base.sub,
        price: base.price + (i * 50),
        comparePrice: base.compare + (i * 75),
        images: base.img,
        description: `Fabish clinical organic formulation for ${slug}. Dermatologically tested with high purity bio-active botanical ingredients.`,
        sku: `FBSH-${slug.slice(0, 3).toUpperCase()}-${String(counter).padStart(3, '0')}`,
        stock: 20 + (i * 5),
        ratings: 4.6 + (i % 4) * 0.1,
        reviewsCount: 15 + (i * 12),
        tags: [slug, 'organic', 'skincare', 'fabish'],
        ingredients: [{ name: 'Bio-Active Extracts', description: 'Cold-pressed phytonutrients.' }],
        benefits: [{ title: 'Clinical Efficacy', description: 'Restores healthy skin barrier.' }],
        featured: i === 0,
        bestSeller: i === 1,
        newArrival: i === 2
      });
      counter++;
    }
  });

  // Add the base templates
  productTemplates.forEach(t => {
    const title = t.name.startsWith('Fabish ') ? t.name : `Fabish ${t.name}`;
    const itemSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    prods.push({
      title,
      slug: itemSlug,
      category: t.cat,
      subcategory: t.sub,
      price: t.price,
      comparePrice: t.compare,
      images: t.img,
      description: `Fabish high performance formulation ${title}. Engineered for cell renewal, moisture barrier restoration, and clean Scandinavian luxury skincare ethics.`,
      sku: `FBSH-${t.cat.slice(0, 3).toUpperCase()}-${String(counter++).padStart(3, '0')}`,
      stock: 30,
      ratings: 4.8,
      reviewsCount: 45,
      tags: [t.cat, 'organic', 'fabish'],
      ingredients: [{ name: 'Pure Botanicals', description: '100% natural active complex.' }],
      benefits: [{ title: 'Proven Results', description: 'Visibly transforms skin health.' }],
      featured: !!t.featured,
      bestSeller: !!t.bestSeller,
      newArrival: !!t.newArrival
    });
  });

  return prods;
};

const rawProducts = generateProducts();

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing database collections...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Blog.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    await Contact.deleteMany({});

    // Seed Users
    const createdUsers = await User.create(users);
    console.log(`Seeded ${createdUsers.length} admin/customer users.`);

    // Seed Categories
    const createdCategories = await Category.create(categoriesToSeed);
    console.log(`Seeded ${createdCategories.length} categories successfully.`);

    // Map Category Slugs to ObjectIds
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.slug] = cat._id;
    });

    // Map Products
    const productsToSeed = rawProducts.map(prod => {
      const categoryId = categoryMap[prod.category] || createdCategories[0]._id;

      const imageObjects = (prod.images || ['/assets/homepage/P1.jpg']).map((img, index) => ({
        secure_url: img,
        public_id: `${prod.slug}-img-${index}`
      }));

      return {
        ...prod,
        category: categoryId,
        images: imageObjects,
        thumbnail: imageObjects[0]?.secure_url || '/assets/homepage/P1.jpg',
        brand: 'Fabish',
        ratings: Number((prod.ratings || 4.8).toFixed(1)),
        reviewsCount: prod.reviewsCount || 25,
        stock: prod.stock || 25,
        productName: prod.title,
        seoTitle: `${prod.title} — Fabish Luxury Organic Skincare`,
        seoDescription: (prod.description || '').slice(0, 150)
      };
    });

    const createdProducts = await Product.create(productsToSeed);
    console.log(`Seeded ${createdProducts.length} realistic Fabish 2026 products successfully.`);

    // Seed Sample Reviews for the first 3 products
    if (createdProducts.length > 0 && createdUsers.length > 1) {
      const sampleReviews = [
        {
          product: createdProducts[0]._id,
          user: createdUsers[1]._id,
          name: createdUsers[1].name,
          rating: 5,
          comment: 'This Fabish cleanser completely transformed my skin texture! Hydrating, smells natural, and leaves my face glowing.'
        },
        {
          product: createdProducts[1]._id,
          user: createdUsers[2]._id,
          name: createdUsers[2].name,
          rating: 5,
          comment: 'The Salicylic Acid cleanser cleared my chin breakouts in less than a week without drying out my skin!'
        }
      ];
      await Review.create(sampleReviews);
      console.log('Seeded customer reviews successfully.');
    }

    console.log('Database Seeding Completed Successfully! Exiting...');
    process.exit(0);
  } catch (error) {
    console.error(`Seeding Failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();