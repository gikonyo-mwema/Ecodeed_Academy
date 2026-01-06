import { useState } from 'react';
import apiRequest from '../../../../utils/apiRequest';

export default function usePostActions(currentUser, setShowEditForm, setCurrentPost) {
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
      await apiRequest(
        `/api/posts/delete/${postIdToDelete}/${currentUser._id}`,
        currentUser.token,
        { method: 'DELETE' }
      );
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