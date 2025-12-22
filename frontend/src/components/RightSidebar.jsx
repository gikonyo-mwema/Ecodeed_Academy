import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiEye, HiClock, HiTag } from 'react-icons/hi';
import { apiFetch } from '../utils/api';

export default function RightSidebar() {
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState('');

  // Fetch trending posts
  useEffect(() => {
    const fetchTrendingPosts = async () => {
      try {
        const data = await apiFetch('/api/posts/trending');
        setTrendingPosts(data.data.posts || []);
      } catch (error) {
        console.error('Error fetching trending posts:', error);
      }
    };

    fetchTrendingPosts();
  }, []);

  // Fetch recent posts and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching sidebar data...');
        
        // Get recent posts
        const recentData = await apiFetch('/api/posts/getPosts?limit=5&order=desc');
        setRecentPosts(recentData.data.posts || []);

        // Get all posts to calculate category stats
        const allPostsData = await apiFetch('/api/posts/getPosts?limit=100');
        const posts = allPostsData.data.posts || [];
        
        console.log('✅ Sidebar data fetched successfully');
        
        // Calculate category counts
        const categoryCount = posts.reduce((acc, post) => {
          const category = post.category || 'uncategorized';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {});

        // Convert to array and sort by count
        const sortedCategories = Object.entries(categoryCount)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6); // Top 6 categories

        setCategories(sortedCategories);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching sidebar data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Newsletter subscription handler
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    setSubscribeStatus('subscribing');
    
    try {
      const data = await apiFetch('/api/messages/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      });

      setSubscribeStatus('success');
      setEmail('');
      // Reset status after 3 seconds
      setTimeout(() => setSubscribeStatus(''), 3000);
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setSubscribeStatus('error');
      setTimeout(() => setSubscribeStatus(''), 3000);
    }
  };

  return (
    <div className="w-full lg:w-80 lg:ml-6 flex-shrink-0">
      {/* Categories Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Categories
        </h3>
        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/search?category=${encodeURIComponent(category.name)}`}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <HiTag className="text-green-600 dark:text-green-400 w-4 h-4 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300 capitalize">
                    {category.name}
                  </span>
                </div>
                <span className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">
                  {category.count}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Posts Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Recent Posts
        </h3>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <Link
                key={post._id}
                to={`/post/${post.slug}`}
                className="block hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors duration-200"
              >
                <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">
                  {post.title}
                </h4>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <HiClock className="w-3 h-3 mr-1" />
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Trending Posts Section */}
      {trendingPosts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Trending Posts
          </h3>
          <div className="space-y-4">
            {trendingPosts.map((post) => (
              <Link
                key={post._id}
                to={`/post/${post.slug}`}
                className="block hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors duration-200"
              >
                <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">
                  {post.title}
                </h4>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <HiEye className="w-3 h-3 mr-1" />
                  <span>{post.views} views</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Newsletter Signup */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Subscribe to Newsletter
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
          Get the latest updates and environmental insights delivered to your inbox.
        </p>
        <form onSubmit={handleNewsletterSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={subscribeStatus === 'subscribing'}
            className="w-full px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          />
          <button
            type="submit"
            disabled={subscribeStatus === 'subscribing' || !email.trim()}
            className="w-full bg-gradient-to-r from-brand-green to-brand-yellow hover:from-brand-green/90 hover:to-brand-yellow/90 text-white font-medium py-2.5 px-4 rounded-full transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm shadow-md hover:shadow-lg"
          >
            {subscribeStatus === 'subscribing' ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
        {subscribeStatus === 'success' && (
          <p className="text-green-600 dark:text-green-400 text-sm mt-2">Successfully subscribed!</p>
        )}
        {subscribeStatus === 'error' && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-2">Subscription failed. Please try again.</p>
        )}
      </div>
    </div>
  );
}
