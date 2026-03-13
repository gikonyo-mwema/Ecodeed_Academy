/**\n * Edit Course Component\n * \n * Provides an interface for administrators to edit existing environmental courses.\n * Fetches course data and populates the form for modification and updates.\n * \n * Features:\n * - Fetch course data by ID from API\n * - Pre-populate form with existing course data\n * - Admin-only access with authorization check\n * - Update course with validation\n * - Feature management for existing courses\n * - Error handling and loading states\n * - Navigation after successful update\n * \n * Data Flow:\n * 1. Get courseId from URL parameters\n * 2. Verify user is admin\n * 3. Fetch course data from API\n * 4. Populate form with existing data\n * 5. Handle form submissions for updates\n * 6. Navigate to course list after update\n * \n * @component\n * @version 1.0.0\n * @author Gikonyo Mwema\n * \n * @returns {JSX.Element} Course edit form or unauthorized message\n * \n * @example\n * ```jsx\n * <EditCourse /> // Requires courseId in URL params\n * ```\n */\n\nimport React, { useEffect } from 'react';\nimport { useSelector } from 'react-redux';\nimport { useNavigate, useParams } from 'react-router-dom';\nimport { CourseForm } from './CourseForm';\n//import { useCourseForm } from './CourseForm';\nimport { Unauthorized } from './Unauthorized';\n\n/**\n * EditCourse\n * \n * Main component for editing existing courses\n * \n * @returns {JSX.Element} Course edit form or unauthorized access message\n */\nexport const EditCourse = () => {\n  const { currentUser } = useSelector((state) => state.user);\n  const { courseId } = useParams();\n  const navigate = useNavigate();
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