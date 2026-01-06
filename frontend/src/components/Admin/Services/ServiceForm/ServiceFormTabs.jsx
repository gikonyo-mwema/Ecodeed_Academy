import { 
  Label, 
  TextInput, 
  Textarea, 
  Select, 
  ToggleSwitch, 
  FileInput, 
  Button, 
  Alert,
  Badge,
  Tooltip 
} from 'flowbite-react';
import { 
  HiOutlinePhotograph, 
  HiOutlineTrash, 
  HiOutlinePlus 
} from 'react-icons/hi';
import { useState } from 'react';

// Rich text editor reused from Posts
import PostEditor from '../../Posts/PostForm/PostEditor.jsx';

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
  // Tab state
  const [activeTab, setActiveTab] = useState('basic');
  
  // Local handlers to ensure setFormData is properly called
  const handleRichTextChange = (html) => {
    if (setFormData) {
      setFormData({ ...formData, description: html });
    }
  };
  
  const handleToggleChange = (checked) => {
    if (setFormData) {
      setFormData({
        ...formData,
        isFeatured: checked
      });
    }
  };
  
  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '📋' },
    { id: 'content', label: 'Content', icon: '📝' },
    { id: 'process', label: 'Process Steps', icon: '🔄' },
    { id: 'examples', label: 'Examples', icon: '📊' },
    { id: 'benefits', label: 'Benefits', icon: '✅' }
  ];
  // Static data
  const benefitIcons = [
    { value: '✅', label: 'Check Mark' },
    { value: '⏱️', label: 'Time' },
    { value: '💰', label: 'Money' },
    { value: '🛡️', label: 'Shield' },
    { value: '🌱', label: 'Sustainability' },
  ];

  const socialPlatforms = [
    { value: 'twitter', label: 'Twitter' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'youtube', label: 'YouTube' },
  ];

  const envConsultingCategories = [
    { _id: 'env1', name: 'Environmental Impact Assessment' },
    { _id: 'env2', name: 'Air Quality Monitoring' },
    { _id: 'env3', name: 'Water Resource Management' },
    { _id: 'env4', name: 'Waste Management Consulting' },
    { _id: 'env5', name: 'Sustainability Planning' },
    { _id: 'env6', name: 'Environmental Compliance' },
    { _id: 'env7', name: 'Ecological Surveys' },
    { _id: 'env8', name: 'Carbon Footprint Analysis' },
    { _id: 'env9', name: 'Soil Contamination Studies' },
    { _id: 'env10', name: 'Environmental Auditing' },
    // New environmental consulting categories
    { _id: 'env11', name: 'Environmental Training & Capacity Building' },
    { _id: 'env12', name: 'Regulatory Compliance & Policy Advisory' },
    { _id: 'env13', name: 'Climate Change & Adaptation Consulting' },
    { _id: 'env14', name: 'Environmental Risk Assessment' },
    { _id: 'env15', name: 'Green Building & LEED Certification' },
    { _id: 'env16', name: 'Environmental Management Systems (ISO 14001)' },
    { _id: 'env17', name: 'Biodiversity & Conservation Planning' }
  ];

  // Combine dynamic and static categories
  const allCategories = [
    ...new Map([
      ...envConsultingCategories.map(item => [item._id, item]),
      ...categories.map(item => [item._id, item])
    ]).values()
  ];

  // Destructure form data
  const {
    projectTypes = [],
    benefits = [],
    features = [],
    processSteps = [],
    examples = []
  } = formData;

  // Tab Navigation Component
  const renderTabNavigation = () => (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
      <nav className="flex space-x-2 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-4 font-medium text-sm rounded-t-lg transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-brand-blue text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:text-brand-blue dark:hover:text-brand-green hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );

  // Process Steps Section
  const renderProcessSteps = () => (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Process Steps (Optional)</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Outline your service delivery process. This helps clients understand what to expect and builds confidence in your methodology.
      </p>
      <div className="space-y-4">
        <Label value="Service Process Steps" />
        {processSteps?.map((step, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <Label value={`Step ${index + 1} Title`} />
                <TextInput
                  value={step.title || step.step || ''}
                  onChange={(e) => handleProcessStepChange(index, 'title', e.target.value)}
                  color={errors[`processStepTitle${index}`] ? 'failure' : 'gray'}
                  helperText={errors[`processStepTitle${index}`]}
                  disabled={loading}
                  placeholder="e.g., Initial Consultation, Site Assessment"
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
                />
              </div>
            </div>
            <div>
              <Label value="Description" />
              <Textarea
                value={step.description || ''}
                onChange={(e) => handleProcessStepChange(index, 'description', e.target.value)}
                rows={3}
                color={errors[`processStepDesc${index}`] ? 'failure' : 'gray'}
                helperText={errors[`processStepDesc${index}`]}
                disabled={loading}
                placeholder="Describe what happens in this step and what clients can expect..."
              />
            </div>
            <div className="flex justify-end mt-3">
              <Button
                color="failure"
                size="xs"
                onClick={() => removeProcessStep(index)}
                disabled={processSteps.length <= 1 || loading}
              >
                <HiOutlineTrash className="mr-1" /> Remove Step
              </Button>
            </div>
          </div>
        ))}
        <Button
          gradientMonochrome="info"
          onClick={addProcessStep}
          disabled={loading}
        >
          <HiOutlinePlus className="mr-2" /> Add Process Step
        </Button>
      </div>
    </div>
  );

  // Examples Section
  const renderExamples = () => (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Project Examples (Optional)</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Share examples of real projects to showcase your experience and build credibility. These help potential clients understand your track record.
      </p>
      <div className="space-y-4">
        <Label value="Real Project Examples" />
        {examples?.map((example, index) => (
          <div key={index} className="flex gap-2 items-center">
            <div className="flex-1">
              <TextInput
                value={example || ''}
                onChange={(e) => handleExampleChange(index, e.target.value)}
                color={errors[`example${index}`] ? 'failure' : 'gray'}
                helperText={errors[`example${index}`]}
                disabled={loading}
                placeholder="e.g., Annual Environmental Audit for Kuri Quarry and Crushing Project, Chaka"
              />
            </div>
            <Button
              color="failure"
              size="xs"
              onClick={() => removeExample(index)}
              disabled={examples.length <= 1 || loading}
            >
              <HiOutlineTrash />
            </Button>
          </div>
        ))}
        <Button
          gradientMonochrome="info"
          onClick={addExample}
          disabled={loading}
        >
          <HiOutlinePlus className="mr-2" /> Add Example
        </Button>
      </div>
    </div>
  );

  // Basic Info Section
  const renderBasicInfo = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <h2 className="text-xl font-semibold mb-2">Basic Information</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Fill in the basic details about your service. Only the title is required to publish.
        </p>
      </div>

      {/* Service Title */}
      <div className="md:col-span-2">
        <Label htmlFor="title" value="Service Title*" />
        <TextInput
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          color={errors.title ? 'failure' : 'gray'}
          helperText={errors.title || "Give your service a clear, descriptive name"}
          disabled={loading}
          placeholder="e.g., Environmental Impact Assessment Services"
        />
      </div>

      {/* Category */}
      <div>
        <Label htmlFor="category" value="Category (Optional)" />
        <TextInput
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          color={errors.category ? 'failure' : 'gray'}
          helperText="Help visitors find your service by categorizing it"
          disabled={loading}
          placeholder="e.g., Environmental Impact Assessment"
        />
      </div>

      {/* Icon */}
      <div>
        <Label htmlFor="icon" value="Service Icon (Optional)" />
        <Select
          id="icon"
          name="icon"
          value={formData.icon}
          onChange={handleChange}
          color={errors.icon ? 'failure' : 'gray'}
          helperText="Choose an emoji to visually represent your service"
          disabled={loading}
        >
          <option value="📋">📋 Default</option>
          <option value="🌍">🌍 Environment</option>
          <option value="🌱">🌱 Sustainability</option>
          <option value="🏗️">🏗️ Construction</option>
          <option value="🌿">🌿 Nature</option>
          <option value="💧">💧 Water</option>
          <option value="🌳">🌳 Forestry</option>
          <option value="🔬">🔬 Research</option>
          <option value="📊">📊 Analysis</option>
          <option value="🛡️">🛡️ Protection</option>
          <option value="♻️">♻️ Recycling</option>
          <option value="⚡">⚡ Energy</option>
          <option value="🌞">🌞 Solar</option>
          <option value="🌬️">🌬️ Wind</option>
          <option value="🏭">🏭 Industrial</option>
          {/* New environmental consulting icons */}
          <option value="📚">📚 Training & Education</option>
          <option value="⚖️">⚖️ Legal & Compliance</option>
          <option value="🌡️">🌡️ Climate & Temperature</option>
          <option value="⚠️">⚠️ Risk Assessment</option>
          <option value="🏢">🏢 Green Building</option>
          <option value="📝">📝 Management Systems</option>
          <option value="🦋">🦋 Biodiversity & Wildlife</option>
          <option value="🌊">🌊 Marine & Coastal</option>
          <option value="🏔️">🏔️ Mountain & Alpine</option>
          <option value="🌾">🌾 Agriculture & Land Use</option>
          <option value="🌊">🌊 Marine</option>
          <option value="🦋">🦋 Wildlife</option>
          <option value="🌾">🌾 Agriculture</option>
          <option value="🔍">🔍 Assessment</option>
          <option value="📋">📋 Documentation</option>
        </Select>
      </div>

      {/* Short Description */}
      <div className="md:col-span-2">
        <Label htmlFor="shortDescription" value="Short Description (Optional)" />
        <Textarea
          id="shortDescription"
          name="shortDescription"
          value={formData.shortDescription}
          onChange={handleChange}
          rows={3}
          color={errors.shortDescription ? 'failure' : 'gray'}
          helperText="Write a brief summary that will appear in service listings and previews"
          disabled={loading}
          placeholder="Brief overview of what this service provides and its main benefits..."
        />
      </div>

      {/* Full Description (Rich Text) */}
      <div className="md:col-span-2">
        <Label htmlFor="description" value="Full Description*" />
        <PostEditor
          content={formData.description || ''}
          onChange={handleRichTextChange}
          currentUser={currentUser}
        />
        {errors.description && (
          <p className="text-xs text-red-600 mt-1">{errors.description}</p>
        )}
      </div>

      {/* Meta Fields */}
      <div>
        <Label htmlFor="metaTitle" value="SEO Title" />
        <TextInput
          id="metaTitle"
          name="metaTitle"
          value={formData.metaTitle}
          onChange={handleChange}
          disabled={loading}
          placeholder="Title for search engines (optional)"
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
          placeholder="Description for search engines (optional)"
        />
      </div>

      {/* Status Toggle */}
      <div className="md:col-span-2 flex items-center gap-2">
        <ToggleSwitch
          checked={formData.isFeatured || false}
          label="Featured Service"
          onChange={handleToggleChange}
          disabled={loading}
        />
      </div>
    </div>
  );

  // Project Types Section
  const renderProjectTypes = () => (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Project Types (Optional)</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        List the types of projects this service applies to. This helps clients understand if your service fits their needs.
      </p>
      <div className="space-y-4">
        <Label value="Supported Project Types" />
        {projectTypes.map((type, index) => (
          <div key={index} className="flex gap-2 items-center">
            <div className="flex-1">
              <TextInput
                value={type}
                onChange={(e) => handleProjectTypeChange(index, e.target.value)}
                color={errors[`projectType${index}`] ? 'failure' : 'gray'}
                helperText={errors[`projectType${index}`]}
                disabled={loading}
                placeholder="e.g., Petrol stations and fuel storage, Commercial buildings, etc."
              />
            </div>
            <Button
              color="failure"
              size="xs"
              onClick={() => removeProjectType(index)}
              disabled={projectTypes.length <= 1 || loading}
            >
              <HiOutlineTrash />
            </Button>
          </div>
        ))}
        <Button
          gradientMonochrome="info"
          onClick={addProjectType}
          disabled={loading}
        >
          <HiOutlinePlus className="mr-2" /> Add Project Type
        </Button>
      </div>
    </div>
  );

  // Benefits Section
  const renderBenefits = () => (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Service Benefits (Optional)</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Highlight the key benefits and value propositions that make your service stand out. 
        List the advantages clients will gain by choosing your service over competitors.
      </p>
      <div className="space-y-4">
        <Label value="Service Benefits (Optional)" />
        {benefits.map((benefit, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <Label value={`Benefit ${index + 1} Title`} />
                <TextInput
                  value={benefit.title}
                  onChange={(e) => handleBenefitChange(index, 'title', e.target.value)}
                  color={errors[`benefitTitle${index}`] ? 'failure' : 'gray'}
                  helperText={errors[`benefitTitle${index}`]}
                  disabled={loading}
                  placeholder="Expertise you can trust"
                />
              </div>
              <div className="flex items-end justify-end">
                <Button
                  color="failure"
                  size="xs"
                  onClick={() => removeBenefit(index)}
                  disabled={benefits.length <= 1 || loading}
                >
                  <HiOutlineTrash className="mr-1" /> Remove
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label value="Icon" />
                <Select
                  value={benefit.icon || '✅'}
                  onChange={(e) => handleBenefitChange(index, 'icon', e.target.value)}
                  disabled={loading}
                >
                  {benefitIcons.map(icon => (
                    <option key={icon.value} value={icon.value}>{icon.label} {icon.value}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label value="Description" />
                <Textarea
                  value={benefit.description}
                  onChange={(e) => handleBenefitChange(index, 'description', e.target.value)}
                  rows={3}
                  color={errors[`benefitDesc${index}`] ? 'failure' : 'gray'}
                  helperText={errors[`benefitDesc${index}`]}
                  disabled={loading}
                  placeholder="Our team is fully licensed and certified..."
                />
              </div>
            </div>
          </div>
        ))}
        <Button
          gradientMonochrome="info"
          onClick={addBenefit}
          disabled={loading}
        >
          <HiOutlinePlus className="mr-2" /> Add Benefit
        </Button>
        
        {/* Contact Information Note */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>📞 Contact Information:</strong> Clients will be directed to the main contact page for inquiries about this service. 
            Make sure your main contact information is up to date.
          </p>
        </div>
      </div>
    </div>
  );

  // Features Section
  const renderFeatures = () => (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Service Features (Optional)</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Highlight key features that set your service apart. These help potential clients understand what makes your service unique.
      </p>
      <div className="space-y-4">
        <Label value="Service Features" />
        {features.map((feature, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <Label value={`Feature ${index + 1} Title`} />
                <TextInput
                  value={feature.title}
                  onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                  color={errors[`featureTitle${index}`] ? 'failure' : 'gray'}
                  helperText={errors[`featureTitle${index}`]}
                  disabled={loading}
                  placeholder="e.g., Custom solutions, Expert consultation"
                />
              </div>
              <div className="flex items-end justify-end">
                <Button
                  color="failure"
                  size="xs"
                  onClick={() => removeFeature(index)}
                  disabled={features.length <= 1 || loading}
                >
                  <HiOutlineTrash className="mr-1" /> Remove
                </Button>
              </div>
            </div>
            <div>
              <Label value={`Feature ${index + 1} Description*`} />
              <Textarea
                value={feature.description}
                onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                rows={3}
                color={errors[`featureDesc${index}`] ? 'failure' : 'gray'}
                helperText={errors[`featureDesc${index}`]}
                disabled={loading}
                placeholder="Detailed description of this feature"
              />
            </div>
          </div>
        ))}
        <Button
          gradientMonochrome="info"
          onClick={addFeature}
          disabled={loading}
        >
          <HiOutlinePlus className="mr-2" /> Add Feature
        </Button>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="space-y-8 pb-4">
      {formError && (
        <Alert color="failure" className="mb-4">
          {formError}
        </Alert>
      )}

      {renderTabNavigation()}

      {activeTab === 'basic' && renderBasicInfo()}
      {activeTab === 'content' && (
        <>
          {renderProjectTypes()}
          {renderFeatures()}
        </>
      )}
      {activeTab === 'process' && renderProcessSteps()}
      {activeTab === 'examples' && renderExamples()}
      {activeTab === 'benefits' && renderBenefits()}
    </div>
  );
};

export default ServiceFormTabs;