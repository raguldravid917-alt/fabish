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

const parentCategories = [
  {
    name: 'Skin Care',
    slug: 'skin-care',
    image: '/assets/homepage/6.jpg',
    parentCategory: null
  },
  {
    name: 'Hair Care',
    slug: 'hair-care',
    image: '/assets/homepage/P13.jpg',
    parentCategory: null
  },
  {
    name: 'Makeup',
    slug: 'makeup',
    image: '/assets/homepage/P10.jpg',
    parentCategory: null
  },
  {
    name: 'Body Care',
    slug: 'body-care',
    image: '/assets/homepage/14.jpg',
    parentCategory: null
  },
  {
    name: 'Fragrance',
    slug: 'fragrance',
    image: '/assets/homepage/12.jpg',
    parentCategory: null
  },
  {
    name: 'Men\'s Care',
    slug: 'mens-care',
    image: '/assets/homepage/11.jpg',
    parentCategory: null
  }
];

const products = [
  // 1. Skin Care - Moisturizer
  {
    title: 'Aura Natural Face Cream',
    slug: 'aura-natural-face-cream',
    description: 'Our daily face moisturizer features active botanical ingredients that brighten dark spots and deliver a glowing aura complexion.',
    images: ['/assets/homepage/P1.jpg', '/assets/homepage/P1 (1).jpg'],
    category: 'moisturizer',
    subcategory: 'Moisturizer',
    price: 2400.00,
    comparePrice: 3500.00,
    stock: 15,
    ratings: 4.9,
    reviewsCount: 1,
    tags: ['moisturizer', 'glow', 'aura']
  },
  // 2. Skin Care - Face Cream
  {
    title: 'Azalea Fields Soothing Cream',
    slug: 'azalea-fields-soothing-cream',
    description: 'A soothing and refreshing face cream made with organic azalea flower extracts. Hydrates dry skin, reduces redness, and provides all-day nourishment.',
    images: ['/assets/homepage/1.jpg', '/assets/homepage/2.jpg'],
    category: 'face-cream',
    subcategory: 'Face Cream',
    price: 24100.00,
    comparePrice: 0.00,
    stock: 25,
    ratings: 4.8,
    reviewsCount: 15,
    tags: ['face-cream', 'soothing', 'organic']
  },
  // 3. Skin Care - Sunscreen
  {
    title: 'Dandelion Revive Sunscreen',
    slug: 'dandelion-revive-sunscreen',
    description: 'An iced cooling gel cream infused with dandelion root extracts to calm irritated skin and protect against harsh UV rays.',
    images: ['/assets/homepage/16.jpg', '/assets/homepage/17.jpg'],
    category: 'sunscreen',
    subcategory: 'Sunscreen',
    price: 1450.00,
    comparePrice: 1800.00,
    stock: 18,
    ratings: 4.4,
    reviewsCount: 6,
    tags: ['sunscreen', 'sun-protection', 'spf']
  },
  // 4. Skin Care - Cleanser
  {
    title: 'Creamy Foam Cleanser',
    slug: 'creamy-foam-cleanser',
    description: 'Deeply cleanses pores, removes sebum and make-up residues, leaving your skin soft and perfectly hydrated.',
    images: ['/assets/homepage/9.jpg', '/assets/homepage/6.jpg'],
    category: 'cleanser',
    subcategory: 'Cleanser',
    price: 1200.00,
    comparePrice: 1500.00,
    stock: 30,
    ratings: 4.6,
    reviewsCount: 8,
    tags: ['cleanser', 'foam', 'cleanse']
  },
  // 5. Skin Care - Toner
  {
    title: 'Bluebell Dream Toner',
    slug: 'bluebell-dream-toner',
    description: 'Enriched with wild bluebell essence to restore skin elasticity, lock-in moisture, and prepare skin for moisturizing.',
    images: ['/assets/homepage/3.jpg', '/assets/homepage/4.jpg'],
    category: 'toner',
    subcategory: 'Toner',
    price: 1850.00,
    comparePrice: 2200.00,
    stock: 15,
    ratings: 4.6,
    reviewsCount: 8,
    tags: ['toner', 'bluebell', 'hydration']
  },
  // 6. Skin Care - Serum
  {
    title: 'Organic Anti-Aging Serum',
    slug: 'organic-anti-aging-serum',
    description: 'A potent serum loaded with Vitamin C, Hyaluronic Acid, and Niacinamide. Enhances collagen production and restores youthfulness.',
    images: ['/assets/homepage/P12.jpg'],
    category: 'serum',
    subcategory: 'Serum',
    price: 2800.00,
    comparePrice: 4000.00,
    stock: 15,
    ratings: 4.9,
    reviewsCount: 52,
    tags: ['serum', 'anti-aging', 'hyaluronic']
  },
  // 7. Skin Care - Night Cream
  {
    title: 'Wrinkle Reduce Night Cream',
    slug: 'wrinkle-reduce-night-cream',
    description: 'A night treatment formulated with clean retinol and peptide complexes to significantly diminish fine lines.',
    images: ['/assets/homepage/P11.jpg', '/assets/homepage/P11 (1).jpg'],
    category: 'night-cream',
    subcategory: 'Night Cream',
    price: 3200.00,
    comparePrice: 4800.00,
    stock: 10,
    ratings: 4.5,
    reviewsCount: 14,
    tags: ['night-cream', 'anti-aging', 'retinol']
  },
  // 8. Skin Care - Day Cream
  {
    title: 'Skin Naturals Day Cream',
    slug: 'skin-naturals-day-cream',
    description: 'An all-in-one day cream that primes, moisturizes, and protects with SPF. Infused with Vitamin C to brighten your skin.',
    images: ['/assets/homepage/P14.jpg', '/assets/homepage/P14-2.jpg'],
    category: 'day-cream',
    subcategory: 'Day Cream',
    price: 1100.00,
    comparePrice: 1500.00,
    stock: 45,
    ratings: 4.7,
    reviewsCount: 38,
    tags: ['day-cream', 'spf', 'vitamin-c']
  },

  // 9. Hair Care - Shampoo
  {
    title: 'Smooth Argan Shampoo',
    slug: 'smooth-argan-shampoo',
    description: 'Nourishing shampoo enriched with pure Moroccan argan oil to strengthen, soften, and revive dry, damaged hair.',
    images: ['/assets/homepage/P13-2.jpg'],
    category: 'shampoo',
    subcategory: 'Shampoo',
    price: 950.00,
    comparePrice: 1300.00,
    stock: 22,
    ratings: 4.5,
    reviewsCount: 12,
    tags: ['shampoo', 'hair-care', 'argan']
  },
  // 10. Hair Care - Conditioner
  {
    title: 'Smooth Hair Conditioner',
    slug: 'smooth-hair-conditioner',
    description: 'Enriched with argan oil and silk proteins, this conditioner tames frizz, seals split ends, and leaves hair glossy.',
    images: ['/assets/homepage/P13.jpg', '/assets/homepage/P13-2.jpg'],
    category: 'conditioner',
    subcategory: 'Conditioner',
    price: 890.00,
    comparePrice: 1200.00,
    stock: 20,
    ratings: 4.2,
    reviewsCount: 9,
    tags: ['conditioner', 'hair-care', 'glossy']
  },
  // 11. Hair Care - Hair Oil
  {
    title: 'Earthy Cedar Hair Oil',
    slug: 'earthy-cedar-hair-oil',
    description: 'A woodsy, nourishing hair oil containing cedar extract and natural oils to promote scalp health and hair thickness.',
    images: ['/assets/homepage/12.jpg'],
    category: 'hair-oil',
    subcategory: 'Hair Oil',
    price: 1250.00,
    comparePrice: 1600.00,
    stock: 35,
    ratings: 4.6,
    reviewsCount: 14,
    tags: ['hair-oil', 'cedar', 'scalp']
  },
  // 12. Hair Care - Hair Serum
  {
    title: 'Silky Shine Hair Serum',
    slug: 'silky-shine-hair-serum',
    description: 'Ultra-lightweight hair serum that forms a protective layer around hair strands to shield from heat damage and reduce frizz.',
    images: ['/assets/homepage/P12.jpg'],
    category: 'hair-serum',
    subcategory: 'Hair Serum',
    price: 1550.00,
    comparePrice: 1900.00,
    stock: 28,
    ratings: 4.7,
    reviewsCount: 19,
    tags: ['hair-serum', 'anti-frizz', 'heat-protection']
  },
  // 13. Hair Care - Hair Mask
  {
    title: 'Birch Repair Hair Mask',
    slug: 'birch-repair-hair-mask',
    description: 'Deep conditioning treatment mask formulated with organic birch sap to deeply rebuild weak or heavily processed hair.',
    images: ['/assets/homepage/23.jpg'],
    category: 'hair-mask',
    subcategory: 'Hair Mask',
    price: 1800.00,
    comparePrice: 2400.00,
    stock: 15,
    ratings: 4.8,
    reviewsCount: 22,
    tags: ['hair-mask', 'repair', 'birch']
  },
  // 14. Hair Care - Hair Spray
  {
    title: 'Volumizing Hair Spray',
    slug: 'volumizing-hair-spray',
    description: 'A long-lasting hold styling hair spray that provides instant volume, texture, and natural-looking shine.',
    images: ['/assets/homepage/15.jpg'],
    category: 'hair-spray',
    subcategory: 'Hair Spray',
    price: 750.00,
    comparePrice: 1000.00,
    stock: 40,
    ratings: 4.3,
    reviewsCount: 10,
    tags: ['hair-spray', 'styling', 'volume']
  },

  // 15. Makeup - Lipstick
  {
    title: 'Waterproof Matte Lipstick',
    slug: 'waterproof-matte-lipstick',
    description: 'A velvety smooth matte lipstick that stays put for up to 16 hours. Non-drying formula keeps lips hydrated.',
    images: ['/assets/homepage/P10.jpg', '/assets/homepage/P10 (1).jpg'],
    category: 'lipstick',
    subcategory: 'Lipstick',
    price: 699.00,
    comparePrice: 999.00,
    stock: 60,
    ratings: 4.6,
    reviewsCount: 40,
    tags: ['lipstick', 'matte', 'waterproof']
  },
  // 16. Makeup - Foundation
  {
    title: 'All Day Matte Foundation',
    slug: 'all-day-matte-foundation',
    description: 'A buildable medium-to-full coverage foundation that provides a flawless matte finish for 24-hour wear.',
    images: ['/assets/homepage/P14.jpg'],
    category: 'foundation',
    subcategory: 'Foundation',
    price: 1850.00,
    comparePrice: 2500.00,
    stock: 30,
    ratings: 4.7,
    reviewsCount: 25,
    tags: ['foundation', 'makeup', 'matte']
  },
  // 17. Makeup - Compact
  {
    title: 'Oil Control Compact Powder',
    slug: 'oil-control-compact-powder',
    description: 'A lightweight setting powder that controls oil breakout and sets makeup for a matte look all day.',
    images: ['/assets/homepage/P11.jpg'],
    category: 'compact',
    subcategory: 'Compact',
    price: 950.00,
    comparePrice: 1300.00,
    stock: 45,
    ratings: 4.4,
    reviewsCount: 15,
    tags: ['compact', 'oil-control', 'powder']
  },
  // 18. Makeup - Concealer
  {
    title: 'Full Coverage Concealer',
    slug: 'full-coverage-concealer',
    description: 'Crease-proof liquid concealer that immediately covers dark circles, acne scars, blemishes, and hyperpigmentation.',
    images: ['/assets/homepage/P1.jpg'],
    category: 'concealer',
    subcategory: 'Concealer',
    price: 799.00,
    comparePrice: 1100.00,
    stock: 50,
    ratings: 4.5,
    reviewsCount: 18,
    tags: ['concealer', 'full-coverage', 'blemish']
  },
  // 19. Makeup - Primer
  {
    title: 'Hydrating Poreless Primer',
    slug: 'hydrating-poreless-primer',
    description: 'Creates a smooth canvas for makeup application while sealing in moisture and minimizing pore appearance.',
    images: ['/assets/homepage/6.jpg'],
    category: 'primer',
    subcategory: 'Primer',
    price: 1150.00,
    comparePrice: 1600.00,
    stock: 32,
    ratings: 4.6,
    reviewsCount: 21,
    tags: ['primer', 'poreless', 'hydrating']
  },
  // 20. Makeup - Mascara
  {
    title: 'Lash Lift Volumizing Mascara',
    slug: 'lash-lift-volumizing-mascara',
    description: 'Delivers intense volume and dramatic length to your lashes without clumping or smudging.',
    images: ['/assets/homepage/P10 (1).jpg'],
    category: 'mascara',
    subcategory: 'Mascara',
    price: 850.00,
    comparePrice: 1200.00,
    stock: 40,
    ratings: 4.7,
    reviewsCount: 30,
    tags: ['mascara', 'volume', 'lashes']
  },
  // 21. Makeup - Eyeliner
  {
    title: 'Precision Liquid Eyeliner',
    slug: 'precision-liquid-eyeliner',
    description: 'Waterproof liquid eyeliner with an ultra-fine felt tip for drawing precise cat-eyes and dramatic wings.',
    images: ['/assets/homepage/P10.jpg'],
    category: 'eyeliner',
    subcategory: 'Eyeliner',
    price: 650.00,
    comparePrice: 900.00,
    stock: 45,
    ratings: 4.5,
    reviewsCount: 26,
    tags: ['eyeliner', 'liquid', 'waterproof']
  },
  // 22. Makeup - Blush
  {
    title: 'Natural Glow Cheek Blush',
    slug: 'natural-glow-cheek-blush',
    description: 'A silky pressed-powder blush that blends beautifully to give a healthy, natural flush of color.',
    images: ['/assets/homepage/9.jpg'],
    category: 'blush',
    subcategory: 'Blush',
    price: 990.00,
    comparePrice: 1400.00,
    stock: 38,
    ratings: 4.8,
    reviewsCount: 19,
    tags: ['blush', 'glow', 'cheek']
  },

  // 23. Body Care - Body Lotion
  {
    title: 'Citrus Grove Hydrating Lotion',
    slug: 'citrus-grove-hydrating-lotion',
    description: 'A light, daily body lotion loaded with fresh orange and grapefruit essential oils to keep body skin smooth all day.',
    images: ['/assets/homepage/14.jpg', '/assets/homepage/15.jpg'],
    category: 'body-lotion',
    subcategory: 'Body Lotion',
    price: 999.00,
    comparePrice: 1200.00,
    stock: 50,
    ratings: 4.7,
    reviewsCount: 19,
    tags: ['body-lotion', 'citrus', 'hydrating']
  },
  // 24. Body Care - Body Wash
  {
    title: 'Refreshing Citrus Body Wash',
    slug: 'refreshing-citrus-body-wash',
    description: 'An invigorating gel cleanser for the body, rich in citrus antioxidants that deep cleanses and conditions skin.',
    images: ['/assets/homepage/15.jpg'],
    category: 'body-wash',
    subcategory: 'Body Wash',
    price: 799.00,
    comparePrice: 1100.00,
    stock: 55,
    ratings: 4.4,
    reviewsCount: 12,
    tags: ['body-wash', 'citrus', 'refreshing']
  },
  // 25. Body Care - Body Butter
  {
    title: 'Pure Shea Body Butter',
    slug: 'pure-shea-body-butter',
    description: 'Intensively hydrating thick body butter containing organic shea butter to repair extremely dry and flaky skin.',
    images: ['/assets/homepage/23.jpg', '/assets/homepage/24.jpg'],
    category: 'body-butter',
    subcategory: 'Body Butter',
    price: 1650.00,
    comparePrice: 2200.00,
    stock: 25,
    ratings: 4.9,
    reviewsCount: 31,
    tags: ['body-butter', 'shea-butter', 'deep-hydration']
  },
  // 26. Body Care - Scrub
  {
    title: 'Exfoliating Apricot Body Scrub',
    slug: 'exfoliating-apricot-body-scrub',
    description: 'Finely ground apricot kernels gently buff away dead skin cells, promoting blood flow and smoother skin texture.',
    images: ['/assets/homepage/21.jpg', '/assets/homepage/20.jpg'],
    category: 'scrub',
    subcategory: 'Scrub',
    price: 1150.00,
    comparePrice: 1600.00,
    stock: 30,
    ratings: 4.5,
    reviewsCount: 17,
    tags: ['scrub', 'apricot', 'exfoliate']
  },

  // 27. Fragrance - Perfume
  {
    title: 'Cedar Wood Luxury Perfume',
    slug: 'cedar-wood-luxury-perfume',
    description: 'A woodsy, earthy, premium eau de parfum featuring layers of cedar bark, amber, and light bergamot notes.',
    images: ['/assets/homepage/12.jpg'],
    category: 'perfume',
    subcategory: 'Perfume',
    price: 4500.00,
    comparePrice: 6000.00,
    stock: 12,
    ratings: 4.8,
    reviewsCount: 15,
    tags: ['perfume', 'luxury', 'cedar']
  },
  // 28. Fragrance - Mist
  {
    title: 'Fresh Citrus Body Mist',
    slug: 'fresh-citrus-body-mist',
    description: 'A light, refreshing all-day fragrance mist spray infused with lemon water and grapefruit extract.',
    images: ['/assets/homepage/15.jpg'],
    category: 'mist',
    subcategory: 'Mist',
    price: 1350.00,
    comparePrice: 1800.00,
    stock: 24,
    ratings: 4.3,
    reviewsCount: 11,
    tags: ['mist', 'fragrance', 'citrus']
  },
  // 29. Fragrance - Deodorant
  {
    title: 'All Day Fresh Deodorant',
    slug: 'all-day-fresh-deodorant',
    description: 'Aluminum-free roll-on deodorant that effectively neutralizes odors while keeping underarms soft and fresh.',
    images: ['/assets/homepage/14.jpg'],
    category: 'deodorant',
    subcategory: 'Deodorant',
    price: 650.00,
    comparePrice: 850.00,
    stock: 50,
    ratings: 4.4,
    reviewsCount: 20,
    tags: ['deodorant', 'fresh', 'aluminum-free']
  },

  // 30. Men's Care - Beard Oil
  {
    title: 'Premium Beard Growth Oil',
    slug: 'premium-beard-growth-oil',
    description: 'Softens coarse beard hairs, relieves itchy skin underneath, and promotes healthy beard growth with cedar notes.',
    images: ['/assets/homepage/12.jpg'],
    category: 'beard-oil',
    subcategory: 'Beard Oil',
    price: 990.00,
    comparePrice: 1400.00,
    stock: 35,
    ratings: 4.6,
    reviewsCount: 15,
    tags: ['beard-oil', 'beard-care', 'mens']
  },
  // 31. Men's Care - Face Wash
  {
    title: 'Charcoal Deep Face Wash',
    slug: 'charcoal-deep-face-wash',
    description: 'Formulated with active charcoal to draw out deep pore dirt, oil, and pollution particles from men\'s skin.',
    images: ['/assets/homepage/11.jpg'],
    category: 'mens-face-wash',
    subcategory: 'Face Wash',
    price: 850.00,
    comparePrice: 1100.00,
    stock: 45,
    ratings: 4.5,
    reviewsCount: 22,
    tags: ['face-wash', 'charcoal', 'mens']
  },
  // 32. Men's Care - Shaving Cream
  {
    title: 'Menthol Cool Shaving Cream',
    slug: 'menthol-cool-shaving-cream',
    description: 'Provides a rich lubricating lather for a clean close shave, enriched with cooling menthol extracts to soothe skin.',
    images: ['/assets/homepage/16.jpg'],
    category: 'shaving-cream',
    subcategory: 'Shaving Cream',
    price: 590.00,
    comparePrice: 800.00,
    stock: 55,
    ratings: 4.7,
    reviewsCount: 18,
    tags: ['shaving-cream', 'shave', 'mens']
  },

  // Extra products for variety and matching the 35 target count
  // 33. Skin Care - Moisturizer (extra)
  {
    title: 'Vanguard Glow Hydrator',
    slug: 'vanguard-glow-hydrator',
    description: 'Premium hydrating cream for all-day skin glow and smoothness. Works wonders on sensitive and mixed skin types.',
    images: ['/assets/homepage/6.jpg'],
    category: 'moisturizer',
    subcategory: 'Moisturizer',
    price: 3500.00,
    comparePrice: 0.00,
    stock: 100,
    ratings: 4.8,
    reviewsCount: 4,
    tags: ['moisturizer', 'hydrator', 'glow']
  },
  // 34. Skin Care - Moisturizer (extra 2)
  {
    title: 'Aloe Vera Freshness Cream',
    slug: 'aloe-vera-freshness-cream',
    description: 'A 99% pure aloe vera extract cream. Perfect for skin hydration, healing breakouts, and maintaining moisture barrier.',
    images: ['/assets/homepage/6.jpg', '/assets/homepage/9.jpg'],
    category: 'moisturizer',
    subcategory: 'Moisturizer',
    price: 46000.00,
    comparePrice: 0.00,
    stock: 100,
    ratings: 4.8,
    reviewsCount: 45,
    tags: ['moisturizer', 'aloe-vera', 'soothing']
  },
  // 35. Skin Care - Face Cream (extra)
  {
    title: 'Apricot Melon Softening Cream',
    slug: 'apricot-melon-softening-cream',
    description: 'A delightful blend of apricot extract and fresh melon oil. Instantly softens rough texture and provides fruity hydration.',
    images: ['/assets/homepage/21.jpg', '/assets/homepage/20.jpg'],
    category: 'face-cream',
    subcategory: 'Face Cream',
    price: 80700.00,
    comparePrice: 95800.00,
    stock: 40,
    ratings: 4.5,
    reviewsCount: 22,
    tags: ['face-cream', 'apricot', 'melon']
  }
];

const blogs = [
  {
    title: 'Best cleansers for sensitive skin',
    slug: 'best-cleansers-for-sensitive-skin',
    content: '<p>Sensitive skin requires gentle care. Learn about the top face washes that cleanse without stripping away natural oils or causing irritation. We recommend using pH-balanced, fragrance-free foaming cleansers containing aloe vera and chamomile extracts to calm sensitive skin barriers.</p>',
    author: 'Skincare Expert',
    image: '/assets/homepage/Blog08.jpg',
    date: new Date('2026-05-10')
  },
  {
    title: 'How to treat an infected pimple',
    slug: 'how-to-treat-an-infected-pimple',
    content: '<p>Breakouts happen, but an infected pimple requires proper treatment. Read our guide on using salicylic acid, tea tree oil, and warm compresses to safely reduce inflammation and heal your skin without scarring. Avoid popping or squeezing, as it spreads infection.</p>',
    author: 'Dermatologist',
    image: '/assets/homepage/Blog03.jpg',
    date: new Date('2026-06-01')
  },
  {
    title: 'Best sunscreens for everyday wear',
    slug: 'best-sunscreens-for-everyday-wear',
    content: '<p>Sun protection is non-negotiable. We review the best mineral and chemical sunscreens that offer SPF 30+ protection, absorb quickly, leave no white cast, and feel lightweight under makeup. Protect your skin from UV aging everyday!</p>',
    author: 'Health Editor',
    image: '/assets/homepage/Blog07.jpg',
    date: new Date('2026-06-15')
  }
];

const seedData = async () => {
  try {
    await connectDB();

    // Clear old data
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await Blog.deleteMany();
    await Order.deleteMany();
    await Review.deleteMany();
    await Contact.deleteMany();

    console.log('Cleared all old database collections.');

    // Seed users
    const createdUsers = await User.create(users);
    console.log(`Seeded ${createdUsers.length} users successfully.`);

    // Seed Parent Categories first
    const createdParents = await Category.create(parentCategories);
    console.log(`Seeded ${createdParents.length} parent categories successfully.`);

    // Extract newly created Parent IDs
    const skinCareId = createdParents.find(c => c.slug === 'skin-care')?._id;
    const hairCareId = createdParents.find(c => c.slug === 'hair-care')?._id;
    const makeupId = createdParents.find(c => c.slug === 'makeup')?._id;
    const bodyCareId = createdParents.find(c => c.slug === 'body-care')?._id;
    const fragranceId = createdParents.find(c => c.slug === 'fragrance')?._id;
    const mensCareId = createdParents.find(c => c.slug === 'mens-care')?._id;

    // Define subcategories mapped safely to parent categories
    const subCategories = [
      // Skin Care
      { name: 'Moisturizer', slug: 'moisturizer', image: '/assets/homepage/P1.jpg', parentCategory: skinCareId },
      { name: 'Face Cream', slug: 'face-cream', image: '/assets/homepage/1.jpg', parentCategory: skinCareId },
      { name: 'Sunscreen', slug: 'sunscreen', image: '/assets/homepage/16.jpg', parentCategory: skinCareId },
      { name: 'Cleanser', slug: 'cleanser', image: '/assets/homepage/9.jpg', parentCategory: skinCareId },
      { name: 'Toner', slug: 'toner', image: '/assets/homepage/3.jpg', parentCategory: skinCareId },
      { name: 'Serum', slug: 'serum', image: '/assets/homepage/P12.jpg', parentCategory: skinCareId },
      { name: 'Night Cream', slug: 'night-cream', image: '/assets/homepage/P11.jpg', parentCategory: skinCareId },
      { name: 'Day Cream', slug: 'day-cream', image: '/assets/homepage/P14.jpg', parentCategory: skinCareId },

      // Hair Care
      { name: 'Shampoo', slug: 'shampoo', image: '/assets/homepage/P13-2.jpg', parentCategory: hairCareId },
      { name: 'Conditioner', slug: 'conditioner', image: '/assets/homepage/P13.jpg', parentCategory: hairCareId },
      { name: 'Hair Oil', slug: 'hair-oil', image: '/assets/homepage/12.jpg', parentCategory: hairCareId },
      { name: 'Hair Serum', slug: 'hair-serum', image: '/assets/homepage/P12.jpg', parentCategory: hairCareId },
      { name: 'Hair Mask', slug: 'hair-mask', image: '/assets/homepage/23.jpg', parentCategory: hairCareId },
      { name: 'Hair Spray', slug: 'hair-spray', image: '/assets/homepage/15.jpg', parentCategory: hairCareId },

      // Makeup
      { name: 'Lipstick', slug: 'lipstick', image: '/assets/homepage/P10.jpg', parentCategory: makeupId },
      { name: 'Foundation', slug: 'foundation', image: '/assets/homepage/P14.jpg', parentCategory: makeupId },
      { name: 'Compact', slug: 'compact', image: '/assets/homepage/P11.jpg', parentCategory: makeupId },
      { name: 'Concealer', slug: 'concealer', image: '/assets/homepage/P1.jpg', parentCategory: makeupId },
      { name: 'Primer', slug: 'primer', image: '/assets/homepage/6.jpg', parentCategory: makeupId },
      { name: 'Mascara', slug: 'mascara', image: '/assets/homepage/P10 (1).jpg', parentCategory: makeupId },
      { name: 'Eyeliner', slug: 'eyeliner', image: '/assets/homepage/P10.jpg', parentCategory: makeupId },
      { name: 'Blush', slug: 'blush', image: '/assets/homepage/9.jpg', parentCategory: makeupId },

      // Body Care
      { name: 'Body Lotion', slug: 'body-lotion', image: '/assets/homepage/14.jpg', parentCategory: bodyCareId },
      { name: 'Body Wash', slug: 'body-wash', image: '/assets/homepage/15.jpg', parentCategory: bodyCareId },
      { name: 'Body Butter', slug: 'body-butter', image: '/assets/homepage/23.jpg', parentCategory: bodyCareId },
      { name: 'Scrub', slug: 'scrub', image: '/assets/homepage/24.jpg', parentCategory: bodyCareId },

      // Fragrance
      { name: 'Perfume', slug: 'perfume', image: '/assets/homepage/12.jpg', parentCategory: fragranceId },
      { name: 'Mist', slug: 'mist', image: '/assets/homepage/15.jpg', parentCategory: fragranceId },
      { name: 'Deodorant', slug: 'deodorant', image: '/assets/homepage/14.jpg', parentCategory: fragranceId },

      // Men's Care
      { name: 'Beard Oil', slug: 'beard-oil', image: '/assets/homepage/12.jpg', parentCategory: mensCareId },
      { name: 'Face Wash', slug: 'mens-face-wash', image: '/assets/homepage/11.jpg', parentCategory: mensCareId },
      { name: 'Shaving Cream', slug: 'shaving-cream', image: '/assets/homepage/16.jpg', parentCategory: mensCareId }
    ];

    // Seed Subcategories
    const createdSubs = await Category.create(subCategories);
    console.log(`Seeded ${createdSubs.length} subcategories successfully.`);

    // Merge both created collections to map all products safely
    const allCreatedCategories = [...createdParents, ...createdSubs];

    // Map product category slugs to Category ObjectIds
    const categoryMap = {};
    allCreatedCategories.forEach(cat => {
      categoryMap[cat.slug] = cat._id;
    });

    const productsToSeed = products.map(prod => {
      const categoryId = categoryMap[prod.category];
      if (!categoryId) {
        throw new Error(`Category slug "${prod.category}" not found in seeded categories.`);
      }
      const imageObjects = prod.images.map((img, index) => ({
        secure_url: img,
        public_id: `${prod.slug}-image-${index}`
      }));
      return {
        ...prod,
        category: categoryId,
        images: imageObjects,
        thumbnail: imageObjects[0]?.secure_url || '',
      };
    });

    // Seed products
    const createdProducts = await Product.create(productsToSeed);
    console.log(`Seeded ${createdProducts.length} products successfully.`);

    // Seed blogs
    const createdBlogs = await Blog.create(blogs);
    console.log(`Seeded ${createdBlogs.length} blog articles successfully.`);

    // Add some reviews to the first product (Aura Natural Face Cream)
    const product = await Product.findOne({ slug: 'aura-natural-face-cream' });
    const user = createdUsers[1]; // John Doe

    if (product && user) {
      const review = new Review({
        product: product._id,
        user: user._id,
        name: user.name,
        rating: 5,
        comment: 'This face cream is absolutely amazing! It makes my skin feel hydrated, plump, and glowing all day long. Highly recommend!',
      });
      await review.save();

      product.reviewsCount = 1;
      product.ratings = 5.0;
      await product.save();
      console.log('Seeded sample reviews.');
    }

    console.log('Database Seeding Completed Successfully! Exiting...');
    process.exit(0);
  } catch (error) {
    console.error(`Seeding Failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();