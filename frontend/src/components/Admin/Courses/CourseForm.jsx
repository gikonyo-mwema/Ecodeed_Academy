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

  const renderInlineError = (key) => {
    if (!validationErrors[key]) return null;
    return <p className="mt-1 text-xs text-red-600 dark:text-red-300">{validationErrors[key]}</p>;
  };

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

  return (
    <div className={isEmbedded ? 'py-6 px-4 sm:px-6 lg:px-8 bg-transparent' : 'min-h-screen bg-gray-50 dark:bg-brand-blue py-12 px-4 sm:px-6 lg:px-8'}>
      <div className={isEmbedded ? 'max-w-5xl mx-auto' : 'max-w-6xl mx-auto'}>
        {showHeader && (
          <Link to="/dashboard?tab=courses">
            <Button outline color="none" className="mb-6 !border-brand-green !text-brand-green hover:!bg-brand-green hover:!text-white transition-colors">
              <HiOutlineArrowLeft className="mr-2" /> Back to Courses
            </Button>
          </Link>
        )}

        <div className={isEmbedded ? 'bg-white/80 dark:bg-brand-blue/70 border-0 shadow-none p-6 rounded-b-2xl' : 'bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-brand-green/20 dark:border-gray-700'}>
          {showHeader && (
            <h1 className="text-3xl font-bold text-brand-blue dark:text-white mb-6">{title}</h1>
          )}

          <form id={id} onSubmit={handleSubmit} className="space-y-6">
            {/* STEP 1: Basic Information */}
            {activeStep === 1 && (
              <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Basic Information
                {sectionErrorCounts?.[1] > 0 && (
                  <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200 align-middle">
                    {sectionErrorCounts[1]} issues
                  </span>
                )}
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-300">Step 1 of 3</span>
            </div>

            {/* Basic Information Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:max-w-xl">
                <Label htmlFor="title" value="Course Title *" />
                <TextInput
                  id="title"
                  type="text"
                  placeholder="Enter course title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  sizing="sm"
                />
                {renderInlineError('title')}
              </div>

            </div>

            {/* Pricing and Category Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:max-w-sm">
                <Label htmlFor="price" value="Price (KES) *" />
                <TextInput
                  id="price"
                  type="number"
                  placeholder="Enter price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="100"
                  disabled={formData.isFree}
                  sizing="sm"
                />
                {renderInlineError('price')}
              </div>

              <div className="md:max-w-sm">
                <Label htmlFor="category" value="Category *" />
                <Select
                  id="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  sizing="sm"
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
            </div>

            {/* Descriptions */}
            <div className="md:max-w-3xl">
              <Label htmlFor="shortDescription" value="Short Description *" />
              <Textarea
                id="shortDescription"
                placeholder="Brief description for course cards (max 100 characters)"
                rows={2}
                maxLength={100}
                value={formData.shortDescription}
                onChange={handleChange}
                required
              />
              {renderInlineError('shortDescription')}
            </div>

            <div className="md:max-w-4xl">
              <Label htmlFor="description" value="Full Description *" />
              <Textarea
                id="description"
                placeholder="Detailed course description"
                rows={6}
                value={formData.description}
                onChange={handleChange}
                required
              />
              {renderInlineError('description')}
            </div>

            {/* Course Thumbnail */}
            <div className="md:max-w-xl">
              <FeaturedImageUpload 
                value={formData.image || formData.thumbnail || ''} 
                onChange={(url) => {
                  handleChange({ target: { id: 'image', value: url, type: 'text' } });
                }}
                label="Course Thumbnail"
              />
            </div>
              </>
            )}

            {/* Course Options */}
            {activeStep === 3 && (
              <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Publish & Settings
                {sectionErrorCounts?.[3] > 0 && (
                  <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200 align-middle">
                    {sectionErrorCounts[3]} issues
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  outline
                  color="none"
                  size="xs"
                  onClick={() => setShowPreview(true)}
                  className="!border-brand-green !text-brand-green hover:!bg-brand-green hover:!text-white transition-colors"
                >
                  <HiOutlineEye className="mr-1" /> Student Preview
                </Button>
                <span className="text-xs text-gray-500 dark:text-gray-300">Step 3 of 3</span>
              </div>
            </div>

            {/* Publish Checklist */}
            <div className="border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-brand-blue/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Publish Checklist</h3>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  {checklistDone}/{checklistTotal} complete
                </span>
              </div>

              <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mb-4">
                <div
                  className="h-full bg-gradient-to-r from-brand-green to-brand-yellow transition-all duration-500"
                  style={{ width: `${checklistPercent}%` }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {checklist.map((item) => (
                  <div
                    key={item.key}
                    className={`text-sm px-3 py-2 rounded-lg border ${
                      item.done
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/40 text-green-700 dark:text-green-300'
                        : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {item.done ? '✅' : '⚠️'} {item.label}
                  </div>
                ))}
              </div>

              <div className="mt-3 text-xs text-gray-600 dark:text-gray-300">
                Completion: <span className="font-semibold">{checklistPercent}%</span>
              </div>
            </div>

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
                  <option value="self_paced">Self-Paced (students unlock by completing previous week)</option>
                  <option value="weekly">Weekly Content (auto-unlocks one week at a time from go-live)</option>
                </Select>
              </div>
            </div>



            {/* Course Features */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label value="Course Features" />
                <Button
                  type="button"
                  outline
                  color="none"
                  size="xs"
                  onClick={addFeatureField}
                  className="!border-brand-green !text-brand-green hover:!bg-brand-green hover:!text-white transition-colors"
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

            {/* Who This Course Is For (Target Audience) */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label value="Who This Course Is For" />
                <Button
                  type="button"
                  outline
                  color="none"
                  size="xs"
                  onClick={addTargetAudience}
                  className="!border-brand-green !text-brand-green hover:!bg-brand-green hover:!text-white transition-colors"
                >
                  <HiOutlinePlus className="mr-1" /> Add Audience
                </Button>
              </div>
              {(formData.targetAudience || []).map((audience, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <TextInput
                    type="text"
                    value={audience}
                    onChange={(e) => handleTargetAudienceChange(index, e.target.value)}
                    placeholder={`e.g. Environmental consultants, Students, NGO staff...`}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    color="failure"
                    size="xs"
                    onClick={() => removeTargetAudience(index)}
                    disabled={(formData.targetAudience || []).length <= 1}
                  >
                    <HiOutlineX className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
              </>
            )}

            {/* Curriculum Builder */}
            {activeStep === 2 && (
              <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Curriculum
                {sectionErrorCounts?.[2] > 0 && (
                  <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200 align-middle">
                    {sectionErrorCounts[2]} issues
                  </span>
                )}
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-300">Step 2 of 3</span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <Label value="Course Curriculum (Weeks & Lessons)" className="text-base font-semibold" />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    outline
                    color="none"
                    size="xs"
                    onClick={addCurriculumSection}
                    className="!border-brand-green !text-brand-green hover:!bg-brand-green hover:!text-white transition-colors"
                  >
                    <HiOutlinePlus className="mr-1" /> Add Week
                  </Button>
                </div>
              </div>
              {(validationErrors.curriculum || validationErrors.weekTitle || validationErrors.lessonTitle) && (
                <p className="mb-2 text-xs text-red-600 dark:text-red-300">
                  {validationErrors.curriculum || validationErrors.weekTitle || validationErrors.lessonTitle}
                </p>
              )}

              {/* Week Accordion */}
              <div className="space-y-3">
                {(Array.isArray(formData.curriculum) ? formData.curriculum : []).map((section, sectionIndex) => {
                  const isWeekOpen = expandedWeeks.has(sectionIndex);
                  const lessonCount = (section.items || []).length;
                  const sessionCount = (section.live_sessions || []).length;
                  const resourceCount = (section.resources || []).length;

                  return (
                    <div
                      key={sectionIndex}
                      className="border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden"
                      draggable
                      onDragStart={() => setDraggedWeekIndex(sectionIndex)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (draggedWeekIndex === null || draggedWeekIndex === sectionIndex) return;
                        moveCurriculumSection?.(draggedWeekIndex, sectionIndex);
                        setDraggedWeekIndex(null);
                      }}
                      onDragEnd={() => setDraggedWeekIndex(null)}
                    >
                      {/* Week Header — click to collapse/expand */}
                      <div
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer select-none transition-colors ${
                          isWeekOpen
                            ? 'bg-brand-green/10 dark:bg-brand-green/20'
                            : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => toggleWeek(sectionIndex)}
                      >
                        {isWeekOpen ? (
                          <HiChevronDown className="w-5 h-5 text-brand-green shrink-0" />
                        ) : (
                          <HiChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                        )}
                        <Badge color="info" size="sm" className="shrink-0">Week {sectionIndex + 1}</Badge>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate flex-1">
                          {section.title || 'Untitled Week'}
                        </span>
                        {/* Counts */}
                        <div className="flex items-center gap-2 shrink-0 text-xs text-gray-500 dark:text-gray-400">
                          <span title="Lessons">📖 {lessonCount}</span>
                          {sessionCount > 0 && <span title="Live Sessions">📹 {sessionCount}</span>}
                          {resourceCount > 0 && <span title="Resources">📎 {resourceCount}</span>}
                        </div>
                        <Button
                          type="button"
                          outline
                          color="none"
                          size="xs"
                          onClick={(e) => { e.stopPropagation(); duplicateCurriculumSection?.(sectionIndex); }}
                          title="Duplicate this week"
                          className="!border-brand-green !text-brand-green hover:!bg-brand-green hover:!text-white transition-colors"
                        >
                          Copy
                        </Button>
                        <Button
                          type="button"
                          outline
                          color="none"
                          size="xs"
                          onClick={(e) => { e.stopPropagation(); moveCurriculumSection?.(sectionIndex, Math.max(0, sectionIndex - 1)); }}
                          disabled={sectionIndex === 0}
                          title="Move week up"
                        >
                          ↑
                        </Button>
                        <Button
                          type="button"
                          outline
                          color="none"
                          size="xs"
                          onClick={(e) => { e.stopPropagation(); moveCurriculumSection?.(sectionIndex, Math.min((formData.curriculum || []).length - 1, sectionIndex + 1)); }}
                          disabled={sectionIndex === (formData.curriculum || []).length - 1}
                          title="Move week down"
                        >
                          ↓
                        </Button>
                        <Button
                          type="button"
                          color="failure"
                          size="xs"
                          onClick={(e) => { e.stopPropagation(); removeCurriculumItem(sectionIndex); }}
                          disabled={(formData.curriculum || []).length <= 1}
                          title="Delete this week"
                        >
                          <HiOutlineX className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Week Body — only shown when expanded */}
                      {isWeekOpen && (
                        <div className="p-4 space-y-5 bg-white dark:bg-gray-900/50">
                          {/* Week title input */}
                          <div>
                            <Label value="Week Title" className="text-xs mb-1" />
                            <TextInput
                              placeholder="e.g. Environmental Auditing Fundamentals"
                              value={section.title}
                              onChange={(e) => handleCurriculumChange(sectionIndex, 'title', e.target.value)}
                              className="max-w-2xl"
                              required
                            />
                          </div>

                          {/* ─── LESSONS ─── */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                📖 Lessons
                              </span>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  outline
                                  color="none"
                                  size="xs"
                                  onClick={() => addCurriculumItem(sectionIndex)}
                                  className="!border-brand-green !text-brand-green hover:!bg-brand-green hover:!text-white transition-colors"
                                >
                                  <HiOutlinePlus className="mr-1" /> Add Lesson
                                </Button>
                                <Button
                                  type="button"
                                  outline
                                  color="none"
                                  size="xs"
                                  onClick={() => addMultipleCurriculumItems?.(sectionIndex, 5)}
                                  className="!border-brand-green !text-brand-green hover:!bg-brand-green hover:!text-white transition-colors"
                                >
                                  +5 Lessons
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              {(Array.isArray(section.items) ? section.items : []).map((item, itemIndex) => {
                                const lessonKey = `${sectionIndex}-${itemIndex}`;
                                const isExpanded = expandedLessons.has(lessonKey);
                                const itemObj = typeof item === 'object' && item !== null ? item : { title: item || '' };

                                return (
                                  <div
                                    key={itemIndex}
                                    className="border border-gray-100 dark:border-gray-700 rounded-lg"
                                    draggable
                                    onDragStart={() => setDraggedLesson({ sectionIndex, itemIndex })}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => {
                                      if (!draggedLesson || draggedLesson.sectionIndex !== sectionIndex) return;
                                      moveCurriculumLesson?.(sectionIndex, draggedLesson.itemIndex, itemIndex);
                                      setDraggedLesson(null);
                                    }}
                                    onDragEnd={() => setDraggedLesson(null)}
                                  >
                                    {/* Lesson header row */}
                                    <div className="flex items-center gap-2 p-2">
                                      <button
                                        type="button"
                                        onClick={() => toggleLessonExpand(lessonKey)}
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                        title={isExpanded ? 'Collapse' : 'Expand to edit video & content'}
                                      >
                                        {isExpanded ? (
                                          <HiChevronDown className="w-4 h-4 text-brand-green" />
                                        ) : (
                                          <HiChevronRight className="w-4 h-4 text-gray-400" />
                                        )}
                                      </button>
                                      <span className="text-xs text-gray-400 w-6">{itemIndex + 1}.</span>
                                      <TextInput
                                        placeholder={`Lesson ${itemIndex + 1} title`}
                                        value={itemObj.title || ''}
                                        onChange={(e) => handleCurriculumItemChange(sectionIndex, itemIndex, e.target.value)}
                                        className="flex-1 max-w-2xl"
                                        sizing="sm"
                                        required
                                      />
                                      {/* Indicators */}
                                      {itemObj.video_url && <Badge color="purple" size="xs" title="Has video">🎬</Badge>}
                                      {itemObj.content && <Badge color="info" size="xs" title="Has text content">📝</Badge>}
                                      <Button
                                        type="button"
                                        outline
                                        color="none"
                                        size="xs"
                                        onClick={() => duplicateCurriculumLesson?.(sectionIndex, itemIndex)}
                                        title="Duplicate lesson"
                                        className="!border-brand-green !text-brand-green hover:!bg-brand-green hover:!text-white transition-colors"
                                      >
                                        Copy
                                      </Button>
                                      <Button
                                        type="button"
                                        outline
                                        color="none"
                                        size="xs"
                                        onClick={() => moveCurriculumLesson?.(sectionIndex, itemIndex, Math.max(0, itemIndex - 1))}
                                        disabled={itemIndex === 0}
                                        title="Move lesson up"
                                      >
                                        ↑
                                      </Button>
                                      <Button
                                        type="button"
                                        outline
                                        color="none"
                                        size="xs"
                                        onClick={() => moveCurriculumLesson?.(sectionIndex, itemIndex, Math.min((section.items || []).length - 1, itemIndex + 1))}
                                        disabled={itemIndex === (section.items || []).length - 1}
                                        title="Move lesson down"
                                      >
                                        ↓
                                      </Button>
                                      <Button
                                        type="button"
                                        color="failure"
                                        size="xs"
                                        onClick={() => removeCurriculumItem(sectionIndex, itemIndex)}
                                        disabled={(section.items || []).length <= 1}
                                        title="Delete lesson"
                                      >
                                        <HiOutlineX className="h-3 w-3" />
                                      </Button>
                                    </div>

                                    {/* Expanded lesson details */}
                                    {isExpanded && (
                                      <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-700 space-y-3 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
                                        <div>
                                          <Label value="External Video URL (YouTube, Vimeo, etc.)" className="text-xs" />
                                          <TextInput
                                            type="url"
                                            placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                                            value={itemObj.video_url || ''}
                                            onChange={(e) => handleLessonDetailChange(sectionIndex, itemIndex, 'video_url', e.target.value)}
                                            sizing="sm"
                                            helperText="This video will play in the lesson's embedded player"
                                          />
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Checkbox
                                            checked={Boolean(itemObj.is_free_preview)}
                                            onChange={(e) => handleLessonDetailChange(sectionIndex, itemIndex, 'is_free_preview', e.target.checked)}
                                          />
                                          <Label className="text-xs">Free Preview (visible to non-enrolled users)</Label>
                                        </div>
                                        <div>
                                          <Label value="Lesson Content" className="text-xs mb-1" />
                                          <TipTapEditor
                                            content={itemObj.content || ''}
                                            onChange={(html) => handleLessonDetailChange(sectionIndex, itemIndex, 'content', html)}
                                            placeholder="Write your lesson content here — multiple paragraphs, headings, lists, images, code blocks…"
                                            minHeight="250px"
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* ─── LIVE SESSIONS ─── */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                <HiOutlineCalendar className="w-4 h-4" /> Live Sessions
                              </span>
                              <Button
                                type="button"
                                outline
                                color="none"
                                size="xs"
                                onClick={() => addLiveSession(sectionIndex)}
                                className="!border-brand-green !text-brand-green hover:!bg-brand-green hover:!text-white transition-colors"
                              >
                                <HiOutlinePlus className="mr-1" /> Add Session
                              </Button>
                            </div>

                            {(section.live_sessions || []).length === 0 ? (
                              <p className="text-xs text-gray-400 italic">No live sessions for this week yet.</p>
                            ) : (
                              <div className="space-y-2">
                                {(section.live_sessions || []).map((ls, lsIndex) => (
                                  <div key={lsIndex} className="border border-gray-100 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <div>
                                        <Label value="Session Title" className="text-xs" />
                                        <TextInput
                                          placeholder="e.g. Q&A with Instructor"
                                          value={ls.title || ''}
                                          onChange={(e) => updateLiveSession(sectionIndex, lsIndex, 'title', e.target.value)}
                                          sizing="sm"
                                        />
                                      </div>
                                      <div>
                                        <Label value="Meeting Link (Zoom / Google Meet)" className="text-xs" />
                                        <TextInput
                                          type="url"
                                          placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                                          value={ls.zoom_link || ''}
                                          onChange={(e) => updateLiveSession(sectionIndex, lsIndex, 'zoom_link', e.target.value)}
                                          sizing="sm"
                                          icon={HiOutlineLink}
                                        />
                                      </div>
                                      <div>
                                        <Label value="Date & Time" className="text-xs" />
                                        <TextInput
                                          type="datetime-local"
                                          value={ls.date_time || ''}
                                          onChange={(e) => updateLiveSession(sectionIndex, lsIndex, 'date_time', e.target.value)}
                                          sizing="sm"
                                        />
                                      </div>
                                      <div>
                                        <Label value="Recording URL (optional, add after session)" className="text-xs" />
                                        <TextInput
                                          type="url"
                                          placeholder="https://..."
                                          value={ls.recording_url || ''}
                                          onChange={(e) => updateLiveSession(sectionIndex, lsIndex, 'recording_url', e.target.value)}
                                          sizing="sm"
                                        />
                                      </div>
                                    </div>
                                    <div className="mt-2 flex justify-end">
                                      <Button
                                        type="button"
                                        color="failure"
                                        size="xs"
                                        onClick={() => removeLiveSession(sectionIndex, lsIndex)}
                                        title="Remove session"
                                      >
                                        <HiOutlineX className="h-3 w-3 mr-1" /> Remove
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* ─── RESOURCES ─── */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                <HiOutlineDocumentText className="w-4 h-4" /> Resources
                              </span>
                              <Button
                                type="button"
                                outline
                                color="none"
                                size="xs"
                                onClick={() => addResource(sectionIndex)}
                                className="!border-brand-green !text-brand-green hover:!bg-brand-green hover:!text-white transition-colors"
                              >
                                <HiOutlinePlus className="mr-1" /> Add Resource
                              </Button>
                            </div>

                            {(section.resources || []).length === 0 ? (
                              <p className="text-xs text-gray-400 italic">No resources for this week yet.</p>
                            ) : (
                              <div className="space-y-2">
                                {(section.resources || []).map((res, rIndex) => (
                                  <div key={rIndex} className="border border-gray-100 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                      <div>
                                        <Label value="Title" className="text-xs" />
                                        <TextInput
                                          placeholder="e.g. Research Paper PDF"
                                          value={res.title || ''}
                                          onChange={(e) => updateResource(sectionIndex, rIndex, 'title', e.target.value)}
                                          sizing="sm"
                                        />
                                      </div>
                                      <div>
                                        <Label value="URL / Link" className="text-xs" />
                                        <TextInput
                                          type="url"
                                          placeholder="https://..."
                                          value={res.file_url || ''}
                                          onChange={(e) => updateResource(sectionIndex, rIndex, 'file_url', e.target.value)}
                                          sizing="sm"
                                          icon={HiOutlineLink}
                                        />
                                      </div>
                                      <div>
                                        <Label value="Type" className="text-xs" />
                                        <Select
                                          value={res.resource_type || 'document'}
                                          onChange={(e) => updateResource(sectionIndex, rIndex, 'resource_type', e.target.value)}
                                          sizing="sm"
                                        >
                                          <option value="document">Document / PDF</option>
                                          <option value="link">External Link</option>
                                          <option value="video">Video</option>
                                          <option value="other">Other</option>
                                        </Select>
                                      </div>
                                    </div>
                                    <div className="mt-2">
                                      <Label value="Description (optional)" className="text-xs" />
                                      <TextInput
                                        placeholder="Brief description of this resource"
                                        value={res.description || ''}
                                        onChange={(e) => updateResource(sectionIndex, rIndex, 'description', e.target.value)}
                                        sizing="sm"
                                      />
                                    </div>
                                    <div className="mt-2 flex justify-end">
                                      <Button
                                        type="button"
                                        color="failure"
                                        size="xs"
                                        onClick={() => removeResource(sectionIndex, rIndex)}
                                        title="Remove resource"
                                      >
                                        <HiOutlineX className="h-3 w-3 mr-1" /> Remove
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
              </>
            )}

              {/* FAQs Section */}
              {activeStep === 3 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label value="Frequently Asked Questions" />
                  <Button
                    type="button"
                    outline
                    color="none"
                    size="xs"
                    onClick={addFaq}
                    className="!border-brand-green !text-brand-green hover:!bg-brand-green hover:!text-white transition-colors"
                  >
                    <HiOutlinePlus className="mr-1" /> Add FAQ
                  </Button>
                </div>
                
                {(Array.isArray(formData.faqs) ? formData.faqs : []).map((faq, index) => (
                  <div key={index} className="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <TextInput
                        placeholder="Question"
                        value={faq.question}
                        onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                        className="flex-1 max-w-3xl"
                        sizing="sm"
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
                      className="max-w-4xl"
                      required
                    />
                  </div>
                ))}
              </div>
              )}

            {/* Submit Buttons */}
            {showSubmitButtons && activeStep === 3 && (
            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              {/* Save as Draft */}
              <Button
                type="button"
                color="none"
                className="w-full sm:w-auto border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-600"
                disabled={loading}
                onClick={(e) => handleSubmit(e, { isLive: false })}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  '💾 Save as Draft'
                )}
              </Button>

              {/* Publish / Update */}
              <Button
                type="button"
                color="none"
                className="w-full sm:w-auto bg-gradient-to-r from-brand-green to-brand-yellow hover:from-brand-green/90 hover:to-brand-yellow/90 text-white border-0 focus:ring-4 focus:ring-brand-green/25 shadow-md"
                disabled={loading}
                onClick={(e) => handleSubmit(e, { isLive: true })}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Publishing...
                  </span>
                ) : formData.isLive ? (
                  '🚀 Update & Publish'
                ) : (
                  '🚀 Publish Course'
                )}
              </Button>
            </div>
            )}

            {/* Draft indicator */}
            {showSubmitButtons && formData.isLive === false && formData.title && (
              <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
                ⚠️ This course is currently a <strong>draft</strong> and is not visible to students.
              </p>
            )}

            {showSubmitButtons && error && (
              <div className="mt-4 text-center">
                <p className="text-red-500 text-sm">{error}</p>
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
    </div>
  );
};