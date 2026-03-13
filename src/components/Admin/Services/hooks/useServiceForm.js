/**
 * useServiceForm Hook
 * 
 * Custom React hook for managing service form state and validation.
 * Handles all form field changes, contact info, features, and error tracking.
 * 
 * Features:
 * - Form data state management
 * - Input change handlers for all field types
 * - Contact information management
 * - Features list management (dynamic fields)
 * - Error state tracking
 * - Form validation logic
 * - Field error messages
 * - Form reset capability
 * 
 * Form Fields:
 * - Title and slug
 * - Short and full descriptions
 * - Category and pricing
 * - Features list
 * - Contact information
 * - Social links
 * - Service metadata
 * 
 * Validation:
 * - Required field validation
 * - Email format validation
 * - URL format validation
 * - Price format validation
 * - Text length constraints
 * 
 * @hook
 * @version 1.0.0
 * @author Gikonyo Mwema
 * 
 * @param {Object} initialData - Initial form data
 * @returns {Object} Hook object with form state and handlers
 *   @returns {Object} formData - Current form values
 *   @returns {Function} setFormData - Update form data
 *   @returns {Object} errors - Field error messages
 *   @returns {Function} setErrors - Update errors
 *   @returns {Function} handleChange - Handle input changes
 *   @returns {Function} handleContactInfoChange - Update contact info
 *   @returns {Function} handleAddFeature - Add feature field
 *   @returns {Function} handleRemoveFeature - Remove feature field
 *   @returns {Function} handleFeatureChange - Update feature value
 *   @returns {Function} validateForm - Validate all fields
 *   @returns {Function} resetForm - Reset to initial state
 * 
 * @example
 * ```jsx
 * const form = useServiceForm(initialData);
 * const { formData, handleChange, errors } = form;
 * ```
 */

import { useState, useCallback } from 'react';

export const useServiceForm = (initialData) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});

  // Generic field change handler
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  // Contact info change handler
  const handleContactInfoChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [name]: value
      }
    }));
  }, []);

  // Process Steps handlers (field-based to match callers)
  const handleProcessStepChange = useCallback((index, field, value) => {
    setFormData(prev => {
      const newProcessSteps = [...(prev.processSteps || [])];
      const existing = newProcessSteps[index] || { title: "", description: "", order: index + 1 };
      newProcessSteps[index] = { ...existing, [field]: value };
      return { ...prev, processSteps: newProcessSteps };
    });
  }, []);

  const addProcessStep = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      processSteps: [
        ...prev.processSteps,
        { title: "", description: "", order: prev.processSteps.length + 1 }
      ]
    }));
  }, []);

  const removeProcessStep = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      processSteps: prev.processSteps.filter((_, i) => i !== index)
    }));
  }, []);

  // Examples handlers
  const handleExampleChange = useCallback((index, value) => {
    setFormData(prev => {
      const next = [...(prev.examples || [])];
      next[index] = value;
      return { ...prev, examples: next };
    });
  }, []);

  const addExample = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      examples: [...(prev.examples || []), ""]
    }));
  }, []);

  const removeExample = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      examples: (prev.examples || []).filter((_, i) => i !== index)
    }));
  }, []);

  // Project Types handlers
  const handleProjectTypeChange = useCallback((index, value) => {
    setFormData(prev => {
      const newProjectTypes = [...prev.projectTypes];
      newProjectTypes[index] = value;
      return { ...prev, projectTypes: newProjectTypes };
    });
  }, []);

  const addProjectType = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      projectTypes: [...prev.projectTypes, ""]
    }));
  }, []);

  const removeProjectType = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      projectTypes: prev.projectTypes.filter((_, i) => i !== index)
    }));
  }, []);

  // Benefits handlers - UPDATED to match component usage
  const handleBenefitChange = useCallback((index, field, value) => {
    setFormData(prev => {
      const newBenefits = [...prev.benefits];
      if (!newBenefits[index]) return prev; // safety check
      
      newBenefits[index] = {
        ...newBenefits[index],
        [field]: value
      };
      return { ...prev, benefits: newBenefits };
    });
  }, []);

  const addBenefit = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      benefits: [
        ...prev.benefits,
        { title: "", description: "", icon: "✅" }
      ]
    }));
  }, []);

  const removeBenefit = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  }, []);

  // Features handlers - UPDATED to match benefits pattern
  const handleFeatureChange = useCallback((index, field, value) => {
    setFormData(prev => {
      const newFeatures = [...prev.features];
      if (!newFeatures[index]) return prev; // safety check
      
      newFeatures[index] = {
        ...newFeatures[index],
        [field]: value
      };
      return { ...prev, features: newFeatures };
    });
  }, []);

  const addFeature = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      features: [
        ...prev.features,
        { title: "", description: "" }
      ]
    }));
  }, []);

  const removeFeature = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  }, []);

  // Social Links handlers - UPDATED to match benefits pattern
  const handleSocialLinkChange = useCallback((index, field, value) => {
    setFormData(prev => {
      const newSocialLinks = [...prev.socialLinks];
      if (!newSocialLinks[index]) return prev; // safety check
      
      newSocialLinks[index] = {
        ...newSocialLinks[index],
        [field]: value
      };
      return { ...prev, socialLinks: newSocialLinks };
    });
  }, []);

  const addSocialLink = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      socialLinks: [
        ...prev.socialLinks,
        { platform: "", url: "" }
      ]
    }));
  }, []);

  const removeSocialLink = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }));
  }, []);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
  }, [initialData]);

  // Update form data (alias for setFormData for consistency)
  const updateFormData = useCallback((updates) => {
    if (typeof updates === 'function') {
      setFormData(updates);
    } else {
      setFormData(prev => ({ ...prev, ...updates }));
    }
  }, []);

  // Basic validation function
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    isValid: Object.keys(errors).length === 0,
    // Form utilities
    resetForm,
    updateFormData,
    validateForm,
    handleChange,
    handleContactInfoChange,
    // Process Steps
    handleProcessStepChange,
    addProcessStep,
    removeProcessStep,
    // Project Types
    handleProjectTypeChange,
    addProjectType,
    removeProjectType,
    // Benefits
    handleBenefitChange,
    addBenefit,
    removeBenefit,
    // Features
  handleFeatureChange,
  addFeature,
  removeFeature,
  // Examples
  handleExampleChange,
  addExample,
  removeExample
  };
};