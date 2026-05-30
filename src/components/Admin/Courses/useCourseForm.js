
/**
 * useCourseForm Hook
 * 
 * Custom React hook for managing course form state and operations.
 * Handles form data, validation, and dynamic field management.
 * 
 * Features:
 * - Initialize form with course data
 * - Handle input changes for all field types
 * - Manage dynamic feature list fields
 * - Add/remove feature fields
 * - Track loading and error states
 * - Reset form capability
 * 
 * @hook
 * @version 1.0.0
 * @author Gikonyo Mwema
 * 
 * @param {Object} initialState - Initial form state object
 * @returns {Object} Hook object with form state and handlers
 *   @returns {Object} formData - Current form values
 *   @returns {Function} setFormData - Update form data
 *   @returns {string|null} error - Current error message
 *   @returns {Function} setError - Set error message
 *   @returns {boolean} loading - Loading state
 *   @returns {Function} setLoading - Set loading state
 *   @returns {Function} handleChange - Handle input changes
 *   @returns {Function} handleFeatureChange - Update feature value
 *   @returns {Function} addFeatureField - Add new feature field
 *   @returns {Function} removeFeatureField - Remove feature field
 * 
 * @example
 * ```jsx
 * const form = useCourseForm({ title: '', price: '' });
 * const { formData, handleChange, addFeatureField } = form;
 * ```
 */

import { useState } from 'react';



/**
 * useCourseForm
 * 
 * State management hook for course form
 * 
 * @param {Object} initialState - Initial form state
 * @returns {Object} Form state and handler functions
 */
export const useCourseForm = (initialState) => {
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [id]: type === 'checkbox' ? checked : value 
    });
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeatureField = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeatureField = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  return {
    formData,
    setFormData,
    error,
    setError,
    loading,
    setLoading,
    handleChange,
    handleFeatureChange,
    addFeatureField,
    removeFeatureField
  };
};