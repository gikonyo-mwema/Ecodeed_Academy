import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../../../utils/api';

export default function usePostFetch(currentUser) {
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async () => {
    if (!currentUser?.isAdmin) return;
    
    setLoading(true);
    try {
      // Backend expects startIndex for offset pagination
      const query = new URLSearchParams({
        startIndex: ((pagination.page - 1) * pagination.limit).toString(),
        limit: pagination.limit.toString(),
        order: 'desc'
      }).toString();

      const data = await apiFetch(`/api/posts/getPosts?${query}`);

      const newPosts = data.posts || [];
      setUserPosts(prev => {
        if (pagination.page === 1) {
          return newPosts;
        }
        // Deduplicate posts by _id when appending
        const existingIds = new Set(prev.map(p => p._id));
        const uniqueNewPosts = newPosts.filter(p => !existingIds.has(p._id));
        return [...prev, ...uniqueNewPosts];
      });
      // Backend returns totalPosts
      setShowMore(data.totalPosts > (pagination.page * pagination.limit));
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser, pagination.page, pagination.limit]);

  useEffect(() => {
    const controller = new AbortController();
    fetchPosts();
    return () => controller.abort();
  }, [fetchPosts]);

  const handleShowMore = useCallback(() => {
    setPagination(prev => ({ ...prev, page: prev.page + 1 }));
  }, []);

  return {
    userPosts,
    loading,
    showMore,
    pagination,
    error,
    handleShowMore,
    fetchPosts
  };
}