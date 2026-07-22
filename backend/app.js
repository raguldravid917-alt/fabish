const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');

// Middlewares
const { notFoundHandler, errorHandler } = require('./src/middleware/errorMiddleware');
const { apiLimiter } = require('./src/middleware/rateLimiter');

// Routes
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const productRoutes = require('./src/routes/productRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const wishlistRoutes = require('./src/routes/wishlistRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const addressRoutes = require('./src/routes/addressRoutes');
const couponRoutes = require('./src/routes/couponRoutes');
const blogRoutes = require('./src/routes/blogRoutes');
const contactRoutes = require('./src/routes/contactRoutes');
const userRoutes = require('./src/routes/userRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const sitemapRoutes = require('./src/routes/sitemapRoutes');
const supportTicketRoutes = require('./src/routes/supportTicketRoutes');
const teamRoutes = require('./src/routes/teamRoutes');
const partnerRoutes = require('./src/routes/partnerRoutes');
const footerPageRoutes = require('./src/routes/footerPageRoutes');
const settingsRoutes = require('./src/routes/settingsRoutes');

const app = express();

// Trust proxy to ensure correct client IP is identified behind reverse proxies (like Render)
app.set('trust proxy', 1);

// 1. Security Headers with explicit CSP for Razorpay, Cloudinary, Google Fonts & Google OAuth
app.use(helmet({
  crossOriginOpenerPolicy: { policy: 'unsafe-none' },
  crossOriginResourcePolicy: false, // Allow public loading of local uploads
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",       // Required for Razorpay & React inline scripts
        "https://checkout.razorpay.com",
        "https://api.razorpay.com",
        "https://accounts.google.com",
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",       // Required for Tailwind CSS-in-JS & inline styles
        "https://fonts.googleapis.com",
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "data:",
      ],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https:",                // Allow Cloudinary, CDN images
      ],
      connectSrc: [
        "'self'",
        "https://api.razorpay.com",
        "https://lumberjack.razorpay.com",
        "https://accounts.google.com",
        "https://oauth2.googleapis.com",
        process.env.BACKEND_URL || "http://localhost:5000",
        process.env.FRONTEND_URL || "http://localhost:5173",
      ],
      frameSrc: [
        "'self'",
        "https://api.razorpay.com",
        "https://checkout.razorpay.com",
        "https://accounts.google.com",
      ],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
}));

// 2. CORS setup
const allowedOrigins = [
  process.env.FRONTEND_URL,        // Deployed frontend (Vercel)
  process.env.CLIENT_URL,          // Legacy alias — keep for backwards compat
  'http://localhost:5173',          // Local dev
  'http://localhost:5174',          // Local dev alt port
  'http://localhost:4173',          // Local preview
  'http://localhost:3000',          // Alt local dev port
].filter(Boolean);                  // Remove undefined/null entries

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, mobile apps, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Block CORS without throwing a 500 error on the server
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

// 3. Body parsers
app.use(express.json({ limit: '50kb' })); // Increased for partnership form dynamic fields
app.use(express.urlencoded({ extended: true, limit: '50kb' }));
app.use(cookieParser());

// 4. Input Sanitization (NoSQL injection prevention)
app.use(mongoSanitize());

// 5. Morgan logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 6. Response compression (gzip)
app.use(compression());

// 7. Global API Rate limiter
if (process.env.NODE_ENV === 'production') {
  app.use('/api', apiLimiter);
}

// 8. Serve static files (temp uploaded files folder)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 9. API route mappings
app.use('/api/badges', require('./src/routes/badgeRoutes'));
app.get('/api/product/:id', require('./src/controllers/productController').getProductById);
app.use('/api/profile', profileRoutes);
app.use('/api/auth/profile', profileRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/cms/pages', require('./src/routes/cmsPageRoutes'));
app.use('/api/blogs', blogRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sitemap.xml', sitemapRoutes);
app.use('/api/support', supportTicketRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/partnerships', partnerRoutes);
app.use('/api/settings', settingsRoutes);

// Footer Pages CMS — public storefront
app.use('/api/footer-pages', footerPageRoutes);
// Footer Pages CMS — admin CRUD (routes internally enforce adminOnly guard)
app.use('/api/admin/footer-pages', footerPageRoutes);

app.post('/api/log-error', (req, res) => {
  // Only log in development to avoid flooding production logs with client-side errors
  if (process.env.NODE_ENV !== 'production') {
    console.error('[CLIENT ERROR BOUNDARY]', req.body?.message || 'Unknown error');
  }
  res.sendStatus(200);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Fabish Storefront REST API',
    version: '1.0.0',
  });
});

// 10. 404 & 500 error boundaries
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
