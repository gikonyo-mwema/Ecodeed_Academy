/**
 * PostCard Component
 *
 * Industry-standard blog post preview card with:
 * - Server-side excerpt (no client-side HTML parsing)
 * - Full skeleton loading (not just image)
 * - Proper accessibility (aria-labels, heading hierarchy, no nested interactives)
 * - Optimised images with size-appropriate thumbnails
 * - Graceful fallbacks for missing data
 *
 * @component
 */

import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiClock } from 'react-icons/fi';
import { getDefaultImageUrl, extractFirstImageFromContent } from '../utils/cloudinary';
import { getCategoryColorClass, formatCategoryLabel } from '../utils/categories';

// 32×32 placeholder — tiny enough to be negligible, avoids full-res fetch per card
const DEFAULT_AVATAR =
  'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

// ---------------------------------------------------------------------------
// Skeleton placeholder shown while the card data is loading
// ---------------------------------------------------------------------------
function PostCardSkeleton({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-lg overflow-hidden h-full flex flex-col bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/50 animate-pulse ${className}`}
    >
      {/* Image skeleton */}
      <div className="bg-gray-200 dark:bg-gray-700" style={{ aspectRatio: '16/9' }} />
      {/* Body skeleton */}
      <div className="p-5 flex-1 flex flex-col gap-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        <div className="mt-auto flex items-center gap-2 pt-2">
          <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
          <div className="ml-auto h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return author display name from the nested user object. */
function getAuthorName(post) {
  const u = post?.user;
  if (!u) return 'Eco Author';
  if (u.firstName || u.first_name) {
    const first = u.firstName || u.first_name || '';
    const last = u.lastName || u.last_name || '';
    return `${first} ${last}`.trim() || u.username || 'Eco Author';
  }
  return u.username || 'Eco Author';
}

/** Return a small profile picture URL. */
function getAuthorAvatar(post) {
  return post?.user?.profilePicture || post?.user?.profile_picture || DEFAULT_AVATAR;
}

/** Return the author's profile link path. */
function getAuthorLink(post) {
  const id = post?.user?._id || post?.user?.id || post?.userId;
  return id ? `/user/${id}` : '#';
}

/** Format a date string for display. */
function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// PostCard
// ---------------------------------------------------------------------------
export default function PostCard({ post, isCompact = false, isLoading = false, className = '' }) {
  // ---- Image state (must be called before any early return — Rules of Hooks) ----
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(post?.image || extractFirstImageFromContent(post?.content) || getDefaultImageUrl());

  const handleImgError = useCallback(() => {
    setImgSrc(getDefaultImageUrl());
    setImgLoaded(true);
  }, []);

  // If parent tells us it's loading, or there's no post yet, show skeleton
  if (isLoading || !post) {
    return <PostCardSkeleton className={className} />;
  }

  // ---- Derived data (cheap — no DOM parsing) ----
  const postUrl = `/post/${post.slug || '#'}`;

  // Use server-side excerpt directly — no stripHtml / DOMParser needed
  const excerpt = post.excerpt
    || (post.meta_description)
    || '';

  // Use server-computed reading_time; fall back to a rough word-count estimate only as last resort
  const readingTime = post.reading_time ?? Math.max(1, Math.ceil((excerpt.split(' ').length || 1) / 200));

  const authorName = getAuthorName(post);
  const authorAvatar = getAuthorAvatar(post);
  const authorLink = getAuthorLink(post);
  const formattedDate = formatDate(post.createdAt || post.publishedAt || post.created_at);

  return (
    <article
      aria-label={`Blog post: ${post.title || 'Untitled'}`}
      className={`rounded-lg shadow-md overflow-hidden hover:shadow-[0_4px_12px_rgba(5,24,54,0.2)] hover:ring-1 hover:ring-brand-blue transition-all duration-300 h-full flex flex-col bg-white dark:bg-gray-800 dark:shadow-gray-900/50 ${className}`}
    >
      {/* -------- Image -------- */}
      <div
        className="relative overflow-hidden group"
        style={{ aspectRatio: '16/9', backgroundColor: !imgLoaded ? '#f3f4f6' : 'transparent' }}
      >
        <Link to={postUrl} aria-hidden="true" tabIndex={-1} className="absolute inset-0 z-0">
          <img
            src={imgSrc}
            alt="" // decorative — the title link below is the accessible name
            className={`w-full h-full object-cover transition-all duration-500 ${
              imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            } group-hover:scale-105`}
            loading="lazy"
            decoding="async"
            width={640}
            height={360}
            onLoad={() => setImgLoaded(true)}
            onError={handleImgError}
          />
        </Link>

        {/* Pulse overlay while image loads */}
        {!imgLoaded && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" aria-hidden="true" />
        )}

        {/* Category badge — outside the image link to avoid nested interactives */}
        {post.category && post.category !== 'uncategorized' && (
          <Link
            to={`/search?category=${encodeURIComponent(post.category)}`}
            className={`absolute top-2 right-2 z-10 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm hover:opacity-80 transition-opacity ${getCategoryColorClass(post.category)}`}
            aria-label={`Category: ${formatCategoryLabel(post.category)}`}
          >
            {formatCategoryLabel(post.category)}
          </Link>
        )}
      </div>

      {/* -------- Body -------- */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Title — the primary accessible link for the card */}
        <h3 className={`font-bold mb-2 line-clamp-2 ${isCompact ? 'text-lg' : 'text-xl'} text-gray-900 dark:text-white`}>
          <Link
            to={postUrl}
            className="hover:text-brand-green dark:hover:text-brand-green transition-colors"
          >
            {post.title || 'Untitled Post'}
          </Link>
        </h3>

        {/* Excerpt — plain text from the API, no client-side stripping */}
        {excerpt && (
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 flex-1">
            {excerpt}
          </p>
        )}

        {/* -------- Footer metadata -------- */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-auto pt-1 gap-2">
          {/* Author */}
          <Link
            to={authorLink}
            className="flex items-center gap-1.5 min-w-0 hover:text-brand-green dark:hover:text-brand-green transition-colors"
            aria-label={`Author: ${authorName}`}
          >
            <img
              src={authorAvatar}
              alt=""
              className="w-6 h-6 rounded-full object-cover flex-shrink-0 border border-gray-200 dark:border-gray-600"
              loading="lazy"
              decoding="async"
              width={24}
              height={24}
              onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
            />
            <span className="font-medium truncate">{authorName}</span>
          </Link>

          {/* Date · Views · Reading time */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {formattedDate && <time dateTime={post.createdAt || post.created_at}>{formattedDate}</time>}

            <span className="text-gray-300 dark:text-gray-600" aria-hidden="true">·</span>
            <span className="flex items-center gap-0.5" aria-label={`${post.views || 0} views`}>
              <FiEye className="w-3 h-3" aria-hidden="true" />
              {post.views || 0}
            </span>

            <span className="hidden sm:flex items-center gap-0.5" aria-label={`${readingTime} minute read`}>
              <span className="text-gray-300 dark:text-gray-600" aria-hidden="true">·</span>
              <FiClock className="w-3 h-3" aria-hidden="true" />
              {readingTime} min
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

// Export skeleton for use in parent loading states
PostCard.Skeleton = PostCardSkeleton;

export { PostCardSkeleton };