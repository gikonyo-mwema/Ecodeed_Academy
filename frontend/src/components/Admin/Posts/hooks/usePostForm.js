import { useState, useEffect } from 'react';
import axios from 'axios';

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
        currentUserId: currentUser._id,
        isEdit
      });

      // Validation
      if (!formData.title.trim()) throw new Error('Title is required');
      if (!formData.content.trim() || formData.content === '<p><br></p>') {
        throw new Error('Content is required');
      }
      
      // Check if there are images in the content or a featured image
      const hasContentImages = formData.content.includes('<img');
      const hasFeaturedImage = !!formData.image;
      
      if (!hasFeaturedImage && !hasContentImages) {
        throw new Error('Please add at least one image - either a featured image or images within your content');
      }

      // Prepare API request
      const url = isEdit 
        ? `/api/posts/update/${initialPost._id}/${currentUser._id}`
        : '/api/posts/create';
      
      const method = isEdit ? 'put' : 'post';
      
      // Prepare the payload without userId
      const postPayload = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        image: formData.image || '', // Ensure empty string instead of undefined
      };

      // Send request with cookies for authentication (withCredentials is set globally)
      const response = await axios[method](url, postPayload);

      console.log('Post submission successful:', response.data);

      // Reset form and call success handler
      if (!isEdit) {
        setFormData(initialFormState);
      }
      onSuccess();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Internal Server Error';
      setError(errorMessage);
      
      console.error('=== FORM SUBMISSION ERROR DETAILS ===');
      console.error('Error message:', errorMessage);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
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