
import React, { useEffect, useState, useCallback } from 'react';
import { Button, Select, TextInput, Spinner, Alert } from 'flowbite-react';
import { useNavigate, useLocation } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { FiSearch, FiFilter, FiChevronDown } from 'react-icons/fi';
import { apiFetch } from '../utils/api';

export default function Search() {
    const [sidebarData, setSidebarData] = useState({
        searchTerm: '',
        sort: 'desc',
        category: 'all',
    }); 
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMore, setShowMore] = useState(false);
    const [error, setError] = useState(null);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    // Debounced fetch function
    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const urlParams = new URLSearchParams(location.search);
            const data = await apiFetch(`/api/posts/getPosts?${urlParams.toString()}`);
            const posts = data?.data?.posts || data?.posts || [];
            setPosts(posts);
            setShowMore(posts.length === 9);
        } catch (err) {
            console.error('Error fetching posts:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [location.search]);

    // Handle input changes with debounce
    const handleChange = (e) => {
        const { id, value } = e.target;
        setSidebarData(prev => ({
            ...prev,
            [id]: value,
        }));
    };

    // Apply filters and update URL
    const handleSubmit = (e) => {
        e.preventDefault();
        const urlParams = new URLSearchParams();
        urlParams.set('searchTerm', sidebarData.searchTerm);
        urlParams.set('sort', sidebarData.sort);
        if (sidebarData.category !== 'all') {
            urlParams.set('category', sidebarData.category);
        }
        navigate(`/search?${urlParams.toString()}`);
        setMobileFiltersOpen(false); // Close mobile filters after submit
    };

    // Load more posts
    const handleShowMore = async () => {
        setLoading(true);
        try {
            const startIndex = posts.length;
            const urlParams = new URLSearchParams(location.search);
            urlParams.set('startIndex', startIndex);
            
            const data = await apiFetch(`/api/posts/getPosts?${urlParams.toString()}`);
            const newPosts = data?.data?.posts || data?.posts || [];
            setPosts(prev => [...prev, ...newPosts]);
            setShowMore(newPosts.length === 9);
        } catch (err) {
            console.error('Error loading more posts:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Sync URL params with state
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        setSidebarData({
            searchTerm: urlParams.get('searchTerm') || '',
            sort: urlParams.get('sort') || 'desc',
            category: urlParams.get('category') || 'all',
        });
    }, [location.search]);

    // Fetch posts with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPosts();
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [fetchPosts]);

    // Categories could be fetched from API in a real app
    const categories = [
        { value: 'all', label: 'All Categories' },
        { value: 'climate-change', label: 'Climate Change' },
        { value: 'forest', label: 'Forest Conservation' },
        { value: 'eia', label: 'Environmental Impact' },
        { value: 'sustainability', label: 'Sustainability' },
        { value: 'policy', label: 'Environmental Policy' },
    ];

    return (
        <div className='flex flex-col md:flex-row min-h-screen'>
            {/* Mobile filter toggle */}
            <div className='md:hidden p-4 border-b border-gray-200 dark:border-gray-700'>
                <Button
                    fullSized
                    color='gray'
                    onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                >
                    <div className='flex items-center justify-between w-full'>
                        <span>Filters</span>
                        <FiFilter className='ml-2' />
                        <FiChevronDown className={`ml-2 transition-transform ${mobileFiltersOpen ? 'rotate-180' : ''}`} />
                    </div>
                </Button>
            </div>

            {/* Sidebar - Desktop & Mobile when open */}
            <div className={`${mobileFiltersOpen ? 'block' : 'hidden'} md:block w-full md:w-64 p-4 md:p-6 border-b md:border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800`}>
                <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                    <div>
                        <label htmlFor='searchTerm' className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>
                            Search
                        </label>
                        <div className='relative'>
                            <TextInput
                                id='searchTerm'
                                type='text'
                                placeholder='Search posts...'
                                value={sidebarData.searchTerm}
                                onChange={handleChange}
                                rightIcon={FiSearch}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor='sort' className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>
                            Sort By
                        </label>
                        <Select
                            id='sort'
                            value={sidebarData.sort}
                            onChange={handleChange}
                        >
                            <option value='desc'>Newest First</option>
                            <option value='asc'>Oldest First</option>
                        </Select>
                    </div>

                    <div>
                        <label htmlFor='category' className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>
                            Category
                        </label>
                        <Select
                            id='category'
                            value={sidebarData.category}
                            onChange={handleChange}
                        >
                            {categories.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <button
                        type='submit'
                        className='w-full px-4 py-2 rounded-md bg-gradient-to-r from-brand-green to-brand-yellow text-white font-semibold shadow-sm hover:from-brand-green/90 hover:to-brand-yellow/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow'
                    >
                        Apply Filters
                    </button>
                </form>
            </div>

            {/* Main content */}
            <div className='flex-1 p-4 md:p-6'>
                <div className='mb-6'>
                    <h1 className='text-2xl md:text-3xl font-bold text-gray-900 dark:text-white'>
                        Search Results
                    </h1>
                    {sidebarData.searchTerm && (
                        <p className='text-gray-600 dark:text-gray-400 mt-2'>
                            Showing results for "{sidebarData.searchTerm}"
                        </p>
                    )}
                </div>

                {/* Error message */}
                {error && (
                    <Alert color='failure' className='mb-4'>
                        {error}
                    </Alert>
                )}

                {/* Loading state */}
                {loading && posts.length === 0 && (
                    <div className='flex justify-center items-center h-64'>
                        <Spinner size='xl' />
                    </div>
                )}

                {/* No results */}
                {!loading && posts.length === 0 && !error && (
                    <div className='text-center py-12'>
                        <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                            No posts found
                        </h3>
                        <p className='mt-2 text-gray-600 dark:text-gray-400'>
                            Try adjusting your search or filter criteria
                        </p>
                    </div>
                )}

                {/* Posts grid */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {!loading && posts.map((post) => (
                        <PostCard key={post._id} post={post} />
                    ))}
                </div>

                {/* Show more button */}
                {showMore && (
                    <div className='text-center mt-8'>
                        <Button
                            gradientDuoTone='greenToBlue'
                            onClick={handleShowMore}
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Show More'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
    
