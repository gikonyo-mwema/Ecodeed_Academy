/**
 * Home Page Component
 * 
 * The main landing page of the MERN blog application that displays:
 * - Latest blog posts in a responsive grid layout
 * - Pagination for navigating through posts
 * - Categories for post filtering
 * - Sidebar with additional content
 * - Loading states and error handling
 * 
 * Features:
 * - Responsive design (mobile-first approach)
 * - Infinite scrolling with pagination
 * - Category-based filtering
 * - Post preview cards with images and excerpts
 * - Error handling with retry functionality
 * - Loading skeletons for better UX
 * - SEO-friendly post slugs
 * 
 * State Management:
 * - Posts array with pagination
 * - Current page tracking
 * - Loading and error states
 * - Categories for navigation
 * 
 * @component
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
import RightSidebar from '../components/RightSidebar';
import Pagination from '../components/Pagination';
import { apiFetch } from '../utils/api';

/**
 * Home Component
 * Main landing page that fetches and displays blog posts
 * 
 * @returns {JSX.Element} The home page with posts grid and sidebar
 */
export default function Home() {
  // Posts and pagination state
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Content organization
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    totalPosts: 0,
    postsPerPage: 9,  // Number of posts per page
    hasNextPage: false
  });

  /**
   * Effect to fetch posts when component mounts or page changes
   * Handles API calls, pagination, and error states
   */
  useEffect(() => {
    /**
     * Fetches posts from the API with pagination and error handling
     * @async
     * @function fetchPosts
     */
    const fetchPosts = async () => {
      const startTime = performance.now();
      console.log('🔄 Starting to fetch posts...');
      
      try {
        setLoading(true);
        setError(null);
        
        // Build query parameters for API request
        const query = new URLSearchParams({
          page: currentPage,
          limit: pagination.postsPerPage,
          order: 'desc' // Latest posts first
        }).toString();

        console.log('📡 Making API request to:', `/api/posts/getPosts?${query}`);
        
        // Fetch posts from API
        const response = await apiFetch(`/api/posts/getPosts?${query}`);
        
        const fetchTime = performance.now() - startTime;
        console.log(`✅ API request completed in ${fetchTime.toFixed(2)}ms`);
        console.log('📊 Response data:', response);
        
        // Match the backend response structure from your dashboard
        const postsData = response.data?.posts || [];
        const paginationData = response.data?.pagination || {
          totalPosts: 0,
          totalPages: 1,
          currentPage: 1,
          postsPerPage: pagination.postsPerPage,
          hasNextPage: false
        };

        console.log(`📝 Loaded ${postsData.length} posts`);

        // Update component state
        setPosts(postsData);
        setTotalPages(paginationData.totalPages);
        setPagination(paginationData);

        // Extract unique categories from posts for filtering
        const uniqueCategories = [...new Set(
          postsData.map(post => post.category)
        )].filter(Boolean);
        setCategories(uniqueCategories);

      } catch (err) {
        const fetchTime = performance.now() - startTime;
        console.error(`❌ API request failed after ${fetchTime.toFixed(2)}ms:`, err);
        console.error("Fetch error:", err);
        setError(err.message || 'Failed to load posts');
        
        // Development fallback for testing
        if (process.env.NODE_ENV === 'development') {
          console.warn('Using development fallback data');
          setPosts([{
            _id: 'dev_fallback_1',
            title: 'Sample Post (Dev Fallback)',
            content: 'This is sample data because the API failed',
            category: 'uncategorized',
            image: 'https://res.cloudinary.com/demo/image/upload/v1626283631/sample.jpg',
            createdAt: new Date().toISOString(),
            slug: 'sample-post-dev-fallback'
          }]);
          setTotalPages(1);
        }
      } finally {
        const totalTime = performance.now() - startTime;
        console.log(`⏱️ Total fetchPosts execution time: ${totalTime.toFixed(2)}ms`);
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage, pagination.postsPerPage]);

  const renderPostGrid = () => {
    if (loading) return (
      <div className="space-y-6">
        {[...Array(3)].map((_, rowIndex) => (
          <div 
            key={rowIndex} 
            className={`grid gap-6 ${rowIndex % 3 === 1 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}
          >
            {[...Array(rowIndex % 3 === 1 ? 3 : 2)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse h-full">
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-3"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );

    if (error) return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <h3 className="text-red-600 dark:text-red-400 font-bold mb-2">Loading Error</h3>
        <p className="text-red-500 dark:text-red-300">{error}</p>
        <div className="flex gap-3 mt-4">
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/40 rounded text-red-600 dark:text-red-300"
          >
            Retry
          </button>
          <button
            onClick={() => setError(null)}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-800 dark:text-gray-200"
          >
            Dismiss
          </button>
        </div>
      </div>
    );

    if (posts.length === 0) return (
      <div className="text-center py-12">
        <h3 className="text-gray-500 dark:text-gray-400 text-xl">No posts found</h3>
        <p className="text-gray-400 dark:text-gray-500">Try refreshing the page or check back later</p>
      </div>
    );

    // Create groups of posts following the 2-3-2 pattern
    const postGroups = [];
    for (let i = 0; i < posts.length; i += 7) {
      postGroups.push(posts.slice(i, i + 2));
      postGroups.push(posts.slice(i + 2, i + 5));
      postGroups.push(posts.slice(i + 5, i + 7));
    }

    return (
      <div className="space-y-6">
        {postGroups.map((group, rowIndex) => (
          <div 
            key={rowIndex} 
            className={`grid gap-6 ${group.length === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}
          >
            {group.map(post => (
              <PostCard 
                key={post._id} 
                post={post} 
                isCompact={group.length === 3}
                className="bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900 rounded-lg overflow-hidden"
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <main className="lg:w-3/4">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Latest Articles</h1>
          
          {renderPostGrid()}
          
          {totalPages > 1 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="mt-8"
            />
          )}

          {categories.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Browse Categories</h2>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Link 
                    key={category} 
                    to={`/search?category=${encodeURIComponent(category)}`}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full text-sm font-medium transition-colors text-gray-800 dark:text-gray-200"
                  >
                    {category.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </main>

        <aside className="lg:w-1/4">
          <RightSidebar 
            className="bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900 rounded-lg p-4 sticky top-4"
          />
        </aside>
      </div>
    </div>
  );
}