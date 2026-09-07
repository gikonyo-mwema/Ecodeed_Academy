/**
 * Service Form - Simplified Single Page
 * 
 * @component
 * @version 2.0.0
 * @author Gikonyo Mwema
 */

import { 
  Label, 
  TextInput, 
  Textarea, 
  Select, 
  ToggleSwitch, 
  Button, 
  Alert
} from 'flowbite-react';
import { HiOutlineTrash, HiOutlinePlus } from 'react-icons/hi';
import TipTapEditor from '../../../Editor/TipTapEditor';

const ServiceFormTabs = ({
  formData,
  handleChange,
  setFormData,
  handleProjectTypeChange, 
  addProjectType,
  removeProjectType,
  handleBenefitChange,
  addBenefit,
  removeBenefit,
  handleFeatureChange,
  addFeature,
  removeFeature,
  handleProcessStepChange,
  addProcessStep,
  removeProcessStep,
  handleExampleChange,
  addExample,
  removeExample,
  errors,
  formError,
  loading,
  categories = [],
  currentUser
}) => {
  
  const handleRichTextChange = (html) => {
    if (setFormData) {
      setFormData({ ...formData, description: html });
    }
  };
  
  const handleToggleChange = (checked) => {
    if (setFormData) {
      setFormData({ ...formData, isFeatured: checked });
    }
  };

  const iconOptions = [
    { value: '📋', label: 'Document' },
    { value: '🌍', label: 'Environment' },
    { value: '🌱', label: 'Sustainability' },
    { value: '🏗️', label: 'Construction' },
    { value: '🌿', label: 'Nature' },
    { value: '💧', label: 'Water' },
    { value: '🌳', label: 'Forestry' },
    { value: '🔬', label: 'Research' },
    { value: '📊', label: 'Analysis' },
    { value: '🛡️', label: 'Protection' },
    { value: '♻️', label: 'Recycling' },
    { value: '⚡', label: 'Energy' },
    { value: '🌞', label: 'Solar' },
    { value: '🌬️', label: 'Wind' },
    { value: '🏭', label: 'Industrial' },
  ];

  const benefitIcons = [
    { value: '✅', label: 'Check Mark' },
    { value: '⏱️', label: 'Time' },
    { value: '💰', label: 'Money' },
    { value: '🛡️', label: 'Shield' },
    { value: '🌱', label: 'Sustainability' },
  ];

  const {
    projectTypes = [],
    benefits = [],
    features = [],
    processSteps = [],
    examples = []
  } = formData;

  return (
    <div className="space-y-6 pb-4 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">
      {formError && (
        <Alert color="failure" className="mb-4">
          {formError}
        </Alert>
      )}

      {/* Basic Information */}
      <section className="bg-white dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Service Title */}
          <div className="md:col-span-2">
            <Label htmlFor="title" value="Service Title *" />
            <TextInput
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              color={errors.title ? 'failure' : 'gray'}
              helperText={errors.title}
              disabled={loading}
              placeholder="Enter service name"
            />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category" value="Category" />
            <TextInput
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={loading}
              placeholder="e.g., Environmental Audit"
            />
          </div>

          {/* Icon */}
          <div>
            <Label htmlFor="icon" value="Icon" />
            <Select
              id="icon"
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              disabled={loading}
            >
              {iconOptions.map(icon => (
                <option key={icon.value} value={icon.value}>
                  {icon.value} {icon.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Short Description */}
          <div className="md:col-span-2">
            <Label htmlFor="shortDescription" value="Short Description" />
            <Textarea
              id="shortDescription"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              rows={2}
              disabled={loading}
              placeholder="Brief summary"
            />
          </div>

          {/* Full Description */}
          <div className="md:col-span-2">
            <Label htmlFor="description" value="Full Description *" />
            <TipTapEditor
              content={formData.description || ''}
              onChange={handleRichTextChange}
              placeholder="Describe your service in detail"
              minHeight="200px"
            />
            {errors.description && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.description}</p>
            )}
          </div>

          {/* SEO Fields */}
          <div>
            <Label htmlFor="metaTitle" value="SEO Title" />
            <TextInput
              id="metaTitle"
              name="metaTitle"
              value={formData.metaTitle}
              onChange={handleChange}
              disabled={loading}
              placeholder="For search engines"
            />
          </div>

          <div>
            <Label htmlFor="metaDescription" value="SEO Description" />
            <TextInput
              id="metaDescription"
              name="metaDescription"
              value={formData.metaDescription}
              onChange={handleChange}
              disabled={loading}
              placeholder="For search engines"
            />
          </div>

          {/* Featured Toggle */}
          <div className="md:col-span-2">
            <ToggleSwitch
              checked={formData.isFeatured || false}
              label="Featured Service"
              onChange={handleToggleChange}
              disabled={loading}
            />
          </div>
        </div>
      </section>

      {/* Project Types */}
      <section className="bg-white dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Project Types</h3>
        <div className="space-y-3">
          {projectTypes.map((type, index) => (
            <div key={index} className="flex gap-2 items-center">
              <TextInput
                value={type}
                onChange={(e) => handleProjectTypeChange(index, e.target.value)}
                color={errors[`projectType${index}`] ? 'failure' : 'gray'}
                disabled={loading}
                placeholder="e.g., Commercial buildings"
                className="flex-1"
              />
              <Button
                color="failure"
                size="sm"
                onClick={() => removeProjectType(index)}
                disabled={projectTypes.length <= 1 || loading}
              >
                <HiOutlineTrash />
              </Button>
            </div>
          ))}
          <Button
            color="none"
            className="bg-brand-green hover:bg-brand-green/90 text-white border-0 text-sm"
            onClick={addProjectType}
            disabled={loading}
          >
            <HiOutlinePlus className="mr-1" /> Add Type
          </Button>
        </div>
      </section>

      {/* Process Steps */}
      <section className="bg-white dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Process Steps</h3>
        <div className="space-y-4">
          {processSteps?.map((step, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <Label value={`Step ${index + 1} Title`} />
                  <TextInput
                    value={step.title || step.step || ''}
                    onChange={(e) => handleProcessStepChange(index, 'title', e.target.value)}
                    disabled={loading}
                    placeholder="Step title"
                    size="sm"
                  />
                </div>
                <div>
                  <Label value="Order" />
                  <TextInput
                    type="number"
                    value={step.order || index + 1}
                    onChange={(e) => handleProcessStepChange(index, 'order', parseInt(e.target.value))}
                    disabled={loading}
                    min="1"
                    size="sm"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    color="failure"
                    size="sm"
                    onClick={() => removeProcessStep(index)}
                    disabled={processSteps.length <= 1 || loading}
                  >
                    Remove
                  </Button>
                </div>
              </div>
              <div>
                <Label value="Description" />
                <Textarea
                  value={step.description || ''}
                  onChange={(e) => handleProcessStepChange(index, 'description', e.target.value)}
                  rows={2}
                  disabled={loading}
                  placeholder="What happens in this step"
                />
              </div>
            </div>
          ))}
          <Button
            color="none"
            className="bg-brand-green hover:bg-brand-green/90 text-white border-0 text-sm"
            onClick={addProcessStep}
            disabled={loading}
          >
            <HiOutlinePlus className="mr-1" /> Add Step
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Features</h3>
        <div className="space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <Label value={`Feature ${index + 1} Title`} />
                  <TextInput
                    value={feature.title}
                    onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                    disabled={loading}
                    placeholder="Feature name"
                    size="sm"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    color="failure"
                    size="sm"
                    onClick={() => removeFeature(index)}
                    disabled={features.length <= 1 || loading}
                  >
                    Remove
                  </Button>
                </div>
              </div>
              <div>
                <Label value="Description" />
                <Textarea
                  value={feature.description}
                  onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                  rows={2}
                  disabled={loading}
                  placeholder="Describe this feature"
                />
              </div>
            </div>
          ))}
          <Button
            color="none"
            className="bg-brand-green hover:bg-brand-green/90 text-white border-0 text-sm"
            onClick={addFeature}
            disabled={loading}
          >
            <HiOutlinePlus className="mr-1" /> Add Feature
          </Button>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Benefits</h3>
        <div className="space-y-4">
          {benefits.map((benefit, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <Label value={`Benefit ${index + 1} Title`} />
                  <TextInput
                    value={benefit.title}
                    onChange={(e) => handleBenefitChange(index, 'title', e.target.value)}
                    disabled={loading}
                    placeholder="Benefit title"
                    size="sm"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Select
                    value={benefit.icon || '✅'}
                    onChange={(e) => handleBenefitChange(index, 'icon', e.target.value)}
                    disabled={loading}
                    className="flex-1"
                  >
                    {benefitIcons.map(icon => (
                      <option key={icon.value} value={icon.value}>{icon.value} {icon.label}</option>
                    ))}
                  </Select>
                  <Button
                    color="failure"
                    size="sm"
                    onClick={() => removeBenefit(index)}
                    disabled={benefits.length <= 1 || loading}
                  >
                    Remove
                  </Button>
                </div>
              </div>
              <div>
                <Label value="Description" />
                <Textarea
                  value={benefit.description}
                  onChange={(e) => handleBenefitChange(index, 'description', e.target.value)}
                  rows={2}
                  disabled={loading}
                  placeholder="Describe this benefit"
                />
              </div>
            </div>
          ))}
          <Button
            color="none"
            className="bg-brand-green hover:bg-brand-green/90 text-white border-0 text-sm"
            onClick={addBenefit}
            disabled={loading}
          >
            <HiOutlinePlus className="mr-1" /> Add Benefit
          </Button>
        </div>
      </section>

      {/* Examples */}
      <section className="bg-white dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Project Examples</h3>
        <div className="space-y-3">
          {examples?.map((example, index) => (
            <div key={index} className="flex gap-2 items-center">
              <TextInput
                value={example || ''}
                onChange={(e) => handleExampleChange(index, e.target.value)}
                disabled={loading}
                placeholder="e.g., Annual Environmental Audit for Kuri Quarry"
                className="flex-1"
              />
              <Button
                color="failure"
                size="sm"
                onClick={() => removeExample(index)}
                disabled={examples.length <= 1 || loading}
              >
                <HiOutlineTrash />
              </Button>
            </div>
          ))}
          <Button
            color="none"
            className="bg-brand-green hover:bg-brand-green/90 text-white border-0 text-sm"
            onClick={addExample}
            disabled={loading}
          >
            <HiOutlinePlus className="mr-1" /> Add Example
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ServiceFormTabs;