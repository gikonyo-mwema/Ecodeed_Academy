import React, { useState } from 'react';
import { 
  Button, 
  TextInput, 
  Textarea, 
  Select, 
  Label, 
  Checkbox,
  Badge
} from 'flowbite-react';
import { 
  HiOutlineArrowLeft, 
  HiOutlinePlus,
  HiOutlineX,
  HiOutlineAcademicCap,
  HiOutlineBookOpen,
  HiOutlineChartBar,
  HiOutlineShieldCheck,
  HiOutlineVideoCamera,
  HiOutlineUserCircle,
  HiOutlineGlobe,
  HiChevronDown,
  HiChevronRight
} from 'react-icons/hi';
import { Link } from 'react-router-dom';

// Icon mapping for the icon selector
const iconComponents = {
  HiOutlineAcademicCap,
  HiOutlineBookOpen,
  HiOutlineChartBar,
  HiOutlineShieldCheck,
  HiOutlineVideoCamera,
  HiOutlineUserCircle,
  HiOutlineGlobe
};

export const CourseForm = ({ 
  formData, 
  handleChange, 
  handleFeatureChange,
  handleCurriculumChange,
  handleCurriculumItemChange,
  handleLessonDetailChange,
  handleFaqChange,
  addFeatureField, 
  removeFeatureField,
  addCurriculumSection,
  addCurriculumItem,
  removeCurriculumItem,
  addFaq,
  removeFaq,
  handleSubmit, 
  error, 
  loading, 
  title, 
  submitButtonText 
}) => {
  // Track which lessons are expanded to show detail fields
  const [expandedLessons, setExpandedLessons] = useState(new Set());

  const toggleLessonExpand = (key) => {
    setExpandedLessons(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/dashboard?tab=courses">
          <Button outline gradientDuoTone="tealToLime" className="mb-6">
            <HiOutlineArrowLeft className="mr-2" /> Back to Courses
          </Button>
        </Link>

        <div className="bg-white rounded-xl shadow-md p-8 border border-teal-100">
          <h1 className="text-3xl font-bold text-teal-800 mb-6">{title}</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="title" value="Course Title" />
                <TextInput
                  id="title"
                  type="text"
                  placeholder="Enter course title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="slug" value="URL Slug" />
                <TextInput
                  id="slug"
                  type="text"
                  placeholder="e.g. effluent-discharge-license"
                  required
                  value={formData.slug}
                  onChange={handleChange}
                  helperText="Used in the course URL (lowercase, hyphens, no spaces)"
                />
              </div>
            </div>

            {/* Pricing and Category Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="price" value="Price (KES)" />
                <TextInput
                  id="price"
                  type="number"
                  placeholder="Enter price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="100"
                  disabled={formData.isFree}
                />
              </div>

              <div>
                <Label htmlFor="category" value="Category" />
                <Select
                  id="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select category</option>
                  <option value="specialized">Specialized Course</option>
                  <option value="masterclass">Masterclass</option>
                  <option value="webinar">Webinar</option>
                  <option value="coaching">Coaching</option>
                  <option value="compliance">Compliance</option>
                  <option value="licensing">Licensing</option>
                </Select>
              </div>
            </div>

            {/* Free Course and Payment Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isFree"
                  checked={Boolean(formData.isFree)}
                  onChange={handleChange}
                />
                <Label htmlFor="isFree">Free Course</Label>
              </div>

              {!formData.isFree && (
                <div>
                  <Label htmlFor="paymentOption" value="Payment Option" />
                  <Select
                    id="paymentOption"
                    value={formData.paymentOption}
                    onChange={handleChange}
                    required={!formData.isFree}
                  >
                    <option value="">Select payment option</option>
                    <option value="one-time">One-time Payment</option>
                    <option value="subscription">Subscription</option>
                  </Select>
                </div>
              )}
            </div>

            {/* Icon Selection */}
            <div>
              <Label value="Course Icon" />
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.keys(iconComponents).map((iconKey) => {
                  const Icon = iconComponents[iconKey];
                  return (
                    <button
                      key={iconKey}
                      type="button"
                      onClick={() => handleChange({ target: { id: 'iconName', value: iconKey } })}
                      className={`p-2 rounded-lg flex items-center justify-center ${
                        formData.iconName === iconKey 
                          ? 'bg-teal-100 text-teal-600 border border-teal-300' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      style={{ width: '44px', height: '44px' }}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Descriptions */}
            <div>
              <Label htmlFor="shortDescription" value="Short Description" />
              <Textarea
                id="shortDescription"
                placeholder="Brief description for course cards (max 100 characters)"
                rows={2}
                maxLength={100}
                value={formData.shortDescription}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="description" value="Full Description" />
              <Textarea
                id="description"
                placeholder="Detailed course description"
                rows={6}
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            {/* External URL */}
            <div>
              <Label htmlFor="externalUrl" value="External Platform URL" />
              <TextInput
                id="externalUrl"
                type="url"
                placeholder="https://external-platform.com/course"
                value={formData.externalUrl}
                onChange={handleChange}
                helperText="Where users will be redirected to enroll"
              />
            </div>

            {/* Course Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isPopular"
                  checked={Boolean(formData.isPopular)}
                  onChange={handleChange}
                />
                <Label htmlFor="isPopular">Mark as Popular Course</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="hasCertificate"
                  checked={Boolean(formData.hasCertificate)}
                  onChange={handleChange}
                />
                <Label htmlFor="hasCertificate">Offers Certificate</Label>
              </div>

              <div>
                <Label htmlFor="pacingType" value="Pacing Type" />
                <Select
                  id="pacingType"
                  value={formData.pacingType || 'self_paced'}
                  onChange={handleChange}
                >
                  <option value="self_paced">Self-Paced (unlock by completing previous week)</option>
                  <option value="scheduled">Scheduled (unlock by calendar date)</option>
                </Select>
              </div>
              <div>
                <TextInput
                  id="cta"
                  type="text"
                  placeholder="e.g. 'Enroll Now' or 'Book Session'"
                  value={formData.cta}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Target Level */}
            <div>
              <Label value="Target Level" />
              <div className="flex flex-wrap gap-2 mt-2">
                {['Business Owners', 'Compliance Officers', 'Environmental Managers', 'Consultants'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => {
                      const currentLevels = Array.isArray(formData.level) ? formData.level : [];
                      const newLevels = currentLevels.includes(level)
                        ? currentLevels.filter(l => l !== level)
                        : [...currentLevels, level];
                      handleChange({ target: { id: 'level', value: newLevels } });
                    }}
                    className={`px-3 py-1 rounded-full text-sm ${
                      (Array.isArray(formData.level) && formData.level.includes(level))
                        ? 'bg-teal-100 text-teal-800 border border-teal-300'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Course Format */}
            <div>
              <Label value="Course Format" />
              <div className="flex flex-wrap gap-2 mt-2">
                {['Self-paced modules', 'Practical tools', 'Step-by-step sessions', 'Live Q&A'].map((format) => (
                  <button
                    key={format}
                    type="button"
                    onClick={() => {
                      const currentFormats = Array.isArray(formData.format) ? formData.format : [];
                      const newFormats = currentFormats.includes(format)
                        ? currentFormats.filter(f => f !== format)
                        : [...currentFormats, format];
                      handleChange({ target: { id: 'format', value: newFormats } });
                    }}
                    className={`px-3 py-1 rounded-full text-sm ${
                      (Array.isArray(formData.format) && formData.format.includes(format))
                        ? 'bg-purple-100 text-purple-800 border border-purple-300'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>

            {/* Course Features */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label value="Course Features" />
                <Button
                  type="button"
                  outline
                  gradientDuoTone="tealToLime"
                  size="xs"
                  onClick={addFeatureField}
                >
                  <HiOutlinePlus className="mr-1" /> Add Feature
                </Button>
              </div>
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <TextInput
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder={`Feature ${index + 1}`}
                    className="flex-1"
                    required
                  />
                  <Button
                    type="button"
                    color="failure"
                    size="xs"
                    onClick={() => removeFeatureField(index)}
                    disabled={formData.features.length <= 1}
                  >
                    <HiOutlineX className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Curriculum Builder */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label value="Course Curriculum (Weeks & Lessons)" />
                <Button
                  type="button"
                  outline
                  gradientDuoTone="tealToLime"
                  size="xs"
                  onClick={addCurriculumSection}
                >
                  <HiOutlinePlus className="mr-1" /> Add Week
                </Button>
              </div>
              
{(Array.isArray(formData.curriculum) ? formData.curriculum : []).map((section, sectionIndex) => (
                  <div key={sectionIndex} className="mb-4 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge color="info" size="sm">Week {sectionIndex + 1}</Badge>
                      <TextInput
                        placeholder="Week title (e.g. Environmental Auditing Fundamentals)"
                        value={section.title}
                        onChange={(e) => handleCurriculumChange(sectionIndex, 'title', e.target.value)}
                        className="flex-1"
                        required
                      />
                      <Button
                        type="button"
                        color="failure"
                        size="xs"
                        onClick={() => removeCurriculumItem(sectionIndex)}
                        disabled={(formData.curriculum || []).length <= 1}
                      >
                        <HiOutlineX className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {(Array.isArray(section.items) ? section.items : []).map((item, itemIndex) => {
                      const lessonKey = `${sectionIndex}-${itemIndex}`;
                      const isExpanded = expandedLessons.has(lessonKey);
                      const itemObj = typeof item === 'object' && item !== null ? item : { title: item || '' };
                      
                      return (
                        <div key={itemIndex} className="mb-3 border border-gray-100 dark:border-gray-700 rounded-lg">
                          {/* Lesson header row */}
                          <div className="flex items-center gap-2 p-2">
                            <button
                              type="button"
                              onClick={() => toggleLessonExpand(lessonKey)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              title={isExpanded ? 'Collapse' : 'Expand to edit video, content & duration'}
                            >
                              {isExpanded ? (
                                <HiChevronDown className="w-4 h-4 text-teal-600" />
                              ) : (
                                <HiChevronRight className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                            <span className="text-xs text-gray-400 w-6">{itemIndex + 1}.</span>
                            <TextInput
                              placeholder={`Lesson ${itemIndex + 1} title`}
                              value={itemObj.title || ''}
                              onChange={(e) => handleCurriculumItemChange(sectionIndex, itemIndex, e.target.value)}
                              className="flex-1"
                              sizing="sm"
                              required
                            />
                            {/* Indicators */}
                            {itemObj.video_url && (
                              <Badge color="purple" size="xs" title="Has video">🎬</Badge>
                            )}
                            {itemObj.content && (
                              <Badge color="info" size="xs" title="Has text content">📝</Badge>
                            )}
                            <Button
                              type="button"
                              color="failure"
                              size="xs"
                              onClick={() => removeCurriculumItem(sectionIndex, itemIndex)}
                              disabled={(section.items || []).length <= 1}
                            >
                              <HiOutlineX className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Expanded lesson details */}
                          {isExpanded && (
                            <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-gray-700 space-y-3 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
                              <div>
                                <Label value="Video URL (YouTube, Vimeo, etc.)" className="text-xs" />
                                <TextInput
                                  type="url"
                                  placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                                  value={itemObj.video_url || ''}
                                  onChange={(e) => handleLessonDetailChange(sectionIndex, itemIndex, 'video_url', e.target.value)}
                                  sizing="sm"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label value="Duration (seconds)" className="text-xs" />
                                  <TextInput
                                    type="number"
                                    placeholder="e.g. 600 for 10 min"
                                    value={itemObj.duration || ''}
                                    onChange={(e) => handleLessonDetailChange(sectionIndex, itemIndex, 'duration', Number(e.target.value) || 0)}
                                    sizing="sm"
                                    min="0"
                                  />
                                </div>
                                <div className="flex items-end pb-1">
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      checked={Boolean(itemObj.is_free_preview)}
                                      onChange={(e) => handleLessonDetailChange(sectionIndex, itemIndex, 'is_free_preview', e.target.checked)}
                                    />
                                    <Label className="text-xs">Free Preview</Label>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <Label value="Lesson Content (lecture notes, HTML supported)" className="text-xs" />
                                <Textarea
                                  placeholder="Write lesson text content here. Supports HTML formatting."
                                  value={itemObj.content || ''}
                                  onChange={(e) => handleLessonDetailChange(sectionIndex, itemIndex, 'content', e.target.value)}
                                  rows={5}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  
                  <Button
                    type="button"
                    outline
                    gradientDuoTone="tealToLime"
                    size="xs"
                    onClick={() => addCurriculumItem(sectionIndex)}
                    className="mt-2"
                  >
                    <HiOutlinePlus className="mr-1" /> Add Lesson
                  </Button>
                </div>
              ))}
            </div>

              {/* FAQs Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label value="Frequently Asked Questions" />
                  <Button
                    type="button"
                    outline
                    gradientDuoTone="tealToLime"
                    size="xs"
                    onClick={addFaq}
                  >
                    <HiOutlinePlus className="mr-1" /> Add FAQ
                  </Button>
                </div>
                
                {(Array.isArray(formData.faqs) ? formData.faqs : []).map((faq, index) => (
                  <div key={index} className="mb-4 border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <TextInput
                        placeholder="Question"
                        value={faq.question}
                        onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                        className="flex-1"
                        required
                      />
                      <Button
                        type="button"
                        color="failure"
                        size="xs"
                        onClick={() => removeFaq(index)}
                        disabled={(formData.faqs || []).length <= 1}
                        className="ml-2"
                      >
                        <HiOutlineX className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Answer"
                      value={faq.answer}
                      onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                      rows={2}
                      required
                    />
                  </div>
                ))}
              </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                gradientDuoTone="tealToLime"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {submitButtonText}
                  </span>
                ) : (
                  submitButtonText
                )}
              </Button>
            </div>

            {error && (
              <div className="mt-4 text-center">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};