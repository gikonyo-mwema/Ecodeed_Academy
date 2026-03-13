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
    handleLessonDetailChange,
    handleFaqChange,
    addFaq,
    removeFaq,
    addFeatureField,
    removeFeatureField,
    handleTargetAudienceChange,
    addTargetAudience,
    removeTargetAudience,
    addLiveSession,
    updateLiveSession,
    removeLiveSession,
    addResource,
    updateResource,
    removeResource,
    setError,
    setLoading
  } = useCourseForm({
    title: '',
    price: '',
    shortDescription: '',
    description: '',
    isPopular: false,
    isFree: false,
    isLive: false,
    hasCertificate: false,
    pacingType: 'self_paced',
    category: 'specialized',
    features: [''],
    targetAudience: [''],
    faqs: [{ question: '', answer: '' }],
    curriculum: [{ title: '', items: [''], live_sessions: [], resources: [] }]
  });

  const handleSubmit = async (e, { isLive = true } = {}) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      // Validate admin or instructor status
      if (!currentUser?.isAdmin && !currentUser?.isInstructor) {
        throw new Error('Only admins and instructors can create courses');
      }

      // Map back to snake_case for Django
      const submitData = {
        ...formData,
        short_description: formData.shortDescription,
        full_description: formData.description,
        is_popular: formData.isPopular,
        is_free: formData.isFree,
        has_certificate: formData.hasCertificate,
        pacing_type: formData.pacingType || 'self_paced',
        target_audience: formData.targetAudience || [],
        price: Number(formData.price) || 0,
        is_live: isLive,
      };

      await apiFetch('/api/v1/courses/', {
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

  if (!currentUser?.isAdmin && !currentUser?.isInstructor) {
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
      handleLessonDetailChange={handleLessonDetailChange}
      addLiveSession={addLiveSession}
      updateLiveSession={updateLiveSession}
      removeLiveSession={removeLiveSession}
      addResource={addResource}
      updateResource={updateResource}
      removeResource={removeResource}
      handleFaqChange={handleFaqChange}
      addFaq={addFaq}
      removeFaq={removeFaq}
      addFeatureField={addFeatureField}
      removeFeatureField={removeFeatureField}
      handleTargetAudienceChange={handleTargetAudienceChange}
      addTargetAudience={addTargetAudience}
      removeTargetAudience={removeTargetAudience}
      handleSubmit={handleSubmit}
      title="Create New Course"
    />
  );
};
