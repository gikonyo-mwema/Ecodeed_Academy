/**
 * usePostFetch Hook — Fetches paginated posts with deduplication and load-more support.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * Manages post fetching for admin dashboard with offset-based pagination.
 * Handles automatic deduplication when loading more posts, loading states,
 * and error handling. Requires admin user authentication.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * HOOK STATE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * - userPosts (Post[]): Array of fetched posts with deduplication
 * - loading (bool): Fetch in progress
 * - pagination (object): { page: number, limit: number }
 * - showMore (bool): True if more posts available beyond current page
 * - error (string|null): Last fetch error message
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * PAGINATION STRATEGY
 * ═══════════════════════════════════════════════════════════════════════════════════
 * Backend API: GET /api/v1/posts/?startIndex=X&limit=10
 * - Offset-based pagination: startIndex = (page - 1) * limit
 * - Default limit: 10 posts per page
 * - Deduplication: Filters by post.id to prevent duplicates on "Load More"
 * - Total posts: Backend returns totalPosts to calculate hasMore
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * USAGE EXAMPLE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * function PostsAdmin() {
 *   const currentUser = useSelector(state => state.user.currentUser);
 *   const { userPosts, loading, showMore, handleShowMore } = usePostFetch(currentUser);
 *   
 *   return (
 *     <div>
 *       {userPosts.map(post => <PostItem key={post.id} post={post} />)}
 *       {showMore && <button onClick={handleShowMore}>Load More</button>}
 *       {loading && <Spinner />}
 *     </div>
 *   );
 * }
 *
 * @hook usePostFetch
 * @param {object} currentUser - Current authenticated user object with isAdmin flag
 * @returns {object} Hook state: { userPosts, loading, showMore, pagination, error, handleShowMore, fetchPosts }
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

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

      const data = await apiFetch(`/api/v1/posts/?${query}`);

      const newPosts = data.posts || [];
      setUserPosts(prev => {
        if (pagination.page === 1) {
          return newPosts;
        }
        // Deduplicate posts by _id when appending
        const existingIds = new Set(prev.map(p => p.id));
        const uniqueNewPosts = newPosts.filter(p => !existingIds.has(p.id));
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