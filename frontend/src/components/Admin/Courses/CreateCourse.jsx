import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CourseForm } from './CourseForm';
import { useCourseForm } from './useCourseForm';
import { Unauthorized } from './Unauthorized';
import { apiFetch } from '../../../utils/api';

export const CreateCourse = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const {
    formData,
    error,
    loading,
    handleChange,
    handleFeatureChange,
    handleCurriculumChange,
    handleCurriculumItemChange,
    addCurriculumSection,
    addCurriculumItem,
    removeCurriculumItem,
    handleFaqChange,
    addFaq,
    removeFaq,
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
    category: 'specialized',
    features: [''],
    faqs: [{ question: '', answer: '' }],
    level: [],
    format: [],
    curriculum: [{ title: '', items: [''] }]
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

      // Map back to snake_case for Django
      const submitData = {
        ...formData,
        short_description: formData.shortDescription,
        full_description: formData.description,
        external_url: formData.externalUrl,
        is_popular: formData.isPopular,
        price: Number(formData.price) || 0
      };

      await apiFetch('/api/courses/', {
        method: 'POST',
        body: JSON.stringify(submitData),
      });

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
      handleCurriculumChange={handleCurriculumChange}
      handleCurriculumItemChange={handleCurriculumItemChange}
      addCurriculumSection={addCurriculumSection}
      addCurriculumItem={addCurriculumItem}
      removeCurriculumItem={removeCurriculumItem}
      handleFaqChange={handleFaqChange}
      addFaq={addFaq}
      removeFaq={removeFaq}
      addFeatureField={addFeatureField}
      removeFeatureField={removeFeatureField}
      handleSubmit={handleSubmit}
      title="Create New Course"
      submitButtonText={loading ? 'Creating...' : 'Create Course'}
    />
  );
};
