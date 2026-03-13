import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { CourseForm } from './CourseForm';
import { useCourseForm } from './useCourseForm';
import { Unauthorized } from './Unauthorized';
import { apiFetch } from '../../../utils/api';

export const EditCourse = () => {
  const { currentUser } = useSelector((state) => state.user);
  const { courseId } = useParams();
  const navigate = useNavigate();
  const {
    formData,
    setFormData,
    error,
    setError,
    loading,
    setLoading,
    handleChange,
    handleFeatureChange,
    addFeatureField,
    removeFeatureField,
    handleTargetAudienceChange,
    addTargetAudience,
    removeTargetAudience,
    handleCurriculumChange,
    handleCurriculumItemChange,
    addCurriculumSection,
    addCurriculumItem,
    removeCurriculumItem,
    handleLessonDetailChange,
    addLiveSession,
    updateLiveSession,
    removeLiveSession,
    addResource,
    updateResource,
    removeResource,
    handleFaqChange,
    addFaq,
    removeFaq
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
    curriculum: []
  });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/api/v1/courses/${courseId}/`);

        setFormData(prev => ({
          ...prev,
          title: data.title || '',
          price: data.price || '',
          shortDescription: data.short_description || data.shortDescription || '',
          description: data.full_description || data.description || '',
          isPopular: data.is_popular !== undefined ? data.is_popular : (data.isPopular || false),
          isFree: data.is_free !== undefined ? data.is_free : (data.isFree || false),
          hasCertificate: data.has_certificate !== undefined ? data.has_certificate : (data.hasCertificate || false),
          isLive: data.is_live !== undefined ? data.is_live : (data.isLive || false),
          pacingType: data.pacing_type || data.pacingType || 'self_paced',
          category: data.category || 'specialized',
          features: Array.isArray(data.features) && data.features.length > 0 ? data.features : [''],
          targetAudience: Array.isArray(data.target_audience) && data.target_audience.length > 0 ? data.target_audience : (Array.isArray(data.targetAudience) && data.targetAudience.length > 0 ? data.targetAudience : ['']),
          faqs: Array.isArray(data.faqs) && data.faqs.length > 0 ? data.faqs : [{ question: '', answer: '' }],
          curriculum: Array.isArray(data.curriculum) && data.curriculum.length > 0
            ? data.curriculum.map(section => ({
                ...section,
                items: Array.isArray(section.items) ? section.items : [],
                live_sessions: Array.isArray(section.live_sessions) ? section.live_sessions : [],
                resources: Array.isArray(section.resources) ? section.resources : [],
              }))
            : []
        }));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.isAdmin || currentUser?.isInstructor) {
      fetchCourse();
    }
  }, [courseId, currentUser, setFormData, setError, setLoading]);

  const handleSubmit = async (e, { isLive } = {}) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      if (!currentUser?.isAdmin && !currentUser?.isInstructor) {
        throw new Error('Only admins and instructors can edit courses');
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
        // If isLive is explicitly passed (from Publish/Unpublish buttons), use it.
        // Otherwise preserve the current value from formData.
        is_live: isLive !== undefined ? isLive : Boolean(formData.isLive),
      };

      const data = await apiFetch(`/api/v1/courses/${courseId}/`, {
        method: 'PUT',
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

  if (loading && !formData.title) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
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
      handleFaqChange={handleFaqChange}
      addFeatureField={addFeatureField}
      removeFeatureField={removeFeatureField}
      handleTargetAudienceChange={handleTargetAudienceChange}
      addTargetAudience={addTargetAudience}
      removeTargetAudience={removeTargetAudience}
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
      addFaq={addFaq}
      removeFaq={removeFaq}
      handleSubmit={handleSubmit}
      title="Edit Course"
    />
  );
};