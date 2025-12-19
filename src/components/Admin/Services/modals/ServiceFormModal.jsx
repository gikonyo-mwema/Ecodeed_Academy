import { Modal, Button, Badge, Tooltip } from 'flowbite-react';
import { HiOutlineClock, HiOutlineExclamation, HiOutlineCheck } from 'react-icons/hi';
import { useEffect, useState } from 'react';
import ServiceFormTabs from "../ServiceForm/ServiceFormTabs";

const ServiceFormModal = ({
  show, 
  onClose, 
  editMode, 
  currentService, 
  formData,
  onViewHistory,
  onSubmit, 
  loading = {},
  categories = [], 
  errors = {}, 
  formHandlers,
  currentUser
}) => {
  const [validationStatus, setValidationStatus] = useState({
    isValid: false,
    errors: []
  });

  // Validation effect
  useEffect(() => {
    const validateForm = () => {
      const errors = [];
      if (!formData.title?.trim()) errors.push('Title is required');
      // All other fields are now optional
      
      setValidationStatus({
        isValid: errors.length === 0,
        errors
      });
    };
    
    validateForm();
  }, [formData]);

  const {
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
    setFormData
  } = formHandlers || {};

  const handleSaveDraft = (e) => {
    e.preventDefault();
    onSubmit({ 
      ...formData, 
      isPublished: false 
    });
  };

  const handlePublish = (e) => {
    e.preventDefault();
    onSubmit({ 
      ...formData, 
      isPublished: true 
    });
  };

  return (
    <Modal show={show} onClose={onClose} size="7xl">
      <Modal.Header>
        {editMode ? `Edit ${currentService?.title}` : 'Create New Service'}
        {editMode && (
          <Badge color="gray" className="ml-2">
            {currentService?.isPublished ? 'Published' : 'Draft'}
          </Badge>
        )}
      </Modal.Header>
      
      <Modal.Body className="max-h-[80vh] overflow-y-auto">
        {editMode && (
          <div className="flex justify-end mb-4">
            <Button 
              color="light" 
              onClick={(e) => {
                e.preventDefault();
                onViewHistory();
              }}
              disabled={loading.operation}
            >
              <HiOutlineClock className="mr-2" /> Version History
            </Button>
          </div>
        )}

        <ServiceFormTabs
          formData={formData}
          handleChange={formHandlers.handleChange}
          setFormData={setFormData}
          handleProcessStepChange={formHandlers.handleProcessStepChange}
          addProcessStep={formHandlers.addProcessStep}
          removeProcessStep={formHandlers.removeProcessStep}
          handleExampleChange={formHandlers.handleExampleChange}
          addExample={formHandlers.addExample}
          removeExample={formHandlers.removeExample}
          handleProjectTypeChange={formHandlers.handleProjectTypeChange}
          addProjectType={formHandlers.addProjectType}
          removeProjectType={formHandlers.removeProjectType}
          handleBenefitChange={formHandlers.handleBenefitChange}
          addBenefit={formHandlers.addBenefit}
          removeBenefit={formHandlers.removeBenefit}
          handleFeatureChange={formHandlers.handleFeatureChange}
          addFeature={formHandlers.addFeature}
          removeFeature={formHandlers.removeFeature}
          errors={errors}
          loading={Boolean(loading.operation)}
          categories={categories}
          currentUser={currentUser}
        />
      </Modal.Body>

      <Modal.Footer className="flex justify-between items-center">
        <div className="flex items-center">
          {!validationStatus.isValid && (
            <Tooltip content={validationStatus.errors.join(', ')}>
              <Badge color="warning" icon={HiOutlineExclamation}>
                {validationStatus.errors.length} issue{validationStatus.errors.length !== 1 ? 's' : ''}
              </Badge>
            </Tooltip>
          )}
          {validationStatus.isValid && (
            <Badge color="success" icon={HiOutlineCheck}>
              Ready to publish
            </Badge>
          )}
        </div>
        
        <div className="flex gap-3">
          <Button 
            className="bg-gray-500 hover:bg-gray-600 text-white border-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="bg-brand-yellow hover:bg-brand-yellow/90 text-gray-900 border-0 focus:ring-4 focus:ring-brand-yellow/25 dark:text-gray-800"
            onClick={handleSaveDraft}
            disabled={loading.operation || !formData.title}
          >
            Save Draft
          </Button>
          <Button
            className="bg-gradient-to-r from-brand-green to-brand-blue hover:from-brand-blue hover:to-brand-green text-white border-0 focus:ring-4 focus:ring-brand-green/25"
            onClick={handlePublish}
            disabled={loading.operation || !validationStatus.isValid}
          >
            {editMode ? 'Update Service' : 'Publish Service'}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ServiceFormModal;