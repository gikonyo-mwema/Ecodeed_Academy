import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { CourseForm } from './CourseForm';
//import { useCourseForm } from './CourseForm';
import { Unauthorized } from './Unauthorized';

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
    removeFeatureField
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

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/courses/${courseId}`);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch course');
        }

        setFormData({
          title: data.title,
          slug: data.slug,
          price: data.price,
          shortDescription: data.shortDescription,
          description: data.description,
          externalUrl: data.externalUrl,
          isPopular: data.isPopular || false,
          paymentOption: data.paymentOption || 'one-time',
          features: data.features || [''],
          cta: data.cta || 'Enroll Now',
          iconName: data.iconName || 'HiOutlineAcademicCap'
        });
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

      // Validate required fields
      if (!formData.slug || !formData.externalUrl) {
        throw new Error('Slug and External URL are required');
      }

      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update course');
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
      addFeatureField={addFeatureField}
      removeFeatureField={removeFeatureField}
      handleSubmit={handleSubmit}
      title="Edit Course"
      submitButtonText="Update Course"
    />
  );
};