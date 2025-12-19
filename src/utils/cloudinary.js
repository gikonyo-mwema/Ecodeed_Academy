/**
 * Cloudinary Integration Utility
 * 
 * This module provides comprehensive Cloudinary integration for the client-side application.
 * It handles image transformations, optimization, and URL generation for various use cases.
 * 
 * Features:
 * - Automatic image optimization based on device and context
 * - Responsive image generation
 * - Multiple transformation presets for different use cases
 * - Error handling and fallback images
 * - Configuration validation
 * - Performance optimization for web delivery
 * 
 * Transformations Provided:
 * - Thumbnail generation
 * - Quality optimization
 * - Format conversion (WebP, AVIF)
 * - Responsive sizing
 * - SEO-friendly URLs
 * 
 * @module CloudinaryUtils
 * @version 2.0.0
 * @author Gikonyo Mwema
 */

import { Cloudinary as CoreCloudinary, Util } from 'cloudinary-core';

/**
 * Cloudinary Configuration
 * Environment-based configuration for Cloudinary service
 */
const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dcrubaesi',
  uploadPreset: import.meta.env.VITE_UPLOAD_PRESET || 'ml_default',
  defaultImage: 'v1745060667/uploads/zsowafnaoebrvrivbca8', // Fallback image public ID
  defaultFolder: 'blog_uploads' // Default upload folder
};

// Initialize Cloudinary core instance with secure delivery
const cld = new CoreCloudinary({
  cloud_name: cloudinaryConfig.cloudName,
  secure: true // Always use HTTPS
});

// Validate configuration on module load (with fallbacks)
if (!cloudinaryConfig.cloudName || !cloudinaryConfig.uploadPreset) {
  console.warn('Missing Cloudinary configuration. Using fallback values:');
  console.warn('VITE_CLOUDINARY_CLOUD_NAME, VITE_UPLOAD_PRESET');
  console.warn('Set these environment variables in Vercel dashboard for full functionality');
  
  // Use fallback values instead of throwing error
  cloudinaryConfig.cloudName = cloudinaryConfig.cloudName || 'dcrubaesi';
  cloudinaryConfig.uploadPreset = cloudinaryConfig.uploadPreset || 'ml_default';
}

/**
 * Generates optimized Cloudinary URL with transformations
 * 
 * Creates optimized image URLs with various transformations for web delivery.
 * Supports automatic format detection, quality optimization, and responsive sizing.
 * 
 * @param {string} publicId - Cloudinary public ID or URL
 * @param {object} [options] - Transformation options
 * @returns {string} Optimized URL
 */
export const getCloudinaryUrl = (publicId, options = {}) => {
  if (!publicId) {
    return cld.url(cloudinaryConfig.defaultImage, {
      transformation: buildTransformations(options)
    });
  }

  if (publicId.includes('res.cloudinary.com')) {
    const urlParts = publicId.split('/upload/');
    return `${urlParts[0]}/upload/${buildTransformationString(options)}/${urlParts[1]}`;
  }

  const finalPublicId = publicId.startsWith('uploads/') 
    ? publicId 
    : `${cloudinaryConfig.defaultFolder}/${publicId}`;

  return cld.url(finalPublicId, {
    transformation: buildTransformations(options)
  });
};

/**
 * Uploads image to Cloudinary (client-side)
 * @param {File} file - Image file to upload
 * @param {object} [options] - Upload options
 * @returns {Promise<CloudinaryUploadResponse>}
 */
export const uploadToCloudinary = async (file, options = {}) => {
  validateFile(file);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', cloudinaryConfig.uploadPreset);
  formData.append('folder', options.folder || cloudinaryConfig.defaultFolder);

  if (options.tags) {
    formData.append('tags', options.tags.join(','));
  }

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`,
      { method: 'POST', body: formData }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    return processUploadResponse(await response.json());
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
};

/**
 * Gets default image URL with transformations
 * @param {object} [options] - Transformation options
 * @returns {string} URL
 */
export const getDefaultImageUrl = (options = {}) => {
  return getCloudinaryUrl(cloudinaryConfig.defaultImage, options);
};

// Helper functions
const buildTransformations = (options) => {
  return [
    { width: options.width || 1200, crop: options.crop || 'limit' },
    { quality: 'auto:best' },
    { fetch_format: 'auto' }
  ].filter(t => t);
};

const validateFile = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Allowed: JPEG, PNG, WEBP, GIF');
  }

  if (file.size > maxSize) {
    throw new Error(`File exceeds ${maxSize/1024/1024}MB limit`);
  }
};

const processUploadResponse = (data) => ({
  url: data.secure_url,
  publicId: data.public_id,
  width: data.width,
  height: data.height,
  format: data.format,
  bytes: data.bytes,
  createdAt: data.created_at
});

// Modern named exports
export const Cloudinary = {
  getUrl: getCloudinaryUrl,
  upload: uploadToCloudinary,
  getDefault: getDefaultImageUrl,
  // Note: Remove client-side delete as it requires auth credentials
  config: cloudinaryConfig
};

export default Cloudinary;
// Add this function to handle responsive image URLs
export const getResponsiveImageUrl = (publicId, options = {}) => {
  const transforms = [
    { width: options.width || 'auto', crop: 'scale' },
    { quality: 'auto:good' },
    { dpr: 'auto' },
    { fetch_format: 'auto' }
  ];
  
  return getCloudinaryUrl(publicId, { transformation: transforms });
};