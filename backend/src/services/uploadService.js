const { cloudinary, isConfigured } = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

class UploadService {
  /**
   * Uploads a single file to Cloudinary (falls back to local static files if Cloudinary is not configured).
   * @param {Object} file - Multer file object
   * @param {string} folder - Destination folder on Cloudinary (e.g. 'fabish/products')
   * @param {number} retries - Number of retry attempts on network error
   * @returns {Promise<Object>} Object containing secure_url, public_id, width, height, format, bytes
   */
  async uploadFile(file, folder = 'fabish/products', retries = 2) {
    if (!file) return null;

    if (isConfigured) {
      for (let attempt = 1; attempt <= retries + 1; attempt++) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: folder,
          });

          // Clean up temp file on local disk
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }

          return {
            secure_url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          };
        } catch (error) {
          console.error(`Cloudinary upload attempt ${attempt} failed:`, error.message);
          if (attempt > retries) {
            // Remove local temp file on ultimate failure
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
            throw new Error(`Cloudinary upload failed after ${attempt} attempts: ${error.message}`);
          }
          // Brief delay before retry
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }

    // Fallback: copy file to public uploads and return a mock structure matching the DB schema
    const filename = `${Date.now()}-${path.basename(file.originalname)}`;
    const destDir = path.join(__dirname, '../../uploads');

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const destPath = path.join(destDir, filename);
    
    try {
      fs.renameSync(file.path, destPath);
    } catch (err) {
      // If rename fails, copy and delete
      fs.copyFileSync(file.path, destPath);
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }

    const stats = fs.statSync(destPath);
    return {
      secure_url: `/uploads/${filename}`,
      public_id: `local/${filename.split('.')[0]}`,
      width: 500,
      height: 625,
      format: path.extname(filename).replace('.', ''),
      bytes: stats.size,
    };
  }

  /**
   * Uploads multiple files.
   * @param {Array<Object>} files - Array of Multer file objects
   * @param {string} folder - Destination folder on Cloudinary
   * @returns {Promise<Array<Object>>} Array of uploaded image objects
   */
  async uploadMultiple(files, folder = 'fabish/products') {
    if (!files || !files.length) return [];
    
    const uploadPromises = files.map((file) => this.uploadFile(file, folder));
    const results = await Promise.all(uploadPromises);
    return results.filter(Boolean);
  }

  /**
   * Deletes an image from Cloudinary (or local server).
   * @param {string} urlOrPublicId - Cloudinary URL or Public ID
   */
  async deleteImage(urlOrPublicId) {
    if (!urlOrPublicId) return;

    if (isConfigured) {
      try {
        let publicId = urlOrPublicId;
        
        // Extract public ID if full URL is passed
        if (urlOrPublicId.includes('http') || urlOrPublicId.includes('cloudinary.com')) {
          const parts = urlOrPublicId.split('/upload/');
          if (parts.length > 1) {
            const pathWithVersion = parts[1]; // e.g. "v17129381/fabish/products/filename.jpg"
            const pathParts = pathWithVersion.split('/');
            // Remove version part (e.g. "v17129381") if it starts with 'v' and is numeric
            if (pathParts[0].startsWith('v') && !isNaN(pathParts[0].substring(1))) {
              pathParts.shift();
            }
            const pathWithoutVersion = pathParts.join('/'); // e.g. "fabish/products/filename.jpg"
            publicId = pathWithoutVersion.substring(0, pathWithoutVersion.lastIndexOf('.')) || pathWithoutVersion;
          }
        }

        if (publicId && !publicId.startsWith('local/')) {
          await cloudinary.uploader.destroy(publicId);
          console.log(`Cloudinary file destroyed successfully: ${publicId}`);
        }
      } catch (error) {
        console.error('Cloudinary image deletion failed:', error);
      }
    }

    // Local file fallback removal
    let localPath = null;
    if (urlOrPublicId.startsWith('/uploads/')) {
      localPath = urlOrPublicId;
    } else if (urlOrPublicId.startsWith('local/')) {
      const filenameWithoutExt = urlOrPublicId.substring(6); // Remove 'local/'
      const uploadsDir = path.join(__dirname, '../..', 'uploads');
      if (fs.existsSync(uploadsDir)) {
        try {
          const files = fs.readdirSync(uploadsDir);
          const match = files.find(f => f.startsWith(filenameWithoutExt));
          if (match) {
            localPath = `/uploads/${match}`;
          }
        } catch (err) {
          console.error('Error reading uploads directory:', err.message);
        }
      }
    }

    if (localPath) {
      const filePath = path.join(__dirname, '../..', localPath);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Local file removed: ${filePath}`);
        }
      } catch (err) {
        console.error(`Failed to delete local file ${filePath}:`, err.message);
      }
    }
  }
}

module.exports = new UploadService();
