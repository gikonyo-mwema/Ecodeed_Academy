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
        `/api/posts/delete/${postIdToDelete}/${currentUser._id}/`,
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