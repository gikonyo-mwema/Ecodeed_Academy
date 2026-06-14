import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CourseForm } from './CourseForm';
import { useCourseForm } from './useCourseForm';
import { Unauthorized } from './Unauthorized';
import { apiFetch } from '../../../utils/api';
import {
  HiOutlinePlus,
  HiOutlineX,
  HiOutlineArrowLeft,
  HiOutlineExclamationCircle,
  HiCheckCircle,
} from 'react-icons/hi';

export const CreateCourse = () => {
  const AUTOSAVE_KEY = 'course-draft-create-v1';
  const { currentUser } = useSelector((state) => state.user);
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
    try {
      const raw = localStorage.getItem(AUTOSAVE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.formData && typeof parsed.formData === 'object') {
        setFormData((prev) => ({ ...prev, ...parsed.formData }));
        setLastSavedAt(parsed.savedAt || Date.now());
        lastSavedSerializedRef.current = JSON.stringify(parsed.formData);
        setDraftRestored(true);
      }
    } catch (restoreErr) {
      // noop
    }
  }, [setFormData]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-brand-blue dark:to-gray-900 py-8">
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
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Course</h1>
                  <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-700/40">
                    Draft
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                  Fill in the details below to create your new course
                </p>
              </div>
            </div>

            {/* Save status + primary action */}
            <div className="flex items-center space-x-3 flex-wrap">
              {saveStatus === 'saving' && (
                <div className="flex items-center text-blue-600 dark:text-blue-200 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-lg border border-blue-100 dark:border-blue-800/40">
                  <span className="mr-2 h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium">Creating course...</span>
                </div>
              )}

              {saveStatus === 'success' && (
                <div className="flex items-center text-green-600 dark:text-green-200 bg-green-50 dark:bg-green-900/30 px-4 py-2 rounded-lg border border-green-100 dark:border-green-800/40">
                  <HiCheckCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Course created!</span>
                </div>
              )}

              {saveStatus === 'error' && (
                <div className="flex items-center text-red-600 dark:text-red-200 bg-red-50 dark:bg-red-900/30 px-4 py-2 rounded-lg border border-red-100 dark:border-red-800/40">
                  <HiOutlineExclamationCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Creation failed</span>
                </div>
              )}

              <div className="text-xs text-gray-500 dark:text-gray-300 px-2 py-1 rounded-lg bg-gray-100/70 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                {getLastSavedLabel()}
              </div>

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
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                  >
                    {saveStatus === 'saving' ? (
                      <>
                        <span className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <HiOutlinePlus className="w-4 h-4 mr-2" />
                        Create Course
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
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl flex items-start">
              <HiOutlineExclamationCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error creating course</h3>
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
                          : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-200'
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
            title="Create New Course"
          />
        </div>

        {/* Tips section */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50/50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/40">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <HiOutlinePlus className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200">Pro Tip</h4>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Add a compelling course title to attract more students.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50/50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800/40">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <HiCheckCircle className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-purple-900 dark:text-purple-200">Completion</h4>
                <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                  Fill out all sections for a complete course experience.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50/50 dark:bg-green-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800/40">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <HiOutlinePlus className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-green-900 dark:text-green-200">Curriculum</h4>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  Start with one week and add more as you go.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-300">
            {activeStep < 3
              ? 'Complete this step to continue to the next section.'
              : 'Your course will be created when you click "Create Course"'}
          </p>
        </div>
      </div>
    </div>
  );
};