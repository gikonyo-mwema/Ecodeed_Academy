/**
 * PostCard Component
 * 
 * A reusable card component for displaying blog post previews throughout the application.
 * This component provides a consistent interface for showing post information in various layouts.
 * 
 * Features:
 * - Responsive design with mobile-first approach
 * - Image handling with fallbacks and loading states
 * - Category-based color coding
 * - Content excerpt generation
 * - Author information display
 * - View count tracking
 * - Hover effects and animations
 * - SEO-friendly links
 * 
 * Props:
 * - post: Post object with title, content, image, author, etc.
 * - isCompact: Boolean for compact layout mode
 * - className: Additional CSS classes for customization
 * 
 * Image Handling:
 * - Uses featured image if available
 * - Extracts first image from content as fallback
 * - Default placeholder image for posts without images
 * - Lazy loading and error handling
 * 
 * @component
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiEye } from 'react-icons/fi';
import { getDefaultImageUrl } from "../utils/cloudinary";
import { getCategoryColorClass, formatCategoryLabel } from "../utils/categories";

// Default profile picture for authors without custom images
const defaultProfilePic = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

/**
 * PostCard Component
 * Displays a blog post preview with image, title, excerpt, and metadata
 * 
 * @param {Object} props - Component props
 * @param {Object} props.post - Post object containing all post data
 * @param {boolean} props.isCompact - Whether to use compact layout (default: false)
 * @param {string} props.className - Additional CSS classes (default: '')
 * @returns {JSX.Element} Post card component
 */
export default function PostCard({ post, isCompact = false, className = '' }) {
  // Image loading state management
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  
  /**
   * Category color mapping for visual categorization
   * Each category has specific colors for light and dark themes
   */
  // Color mapping moved to utils/categories to keep consistent across app

  /**
   * Helper function to extract first image from HTML content
   * Used as fallback when no featured image is available
   * 
   * @param {string} html - HTML content string
   * @returns {string|null} Image URL or null if no image found
   */
  const extractFirstImage = (html) => {
    if (!html) return null;
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const img = doc.querySelector('img');
    return img ? img.src : null;
  };

  /**
   * Effect to handle image loading and fallbacks
   * Determines the best image to display and handles loading states
   */
  useEffect(() => {
    const contentImage = post?.content ? extractFirstImage(post.content) : null;
    const imageToUse = post?.image || contentImage;
    
    if (imageToUse) {
      const img = new Image();
      img.src = imageToUse;
      img.onload = () => {
        setCurrentImage(imageToUse);
        setImageLoaded(true);
      };
      img.onerror = () => {
        setCurrentImage(getDefaultImageUrl());
        setImageLoaded(true);
      };
    } else {
      setCurrentImage(getDefaultImageUrl());
      setImageLoaded(true);
    }
  }, [post]);

  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html || '';
    return tmp.textContent || tmp.innerText || '';
  };

  const readingTime = Math.ceil((post?.content || '').split(' ').length / 200);
  const formattedDate = new Date(post?.createdAt || new Date()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const cleanExcerpt = post?.excerpt 
    ? stripHtml(post.excerpt)
    : stripHtml(post?.content || '').substring(0, 120) + '...';

  return (
    <div className={`rounded-lg shadow-md overflow-hidden hover:shadow-[0_4px_12px_rgba(5,24,54,0.2)] hover:ring-1 hover:ring-brand-blue transition-all duration-300 h-full flex flex-col bg-white dark:bg-gray-800 dark:shadow-gray-900/50 ${className}`}>
      {/* Image Container */}
      <Link 
        to={`/post/${post?.slug || '#'}`} 
        className="block relative overflow-hidden group"
        style={{
          aspectRatio: '16/9',
          backgroundColor: !imageLoaded ? '#f3f4f6' : 'transparent'
        }}
      >
        {currentImage && (
          <img
            src={currentImage}
            alt={post?.title || 'Post image'}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            } group-hover:scale-105 transition-transform duration-500`}
            loading="lazy"
            onError={() => {
              setCurrentImage(getDefaultImageUrl());
              setImageLoaded(true);
            }}
          />
        )}

        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        )}

        {post?.category && (
          <div className="absolute top-2 right-2 z-10">
            <Link 
              to={`/search?category=${encodeURIComponent(post.category)}`}
              onClick={(e) => e.stopPropagation()}
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                getCategoryColorClass(post.category)
              } shadow-sm hover:opacity-80 transition-opacity`}
            >
              {formatCategoryLabel(post.category)}
            </Link>
          </div>
        )}
      </Link>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className={`font-bold mb-2 line-clamp-2 ${
          isCompact ? 'text-lg' : 'text-xl'
        } text-gray-900 dark:text-white`}>
          <Link 
            to={`/post/${post?.slug || '#'}`} 
            className="hover:text-brand-green dark:hover:text-brand-green transition-colors"
          >
            {post?.title || 'Untitled Post'}
          </Link>
        </h3>

        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 flex-1">
          {cleanExcerpt}
        </p>

        {/* Footer Section */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-auto whitespace-nowrap overflow-hidden">
          <div className="flex items-center space-x-2 overflow-hidden">
            <Link 
              to={`/user/${post?.userId || ''}`} 
              className="flex items-center space-x-2 hover:underline truncate"
            >
              <img 
                src={post?.userId?.profilePicture || defaultProfilePic} 
                alt={post?.userId?.username || 'Author'}
                className="w-5 h-5 rounded-full object-cover flex-shrink-0 border border-gray-200 dark:border-gray-600"
                onError={(e) => {
                  e.target.src = defaultProfilePic;
                }}
              />
              <span className="font-medium hover:text-brand-green dark:hover:text-brand-green transition-colors truncate">
                {post?.userId?.username || 'Eco Author'}
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <span className="truncate">{formattedDate}</span>
            <FiEye className="text-gray-400 dark:text-gray-500" />
            <span>{post?.views || 0}</span>
            <span className="hidden sm:inline">&bull; {readingTime} min read</span>
          </div>
        </div>
      </div>
    </div>
  );
}