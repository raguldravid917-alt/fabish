const path = require('path');
const dotenv = require('dotenv');

// Load environment variables securely from the backend folder using an absolute path
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const cloudinary = require('cloudinary').v2;

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isConfigured = !!(
  cloudName && cloudName !== 'undefined' && cloudName !== 'null' && cloudName.trim() !== '' &&
  apiKey && apiKey !== 'undefined' && apiKey !== 'null' && apiKey.trim() !== '' &&
  apiSecret && apiSecret !== 'undefined' && apiSecret !== 'null' && apiSecret.trim() !== ''
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  console.log('Cloudinary configured successfully.');
} else {
  console.warn(
    'WARNING: Cloudinary credentials missing or invalid in environment variables. Falling back to local mock uploads.'
  );
}

module.exports = {
  cloudinary,
  isConfigured,
};

