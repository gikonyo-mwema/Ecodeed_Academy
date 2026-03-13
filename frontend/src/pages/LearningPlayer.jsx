/**
 * LearningPlayer Page — Interactive course lesson player with progress tracking
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * Professional learning environment for playing course videos and accessing lesson
 * materials. Provides video playback with progress tracking, sidebar course navigation,
 * lesson resources, and auto-completion marking. Integrates with enrollment and
 * progress tracking systems.
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 * FEATURES
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * 1. **Video Player**
 *    - React-Player (supports YouTube, Vimeo, HLS streams, MP4)
 *    - Responsive container (16:9 aspect ratio)
 *    - Play/pause, volume, fullscreen controls
 *    - Progress bar with seek support
 *    - Speed controls (0.5x, 1x, 1.5x, 2x)
 *    - Picture-in-picture mode
 *    - Automatic quality selection
 * 
 * 2. **Sidebar Navigation**
 *    - Course structure with expandable modules/weeks
 *    - All lessons listed under each module
 *    - Current lesson highlighted
 *    - Completion checkmark for finished lessons
 *    - Click lesson to jump to it
 *    - Collapsible on mobile (hamburger menu)
 *    - Expandable/collapsible weeks
 * 
 * 3. **Lesson Content Tabs**
 *    - \"Content\" tab: Lesson description and materials
 *    - \"Resources\" tab: Downloadable files and links
 *    - \"Notes\" tab: Student's personal lesson notes
 *    - \"Discussion\" tab: Q&A and discussion board
 * 
 * 4. **Lesson Resources**
 *    - Download links (PDFs, worksheets, code samples)
 *    - External resource links (with \"Open in new tab\" option)
 *    - Embedded resources (slides, documents)
 *    - Resource preview where applicable
 * 
 * 5. **Progress Tracking**
 *    - Auto-mark lesson as complete after watching threshold (e.g., 80%)
 *    - Completion checkmark in sidebar
 *    - Overall course progress percentage
 *    - Progress saved to backend via API
 *    - Visual progress bar showing course completion
 * 
 * 6. **Lesson Navigation**
 *    - Previous/Next lesson buttons
 *    - Jump to any lesson in sidebar
 *    - Auto-advance to next lesson on completion (optional)
 *    - Scrollable lesson list
 * 
 * 7. **Responsive Design**
 *    - Desktop: Video + sidebar layout
 *    - Tablet: Toggle sidebar view
 *    - Mobile: Full-width video, collapsible sidebar
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 * API INTEGRATION
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * **Endpoints:**
 *   GET /api/v1/courses/{slug}/ — Fetch course content (modules, lessons)
 *   GET /api/v1/enrollments/my-courses/ — Check enrollment status
 *   POST /api/v1/enrollments/{enrollmentId}/mark-lesson-complete/ — Mark lesson done
 *   GET /api/v1/enrollments/{enrollmentId}/progress/ — Get progress data
 *   POST /api/v1/enrollments/{enrollmentId}/progress/ — Update progress
 * 
 * **Course Data Structure:**
 *   - id, title, slug, description
 *   - modules: [
 *       { id, title, lessons: [
 *           { id, title, duration, videoUrl, description, resources: [...] }
 *       ]}
 *     ]
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 * STATE MANAGEMENT
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * Local state:
 * - course: course data with modules and lessons
 * - currentLesson: current lesson object being played
 * - currentModuleIndex: index of active module
 * - completedLessons: Array of completed lesson IDs
 * - sidebarOpen: boolean (mobile sidebar visibility)
 * - activeTab: 'content' | 'resources' | 'notes' | 'discussion'
 * - videoProgress: 0-100 (percentage watched)
 * - loading: boolean (initial fetch)
 * - enrollmentId: enrollment record ID
 * - expandedWeek: which module/week is expanded
 * - expandedSection: which lesson section is expanded
 * 
 * Redux state:
 * - currentUser: from user reducer (verify enrollment)
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 * AUTO-COMPLETION LOGIC
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * Lesson is marked complete when:
 *   1. Video playback reaches 80% of total duration, OR
 *   2. User clicks \"Mark as Complete\" button, OR
 *   3. API marks it complete on backend request
 * 
 * Triggers:
 *   - POST to /api/v1/enrollments/{enrollmentId}/mark-lesson-complete/
 *   - Updates completedLessons array
 *   - Updates sidebar checkmarks
 *   - Updates progress percentage
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 * KEYBOARD SHORTCUTS
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * - Space: Play/Pause
 * - ←/→: Seek ±5 seconds
 * - ↑/↓: Volume ±10%
 * - F: Toggle fullscreen
 * - M: Toggle mute
 * 
 * @component
 * @version 2.0.0
 * @author Gikonyo Mwema
 * @example
 * // In App.jsx router:
 * <Route path=\"/learn/:slug/:lessonId?\" element={<LearningPlayer />} />
 * 
 * // Navigation from StudentDashboard:
 * navigate(`/learn/${course.slug}`);
 * 
 * // Jump to specific lesson:
 * navigate(`/learn/${course.slug}/${lesson.id}`);
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ReactPlayer from 'react-player';
import DOMPurify from 'dompurify';
import { 
  HiOutlineChevronLeft, 
  HiOutlineChevronRight,
  HiOutlineCheckCircle, 
  HiOutlinePlay, 
  HiOutlineDocumentText,
  HiOutlineDownload,
  HiOutlineClipboardList,
  HiOutlineExternalLink,
  HiOutlineBookOpen,
  HiOutlineAcademicCap,
  HiMenu,
  HiX,
  HiOutlineClock,
  HiOutlineLightBulb,
  HiOutlineLink
} from 'react-icons/hi';
import { apiFetch } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

// Brand colors
const brandColors = {
  green: '#008037',
  yellow: '#F8BF0F',
  blue: '#051836'
};

export default function LearningPlayer() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollmentId, setEnrollmentId] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('content');
  const [videoProgress, setVideoProgress] = useState(0);
  const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 768);
  const [expandedWeek, setExpandedWeek] = useState(0);
  const [expandedSection, setExpandedSection] = useState('lessons');

  // Flatten all lessons for navigation
  const allLessons = useMemo(() => {
    if (!course?.modules) return [];
    return course.modules.flatMap((module, mIdx) => 
      module.lessons?.map(lesson => ({ ...lesson, moduleIndex: mIdx, moduleTitle: module.title })) || []
    );
  }, [course]);

  // Current lesson index in flattened array
  const currentLessonIndex = useMemo(() => {
    if (!currentLesson || !allLessons.length) return -1;
    return allLessons.findIndex(l => l.id === currentLesson.id);
  }, [currentLesson, allLessons]);

  // Get current module data
  const currentModule = useMemo(() => {
    if (!course?.modules || currentModuleIndex < 0) return null;
    return course.modules[currentModuleIndex];
  }, [course, currentModuleIndex]);

  // Calculate progress
  const progressPercentage = useMemo(() => {
    if (!allLessons.length) return 0;
    return Math.round((completedLessons.length / allLessons.length) * 100);
  }, [completedLessons, allLessons]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Fetch course content and enrollment in parallel
        const [data, enrollmentData] = await Promise.all([
          apiFetch(`/api/v1/courses/${slug}/content`),
          currentUser
            ? apiFetch(`/api/v1/enrollments/check/?userId=${currentUser.id || currentUser._id}&courseSlug=${slug}`)
            : Promise.resolve(null),
        ]);

        setCourse(data);

        // Restore persisted progress from enrollment
        if (enrollmentData?.isEnrolled && enrollmentData.id) {
          setEnrollmentId(enrollmentData.id);
          const savedCompleted = enrollmentData.progress?.completed_lessons || [];
          setCompletedLessons(savedCompleted);
        }
        
        if (data.modules?.length > 0 && data.modules[0].lessons?.length > 0) {
          setCurrentLesson(data.modules[0].lessons[0]);
          setCurrentModuleIndex(0);
        }
      } catch (error) {
        console.error("Access error:", error);
        navigate(`/courses/${slug}`); 
      } finally {
        setLoading(false);
      }
    };
    fetchContent();

    const handleResize = () => {
      setShowSidebar(window.innerWidth >= 768 ? sidebarOpen : false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [slug, navigate]);

  const handleLessonSelect = (lesson, moduleIndex) => {
    setCurrentLesson(lesson);
    setCurrentModuleIndex(moduleIndex);
    setActiveTab('content');
    setVideoProgress(0);
    if (window.innerWidth < 768) setShowSidebar(false);
  };

  const isLessonCompleted = (id) => completedLessons.includes(id);

  const markComplete = async () => {
    if (currentLesson && !completedLessons.includes(currentLesson.id)) {
      // Optimistic UI update
      setCompletedLessons(prev => [...prev, currentLesson.id]);

      // Persist to backend
      if (enrollmentId) {
        try {
          await apiFetch(`/api/v1/enrollments/${enrollmentId}/complete-lesson/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lesson_id: currentLesson.id }),
          });
        } catch (error) {
          console.error('Failed to persist lesson completion:', error);
          // Revert optimistic update on failure
          setCompletedLessons(prev => prev.filter(id => id !== currentLesson.id));
          return; // Don't auto-navigate if save failed
        }
      }

      // Auto-navigate to next lesson
      goToNextLesson();
    }
  };

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      const prevLesson = allLessons[currentLessonIndex - 1];
      setCurrentLesson(prevLesson);
      setCurrentModuleIndex(prevLesson.moduleIndex);
      setActiveTab('content');
    }
  };

  const goToNextLesson = () => {
    if (currentLessonIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentLessonIndex + 1];
      setCurrentLesson(nextLesson);
      setCurrentModuleIndex(nextLesson.moduleIndex);
      setActiveTab('content');
    }
  };

  const goToNextModule = () => {
    if (course?.modules && currentModuleIndex < course.modules.length - 1) {
      const nextModule = course.modules[currentModuleIndex + 1];
      if (nextModule.lessons?.length > 0) {
        setCurrentLesson(nextModule.lessons[0]);
        setCurrentModuleIndex(currentModuleIndex + 1);
        setActiveTab('content');
      }
    }
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
    setSidebarOpen(!showSidebar);
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!course) return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: brandColors.blue }}>
      <div className="text-white text-center">
        <p className="text-xl">Course content unavailable</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-6 py-2 rounded-lg transition-colors"
          style={{ backgroundColor: brandColors.green }}
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: brandColors.blue }}>
      {/* Sidebar Overlay for Mobile */}
      {showSidebar && window.innerWidth < 768 && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar - Curriculum */}
      <div 
        className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} 
          fixed md:relative md:translate-x-0 w-80 lg:w-96 h-full 
          transition-transform duration-300 ease-in-out z-30
          flex flex-col overflow-hidden shadow-2xl`}
        style={{ backgroundColor: '#FFFFFF' }}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg truncate text-gray-800">{course.title}</h2>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-3 py-1 text-sm rounded-lg transition-colors"
              style={{ 
                backgroundColor: 'rgba(0,0,0,0.08)',
                color: '#333'
              }}
            >
              Exit
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span style={{ color: brandColors.yellow }}>Your progress</span>
              <span className="text-gray-800">{progressPercentage}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%`, backgroundColor: brandColors.green }}
              />
            </div>
          </div>
        </div>
        
        {/* Module List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {course.modules?.map((module, mIndex) => {
            const moduleLessons = module.lessons || [];
            const isCurrentModule = mIndex === currentModuleIndex;
            const isWeekExpanded = expandedWeek === mIndex;
            
            return (
              <div key={module.id} className="border-b" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                {/* Week Header */}
                <button
                  onClick={() => {
                    setExpandedWeek(isWeekExpanded ? -1 : mIndex);
                    setCurrentModuleIndex(mIndex);
                  }}
                  className={`w-full px-6 py-4 text-left transition-colors ${
                    isCurrentModule ? 'bg-gray-50' : 'hover:bg-gray-25'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-800">{module.title}</p>
                    <span className="text-gray-400">
                      {isWeekExpanded ? '−' : '+'}
                    </span>
                  </div>
                </button>

                {/* Week Sections */}
                {isWeekExpanded && (
                  <div className="bg-gray-25 border-t" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                    {/* Lessons Section */}
                    <div>
                      <button
                        onClick={() => setExpandedSection(expandedSection === 'lessons' ? '' : 'lessons')}
                        className="w-full px-8 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors text-sm font-medium"
                        style={{ color: brandColors.blue }}
                      >
                        <span>📚 Lessons ({moduleLessons.length})</span>
                        <span className="text-gray-400">{expandedSection === 'lessons' ? '−' : '+'}</span>
                      </button>
                      
                      {expandedSection === 'lessons' && (
                        <div className="bg-white">
                          {moduleLessons.map((lesson) => {
                            const isCompleted = isLessonCompleted(lesson.id);
                            const isActive = currentLesson?.id === lesson.id;
                            
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => {
                                  handleLessonSelect(lesson, mIndex);
                                  setExpandedSection('');
                                }}
                                className={`w-full text-left px-12 py-2.5 text-sm flex items-start gap-3 transition-all border-l-4
                                  ${isActive ? 'bg-gray-100 border-green-500' : 'border-transparent hover:bg-gray-50'}`}
                              >
                                <div className="mt-0.5 flex-shrink-0">
                                  {isCompleted ? (
                                    <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: brandColors.green }}>
                                      <span className="text-white text-xs">✓</span>
                                    </div>
                                  ) : (
                                    <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: 'rgba(0,0,0,0.2)' }} />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`truncate ${isActive ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                                    {lesson.title}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Resources Section */}
                    {module.resources?.length > 0 && (
                      <div>
                        <button
                          onClick={() => setExpandedSection(expandedSection === 'resources' ? '' : 'resources')}
                          className="w-full px-8 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors text-sm font-medium border-t"
                          style={{ borderColor: 'rgba(0,0,0,0.1)', color: brandColors.blue }}
                        >
                          <span>📄 Resources ({module.resources.length})</span>
                          <span className="text-gray-400">{expandedSection === 'resources' ? '−' : '+'}</span>
                        </button>
                        
                        {expandedSection === 'resources' && (
                          <div className="bg-white px-8 py-2">
                            {module.resources.map((resource, idx) => (
                              <a
                                key={idx}
                                href={resource.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block py-2 text-sm text-gray-600 hover:text-gray-800 truncate transition-colors"
                              >
                                📎 {resource.title}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Assignments Section */}
                    {module.assignments?.length > 0 && (
                      <div>
                        <button
                          onClick={() => setExpandedSection(expandedSection === 'assignments' ? '' : 'assignments')}
                          className="w-full px-8 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors text-sm font-medium border-t"
                          style={{ borderColor: 'rgba(0,0,0,0.1)', color: brandColors.blue }}
                        >
                          <span>✓ Assignments ({module.assignments.length})</span>
                          <span className="text-gray-400">{expandedSection === 'assignments' ? '−' : '+'}</span>
                        </button>
                        
                        {expandedSection === 'assignments' && (
                          <div className="bg-white px-8 py-2">
                            {module.assignments.map((assignment, idx) => (
                              <div key={idx} className="py-2 text-sm text-gray-600 truncate">
                                📋 {assignment.title}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Live Sessions Section */}
                    {module.live_sessions?.length > 0 && (
                      <div>
                        <button
                          onClick={() => setExpandedSection(expandedSection === 'livesessions' ? '' : 'livesessions')}
                          className="w-full px-8 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors text-sm font-medium border-t"
                          style={{ borderColor: 'rgba(0,0,0,0.1)', color: brandColors.blue }}
                        >
                          <span>🎥 Live Sessions ({module.live_sessions.length})</span>
                          <span className="text-gray-400">{expandedSection === 'livesessions' ? '−' : '+'}</span>
                        </button>
                        
                        {expandedSection === 'livesessions' && (
                          <div className="bg-white px-8 py-2">
                            {module.live_sessions.map((session, idx) => (
                              <div key={idx} className="py-2 text-sm text-gray-600 truncate">
                                🎤 {session.title}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        {/* Top Bar */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {showSidebar ? <HiX className="w-5 h-5" style={{ color: brandColors.blue }} /> : <HiMenu className="w-5 h-5" style={{ color: brandColors.blue }} />}
            </button>
            <div className="hidden md:block">
              <p className="text-sm" style={{ color: brandColors.green }}>{currentModule?.title}</p>
              <p className="font-medium" style={{ color: brandColors.blue }}>{currentLesson?.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {currentLessonIndex + 1} / {allLessons.length}
            </span>
          </div>
        </div>

        {/* Lesson Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Lesson Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-2" style={{ color: brandColors.blue }}>
                {currentLesson?.title}
              </h1>
            </div>

            {/* Lesson Description / Introduction — read first */}
            <div className="prose max-w-none mb-12">
              {currentLesson?.content ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentLesson.content) }}
                  style={{ color: '#374151' }}
                />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <HiOutlineBookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>No additional content for this lesson.</p>
                </div>
              )}
            </div>

            {/* Video Player — watch after reading */}
            <div className="mb-12">
              <h2 className="text-xl font-semibold mb-4" style={{ color: brandColors.blue }}>Watch the Video</h2>
              <div className="bg-black relative w-full" style={{ height: 'min(56.25vw, 405px)', aspectRatio: '16/9' }}>
                {currentLesson?.video_url ? (
                  <ReactPlayer
                    url={currentLesson.video_url}
                    width="100%"
                    height="100%"
                    controls={true}
                    playing={false}
                    onProgress={({ played }) => setVideoProgress(played * 100)}
                    onEnded={markComplete}
                    config={{
                      youtube: { 
                        playerVars: { 
                          modestbranding: 1,
                          rel: 0,
                          showinfo: 0
                        } 
                      }
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full" style={{ backgroundColor: brandColors.blue }}>
                    <div className="text-center text-white">
                      <HiOutlineBookOpen className="w-20 h-20 mx-auto mb-4 opacity-50" />
                      <p className="text-2xl font-light mb-2">Reading Material Only</p>
                      <p className="text-sm opacity-75">This lesson does not have a video</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Space after video */}
            </div>

            {/* Navigation */}
            <div className="mt-12 pt-6 border-t" style={{ borderColor: '#E5E7EB' }}>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <button
                  onClick={goToPreviousLesson}
                  disabled={currentLessonIndex <= 0}
                  className={`px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-all
                    ${currentLessonIndex <= 0 
                      ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' 
                      : 'border hover:bg-gray-50'}`}
                  style={{ borderColor: '#E5E7EB', color: brandColors.blue }}
                >
                  <HiOutlineChevronLeft className="w-5 h-5" />
                  Previous Lesson
                </button>

                <button
                  onClick={markComplete}
                  className={`px-8 py-3 rounded-lg flex items-center justify-center gap-2 transition-all
                    ${isLessonCompleted(currentLesson?.id) 
                      ? 'bg-green-100 text-green-700 cursor-default' 
                      : 'text-white hover:opacity-90'}`}
                  style={{ backgroundColor: isLessonCompleted(currentLesson?.id) ? undefined : brandColors.green }}
                  disabled={isLessonCompleted(currentLesson?.id)}
                >
                  <HiOutlineCheckCircle className="w-5 h-5" />
                  {isLessonCompleted(currentLesson?.id) ? 'Completed' : 'Mark as Complete & Next'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.05);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.15);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 0, 0, 0.25);
          }
        `}</style>
      </div>
    </div>
  );
}