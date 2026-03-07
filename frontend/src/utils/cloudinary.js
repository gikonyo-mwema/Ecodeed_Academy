/**
 * Cloudinary URL Utilities
 *
 * Provides helpers for generating optimized Cloudinary image URLs and
 * fallback/default images. All actual uploads go through the Django
 * backend (POST /api/v1/upload/upload) which handles validation and
 * server-side Cloudinary upload securely.
 *
 * @module CloudinaryUtils
 * @version 3.0.0
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dcrubaesi';

/**
 * Base Cloudinary delivery URL.
 * All generated URLs use HTTPS for secure delivery.
 */
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

/**
 * Default fallback image public ID (hosted on Cloudinary).
 */
const DEFAULT_IMAGE_ID = 'v1745060667/uploads/zsowafnaoebrvrivbca8';

/**
 * Build a Cloudinary transformation string from options.
 *
 * @param {object} options
 * @param {number} [options.width]  - Resize width
 * @param {number} [options.height] - Resize height
 * @param {string} [options.crop]   - Crop mode (limit, fill, scale, etc.)
 * @param {string} [options.quality] - Quality (auto:good, auto:best, etc.)
 * @param {string} [options.gravity] - Gravity (face, center, etc.)
 * @returns {string} e.g. "w_1200,c_limit,q_auto:good,f_auto"
 */
const buildTransformationString = (options = {}) => {
  const parts = [];
  if (options.width) parts.push(`w_${options.width}`);
  if (options.height) parts.push(`h_${options.height}`);
  if (options.crop) parts.push(`c_${options.crop}`);
  else if (options.width || options.height) parts.push('c_limit');
  if (options.gravity) parts.push(`g_${options.gravity}`);
  parts.push(`q_${options.quality || 'auto:good'}`);
  parts.push('f_auto');
  return parts.join(',');
};

/**
 * Generate an optimized Cloudinary URL.
 *
 * Accepts either a full Cloudinary URL or a public ID. Inserts
 * transformation parameters for automatic format & quality optimization.
 *
 * @param {string} publicIdOrUrl - Cloudinary public_id or full URL
 * @param {object} [options] - Transformation options
 * @returns {string} Optimized HTTPS URL
 */
export const getCloudinaryUrl = (publicIdOrUrl, options = {}) => {
  if (!publicIdOrUrl) {
    return `${BASE_URL}/${buildTransformationString(options)}/${DEFAULT_IMAGE_ID}`;
  }

  // If it's already a full Cloudinary URL, insert transformations
  if (publicIdOrUrl.includes('res.cloudinary.com')) {
    const parts = publicIdOrUrl.split('/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/upload/${buildTransformationString(options)}/${parts[1]}`;
    }
    return publicIdOrUrl; // Can't parse — return as-is
  }

  // Treat as a public_id
  return `${BASE_URL}/${buildTransformationString(options)}/${publicIdOrUrl}`;
};

/**
 * Get the default/fallback image URL with optional transformations.
 *
 * @param {object} [options] - Transformation options
 * @returns {string} URL
 */
export const getDefaultImageUrl = (options = {}) => {
  return getCloudinaryUrl(DEFAULT_IMAGE_ID, options);
};

export default { getCloudinaryUrl, getDefaultImageUrl };