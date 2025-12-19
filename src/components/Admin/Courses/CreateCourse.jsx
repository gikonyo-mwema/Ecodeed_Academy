import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CourseForm } from './CourseForm';
import { useCourseForm } from './useCourseForm';
import { Unauthorized } from './Unauthorized';

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
    isPopular: false,
    paymentOption: 'one-time',
    features: [''],
    cta: 'Enroll Now',
    iconName: 'HiOutlineAcademicCap'
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
      if (!formData.slug || !formData.externalUrl) {
        throw new Error('Slug and External URL are required');
      }

      // Validate slug format
      if (!/^[a-z0-9-]+$/.test(formData.slug)) {
        throw new Error('Slug can only contain lowercase letters, numbers, and hyphens');
      }

      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          ...formData,
          // Ensure price is stored as number
          price: Number(formData.price)
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create course');
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