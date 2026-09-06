import React, { useState } from 'react';
import {
  Button, TextInput, Textarea, Select, Label, Checkbox, Badge, Modal
} from 'flowbite-react';
import {
  HiOutlineArrowLeft, HiOutlinePlus, HiOutlineX,
  HiChevronDown, HiChevronRight, HiOutlineLink,
  HiOutlineDocumentText, HiOutlineCalendar, HiOutlineEye,
} from 'react-icons/hi';
import { Link } from 'react-router-dom';
import TipTapEditor from '../../Editor/TipTapEditor';
import FeaturedImageUpload from './FeaturedImageUpload';

export const CourseForm = ({
  id,
  showHeader = true,
  showSubmitButtons = true,
  activeStep = 1,
  formData, handleChange, handleFeatureChange,
  handleCurriculumChange, handleCurriculumItemChange, handleLessonDetailChange,
  handleFaqChange, addFeatureField, removeFeatureField,
  handleTargetAudienceChange, addTargetAudience, removeTargetAudience,
  addCurriculumSection, addCurriculumItem, removeCurriculumItem,
  addMultipleCurriculumItems,
  duplicateCurriculumSection,
  duplicateCurriculumLesson,
  moveCurriculumSection,
  moveCurriculumLesson,
  addLiveSession, updateLiveSession, removeLiveSession,
  addResource, updateResource, removeResource,
  addFaq, removeFaq,
  validationErrors = {},
  sectionErrorCounts = {},
  handleSubmit, error, loading, title,
}) => {
  const isEmbedded = !showHeader;
  const [showPreview, setShowPreview] = useState(false);
  // Track which weeks (sections) are expanded — accordion style
  const [expandedWeeks, setExpandedWeeks] = useState(new Set([0]));
  // Track which individual lessons are expanded for editing
  const [expandedLessons, setExpandedLessons] = useState(new Set());
  const [draggedWeekIndex, setDraggedWeekIndex] = useState(null);
  const [draggedLesson, setDraggedLesson] = useState(null);

  const curriculum = Array.isArray(formData.curriculum) ? formData.curriculum : [];
  const allLessons = curriculum.flatMap((section) => (Array.isArray(section?.items) ? section.items : []));
  const faqs = Array.isArray(formData.faqs) ? formData.faqs : [];

  const normalizeLesson = (lesson) => (typeof lesson === 'object' && lesson !== null ? lesson : { title: lesson || '' });

  const checklist = [
    {
      key: 'thumbnail',
      label: 'Has thumbnail',
      done: Boolean(formData.thumbnail || formData.image || formData.imageUrl || formData.coverImage),
    },
    { key: 'title', label: 'Has course title', done: Boolean(formData.title?.trim()) },
    { key: 'short', label: 'Has short description', done: Boolean(formData.shortDescription?.trim()) },
    {
      key: 'intro',
      label: 'Has intro lesson',
      done: allLessons.some((lesson, index) => index === 0 && Boolean(normalizeLesson(lesson).title?.trim())),
    },
    {
      key: 'resource',
      label: 'Has at least one resource',
      done: curriculum.some((section) =>
        (section.resources || []).some((res) => Boolean(res?.title?.trim() || res?.file_url?.trim()))
      ),
    },
    {
      key: 'faq',
      label: 'Has FAQ',
      done: faqs.some((faq) => Boolean(faq?.question?.trim() && faq?.answer?.trim())),
    },
  ];

  const checklistDone = checklist.filter((item) => item.done).length;
  const checklistTotal = checklist.length;
  const checklistPercent = Math.round((checklistDone / checklistTotal) * 100);
  const missingChecks = checklist.filter((item) => !item.done);
  const lessonsWithoutVideo = allLessons.filter((lesson) => !normalizeLesson(lesson).video_url?.trim()).length;

  // Determine which sections to show based on activeStep
  const shouldShowBasicInfo = activeStep === 1;
  const shouldShowCurriculum = activeStep === 2;
  const shouldShowSettings = activeStep === 3;

  const toggleWeek = (idx) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const toggleLessonExpand = (key) => {
    setExpandedLessons(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const renderInlineError = (fieldName) => {
    if (!validationErrors[fieldName]) return null;
    return (
      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
        {validationErrors[fieldName]}
      </p>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full">
        {/* Header */}
        {showHeader && (
          <div className="mb-8">
            <Link to="/dashboard?tab=courses" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 inline-block">
              ← Back to Courses
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
          </div>
        )}

        {/* Single Form */}
        <form id={id} onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          
          {/* ──────────────────────────────────────── */}
          {/* SECTION 1: BASIC INFORMATION - Only show on step 1 */}
          {/* ──────────────────────────────────────── */}
          {shouldShowBasicInfo && (
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h2>

              {/* Title */}
              <div>
                <Label htmlFor="title" value="Course Title" />
                <TextInput
                  id="title"
                  placeholder="e.g. Environmental Impact Assessment Expert Training"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
                {renderInlineError('title')}
              </div>

              {/* Short Description */}
              <div>
                <Label htmlFor="shortDescription" value="Short Description" />
                <Textarea
                  id="shortDescription"
                  placeholder="Brief description for course cards"
                  rows={2}
                  maxLength={100}
                  value={formData.shortDescription}
                  onChange={handleChange}
                  required
                />
                {renderInlineError('shortDescription')}
              </div>

              {/* Full Description */}
              <div>
                <Label htmlFor="description" value="Full Description" />
                <Textarea
                  id="description"
                  placeholder="Detailed course description"
                  rows={5}
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
                {renderInlineError('description')}
              </div>

              {/* Category */}
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
                {renderInlineError('category')}
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────── */}
          {/* SECTION 2: PRICING & THUMBNAIL */}
          {/* ──────────────────────────────────────── */}
          {shouldShowBasicInfo && (
            <div className="p-6 space-y-6 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pricing & Thumbnail</h2>

              {/* Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="isFree" value="Pricing Model" />
                  <div className="mt-2 space-y-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="isFree"
                        checked={Boolean(formData.isFree)}
                        onChange={handleChange}
                      />
                      <label htmlFor="isFree" className="text-sm text-gray-700 dark:text-gray-300">Free Course</label>
                    </div>
                  </div>
                </div>

                {!formData.isFree && (
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
                    />
                    {renderInlineError('price')}
                  </div>
                )}
              </div>

              {/* Thumbnail */}
              <FeaturedImageUpload 
                value={formData.image || formData.thumbnail || ''} 
                onChange={(url) => {
                  handleChange({ target: { id: 'image', value: url, type: 'text' } });
                }}
                label="Course Thumbnail"
              />
            </div>
          )}

          {/* ──────────────────────────────────────── */}
          {/* SECTION 3: COURSE FEATURES & AUDIENCE */}
          {/* ──────────────────────────────────────── */}
          {shouldShowBasicInfo && (
            <div className="p-6 space-y-6 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Features & Target Audience</h2>

              {/* Course Features */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label value="What's Included" />
                  <button
                    type="button"
                    onClick={addFeatureField}
                    className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline"
                  >
                    + Add
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <TextInput
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        placeholder={`Feature ${index + 1}`}
                        className="flex-1"
                      />
                      {formData.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFeatureField(index)}
                          className="text-xs text-gray-500 hover:text-red-600 dark:hover:text-red-400 pt-3"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label value="Who This Course Is For" />
                  <button
                    type="button"
                    onClick={addTargetAudience}
                    className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline"
                  >
                    + Add
                  </button>
                </div>
                <div className="space-y-2">
                  {(formData.targetAudience || []).map((audience, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <TextInput
                        type="text"
                        value={audience}
                        onChange={(e) => handleTargetAudienceChange(index, e.target.value)}
                        placeholder="e.g. Environmental consultants, NGO staff..."
                        className="flex-1"
                      />
                      {(formData.targetAudience || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTargetAudience(index)}
                          className="text-xs text-gray-500 hover:text-red-600 dark:hover:text-red-400 pt-3"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────── */}
          {/* SECTION 4: CURRICULUM */}
          {/* ──────────────────────────────────────── */}
          {shouldShowCurriculum && (
            <div className="p-6 space-y-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Curriculum</h2>
              <button
                type="button"
                onClick={addCurriculumSection}
                className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline"
              >
                + Add Week
              </button>
            </div>

            {/* Weeks */}
            <div className="space-y-4">
              {(Array.isArray(formData.curriculum) ? formData.curriculum : []).map((section, sectionIndex) => {
                const isWeekOpen = expandedWeeks.has(sectionIndex);
                const lessonCount = (section.items || []).length;

                return (
                  <div key={sectionIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    {/* Week Header */}
                    <button
                      type="button"
                      onClick={() => toggleWeek(sectionIndex)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 text-left">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          Week {sectionIndex + 1}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {section.title || 'Untitled'}
                        </span>
                        <span className="text-xs text-gray-400">({lessonCount} lessons)</span>
                      </div>
                      <span className="text-gray-400">{isWeekOpen ? '−' : '+'}</span>
                    </button>

                    {/* Week Content */}
                    {isWeekOpen && (
                      <div className="px-4 py-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700 space-y-4">
                        {/* Week Title */}
                        <div>
                          <Label value="Week Title" className="text-sm" />
                          <TextInput
                            placeholder="e.g. Legal Framework"
                            value={section.title}
                            onChange={(e) => handleCurriculumChange(sectionIndex, 'title', e.target.value)}
                          />
                        </div>

                        {/* Lessons */}
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Lessons ({lessonCount})</span>
                            <button
                              type="button"
                              onClick={() => addCurriculumItem(sectionIndex)}
                              className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline"
                            >
                              + Add Lesson
                            </button>
                          </div>

                          <div className="space-y-2">
                            {(Array.isArray(section.items) ? section.items : []).map((item, itemIndex) => {
                              const lessonKey = `${sectionIndex}-${itemIndex}`;
                              const isExpanded = expandedLessons.has(lessonKey);
                              const itemObj = typeof item === 'object' && item !== null ? item : { title: item || '' };

                              return (
                                <div key={itemIndex} className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 overflow-hidden">
                                  {/* Lesson Header */}
                                  <button
                                    type="button"
                                    onClick={() => toggleLessonExpand(lessonKey)}
                                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                  >
                                    <div className="flex items-center gap-2 flex-1 text-left">
                                      <span className="text-xs text-gray-400">{itemIndex + 1}.</span>
                                      <span className="text-sm text-gray-900 dark:text-white">
                                        {itemObj.title || 'Lesson title'}
                                      </span>
                                    </div>
                                    <span className="text-gray-400">{isExpanded ? '−' : '+'}</span>
                                  </button>

                                  {/* Lesson Details */}
                                  {isExpanded && (
                                    <div className="px-3 py-3 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700 space-y-3">
                                      {/* Lesson Title */}
                                      <div>
                                        <Label value="Title" className="text-xs" />
                                        <TextInput
                                          placeholder="Lesson title"
                                          value={itemObj.title || ''}
                                          onChange={(e) => handleCurriculumItemChange(sectionIndex, itemIndex, e.target.value)}
                                          sizing="sm"
                                        />
                                      </div>

                                      {/* Video URL */}
                                      <div>
                                        <Label value="Video URL (YouTube, Vimeo)" className="text-xs" />
                                        <TextInput
                                          type="url"
                                          placeholder="https://..."
                                          value={itemObj.video_url || ''}
                                          onChange={(e) => handleLessonDetailChange(sectionIndex, itemIndex, 'video_url', e.target.value)}
                                          sizing="sm"
                                        />
                                      </div>

                                      {/* Free Preview */}
                                      <div className="flex items-center gap-2">
                                        <Checkbox
                                          checked={Boolean(itemObj.is_free_preview)}
                                          onChange={(e) => handleLessonDetailChange(sectionIndex, itemIndex, 'is_free_preview', e.target.checked)}
                                        />
                                        <Label className="text-xs">Free Preview</Label>
                                      </div>

                                      {/* Content */}
                                      <div>
                                        <Label value="Content" className="text-xs" />
                                        <TipTapEditor
                                          content={itemObj.content || ''}
                                          onChange={(html) => handleLessonDetailChange(sectionIndex, itemIndex, 'content', html)}
                                          placeholder="Lesson content..."
                                          minHeight="200px"
                                        />
                                      </div>

                                      {/* Lesson Actions */}
                                      <div className="flex gap-2 pt-2">
                                        {(section.items || []).length > 1 && (
                                          <button
                                            type="button"
                                            onClick={() => removeCurriculumItem(sectionIndex, itemIndex)}
                                            className="text-xs text-red-600 dark:text-red-400 hover:text-red-700"
                                          >
                                            Delete Lesson
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Week Actions */}
                        <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          {(formData.curriculum || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeCurriculumItem(sectionIndex)}
                              className="text-xs text-red-600 dark:text-red-400 hover:text-red-700"
                            >
                              Delete Week
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          )}

          {/* ──────────────────────────────────────── */}
          {/* SECTION 5: SETTINGS & PUBLISH */}
          {/* ──────────────────────────────────────── */}
          {shouldShowSettings && (
            <div className="p-6 space-y-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h2>

            {/* Publish Options */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="isPopular"
                      checked={Boolean(formData.isPopular)}
                      onChange={handleChange}
                    />
                    <Label htmlFor="isPopular" className="text-sm">Mark as Popular Course</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="hasCertificate"
                      checked={Boolean(formData.hasCertificate)}
                      onChange={handleChange}
                    />
                    <Label htmlFor="hasCertificate" className="text-sm">Offers Certificate</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="pacingType" value="Pacing Type" className="text-sm" />
                  <Select
                    id="pacingType"
                    value={formData.pacingType || 'self_paced'}
                    onChange={handleChange}
                    sizing="sm"
                  >
                    <option value="self_paced">Self-Paced</option>
                    <option value="weekly">Weekly Release</option>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* ──────────────────────────────────────── */}
          {/* SECTION 6: FAQs */}
          {/* ──────────────────────────────────────── */}
          {shouldShowSettings && (
            <div className="p-6 space-y-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">FAQs</h2>
              <button
                type="button"
                onClick={addFaq}
                className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline"
              >
                + Add FAQ
              </button>
            </div>

            <div className="space-y-4">
              {(Array.isArray(formData.faqs) ? formData.faqs : []).map((faq, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                  <TextInput
                    placeholder="Question"
                    value={faq.question}
                    onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                  />
                  <Textarea
                    placeholder="Answer"
                    value={faq.answer}
                    onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                    rows={2}
                  />
                  {(formData.faqs || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFaq(index)}
                      className="text-xs text-red-600 dark:text-red-400 hover:text-red-700"
                    >
                      Delete FAQ
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          )}

          {/* ──────────────────────────────────────── */}
          {/* ACTION BUTTONS */}
          {/* ──────────────────────────────────────── */}
          {showSubmitButtons && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-4">
              {error && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  {error}
                </div>
              )}
              <div className="flex gap-3 justify-end">
                <Button
                  type="submit"
                  disabled={loading}
                  onClick={(e) => { e.preventDefault(); handleSubmit(e); }}
                  className="px-8 py-2 font-medium"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </form>

        {/* Student Preview Modal */}
        <Modal show={showPreview} onClose={() => setShowPreview(false)} size="4xl">
          <Modal.Header>Student Preview</Modal.Header>
          <Modal.Body>
            <div className="space-y-5">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {formData.title?.trim() || 'Untitled Course'}
                  </h2>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    {formData.shortDescription?.trim() || 'No short description yet.'}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
                      {formData.category || 'Uncategorized'}
                    </span>
                    {formData.hasCertificate && (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200">
                        Certificate
                      </span>
                    )}
                    {formData.isFree ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
                        Free
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200">
                        KES {Number(formData.price || 0).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Curriculum Preview</h3>
                  {curriculum.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-300">No curriculum added yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {curriculum.map((section, idx) => (
                        <div key={idx} className="border border-gray-100 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/40">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Week {idx + 1}: {section?.title || 'Untitled Week'}
                          </p>
                          <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                            {(section?.items || []).map((lesson, li) => {
                              const item = normalizeLesson(lesson);
                              return (
                                <li key={li} className="flex items-center justify-between gap-2">
                                  <span>• {item.title || `Lesson ${li + 1}`}</span>
                                  {item.video_url ? <span className="text-xs">🎬</span> : <span className="text-xs text-amber-500">No video</span>}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Quality Checks</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Checklist completion: <strong>{checklistPercent}%</strong>
                  </p>
                  {missingChecks.length > 0 && (
                    <ul className="mt-2 list-disc list-inside text-sm text-amber-700 dark:text-amber-300">
                      {missingChecks.map((item) => (
                        <li key={item.key}>Missing: {item.label}</li>
                      ))}
                    </ul>
                  )}
                  {lessonsWithoutVideo > 0 && (
                    <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                      {lessonsWithoutVideo} lesson(s) currently have no video URL.
                    </p>
                  )}
                </div>
              </div>
            </Modal.Body>
          </Modal>
      </div>
    </div>
  );
};