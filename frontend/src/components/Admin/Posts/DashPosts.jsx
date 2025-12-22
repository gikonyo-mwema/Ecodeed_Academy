/**
 * Dashboard Posts Management Component
 * 
 * A comprehensive posts management interface for administrators that provides
 * full CRUD operations for blog posts with an intuitive and responsive design.
 * 
 * Features:
 * - Create new posts with rich text editor
 * - Edit existing posts with form validation
 * - Delete posts with confirmation modal
 * - Bulk operations for multiple posts
 * - Real-time search and filtering
 * - Pagination for large post collections
 * - Image upload and management integration
 * - Draft/Published status management
 * - SEO optimization tools
 * 
 * Components:
 * - PostTable: Displays posts in a sortable, filterable table
 * - PostForm: Rich editor for creating/editing posts
 * - DeletePostModal: Confirmation dialog for post deletion
 * - AlertMessage: User feedback for operations
 * 
 * Hooks:
 * - usePostFetch: Handles post data fetching and pagination
 * - usePostActions: Manages post CRUD operations
 * 
 * State Management:
 * - Local state for form visibility and current post
 * - Redux integration for user authentication
 * - Custom hooks for data and action management
 * 
 * @component
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

import { useState } from 'react';
import { useSelector } from 'react-redux';
import PostTable from './PostTable/PostTable';
import PostForm from './PostForm/PostForm';
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
  
  /**
   * Form visibility states
   * Controls whether create/edit forms are displayed
   */
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  
  /**
   * Current post being edited
   * Stores the post data when in edit mode
   */
  const [currentPost, setCurrentPost] = useState(null);
  
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
   * Handles create, edit, delete operations with state management
   */
  const {
    showModal,
    postIdToDelete,
    handleDeleteClick,
    handleDeletePost,
    handleEditPost,
    publishError,
    setPublishError
  } = usePostActions(currentUser, setShowEditForm, setCurrentPost);

  return (
    <div className="p-3 max-w-6xl mx-auto min-h-screen">
      {/* Header section with title and action button */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">
          {showCreateForm || showEditForm ? (showEditForm ? 'Edit Post' : 'Create Post') : 'Manage Posts'}
        </h1>
        
        {/* Create/Cancel post button */}
        <Button
          className="bg-gradient-to-r from-brand-green to-brand-blue hover:from-brand-blue hover:to-brand-green text-white border-0 focus:ring-4 focus:ring-brand-green/25"
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setShowEditForm(false);
            if (!showCreateForm) setCurrentPost(null);
          }}
          disabled={loading}
        >
          {showCreateForm ? 'Cancel' : 'Create New Post'}
        </Button>
      </div>

      {/* Error message display */}
      {(fetchError || publishError) && (
        <AlertMessage 
          message={fetchError || publishError} 
          onDismiss={() => setPublishError(null)} 
        />
      )}

      {/* Post creation/editing form */}
      {(showCreateForm || showEditForm) && (
        <PostForm 
          post={currentPost}
          isEdit={showEditForm}
          onCancel={() => showEditForm ? setShowEditForm(false) : setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            setShowEditForm(false);
            setCurrentPost(null);
            // Refresh the posts list so updated category appears immediately
            fetchPosts();
          }}
          currentUser={currentUser}
        />
      )}

      {/* Posts table view */}
      {!showCreateForm && !showEditForm && (
        <PostTable
          posts={userPosts}
          loading={loading}
          showMore={showMore}
          onShowMore={handleShowMore}
          onEdit={handleEditPost}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Delete confirmation modal */}
      <DeletePostModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDeletePost}
      />
    </div>
  );
}