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
    handleCurriculumChange,
    handleCurriculumItemChange,
    addCurriculumSection,
    addCurriculumItem,
    removeCurriculumItem,
    handleLessonDetailChange,
    handleFaqChange,
    addFaq,
    removeFaq
  } = useCourseForm({
    title: '',
    slug: '',
    price: '',
    shortDescription: '',
    description: '',
    externalUrl: '',
    isPopular: false,
    isFree: false,
    hasCertificate: false,
    pacingType: 'self_paced',
    category: 'specialized',
    features: [''],
    faqs: [{ question: '', answer: '' }],
    level: [],
    format: [],
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
          slug: data.slug || '',
          price: data.price || '',
          shortDescription: data.short_description || data.shortDescription || '',
          description: data.full_description || data.description || '',
          externalUrl: data.external_url || data.externalUrl || '',
          isPopular: data.is_popular !== undefined ? data.is_popular : (data.isPopular || false),
          isFree: data.is_free !== undefined ? data.is_free : (data.isFree || false),
          hasCertificate: data.has_certificate !== undefined ? data.has_certificate : (data.hasCertificate || false),
          pacingType: data.pacing_type || data.pacingType || 'self_paced',
          category: data.category || 'specialized',
          features: Array.isArray(data.features) && data.features.length > 0 ? data.features : [''],
          faqs: Array.isArray(data.faqs) && data.faqs.length > 0 ? data.faqs : [{ question: '', answer: '' }],
          level: Array.isArray(data.level) ? data.level : [],
          format: Array.isArray(data.format) ? data.format : [],
          curriculum: Array.isArray(data.curriculum) && data.curriculum.length > 0 ? data.curriculum : []
        }));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.isAdmin) {
      fetchCourse();
    }
  }, [courseId, currentUser, setFormData, setError, setLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      if (!currentUser?.isAdmin) {
        throw new Error('Only admins can edit courses');
      }

      // Map back to snake_case for Django
      const submitData = {
        ...formData,
        short_description: formData.shortDescription,
        full_description: formData.description,
        external_url: formData.externalUrl,
        is_popular: formData.isPopular,
        is_free: formData.isFree,
        has_certificate: formData.hasCertificate,
        pacing_type: formData.pacingType || 'self_paced',
        price: Number(formData.price) || 0
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

  if (!currentUser?.isAdmin) {
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
      addCurriculumSection={addCurriculumSection}
      addCurriculumItem={addCurriculumItem}
      removeCurriculumItem={removeCurriculumItem}
      handleLessonDetailChange={handleLessonDetailChange}
      addFaq={addFaq}
      removeFaq={removeFaq}
      handleSubmit={handleSubmit}
      title="Edit Course"
      submitButtonText="Update Course"
    />
  );
};