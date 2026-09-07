/**
 * CreateService Component
 * 
 * Full-page service creation interface for administrators.
 * Provides a complete form for creating new services with validation and auto-save.
 * 
 * Features:
 * - Full-page layout (no modal popup)
 * - Form validation with error messages
 * - Auto-save to localStorage (draft saving)
 * - Real-time save status feedback
 * - Navigation back to dashboard
 * - Publish and Save Draft options
 * 
 * @component
 * @returns {JSX.Element} Service creation form
 */

import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Alert, Spinner } from 'flowbite-react';
import {
  HiOutlineArrowLeft,
  HiCheckCircle,
  HiExclamationCircle,
} from 'react-icons/hi';
import ServiceFormTabs from './ServiceForm/ServiceFormTabs';
import { useServiceForm } from './hooks/useServiceForm';
import { useServices } from './hooks/useServices';
import { sanitizeServicePayload } from '../../../utils/serviceSanitizer';

export const CreateService = () => {
  const AUTOSAVE_KEY = 'service-draft-create-v1';
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | success | error
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [saveTick, setSaveTick] = useState(Date.now());
  const [draftRestored, setDraftRestored] = useState(false);
  const [formError, setFormError] = useState('');
  const lastSavedSerializedRef = useRef('');
  const autosaveIntervalRef = useRef(null);

  const { createService, loading } = useServices();

  // Default form data
  const defaultFormData = {
    title: '',
    shortDescription: '',
    description: '',
    category: '',
    metaTitle: '',
    metaDescription: '',
    tags: [],
    icon: '📋',
    duration: '',
    processSteps: [],
    projectTypes: [],
    benefits: [],
    features: [],
    isFeatured: false,
    isPublished: false,
    examples: [],
    price: '',
    priceSuffix: '',
  };

  const {
    formData,
    setFormData,
    errors,
    handleChange,
    handleProcessStepChange,
    addProcessStep,
    removeProcessStep,
    handleExampleChange,
    addExample,
    removeExample,
    handleProjectTypeChange,
    addProjectType,
    removeProjectType,
    handleBenefitChange,
    addBenefit,
    removeBenefit,
    handleFeatureChange,
    addFeature,
    removeFeature,
  } = useServiceForm(defaultFormData);

  // Validation
  const validationErrors = React.useMemo(() => {
    const errs = {};
    if (!formData.title?.trim()) errs.title = 'Service title is required.';
    if (!formData.category?.trim()) errs.category = 'Category is required.';
    if (!formData.shortDescription?.trim()) errs.shortDescription = 'Short description is required.';
    if (!formData.description?.trim()) errs.description = 'Full description is required.';
    return errs;
  }, [formData]);

  const isValid = Object.keys(validationErrors).length === 0;

  // Restore draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(AUTOSAVE_KEY);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setFormData(draft);
        setDraftRestored(true);
      } catch (e) {
        console.error('Failed to restore draft:', e);
      }
    }
  }, []);

  // Auto-save functionality
  useEffect(() => {
    const interval = setInterval(() => {
      const serialized = JSON.stringify(formData);
      if (serialized !== lastSavedSerializedRef.current) {
        lastSavedSerializedRef.current = serialized;
        setSaveStatus('saving');
        
        // Simulate save delay
        setTimeout(() => {
          try {
            localStorage.setItem(AUTOSAVE_KEY, serialized);
            setLastSavedAt(Date.now());
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 2000);
          } catch (e) {
            console.error('Failed to save draft:', e);
            setSaveStatus('error');
          }
        }, 300);
      }
    }, 5000); // Auto-save every 5 seconds

    autosaveIntervalRef.current = interval;
    return () => clearInterval(interval);
  }, [formData]);

  // Update save tick for "last saved" display
  useEffect(() => {
    const interval = setInterval(() => setSaveTick(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getLastSavedLabel = () => {
    if (!lastSavedAt) return 'Not saved yet';
    const sec = Math.max(0, Math.floor((saveTick - lastSavedAt) / 1000));
    if (sec < 60) return `Last saved ${sec}s ago`;
    const min = Math.floor(sec / 60);
    return `Last saved ${min}m ago`;
  };

  const handleBack = () => {
    if (formData.title || formData.description) {
      if (window.confirm('Discard unsaved changes?')) {
        localStorage.removeItem(AUTOSAVE_KEY);
        navigate('/dashboard/services');
      }
    } else {
      navigate('/dashboard/services');
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!isValid) {
      setFormError('Please fill in all required fields.');
      return;
    }

    try {
      const sanitized = sanitizeServicePayload({
        ...formData,
        isPublished: true,
      });

      await createService(sanitized);
      localStorage.removeItem(AUTOSAVE_KEY);
      navigate('/dashboard/services');
    } catch (error) {
      setFormError(error.message || 'Failed to publish service');
    }
  };

  const handleSaveDraft = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title) {
      setFormError('Service title is required to save as draft.');
      return;
    }

    try {
      const sanitized = sanitizeServicePayload({
        ...formData,
        isPublished: false,
      });

      await createService(sanitized);
      localStorage.removeItem(AUTOSAVE_KEY);
      navigate('/dashboard/services');
    } catch (error) {
      setFormError(error.message || 'Failed to save service');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              title="Go back"
            >
              <HiOutlineArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Service</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {draftRestored ? '📄 Restored from draft • ' : ''}{getLastSavedLabel()}
                {saveStatus === 'saving' && ' • Saving...'}
                {saveStatus === 'success' && ' • ✓ Saved'}
              </p>
            </div>
          </div>

          {/* Save Status Icon */}
          {saveStatus === 'saving' && <Spinner size="sm" />}
          {saveStatus === 'success' && (
            <HiCheckCircle className="w-5 h-5 text-green-600" />
          )}
          {saveStatus === 'error' && (
            <HiExclamationCircle className="w-5 h-5 text-red-600" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {formError && (
          <Alert color="failure" className="mb-6">
            <HiExclamationCircle className="mr-2" />
            {formError}
          </Alert>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <form onSubmit={handlePublish}>
            <ServiceFormTabs
              formData={formData}
              handleChange={handleChange}
              setFormData={setFormData}
              handleProcessStepChange={handleProcessStepChange}
              addProcessStep={addProcessStep}
              removeProcessStep={removeProcessStep}
              handleExampleChange={handleExampleChange}
              addExample={addExample}
              removeExample={removeExample}
              handleProjectTypeChange={handleProjectTypeChange}
              addProjectType={addProjectType}
              removeProjectType={removeProjectType}
              handleBenefitChange={handleBenefitChange}
              addBenefit={addBenefit}
              removeBenefit={removeBenefit}
              handleFeatureChange={handleFeatureChange}
              addFeature={addFeature}
              removeFeature={removeFeature}
              errors={errors}
              loading={loading.operation}
              currentUser={currentUser}
            />

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleBack}
                disabled={loading.operation}
                className="px-6 py-2.5 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-medium rounded-lg transition focus:ring-4 focus:ring-gray-400/25"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={loading.operation || !formData.title}
                className="px-6 py-2.5 bg-brand-yellow hover:bg-brand-yellow/90 disabled:bg-brand-yellow/50 text-gray-900 font-semibold rounded-lg transition focus:ring-4 focus:ring-brand-yellow/25"
              >
                Save as Draft
              </button>
              <button
                type="submit"
                disabled={loading.operation || !isValid}
                className="px-6 py-2.5 bg-gradient-to-r from-brand-green to-brand-green hover:from-brand-green/90 hover:to-brand-green/90 disabled:from-brand-green/50 disabled:to-brand-green/50 text-white font-semibold rounded-lg transition focus:ring-4 focus:ring-brand-green/25 flex items-center justify-center gap-2"
              >
                {loading.operation ? (
                  <>
                    <Spinner size="sm" />
                    Publishing...
                  </>
                ) : (
                  'Publish Service'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
