import { useState, useEffect, useCallback } from 'react';
import apiRequest from '../../../../utils/apiRequest';

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
      const query = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        // userId: currentUser._id
      }).toString();

      const response = await apiRequest(
        `/api/posts/getPosts?${query}`,
        currentUser.token
      );

      const newPosts = response.data?.posts || [];
      setUserPosts(prev => {
        if (pagination.page === 1) {
          return newPosts;
        }
        // Deduplicate posts by _id when appending
        const existingIds = new Set(prev.map(p => p._id));
        const uniqueNewPosts = newPosts.filter(p => !existingIds.has(p._id));
        return [...prev, ...uniqueNewPosts];
      });
      setShowMore(response.data?.pagination?.hasNextPage || false);
    } catch (error) {
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