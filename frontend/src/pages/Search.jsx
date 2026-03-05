import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Button, Select, TextInput, Spinner, Alert, Badge } from 'flowbite-react';
import { useNavigate, useLocation } from 'react-router-dom';
import PostCard, { PostCardSkeleton } from '../components/PostCard';
import { FiSearch, FiFilter, FiChevronDown, FiX, FiCalendar } from 'react-icons/fi';
import { apiFetch } from '../utils/api';

// ---------------------------------------------------------------------------
// Search page — dynamic categories + tags, date range, autocomplete
// ---------------------------------------------------------------------------
export default function Search() {
    // --- filter state ---
    const [sidebarData, setSidebarData] = useState({
        searchTerm: '',
        sort: 'desc',
        category: 'all',
        tag: '',
        dateFrom: '',
        dateTo: '',
    });

    // --- data state ---
    const [posts, setPosts] = useState([]);
    const [totalResults, setTotalResults] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showMore, setShowMore] = useState(false);
    const [error, setError] = useState(null);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    // --- categories & tags from API ---
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);

    // --- autocomplete ---
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionsRef = useRef(null);
    const suggestionsTimer = useRef(null);

    const location = useLocation();
    const navigate = useNavigate();

    // ---- Fetch categories & tags once on mount ----
    useEffect(() => {
        const load = async () => {
            try {
                const [catRes, tagRes] = await Promise.all([
                    apiFetch('/api/v1/categories/'),
                    apiFetch('/api/v1/tags/'),
                ]);
                setCategories(catRes?.results || catRes || []);
                setTags(tagRes?.results || tagRes || []);
            } catch (err) {
                console.error('Failed to load filters:', err);
            }
        };
        load();
    }, []);

    // ---- Fetch posts based on URL params ----
    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const urlParams = new URLSearchParams(location.search);
            const data = await apiFetch(`/api/posts/getPosts?${urlParams.toString()}`);
            const fetched = data?.data?.posts || data?.posts || [];
            const total = data?.data?.totalPosts ?? data?.totalPosts ?? fetched.length;
            setPosts(fetched);
            setTotalResults(total);
            setShowMore(fetched.length === 9);
        } catch (err) {
            console.error('Error fetching posts:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [location.search]);

    // ---- Autocomplete suggestions ----
    const fetchSuggestions = useCallback(async (q) => {
        if (q.length < 2) { setSuggestions([]); return; }
        try {
            const res = await apiFetch(`/api/v1/posts/search-suggestions/?q=${encodeURIComponent(q)}`);
            setSuggestions(res?.suggestions || []);
        } catch { setSuggestions([]); }
    }, []);

    // ---- Input change handler ----
    const handleChange = (e) => {
        const { id, value } = e.target;
        setSidebarData((prev) => ({ ...prev, [id]: value }));

        // Trigger autocomplete for search field
        if (id === 'searchTerm') {
            clearTimeout(suggestionsTimer.current);
            suggestionsTimer.current = setTimeout(() => fetchSuggestions(value), 250);
            setShowSuggestions(true);
        }
    };

    // ---- Select a suggestion ----
    const pickSuggestion = (title) => {
        setSidebarData((prev) => ({ ...prev, searchTerm: title }));
        setShowSuggestions(false);
        // Immediately submit
        const urlParams = new URLSearchParams();
        urlParams.set('searchTerm', title);
        urlParams.set('sort', sidebarData.sort);
        if (sidebarData.category !== 'all') urlParams.set('category', sidebarData.category);
        if (sidebarData.tag) urlParams.set('tag', sidebarData.tag);
        if (sidebarData.dateFrom) urlParams.set('dateFrom', sidebarData.dateFrom);
        if (sidebarData.dateTo) urlParams.set('dateTo', sidebarData.dateTo);
        navigate(`/search?${urlParams.toString()}`);
    };

    // ---- Close suggestions on outside click ----
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ---- Apply filters → push to URL ----
    const handleSubmit = (e) => {
        e.preventDefault();
        const urlParams = new URLSearchParams();
        if (sidebarData.searchTerm) urlParams.set('searchTerm', sidebarData.searchTerm);
        urlParams.set('sort', sidebarData.sort);
        if (sidebarData.category && sidebarData.category !== 'all') urlParams.set('category', sidebarData.category);
        if (sidebarData.tag) urlParams.set('tag', sidebarData.tag);
        if (sidebarData.dateFrom) urlParams.set('dateFrom', sidebarData.dateFrom);
        if (sidebarData.dateTo) urlParams.set('dateTo', sidebarData.dateTo);
        navigate(`/search?${urlParams.toString()}`);
        setMobileFiltersOpen(false);
        setShowSuggestions(false);
    };

    // ---- Clear all filters ----
    const clearFilters = () => {
        setSidebarData({ searchTerm: '', sort: 'desc', category: 'all', tag: '', dateFrom: '', dateTo: '' });
        navigate('/search');
        setMobileFiltersOpen(false);
    };

    // ---- Load more ----
    const handleShowMore = async () => {
        setLoading(true);
        try {
            const startIndex = posts.length;
            const urlParams = new URLSearchParams(location.search);
            urlParams.set('startIndex', startIndex);
            const data = await apiFetch(`/api/posts/getPosts?${urlParams.toString()}`);
            const newPosts = data?.data?.posts || data?.posts || [];
            setPosts((prev) => [...prev, ...newPosts]);
            setShowMore(newPosts.length === 9);
        } catch (err) {
            console.error('Error loading more posts:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ---- Sync URL → state ----
    useEffect(() => {
        const p = new URLSearchParams(location.search);
        setSidebarData({
            searchTerm: p.get('searchTerm') || '',
            sort: p.get('sort') || 'desc',
            category: p.get('category') || 'all',
            tag: p.get('tag') || '',
            dateFrom: p.get('dateFrom') || '',
            dateTo: p.get('dateTo') || '',
        });
    }, [location.search]);

    // ---- Fetch with debounce ----
    useEffect(() => {
        const timer = setTimeout(fetchPosts, 300);
        return () => clearTimeout(timer);
    }, [fetchPosts]);

    // ---- Active filter count (for badge) ----
    const activeFilterCount = [
        sidebarData.searchTerm,
        sidebarData.category !== 'all' && sidebarData.category,
        sidebarData.tag,
        sidebarData.dateFrom,
        sidebarData.dateTo,
    ].filter(Boolean).length;

    // ---- Check if any filter is active ----
    const hasActiveFilters = activeFilterCount > 0 || sidebarData.sort !== 'desc';

    return (
        <div className="flex flex-col md:flex-row min-h-screen">
            {/* ========= Mobile filter toggle ========= */}
            <div className="md:hidden p-4 border-b border-gray-200 dark:border-gray-700">
                <Button
                    fullSized
                    color="gray"
                    onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                >
                    <div className="flex items-center justify-between w-full">
                        <span className="flex items-center gap-2">
                            <FiFilter />
                            Filters
                            {activeFilterCount > 0 && (
                                <Badge color="info" size="sm">{activeFilterCount}</Badge>
                            )}
                        </span>
                        <FiChevronDown className={`transition-transform ${mobileFiltersOpen ? 'rotate-180' : ''}`} />
                    </div>
                </Button>
            </div>

            {/* ========= Sidebar ========= */}
            <div
                className={`${
                    mobileFiltersOpen ? 'block' : 'hidden'
                } md:block w-full md:w-72 p-4 md:p-6 border-b md:border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800`}
            >
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Search input + autocomplete */}
                    <div ref={suggestionsRef} className="relative">
                        <label htmlFor="searchTerm" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            Search
                        </label>
                        <TextInput
                            id="searchTerm"
                            type="text"
                            placeholder="Search posts…"
                            value={sidebarData.searchTerm}
                            onChange={handleChange}
                            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                            rightIcon={FiSearch}
                            autoComplete="off"
                        />
                        {/* Autocomplete dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <ul className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                {suggestions.map((s, i) => (
                                    <li
                                        key={i}
                                        className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 truncate"
                                        onClick={() => pickSuggestion(s)}
                                    >
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Sort */}
                    <div>
                        <label htmlFor="sort" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            Sort By
                        </label>
                        <Select id="sort" value={sidebarData.sort} onChange={handleChange}>
                            <option value="desc">Newest First</option>
                            <option value="asc">Oldest First</option>
                        </Select>
                    </div>

                    {/* Category (from API) */}
                    <div>
                        <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            Category
                        </label>
                        <Select id="category" value={sidebarData.category} onChange={handleChange}>
                            <option value="all">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.id || cat.slug} value={cat.slug}>
                                    {cat.emoji ? `${cat.emoji} ${cat.name}` : cat.name}
                                </option>
                            ))}
                        </Select>
                    </div>

                    {/* Tag (from API) */}
                    <div>
                        <label htmlFor="tag" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            Tag
                        </label>
                        <Select id="tag" value={sidebarData.tag} onChange={handleChange}>
                            <option value="">All Tags</option>
                            {tags.map((t) => (
                                <option key={t.id || t.slug} value={t.slug}>
                                    {t.name}
                                </option>
                            ))}
                        </Select>
                    </div>

                    {/* Date range */}
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label htmlFor="dateFrom" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                From
                            </label>
                            <TextInput
                                id="dateFrom"
                                type="date"
                                value={sidebarData.dateFrom}
                                onChange={handleChange}
                                sizing="sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="dateTo" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                To
                            </label>
                            <TextInput
                                id="dateTo"
                                type="date"
                                value={sidebarData.dateTo}
                                onChange={handleChange}
                                sizing="sm"
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <button
                        type="submit"
                        className="w-full px-4 py-2 rounded-md bg-gradient-to-r from-brand-green to-brand-yellow text-white font-semibold shadow-sm hover:from-brand-green/90 hover:to-brand-yellow/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow transition-colors"
                    >
                        Apply Filters
                    </button>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="flex items-center justify-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
                            <FiX className="w-3.5 h-3.5" />
                            Clear all filters
                        </button>
                    )}
                </form>
            </div>

            {/* ========= Main content ========= */}
            <div className="flex-1 p-4 md:p-6">
                {/* Header + result count */}
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        {sidebarData.searchTerm ? 'Search Results' : 'All Posts'}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-gray-600 dark:text-gray-400 text-sm">
                        {sidebarData.searchTerm && (
                            <span>
                                Results for "<strong className="text-gray-800 dark:text-gray-200">{sidebarData.searchTerm}</strong>"
                            </span>
                        )}
                        {!loading && (
                            <span>
                                — {totalResults} {totalResults === 1 ? 'post' : 'posts'} found
                            </span>
                        )}
                    </div>

                    {/* Active filter pills */}
                    {activeFilterCount > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {sidebarData.category !== 'all' && sidebarData.category && (
                                <Badge color="indigo" size="sm">
                                    Category: {categories.find((c) => c.slug === sidebarData.category)?.name || sidebarData.category}
                                </Badge>
                            )}
                            {sidebarData.tag && (
                                <Badge color="purple" size="sm">
                                    Tag: {tags.find((t) => t.slug === sidebarData.tag)?.name || sidebarData.tag}
                                </Badge>
                            )}
                            {sidebarData.dateFrom && (
                                <Badge color="gray" size="sm">From: {sidebarData.dateFrom}</Badge>
                            )}
                            {sidebarData.dateTo && (
                                <Badge color="gray" size="sm">To: {sidebarData.dateTo}</Badge>
                            )}
                        </div>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <Alert color="failure" className="mb-4">{error}</Alert>
                )}

                {/* Loading skeletons */}
                {loading && posts.length === 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <PostCardSkeleton key={i} />
                        ))}
                    </div>
                )}

                {/* No results */}
                {!loading && posts.length === 0 && !error && (
                    <div className="text-center py-16">
                        <div className="text-5xl mb-4">🔍</div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            No posts found
                        </h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                            Try adjusting your search terms or removing some filters to see more results.
                        </p>
                        {hasActiveFilters && (
                            <Button color="light" size="sm" className="mt-4" onClick={clearFilters}>
                                Clear all filters
                            </Button>
                        )}
                    </div>
                )}

                {/* Posts grid */}
                {posts.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post) => (
                            <PostCard key={post._id || post.id} post={post} />
                        ))}
                    </div>
                )}

                {/* Show more */}
                {showMore && (
                    <div className="text-center mt-8">
                        <Button
                            gradientDuoTone="greenToBlue"
                            onClick={handleShowMore}
                            disabled={loading}
                        >
                            {loading ? <><Spinner size="sm" className="mr-2" /> Loading…</> : 'Show More'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
    
