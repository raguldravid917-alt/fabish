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

const app = express();

// Trust proxy to ensure correct client IP is identified behind reverse proxies (like Render)
app.set('trust proxy', 1);

// 1. Security Headers
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow public loading of local uploads
}));

// 2. CORS setup
const allowedOrigins = [
  process.env.FRONTEND_URL,        // Deployed frontend (Vercel)
  process.env.CLIENT_URL,          // Legacy alias — keep for backwards compat
  'http://localhost:5173',          // Local dev
  'http://localhost:5174',          // Local dev alt port
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
app.use(express.json({ limit: '10kb' })); // Restrict body sizes
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
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
app.use('/api/blogs', blogRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/users', userRoutes);

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
