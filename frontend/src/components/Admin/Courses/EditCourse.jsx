import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { CourseForm } from './CourseForm';
import { useCourseForm } from './useCourseForm';
import { Unauthorized } from './Unauthorized';
import { apiFetch } from '../../../utils/api';
import {
  HiOutlinePencil,
  HiOutlineX,
  HiOutlineArrowLeft,
  HiOutlineExclamationCircle,
  HiCheckCircle,
} from 'react-icons/hi';

export const EditCourse = () => {
  const AUTOSAVE_KEY_PREFIX = 'course-draft-edit-v1-';
  const { courseId } = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | success | error
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [saveTick, setSaveTick] = useState(Date.now());
  const [draftRestored, setDraftRestored] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const lastSavedSerializedRef = useRef('');
  const {
    formData,
    setFormData,
    error,
    loading,
    handleChange,
    handleFeatureChange,
    handleCurriculumChange,
    handleCurriculumItemChange,
    addCurriculumSection,
    addCurriculumItem,
    addMultipleCurriculumItems,
    duplicateCurriculumSection,
    duplicateCurriculumLesson,
    moveCurriculumSection,
    moveCurriculumLesson,
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
    curriculum: [{ title: '', items: [''], live_sessions: [], resources: [] }],
    iconName: 'HiOutlineAcademicCap' // Add default icon name
  });

  // Load course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const course = await apiFetch(`/api/v1/courses/${courseId}/`);
        
        // Convert snake_case to camelCase for form
        setFormData({
          id: course.id,
          title: course.title || '',
          price: course.price || '',
          shortDescription: course.short_description || '',
          description: course.full_description || '',
          isPopular: course.is_popular || false,
          isFree: course.is_free || false,
          isLive: course.is_live || false,
          hasCertificate: course.has_certificate || false,
          pacingType: course.pacing_type || 'self_paced',
          category: course.category || 'specialized',
          features: course.features || [''],
          targetAudience: course.target_audience || [''],
          faqs: course.faqs || [{ question: '', answer: '' }],
          curriculum: course.curriculum || [{ title: '', items: [''], live_sessions: [], resources: [] }],
          image: course.image || '',
          iconName: course.icon_name || course.iconName || 'HiOutlineAcademicCap' // Handle both snake_case and camelCase
        });
        
        // Check for autosaved draft for this course
        const AUTOSAVE_KEY = `${AUTOSAVE_KEY_PREFIX}${courseId}`;
        try {
          const raw = localStorage.getItem(AUTOSAVE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.formData && typeof parsed.formData === 'object') {
              setFormData((prev) => ({ ...prev, ...parsed.formData }));
              setLastSavedAt(parsed.savedAt || Date.now());
              lastSavedSerializedRef.current = JSON.stringify(parsed.formData);
              setDraftRestored(true);
            }
          }
        } catch (restoreErr) {
          // noop
        }
        
        setInitialLoadComplete(true);
      } catch (err) {
        setError(err.message);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId, setFormData]);

  const validationErrors = useMemo(() => {
    const errors = {};

    if (!formData.title?.trim()) errors.title = 'Course title is required.';
    if (!formData.category?.trim()) errors.category = 'Category is required.';
    if (!formData.shortDescription?.trim()) errors.shortDescription = 'Short description is required.';
    if (!formData.description?.trim()) errors.description = 'Full description is required.';
    if (!formData.isFree && (formData.price === '' || Number(formData.price) < 0)) {
      errors.price = 'Provide a valid price or mark this course as free.';
    }

    const curriculum = Array.isArray(formData.curriculum) ? formData.curriculum : [];
    if (curriculum.length === 0) {
      errors.curriculum = 'Add at least one week.';
    } else {
      let missingWeekTitle = false;
      let missingLessonTitle = false;
      curriculum.forEach((section) => {
        if (!section?.title?.trim()) missingWeekTitle = true;
        const items = Array.isArray(section?.items) ? section.items : [];
        if (!items.length) {
          missingLessonTitle = true;
          return;
        }
        const hasLessonTitle = items.some((item) => {
          if (typeof item === 'string') return item.trim().length > 0;
          return item?.title?.trim()?.length > 0;
        });
        if (!hasLessonTitle) missingLessonTitle = true;
      });
      if (missingWeekTitle) errors.weekTitle = 'Each week needs a title.';
      if (missingLessonTitle) errors.lessonTitle = 'Each week needs at least one lesson title.';
    }

    return errors;
  }, [formData]);

  const sectionErrorCounts = useMemo(() => ({
    1: ['title', 'category', 'shortDescription', 'description', 'price'].filter((k) => validationErrors[k]).length,
    2: ['curriculum', 'weekTitle', 'lessonTitle'].filter((k) => validationErrors[k]).length,
    3: 0,
  }), [validationErrors]);

  const hasCriticalErrors = sectionErrorCounts[1] > 0 || sectionErrorCounts[2] > 0;

  const getStepValidationMessage = (step) => {
    if (step === 1) {
      if (validationErrors.title) return validationErrors.title;
      if (validationErrors.category) return validationErrors.category;
      if (validationErrors.shortDescription) return validationErrors.shortDescription;
      if (validationErrors.description) return validationErrors.description;
      if (validationErrors.price) return validationErrors.price;
    }
    if (step === 2) {
      if (validationErrors.curriculum) return validationErrors.curriculum;
      if (validationErrors.weekTitle) return validationErrors.weekTitle;
      if (validationErrors.lessonTitle) return validationErrors.lessonTitle;
    }
    return null;
  };

  const AUTOSAVE_KEY = `${AUTOSAVE_KEY_PREFIX}${courseId}`;

  const getLastSavedLabel = () => {
    if (!lastSavedAt) return 'Not saved yet';
    const sec = Math.max(0, Math.floor((saveTick - lastSavedAt) / 1000));
    if (sec < 60) return `Last saved ${sec}s ago`;
    const min = Math.floor(sec / 60);
    return `Last saved ${min}m ago`;
  };

  const saveDraftToStorage = () => {
    try {
      const payload = {
        savedAt: Date.now(),
        formData,
      };
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(payload));
      const serialized = JSON.stringify(formData);
      lastSavedSerializedRef.current = serialized;
      setLastSavedAt(payload.savedAt);
      setDraftRestored(false);
    } catch (storageErr) {
      // noop
    }
  };

  useEffect(() => {
    const interval = setInterval(() => setSaveTick(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to top when step changes
  useEffect(() => {
    // Small delay to ensure DOM has updated
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 50);
  }, [activeStep]);

  useEffect(() => {
    if (!initialLoadComplete) return; // Don't autosave until initial load is complete
    
    const interval = setInterval(() => {
      if (saveStatus === 'saving' || saveStatus === 'success') return;
      const serialized = JSON.stringify(formData);
      if (serialized && serialized !== lastSavedSerializedRef.current) {
        saveDraftToStorage();
      }
    }, 25000);

    return () => clearInterval(interval);
  }, [formData, saveStatus, initialLoadComplete]);

  const validateStep = (step) => {
    const message = getStepValidationMessage(step);
    if (message) {
      setError(message);
      return false;
    }

    setError(null);
    return true;
  };

  const handleNextStep = () => {
    if (activeStep >= 3) return;
    if (!validateStep(activeStep)) return;
    setActiveStep((prev) => Math.min(prev + 1, 3));
  };

  const handlePreviousStep = () => {
    setError(null);
    setActiveStep((prev) => Math.max(prev - 1, 1));
  };

  const handleStepClick = (step) => {
    if (step <= activeStep) {
      setError(null);
      setActiveStep(step);
      return;
    }

    for (let i = activeStep; i < step; i += 1) {
      if (!validateStep(i)) return;
    }

    setActiveStep(step);
  };

  const handleSubmit = async (e, { isLive = true } = {}) => {
    e.preventDefault();
    if (hasCriticalErrors) {
      setError('Please resolve required field errors before publishing.');
      return;
    }
    setSaveStatus('saving');

    try {
      setError(null);
      
      // Validate admin or instructor status
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
        is_live: isLive,
        icon_name: formData.iconName  // Add icon_name for backend
      };

      await apiFetch(`/api/v1/courses/${courseId}/`, {
        method: 'PUT',
        body: JSON.stringify(submitData),
      });

      // Remove autosave draft for this course
      localStorage.removeItem(AUTOSAVE_KEY);

      setSaveStatus('success');

      // Show success briefly before redirect
      setTimeout(() => {
        navigate('/dashboard?tab=courses');
      }, 1500);
    } catch (error) {
      setError(error.message);
      setSaveStatus('error');

      // Clear transient status chip
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  if (!currentUser?.isAdmin && !currentUser?.isInstructor) {
    return <Unauthorized />;
  }

  if (!initialLoadComplete && loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-brand-blue dark:to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-brand-blue dark:to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Header */}
        <div className="mb-8 text-center">
          <button
            onClick={() => navigate('/dashboard?tab=courses')}
            className="inline-flex items-center p-2 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-colors group mb-4"
            aria-label="Go back"
          >
            <HiOutlineArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white" />
          </button>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Course</h1>
            <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-700/40">
              {formData.isLive ? 'Published' : 'Draft'}
            </span>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {formData.title || 'Editing course...'}
          </p>

          {/* Error banner */}
          {error && saveStatus !== 'saving' && (
            <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl flex items-start max-w-2xl mx-auto">
              <HiOutlineExclamationCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error updating course</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 transition-colors"
                aria-label="Dismiss error"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Main form */}
        <div className="bg-gray-50 dark:bg-brand-blue/80 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {draftRestored && (
            <div className="mx-6 mt-4 px-4 py-2 rounded-lg text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800/40">
              Unsaved draft restored from local storage.
            </div>
          )}

          <CourseForm
            id="course-form"
            showHeader={false}
            showSubmitButtons={false}
            activeStep={activeStep}
            validationErrors={validationErrors}
            sectionErrorCounts={sectionErrorCounts}
            formData={formData}
            error={error}
            loading={loading || saveStatus === 'saving'}
            handleChange={handleChange}
            handleFeatureChange={handleFeatureChange}
            handleCurriculumChange={handleCurriculumChange}
            handleCurriculumItemChange={handleCurriculumItemChange}
            addCurriculumSection={addCurriculumSection}
            addCurriculumItem={addCurriculumItem}
            addMultipleCurriculumItems={addMultipleCurriculumItems}
            duplicateCurriculumSection={duplicateCurriculumSection}
            duplicateCurriculumLesson={duplicateCurriculumLesson}
            moveCurriculumSection={moveCurriculumSection}
            moveCurriculumLesson={moveCurriculumLesson}
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
            setActiveStep={setActiveStep} // Pass setActiveStep to allow checklist navigation
            title="Edit Course"
          />
        </div>

        {/* Bottom Action Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-6 pb-8">
          {/* Save Status */}
          {(saveStatus !== 'idle' || lastSavedAt) && (
            <div className="flex items-center space-x-3 flex-wrap justify-center">
              {saveStatus === 'saving' && (
                <div className="flex items-center text-brand-green dark:text-brand-yellow text-sm">
                  <span className="mr-2 h-3 w-3 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
                  <span className="font-medium">Saving...</span>
                </div>
              )}

              {saveStatus === 'success' && (
                <div className="flex items-center text-green-600 dark:text-green-200 text-sm">
                  <HiCheckCircle className="w-4 h-4 mr-2" />
                  <span className="font-medium">Saved</span>
                </div>
              )}

              {saveStatus === 'error' && (
                <div className="flex items-center text-red-600 dark:text-red-200 text-sm">
                  <HiOutlineExclamationCircle className="w-4 h-4 mr-2" />
                  <span className="font-medium">Save failed</span>
                </div>
              )}

              {saveStatus === 'idle' && lastSavedAt && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {getLastSavedLabel()}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-4 flex-wrap justify-center">
            {activeStep > 1 && (
              <button
                type="button"
                onClick={handlePreviousStep}
                disabled={saveStatus === 'saving'}
                className="px-6 py-2 text-sm font-medium text-brand-green dark:text-brand-yellow hover:text-brand-green/80 dark:hover:text-brand-yellow/80 border border-brand-green dark:border-brand-yellow rounded-lg hover:bg-brand-green/10 dark:hover:bg-brand-yellow/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
            )}

            {activeStep < 3 && (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-brand-green to-brand-yellow hover:from-brand-green/90 hover:to-brand-yellow/90 rounded-lg transition-colors"
              >
                Next Step
              </button>
            )}

            {activeStep === 3 && (
              <button
                type="submit"
                form="course-form"
                disabled={saveStatus === 'saving' || hasCriticalErrors}
                className="px-8 py-2 text-sm font-medium text-white bg-gradient-to-r from-brand-green to-brand-yellow hover:from-brand-green/90 hover:to-brand-yellow/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saveStatus === 'saving' ? (
                  <>
                    <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    Update Course
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};