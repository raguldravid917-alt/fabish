/**
 * Helper to map Shopify CDN or placeholder image URLs to local public assets.
 * All storefront images downloaded from Google Drive are located in `/assets/homepage/`
 */
export const getLocalImageUrl = (url) => {
  if (!url) return '/assets/homepage/P1.jpg'; // fallback

  // Extract string URL if input is a Cloudinary/MongoDB image object
  let urlStr = typeof url === 'object' && url !== null ? (url.secure_url || url.url) : url;
  if (!urlStr || typeof urlStr !== 'string') return '/assets/homepage/P1.jpg';

  // Replace offline via.placeholder.com URLs with functional placehold.co URLs
  if (urlStr.includes('via.placeholder.com')) {
    urlStr = urlStr.replace('via.placeholder.com', 'placehold.co');
  }

  if (urlStr.startsWith('/assets/')) {
    return urlStr;
  }

  // Prepend backend URL for local uploads
  if (urlStr.startsWith('/uploads/')) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const backendUrl = apiUrl.replace(/\/api$/, '');
    return `${backendUrl}${urlStr}`;
  }

  // If it's a Cloudinary URL, placeholder URL, or another non-Shopify HTTP URL, return directly
  if ((urlStr.startsWith('http') || urlStr.includes('cloudinary.com')) && !urlStr.includes('shopify.com')) {
    return urlStr;
  }

  let filename = '';
  try {
    // Extract the filename from the Shopify URL or general URL
    // e.g. "https://fabish-theme.myshopify.com/cdn/shop/files/1.jpg?v=1711344342&width=533" -> "1.jpg"
    const urlObj = new URL(urlStr);
    const pathname = urlObj.pathname;
    filename = pathname.substring(pathname.lastIndexOf('/') + 1);
  } catch (err) {
    // If it's not a valid URL (e.g. just a relative path or filename)
    const parts = urlStr.split('/');
    filename = parts[parts.length - 1].split('?')[0];
  }

  // Handle specific known missing/renamed files from the Google Drive download
  if (filename === '7.jpg') return '/assets/homepage/9.jpg';
  if (filename === '13.jpg') return '/assets/homepage/12.jpg';
  if (filename === '22.jpg') return '/assets/homepage/20.jpg';
  if (filename === 'P1_a.jpg') return '/assets/homepage/P1 (1).jpg';

  return `/assets/homepage/${filename}`;
};