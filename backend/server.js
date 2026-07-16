const dotenv = require('dotenv');
const path = require('path');

// Load environment variables securely from absolute path
dotenv.config({ path: path.resolve(__dirname, './.env') });

const app = require('./app');
const connectDB = require('./src/config/db');
const cloudinaryConfig = require('./src/config/cloudinary');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Establish MongoDB Connection & Seed & Migrate
    await connectDB();
    console.log('✓ MongoDB Connected');

    // 2. Start Express Server
    const server = app.listen(PORT, () => {
      const environment = process.env.NODE_ENV || 'development';
      const apiBaseUrl = process.env.BACKEND_URL || `http://localhost:${PORT}`;
      const cloudinaryStatus = cloudinaryConfig.isConfigured
        ? '✓ Cloudinary Configured Successfully'
        : '⚠ Cloudinary Credentials Missing (Mocking Active)';

      console.log('--- SERVER STARTUP SUCCESS ---');
      console.log(`✓ Backend Port: ${PORT}`);
      console.log(`✓ Environment: ${environment}`);
      console.log(`✓ API Base URL: ${apiBaseUrl}`);
      console.log(`✓ Cloudinary Status: ${cloudinaryStatus}`);
      console.log('------------------------------');
    });

    // 3. Graceful Error Handling (e.g., EADDRINUSE)
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n[STARTUP ERROR] Port ${PORT} is already occupied by another application.`);
        console.error('Please terminate the process using this port, or configure a different PORT variable in your backend/.env file.\n');
        process.exit(0); // Exit gracefully as requested by tasks
      } else {
        console.error(`\n[STARTUP ERROR] An unexpected server error occurred: ${err.message}\n`);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error(`\n[STARTUP ERROR] Failed to bootstrap the backend server: ${error.message}\n`);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections gracefully
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Promise Rejection: ${err.message}`);
  process.exit(1);
});
