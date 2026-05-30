/**
 * usePostForm Hook — Manages post creation and editing with form state and validation.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * Provides form state management for creating and editing posts. Handles field
 * updates, form submission, validation (title/content required), and error handling.
 * Supports both POST (create) and PUT (edit) workflows with trailing slash URLs.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * FORM SCHEMA
 * ═══════════════════════════════════════════════════════════════════════════════════
 * {
 *   title: string (required, non-empty),
 *   content: string (required, non-empty, not just HTML tags),
 *   category: string (default: 'uncategorized'),
 *   image: string (URL, optional)
 * }
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * HOOK STATE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * - formData (object): Current form field values
 * - isSubmitting (bool): Form submission in progress
 * - error (string|null): Validation or API error message
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * API ENDPOINTS
 * ═══════════════════════════════════════════════════════════════════════════════════
 * Create: POST /api/v1/posts/
 * Edit:   PUT /api/v1/posts/{id}/
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * VALIDATION RULES
 * ═══════════════════════════════════════════════════════════════════════════════════
 * • Title must be non-empty after trim
 * • Content must be non-empty after trim AND not be just HTML tags (<p><br></p>)
 * • Category optional (defaults to 'uncategorized')
 * • Image optional (must be valid URL if provided)
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * USAGE EXAMPLE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * const { formData, setFormData, isSubmitting, error, handleSubmit }
 *   = usePostForm(editingPost || null, isEdit, currentUser, () => fetchPosts());
 *
 * <form onSubmit={handleSubmit}>
 *   <input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
 *   <Editor value={formData.content} onChange={(html) => setFormData({...formData, content: html})} />
 *   <button disabled={isSubmitting}>{isEdit ? 'Update' : 'Create'}</button>
 *   {error && <Alert>{error}</Alert>}
 * </form>
 *
 * @hook usePostForm
 * @param {object|null} initialPost - Post object for editing (null for creation)
 * @param {boolean} isEdit - True if editing existing post, false if creating new
 * @param {object} currentUser - Current authenticated user object
 * @param {function} onSuccess - Callback after successful form submission
 * @returns {object} { formData, setFormData, isSubmitting, error, handleSubmit }
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

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