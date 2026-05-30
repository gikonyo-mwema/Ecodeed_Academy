/**
 * usePostActions Hook — Manages post deletion and edit workflows with confirmation modal.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * Provides post CRUD action handlers for the admin dashboard. Manages modal state
 * for delete confirmation, handles API calls for post deletion, and coordinates
 * edit form display. Calls optional callback on successful deletion.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * HOOK STATE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * - showModal (bool): Delete confirmation modal visibility
 * - postIdToDelete (string): ID of post pending deletion
 * - publishError (string|null): Last operation error message
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * OPERATIONS
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 1. handleDeleteClick(postId): Opens delete confirmation modal
 * 2. handleDeletePost(): Sends DELETE to /api/v1/posts/{id}/, calls onDeleteSuccess callback
 * 3. handleEditPost(post): Loads post into edit form via setCurrentPost, shows form
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * USAGE EXAMPLE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * function PostsAdmin() {
 *   const { showModal, postIdToDelete, handleDeleteClick, handleDeletePost, handleEditPost }
 *     = usePostActions(currentUser, setShowEditForm, setCurrentPost, () => fetchPosts());
 *   
 *   return (
 *     <>
 *       <button onClick={() => handleDeleteClick(post.id)}>Delete</button>
 *       <button onClick={() => handleEditPost(post)}>Edit</button>
 *       {showModal && <ConfirmModal onConfirm={handleDeletePost} />}
 *     </>
 *   );
 * }
 *
 * @hook usePostActions
 * @param {object} currentUser - Current authenticated user (for context)
 * @param {function} setShowEditForm - Callback to show edit form
 * @param {function} setCurrentPost - Callback to set current post data
 * @param {function} onDeleteSuccess - Callback to refresh posts after deletion
 * @returns {object} Hook state: { showModal, postIdToDelete, handleDeleteClick, handleDeletePost, handleEditPost, publishError, setPublishError }
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

import { useState } from 'react';
import { apiFetch } from '../../../../utils/api';

export default function usePostActions(currentUser, setShowEditForm, setCurrentPost, onDeleteSuccess) {
  const [showModal, setShowModal] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState('');
  const [publishError, setPublishError] = useState(null);

  const handleDeleteClick = (postId) => {
    setShowModal(true);
    setPostIdToDelete(postId);
  };

  const handleDeletePost = async () => {
    setShowModal(false);
    try {
      await apiFetch(
        `/api/v1/posts/${postIdToDelete}/`,
        { method: 'DELETE' }
      );
      // Refresh the posts list after successful deletion
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
      return true;
    } catch (error) {
      setPublishError(error.message);
      return false;
    }
  };

  const handleEditPost = (post) => {
    setCurrentPost(post);
    setShowEditForm(true);
  };

  return {
    showModal,
    postIdToDelete,
    handleDeleteClick,
    handleDeletePost,
    handleEditPost,
    publishError,
    setPublishError
  };
}