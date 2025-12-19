import React from 'react';
import { Button, Spinner, Tooltip } from 'flowbite-react';
import { useEffect, useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiEye, FiCopy, FiArrowUp } from 'react-icons/fi';
import { FaTwitter, FaFacebook, FaPinterest, FaExclamationTriangle } from 'react-icons/fa';
import CallToAction from '../components/CallToAction';
import { getCategoryColorClass, formatCategoryLabel } from '../utils/categories';
import CommentSection from '../components/CommentSection';
import PostCard from '../components/PostCard';
import { getDefaultImageUrl } from '../utils/cloudinary';
import { apiFetch } from '../utils/api';

const defaultProfilePic = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

// Category colors and label formatting centralized

const calculateReadingTime = (content) => {
  if (!content) return 0;
  const textOnly = content.replace(/<[^>]+>/g, ' ');
  const wordCount = textOnly.split(/\s+/).length;
  return Math.ceil(wordCount / 200);
};

export default function PostPage() {
  const { postSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [post, setPost] = useState(null);
  const [recommendedPosts, setRecommendedPosts] = useState([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { currentUser } = useSelector((state) => state.user);

  const readingTime = useMemo(() => calculateReadingTime(post?.content), [post?.content]);

  // Fetch the post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/api/posts/getPosts?slug=${postSlug}`);
        
        // Handle the correct response format: { success: true, data: { posts: [post] } }
        if (data.data && data.data.posts && data.data.posts.length > 0) {
          setPost(data.data.posts[0]);
        } else {
          console.error('No post found or unexpected response format:', data);
          setError(true);
          setLoading(false);
          return;
        }
        setLoading(false);
        setError(false);
      } catch (error) {
        console.error('Fetch error:', error);
        setError(true);
        setLoading(false);
      }
    };

    fetchPost();
  }, [postSlug]);

  // Fetch recommended posts (always 3 posts, not filtered by category)
  useEffect(() => {
    const fetchRecommendedPosts = async () => {
      try {
        const data = await apiFetch(`/api/posts/getPosts?limit=3`);
        
        // Handle response format: { success: true, data: { posts: [...] } }
        const posts = data.data?.posts || [];
        // Filter out the current post if it's in the results
        const filtered = posts.filter(p => p._id !== post?._id);
        // If we filtered out the current post and have less than 3, fetch more
        if (filtered.length < 3) {
          const additionalData = await apiFetch(`/api/posts/getPosts?limit=${3 - filtered.length + 1}`);
          const additionalPosts = additionalData.data?.posts || [];
          const additionalFiltered = additionalPosts.filter(p => p._id !== post?._id);
          
          // Combine and remove duplicates
          const combined = [...filtered, ...additionalFiltered];
          const unique = combined.filter((post, index, self) => 
            index === self.findIndex(p => p._id === post._id)
          );
          setRecommendedPosts(unique.slice(0, 3));
        } else {
          setRecommendedPosts(filtered.slice(0, 3));
        }
      } catch (error) {
        console.log('Recommended posts error:', error.message);
      }
    };

    fetchRecommendedPosts();
  }, [post?._id]);

  // Scroll progress indicator and back to top visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setScrollProgress(progress);
      setShowBackToTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Public page: do not block when user is not logged in.

  if (loading) return (
    <div className='p-3 flex flex-col max-w-6xl mx-auto min-h-screen'>
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mt-10 animate-pulse"></div>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mx-auto mt-5 animate-pulse"></div>
      <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded w-full mt-10 animate-pulse"></div>
      <div className="space-y-3 mt-10 max-w-4xl mx-auto w-full">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div className='flex justify-center items-center min-h-screen flex-col gap-2'>
      <FaExclamationTriangle className="text-red-500 text-4xl" />
      <h1 className='text-xl'>Failed to load post</h1>
      <Button color="gray" onClick={() => window.location.reload()}>
        Try Again
      </Button>
    </div>
  );

  return (
    <main className='p-3 flex flex-col max-w-6xl mx-auto min-h-screen bg-white dark:bg-brand-blue dark:text-gray-100'>
      {/* Scroll progress indicator */}
      <div className="fixed top-0 left-0 h-1 bg-teal-500 z-50" style={{ width: `${scrollProgress}%` }}></div>

      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-teal-500 text-white rounded-full shadow-lg hover:bg-teal-600 transition-colors z-40"
          aria-label="Back to top"
        >
          <FiArrowUp size={20} />
        </button>
      )}

      {/* Post title */}
      <h1 className='text-3xl mt-10 p-3 text-center font-serif max-w-4xl mx-auto lg:text-4xl'>
        {post?.title}
      </h1>

      {/* Author and metadata */}
      <div className="flex items-center gap-4 self-center mt-5">
        <img
          src={post?.userId?.profilePicture || defaultProfilePic}
          alt={post?.userId?.username || 'Author'}
          className="w-10 h-10 rounded-full object-cover"
          onError={(e) => {
            e.target.src = defaultProfilePic;
          }}
        />
        <div className="text-center">
          <Link 
            to={`/user/${post?.userId?._id}`} 
            className="font-medium hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            {post?.userId?.username || 'Eco Author'}
          </Link>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {post && new Date(post.createdAt).toLocaleDateString()} &bull; {readingTime} min read
          </div>
        </div>
      </div>

      {/* Category */}
      <Link
        to={`/search?category=${encodeURIComponent(post?.category || '')}`}
        className='self-center mt-3'
      >
        <Button 
          className={`${getCategoryColorClass(post?.category)}`} 
          pill 
          size='xs'
        >
          {formatCategoryLabel(post?.category)}
        </Button>
      </Link>

      {/* Post image - optimized for better reading flow */}
      <div className="mt-10 w-full max-w-4xl mx-auto">
        {post?.image && (
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-auto max-h-[450px] object-cover rounded-lg shadow-lg"
            loading="lazy"
            onError={(e) => {
              e.target.src = getDefaultImageUrl();
            }}
          />
        )}
      </div>

      {/* View count and social sharing */}
      <div className="flex items-center justify-between p-3 border-b border-slate-500 mx-auto w-full max-w-4xl text-sm">
        <div className="flex items-center gap-1">
          <FiEye className="text-gray-500 dark:text-gray-400" />
          <span className="dark:text-gray-300">{post?.views || 0} views</span>
        </div>
        <div className="flex gap-2 items-center">
          <Tooltip content="Copy link">
            <button 
              onClick={handleCopyLink}
              className="text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 p-1 rounded-full"
            >
              <FiCopy size={16} />
            </button>
          </Tooltip>
          <button className="text-gray-500 hover:text-blue-500 p-1 rounded-full">
            <FaTwitter size={16} />
          </button>
          <button className="text-gray-500 hover:text-blue-800 p-1 rounded-full">
            <FaFacebook size={16} />
          </button>
          <button className="text-gray-500 hover:text-red-500 p-1 rounded-full">
            <FaPinterest size={16} />
          </button>
        </div>
      </div>

      {/* Post content - now wider to match image */}
      <div
        className='p-3 max-w-4xl mx-auto w-full post-content dark:prose-invert prose'
        dangerouslySetInnerHTML={{ __html: post?.content }}
      ></div>

      {/* Call to action */}
      <div className='max-w-4xl mx-auto w-full'>
        <CallToAction 
          type="services"
          title="Need Professional Environmental Consulting?"
          subtitle="Explore our comprehensive environmental impact assessment and audit services."
          primaryButtonText="View Services"
          secondaryButtonText="Contact Us"
          showNewsletter={true}
        />
      </div>

      {/* Comment section */}
      <CommentSection postId={post._id} />

      {/* Recommended articles - always shows 3 posts */}
      <div className='flex flex-col justify-center items-center mb-5 mt-10'>
        <h1 className='text-xl mb-5'>Recommended articles</h1>
        <div className='flex flex-wrap gap-5 justify-center w-full max-w-6xl'>
          {recommendedPosts.map((post) => (
            <div key={post._id} className="flex-1 min-w-[300px] max-w-[400px]">
              <PostCard post={post} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}