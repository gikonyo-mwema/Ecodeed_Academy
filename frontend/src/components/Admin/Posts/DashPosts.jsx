/**
 * Dashboard Posts Management Component
 * 
 * A comprehensive posts management interface for administrators that provides
 * full CRUD operations for blog posts with an intuitive and responsive design.
 * 
 * Features:
 * - Create new posts via the full editor (drafts, scheduling, SEO, autosave)
 * - Edit existing posts in the full editor regardless of status
 * - Delete posts with confirmation modal
 * - Draft / Published / Scheduled status visibility in the table
 * - Pagination for large post collections
 * 
 * Components:
 * - PostTable: Displays posts in a sortable, filterable table
 * - DeletePostModal: Confirmation dialog for post deletion
 * - AlertMessage: User feedback for operations
 * 
 * Hooks:
 * - usePostFetch: Handles post data fetching and pagination (showAll=1)
 * - usePostActions: Manages post delete operations
 * 
 * Routing:
 * - "Create New Post" → /create-post   (PostEditorPage)
 * - "Edit"            → /update-post/:id (PostEditorPage)
 * 
 * @component
 * @version 2.0.0
 * @author Gikonyo Mwema
 */

import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PostTable from './PostTable/PostTable';
import DeletePostModal from './PostModals/DeletePostModal';
import AlertMessage from './PostModals/AlertMessage';
import usePostFetch from './hooks/usePostFetch';
import usePostActions from './hooks/usePostActions';
import { Button } from 'flowbite-react';

/**
 * DashPosts Component
 * Main posts management interface for administrators
 * 
 * @returns {JSX.Element} Complete posts management dashboard
 */
export default function DashPosts() {
  // Redux state for user authentication
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  /**
   * Custom hook for post data fetching
   * Manages posts list, loading states, and pagination
   */
  const {
    userPosts,
    loading,
    showMore,
    pagination,
    error: fetchError,
    handleShowMore,
    fetchPosts
  } = usePostFetch(currentUser);
  
  /**
   * Custom hook for post actions
   * Handles delete operations with state management
   */
  const {
    showModal,
    setShowModal,
    postIdToDelete,
    handleDeleteClick,
    handleDeletePost,
    publishError,
    setPublishError
  } = usePostActions(currentUser, null, null, fetchPosts);

  // Create/Edit open the full editor page (drafts, scheduling, autosave, SEO)
  const handleCreate = () => navigate('/create-post');
  const handleEdit = (post) => navigate(`/update-post/${post.id || post._id}`);

  return (
    <div className="p-3 max-w-6xl mx-auto min-h-screen">
      {/* Header section with title and action button */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Manage Posts</h1>

        {/* Create post button → full editor */}
        <Button
          className="bg-gradient-to-r from-brand-green to-brand-yellow hover:from-brand-green/90 hover:to-brand-yellow/90 text-white border-0 focus:ring-4 focus:ring-brand-green/25"
          onClick={handleCreate}
          disabled={loading}
        >
          Create New Post
        </Button>
      </div>

      {/* Error message display */}
      {(fetchError || publishError) && (
        <AlertMessage 
          message={fetchError || publishError} 
          onDismiss={() => setPublishError(null)} 
        />
      )}

      {/* Posts table view */}
      <PostTable
        posts={userPosts}
        loading={loading}
        showMore={showMore}
        onShowMore={handleShowMore}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {/* Delete confirmation modal */}
      <DeletePostModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDeletePost}
      />
    </div>
  );
}