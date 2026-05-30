import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { CourseForm } from './CourseForm';
import { useCourseForm } from './useCourseForm';
import { Unauthorized } from './Unauthorized';
import { apiFetch } from '../../../utils/api';
import {
  HiOutlineSave,
  HiOutlineX,
  HiOutlineArrowLeft,
  HiOutlineExclamationCircle,
  HiCheckCircle,
  HiOutlineEye,
} from 'react-icons/hi';

export const EditCourse = () => {
  const { currentUser } = useSelector((state) => state.user);
  const { courseId } = useParams();
  const AUTOSAVE_KEY = `course-draft-edit-${courseId}-v1`;
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | success | error
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [saveTick, setSaveTick] = useState(Date.now());
  const [draftRestored, setDraftRestored] = useState(false);
  const lastSavedSerializedRef = useRef('');
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
    addMultipleCurriculumItems,
    duplicateCurriculumSection,
    duplicateCurriculumLesson,
    moveCurriculumSection,
    moveCurriculumLesson,
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

  const getLastSavedLabel = () => {
    if (!lastSavedAt) return 'Not saved yet';
    const sec = Math.max(0, Math.floor((saveTick - lastSavedAt) / 1000));
    if (sec < 60) return `Last saved ${sec}s ago`;
    const min = Math.floor(sec / 60);
    return `Last saved ${min}m ago`;
  };

  const saveDraftToStorage = () => {
    try {
      const payload = { savedAt: Date.now(), formData };
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(payload));
      lastSavedSerializedRef.current = JSON.stringify(formData);
      setLastSavedAt(payload.savedAt);
      setDraftRestored(false);
    } catch (storageErr) {
      // noop
    }
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/api/v1/courses/${courseId}/`);

        let nextData = {
          slug: data.slug || '',
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
        };

        const savedDraftRaw = localStorage.getItem(AUTOSAVE_KEY);
        if (savedDraftRaw) {
          try {
            const savedDraft = JSON.parse(savedDraftRaw);
            if (savedDraft?.formData) {
              nextData = { ...nextData, ...savedDraft.formData };
              setLastSavedAt(savedDraft.savedAt || Date.now());
              setDraftRestored(true);
            }
          } catch (draftErr) {
            // noop
          }
        }

        setFormData(prev => ({
          ...prev,
          ...nextData,
        }));
        lastSavedSerializedRef.current = JSON.stringify(nextData);
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

  useEffect(() => {
    const interval = setInterval(() => setSaveTick(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (saveStatus === 'saving' || saveStatus === 'success') return;
      const serialized = JSON.stringify(formData);
      if (serialized && serialized !== lastSavedSerializedRef.current) {
        saveDraftToStorage();
      }
    }, 25000);

    return () => clearInterval(interval);
  }, [formData, saveStatus]);

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

  const handleSubmit = async (e, { isLive } = {}) => {
    e.preventDefault();
    if (hasCriticalErrors) {
      setError('Please resolve required field errors before publishing.');
      return;
    }
    setSaveStatus('saving');
    try {
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

      await apiFetch(`/api/v1/courses/${courseId}/`, {
        method: 'PUT',
        body: JSON.stringify(submitData),
      });

      localStorage.removeItem(AUTOSAVE_KEY);

      setSaveStatus('success');

      // brief success feedback before redirect
      setTimeout(() => {
        navigate('/dashboard?tab=courses');
      }, 1000);
    } catch (error) {
      setError(error.message);
      setSaveStatus('error');

      // reset status chip after a short delay
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  if (!currentUser?.isAdmin && !currentUser?.isInstructor) {
    return <Unauthorized />;
  }

  if (loading && !formData.title) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-brand-blue flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-400 rounded-full animate-spin absolute top-4 left-1/2 -translate-x-1/2 opacity-60"></div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Loading course</h3>
          <p className="text-sm text-gray-500 dark:text-gray-300">Please wait while we fetch your course details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-blue py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard?tab=courses')}
                className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-colors group"
                aria-label="Go back"
              >
                <HiOutlineArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Course</h1>
                <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                  Update your course information below
                </p>
              </div>
            </div>

            {/* Save status indicator + save action */}
            <div className="flex items-center space-x-3 flex-wrap">
              {saveStatus === 'saving' && (
                <div className="flex items-center text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
                  <span className="mr-2 h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium">Saving changes...</span>
                </div>
              )}

              {saveStatus === 'success' && (
                <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                  <HiCheckCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Saved successfully!</span>
                </div>
              )}

              {saveStatus === 'error' && (
                <div className="flex items-center text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                  <HiOutlineExclamationCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Save failed</span>
                </div>
              )}

              <div className="text-xs text-gray-500 dark:text-gray-300 px-2 py-1 rounded-lg bg-gray-100/70 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                {getLastSavedLabel()}
              </div>

              {formData?.slug && (
                <button
                  type="button"
                  onClick={() => navigate(`/learn/${formData.slug}?preview=1`)}
                  className="inline-flex items-center px-4 py-3 bg-transparent border border-brand-green text-brand-green font-medium rounded-xl hover:bg-brand-green hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green transition-all"
                >
                  <HiOutlineEye className="w-4 h-4 mr-2" />
                  Open Student View
                </button>
              )}

              <div className="flex items-center gap-2">
                {activeStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    disabled={saveStatus === 'saving'}
                    className="inline-flex items-center px-4 py-3 bg-transparent border border-brand-green text-brand-green font-medium rounded-xl hover:bg-brand-green hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                )}

                {activeStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-brand-green to-brand-yellow text-white font-medium rounded-xl hover:from-brand-green/90 hover:to-brand-yellow/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green transition-all shadow-sm hover:shadow-md"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="submit"
                    form="course-form"
                    disabled={saveStatus === 'saving' || hasCriticalErrors}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-brand-green to-brand-yellow text-white font-medium rounded-xl hover:from-brand-green/90 hover:to-brand-yellow/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                  >
                    {saveStatus === 'saving' ? (
                      <>
                        <span className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <HiOutlineSave className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="mt-6 flex items-center space-x-2">
            <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${(activeStep / 3) * 100}%` }} />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-300 font-medium">Step {activeStep} of 3</span>
          </div>

          {/* Error banner */}
          {error && saveStatus !== 'saving' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start">
              <HiOutlineExclamationCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Error saving course</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800"
                aria-label="Dismiss error"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Main form */}
        <div className="bg-gray-50 dark:bg-brand-blue/80 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Guided step header */}
          <div className="border-b border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-brand-blue/90 px-6 py-3">
            <div className="flex space-x-6">
              {[
                { id: 1, label: 'Basic Information' },
                { id: 2, label: 'Curriculum' },
                { id: 3, label: 'Advanced Settings' },
              ].map((step) => {
                const isActive = activeStep === step.id;
                const isCompleted = activeStep > step.id;

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => handleStepClick(step.id)}
                    className={`text-sm font-medium pb-3 px-1 border-b-2 transition-colors ${
                      isActive
                        ? 'text-blue-600 border-blue-600'
                        : isCompleted
                          ? 'text-green-600 border-green-600'
                          : 'text-gray-500 border-transparent hover:text-gray-700'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      {step.label}
                      {sectionErrorCounts[step.id] > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200">
                          {sectionErrorCounts[step.id]}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

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
            handleFaqChange={handleFaqChange}
            addFeatureField={addFeatureField}
            removeFeatureField={removeFeatureField}
            handleTargetAudienceChange={handleTargetAudienceChange}
            addTargetAudience={addTargetAudience}
            removeTargetAudience={removeTargetAudience}
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
            addFaq={addFaq}
            removeFaq={removeFaq}
            handleSubmit={handleSubmit}
            title="Edit Course"
          />
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-300">
            {activeStep < 3
              ? 'Complete this step to continue to the next section.'
              : 'Changes are saved when you click "Save Changes"'}
          </p>
        </div>
      </div>
    </div>
  );
};