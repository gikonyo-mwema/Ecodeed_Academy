import { useState, useEffect } from 'react';
import { apiFetch } from '../../../../utils/api';

export default function usePostForm(initialPost, isEdit, currentUser, onSuccess) {
  
  const initialFormState = {
    title: '',
    content: '',
    category: 'uncategorized',
    image: ''
  };

  const [formData, setFormData] = useState(initialPost || initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Initialize form with post data when editing
  useEffect(() => {
    if (initialPost) {
      setFormData({
        title: initialPost.title,
        content: initialPost.content,
        category: initialPost.category,
        image: initialPost.image
      });
    }
  }, [initialPost]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log('Submitting post data:', {
        formData,
        currentUserId: currentUser.id,
        isEdit
      });

      // Validation
      if (!formData.title.trim()) throw new Error('Title is required');
      if (!formData.content.trim() || formData.content === '<p><br></p>') {
        throw new Error('Content is required');
      }

      // Prepare API request (trailing slash required by Django)
      const url = isEdit 
        ? `/api/v1/posts/${initialPost.id}/`
        : '/api/v1/posts/';
      
      const method = isEdit ? 'PUT' : 'POST';
      
      // Prepare the payload without userId
      const postPayload = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        image: formData.image || '', // Ensure empty string instead of undefined
      };

      // Send request using apiFetch
      const data = await apiFetch(url, {
        method,
        body: JSON.stringify(postPayload)
      });

      console.log('Post submission successful:', data);

      // Reset form and call success handler
      if (!isEdit) {
        setFormData(initialFormState);
      }
      onSuccess();
    } catch (error) {
      const errorMessage = error.message || 'Internal Server Error';
      setError(errorMessage);
      
      console.error('=== FORM SUBMISSION ERROR DETAILS ===');
      console.error('Error message:', errorMessage);
      console.error('Full error:', error);
      console.error('=====================================');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    isSubmitting,
    error,
    handleSubmit
  };
}