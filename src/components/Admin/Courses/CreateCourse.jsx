/**
 * Create Course Component
 * 
 * Provides an interface for administrators to create new environmental courses.
 * Handles the full course creation flow with form validation and API integration.
 * 
 * Features:
 * - Course form with all required fields
 * - Admin-only access with authorization check
 * - Form validation and error handling
 * - Course feature management (dynamic fields)
 * - Course pricing and payment options
 * - Navigation after successful creation
 * - Loading states during submission
 * 
 * Form Fields:
 * - Title: Course name
 * - Slug: URL-friendly identifier
 * - Price: Course pricing in currency
 * - Descriptions: Short and detailed descriptions
 * - Features: Dynamic list of course features
 * - Payment Options: One-time or subscription
 * - External URL: Link to external course content
 * - Popular Flag: Mark as featured course
 * 
 * @component
 * @version 1.0.0
 * @author Gikonyo Mwema
 * 
 * @returns {JSX.Element} Course creation form or unauthorized message
 * 
 * @example
 * ```jsx
 * <CreateCourse />
 * ```
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CourseForm } from './CourseForm';
import { useCourseForm } from './useCourseForm';
import { Unauthorized } from './Unauthorized';

/**
 * CreateCourse
 * 
 * Main component for creating new courses
 * 
 * @returns {JSX.Element} Course creation form or unauthorized access message
 */
export const CreateCourse = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const {
    formData,
    error,
    loading,
    handleChange,
    handleFeatureChange,
    addFeatureField,
    removeFeatureField,
    setError,
    setLoading
  } = useCourseForm({
    title: '',
    slug: '',
    price: '',
    shortDescription: '',
    description: '',
    externalUrl: '',
    category: '', // Added missing required field
    isPopular: false,
    isLive: false, // Added missing field
    hasCertificate: false, // Added missing field
    pacingType: 'self_paced', // Added missing field
    level: [], // Added missing field
    format: [], // Added missing field
    features: [''],
    cta: 'Enroll Now',
    iconName: 'HiOutlineAcademicCap',
    curriculum: [] // Added missing field
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      // Validate admin status
      if (!currentUser?.isAdmin) {
        throw new Error('Only admins can create courses');
      }

      // Validate required fields
      if (!formData.slug || !formData.externalUrl || !formData.category || !formData.title || !formData.shortDescription) {
        throw new Error('Title, Slug, Short Description, External URL, and Category are required');
      }

      const res = await fetch('/api/v1/courses', {  // Updated to correct API endpoint
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          ...formData,
          // Map frontend field names to backend field names
          short_description: formData.shortDescription,
          full_description: formData.description,
          external_url: formData.externalUrl,
          is_free: Number(formData.price) === 0,
          pacing_type: formData.pacingType,
          target_audience: formData.targetAudience || [],
          has_certificate: formData.hasCertificate,
          // Ensure price is stored as number
          price: Number(formData.price) || 0
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || data.detail || 'Failed to create course');
      }

      navigate('/dashboard?tab=courses');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser?.isAdmin) {
    return <Unauthorized />;
  }

  return (
    <CourseForm
      formData={formData}
      error={error}
      loading={loading}
      handleChange={handleChange}
      handleFeatureChange={handleFeatureChange}
      addFeatureField={addFeatureField}
      removeFeatureField={removeFeatureField}
      handleSubmit={handleSubmit}
      title="Create New Course"
      submitButtonText={loading ? 'Creating...' : 'Create Course'}
    />
  );
};