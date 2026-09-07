/**
 * PostPage — Full blog-post view (industry-standard implementation).
 *
 * Key improvements over the previous version:
 *  1. SEO — <Helmet> meta tags + JSON-LD structured data via PostSEO
 *  2. XSS — DOMPurify sanitisation via PostContent (no raw dangerouslySetInnerHTML)
 *  3. TOC — Auto-generated table of contents from h2/h3 headings
 *  4. Social — Functional share buttons (Twitter, Facebook, LinkedIn, etc.)
 *  5. Views — Fires a GET /api/v1/posts/:id/ to atomically increment view count
 *  6. Recommended — Single API call to /api/v1/posts/recommended/:id/ (same-category first)
 *  7. Author — Reads from `post.user` object (first/last name, profile picture)
 *  8. Reading time — Uses server-computed `reading_time` field
 *  9. Semantic HTML — <article>, <header>, <footer>, <time>, <figure>
 * 10. Accessibility — aria-labels, focus-visible, back-to-top
 *
 * @version 2.0.0
 */
import { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from 'flowbite-react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowUp, FiClock } from 'react-icons/fi';
import { FaExclamationTriangle } from 'react-icons/fa';

import CallToAction from '../components/CallToAction';
import CommentSection from '../components/CommentSection';
import PostCard from '../components/PostCard';
import PostSEO from '../components/PostPage/PostSEO';
import PostContent from '../components/PostPage/PostContent';
import TableOfContents from '../components/PostPage/TableOfContents';
import SocialShareButtons from '../components/PostPage/SocialShareButtons';

import { getCategoryColorClass, formatCategoryLabel } from '../utils/categories';
import { getDefaultImageUrl } from '../utils/cloudinary';
import { apiFetch } from '../utils/api';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const DEFAULT_AVATAR =
  'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
/** Build a display name from the user object the serialiser returns. */
function getAuthorName(user) {
  if (!user) return 'Eco Author';
  const first = user.firstName || user.first_name || '';
  const last = user.lastName || user.last_name || '';
  const full = `${first} ${last}`.trim();
  return full || user.username || 'Eco Author';
}

/** Extract post list from the (possibly wrapped) API response. */
function extractPosts(data) {
  return data?.results || data?.posts || data?.data?.posts || [];
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------
function PostSkeleton() {
  return (
    <div className="p-3 flex flex-col max-w-4xl mx-auto min-h-screen animate-pulse" aria-busy="true">
      {/* Title */}
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4 mx-auto mt-10" />
      {/* Author row */}
      <div className="flex items-center gap-3 justify-center mt-6">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-36" />
        </div>
      </div>
      {/* Category pill */}
      <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mt-4" />
      {/* Hero image */}
      <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-lg w-full mt-8" />
      {/* Content lines */}
      <div className="space-y-3 mt-10 w-full">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
            style={{ width: `${85 + Math.random() * 15}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------
function PostError() {
  return (
    <div className="flex justify-center items-center min-h-screen flex-col gap-3" role="alert">
      <FaExclamationTriangle className="text-red-500 text-5xl" />
      <h1 className="text-xl font-medium">Failed to load post</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        The article may have been removed or the link is incorrect.
      </p>
      <Button color="gray" onClick={() => window.location.reload()}>
        Try Again
      </Button>
    </div>
  );
}

// =========================================================================
// Main component
// =========================================================================
export default function PostPage() {
  const { postSlug } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [post, setPost] = useState(null);
  const [recommendedPosts, setRecommendedPosts] = useState([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Prevent double view-count increment in React StrictMode
  const viewCounted = useRef(false);

  // ----- Fetch post by slug -----
  useEffect(() => {
    let cancelled = false;

    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(false);
        viewCounted.current = false;

        const data = await apiFetch(`/api/v1/posts/?slug=${postSlug}`);
        const posts = extractPosts(data);

        if (cancelled) return;

        if (posts.length > 0) {
          setPost(posts[0]);
        } else {
          setError(true);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('PostPage fetch error:', err);
          setError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPost();
    return () => { cancelled = true; };
  }, [postSlug]);

  // ----- Increment view count (fire-and-forget via retrieve endpoint) -----
  useEffect(() => {
    if (!post?._id || viewCounted.current) return;
    viewCounted.current = true;

    // The retrieve endpoint atomically increments views
    apiFetch(`/api/v1/posts/${post._id}/`).catch(() => {});
  }, [post?._id]);

  // ----- Fetch recommended posts (single API call) -----
  useEffect(() => {
    if (!post?._id) return;
    let cancelled = false;

    const fetchRecommended = async () => {
      try {
        const data = await apiFetch(`/api/v1/posts/recommended/${post._id}/?limit=3`);
        if (!cancelled) {
          const posts = data?.posts || extractPosts(data);
          setRecommendedPosts(posts.slice(0, 3));
        }
      } catch {
        // Non-critical — silently fail
      }
    };

    fetchRecommended();
    return () => { cancelled = true; };
  }, [post?._id]);

  // ----- Scroll progress bar + back-to-top visibility -----
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        const progress = scrollHeight <= clientHeight ? 0 : (scrollTop / (scrollHeight - clientHeight)) * 100;
        setScrollProgress(progress);
        setShowBackToTop(scrollTop > 400);
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ----- Derived values -----
  const authorName = getAuthorName(post?.user);
  const authorAvatar = post?.user?.profilePicture || post?.user?.profile_picture || DEFAULT_AVATAR;
  const authorId = post?.user?.id || post?.user?._id || post?.userId;
  const categorySlug = post?.category_detail?.slug || post?.category || '';
  const categoryLabel = post?.category_detail?.name || formatCategoryLabel(post?.category);
  const readingTime = post?.reading_time ?? 0;
  const publishDate = post?.publishedAt || post?.published_at || post?.createdAt || post?.created_at;

  // ----- Render states -----
  if (loading) return <PostSkeleton />;
  if (error || !post) return <PostError />;

  return (
    <>
      {/* SEO meta tags + JSON-LD structured data */}
      <PostSEO post={post} />

      {/* Scroll progress indicator */}
      <div
        className="fixed top-0 left-0 h-1 bg-teal-500 z-50 transition-[width] duration-150"
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
      />

      {/* Back to top */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-teal-500 text-white rounded-full shadow-lg hover:bg-teal-600 focus-visible:ring-2 focus-visible:ring-teal-400 transition-colors z-40"
          aria-label="Scroll back to top"
        >
          <FiArrowUp size={20} />
        </button>
      )}

      <article className="flex flex-col max-w-6xl mx-auto min-h-screen bg-white dark:bg-brand-blue dark:text-gray-100">

        {/* ============ HEADER ============ */}
        <header className="px-4 pt-10 max-w-6xl mx-auto w-full text-center">
          {/* Category pill */}
          <Link
            to={`/search?category=${encodeURIComponent(categorySlug)}`}
            className="inline-block mb-4"
          >
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCategoryColorClass(post?.category)}`}>
              {categoryLabel}
            </span>
          </Link>

          {/* Title */}
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-serif font-bold leading-tight">
            {post.title}
          </h1>

          {/* Excerpt / subtitle */}
          {post.excerpt && (
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {post.excerpt}
            </p>
          )}

          {/* Author row */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <img
              src={authorAvatar}
              alt={authorName}
              className="w-10 h-10 rounded-full object-cover"
              width={40}
              height={40}
              onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
            />
            <div className="text-left">
              <Link
                to={`/user/${authorId}`}
                className="font-medium text-sm hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                {authorName}
              </Link>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                {publishDate && (
                  <time dateTime={new Date(publishDate).toISOString()}>
                    {new Date(publishDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                )}
                {readingTime > 0 && (
                  <>
                    <span aria-hidden="true">&bull;</span>
                    <span className="flex items-center gap-1">
                      <FiClock size={12} />
                      {readingTime} min read
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ============ TOOLBAR (share) ============ */}
        <div className="flex items-center justify-end px-4 py-3 border-b border-gray-200 dark:border-gray-700 mx-auto w-full max-w-6xl text-sm">
          <SocialShareButtons post={post} />
        </div>

        {/* ============ CONTENT AREA ============ */}
        <div className="max-w-6xl mx-auto w-full px-4 mt-8 relative">
          {/* TOC (full-width, collapsible on mobile) */}
          <div className="mb-8">
            <TableOfContents contentHtml={post.content} />
          </div>

          {/* ============ HERO IMAGE ============ */}
          {post.image && (
            <figure className="mb-8 flex justify-center">
              <img
                src={post.image}
                alt={post.title}
                className="max-w-3xl w-full rounded-xl shadow-lg"
                loading="eager"
                decoding="async"
                onError={(e) => { e.target.src = getDefaultImageUrl(); }}
              />
            </figure>
          )}

          <PostContent html={post.content} />

          {/* Tags */}
          {post.tags_detail && post.tags_detail.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
              {post.tags_detail.map((tag) => (
                <Link
                  key={tag.id || tag.slug}
                  to={`/search?tag=${tag.slug}`}
                  className="px-3 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-teal-100 dark:hover:bg-teal-900 transition-colors"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ============ CALL TO ACTION ============ */}
        <div className="max-w-6xl mx-auto w-full px-4 mt-12">
          <CallToAction
            type="services"
            title="Need Professional Environmental Consulting?"
            subtitle="Explore our comprehensive environmental impact assessment and audit services."
            primaryButtonText="View Services"
            secondaryButtonText="Contact Us"
            showNewsletter={true}
          />
        </div>

        {/* ============ COMMENTS ============ */}
        <div className="max-w-6xl mx-auto w-full px-4">
          <CommentSection postId={post._id} />
        </div>

        {/* ============ RECOMMENDED ARTICLES ============ */}
        {recommendedPosts.length > 0 && (
          <footer className="w-full max-w-6xl mx-auto px-4 mt-12 mb-10">
            <h2 className="text-xl font-semibold text-center mb-6">
              Recommended Articles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedPosts.map((rec) => (
                <PostCard key={rec._id || rec.id} post={rec} />
              ))}
            </div>
          </footer>
        )}
      </article>
    </>
  );
}