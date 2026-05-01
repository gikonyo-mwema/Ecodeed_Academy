/**
 * Course Content View Component
 * 
 * Displays course-specific content including modules/weeks, assignments,
 * live sessions, resources, and discussions for a selected course.
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Progress, Badge, Accordion, Avatar, Tooltip, Card, Button } from 'flowbite-react';
import { 
  HiPlay, 
  HiCheckCircle, 
  HiLockClosed,
  HiVideoCamera,
  HiDownload,
  HiCalendar,
  HiClock,
  HiBookOpen,
  HiAcademicCap,
  HiUsers,
  HiChatAlt,
  HiChevronRight,
  HiDocumentText,
  HiOutlineDocumentDownload,
  HiOutlineCollection,
  HiOutlineChat,
  HiArrowLeft,
  HiStar
} from 'react-icons/hi';
import { apiFetch } from '../../utils/api';

export default function CourseContentView({ course, activeSection = 'overview', onBack }) {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [courseContent, setCourseContent] = useState(null);
  const [activeModule, setActiveModule] = useState(null);

  useEffect(() => {
    const fetchCourseContent = async () => {
      if (!course) return;
      
      try {
        setLoading(true);
        let data;
        try {
          data = await apiFetch(`/api/v1/courses/${course.slug}/content`);
        } catch (contentError) {
          // Instructors/admins may not be enrolled; use preview endpoint for a real learner-like view.
          if (currentUser?.isInstructor || currentUser?.isAdmin) {
            data = await apiFetch(`/api/v1/courses/${course.slug}/preview-content/`);
          } else {
            throw contentError;
          }
        }

        setCourseContent(data);
        
        // Set active module to first in-progress or first module
        if (data.modules?.length > 0) {
          const inProgressModule = data.modules.find(m => m.status === 'in-progress');
          setActiveModule(inProgressModule || data.modules[0]);
        }
      } catch (error) {
        console.error('Error fetching course content:', error);
        // Use course data as fallback
        setCourseContent(course);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseContent();
  }, [course, currentUser]);

  const instructorData = course?.instructor || courseContent?.instructor || null;
  const instructorName =
    instructorData?.name ||
    [instructorData?.first_name, instructorData?.last_name].filter(Boolean).join(' ') ||
    course?.instructor_name ||
    'Course Instructor';
  const instructorTitle =
    instructorData?.title ||
    instructorData?.bio ||
    'Instructor';
  const instructorAvatar =
    instructorData?.profilePicture ||
    instructorData?.profile_picture ||
    null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="bg-brand-green rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">{course?.title}</h1>
        <p className="text-white/80 mb-4">{course?.shortDescription}</p>
        
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <HiBookOpen className="w-5 h-5 text-white/70" />
            <span>{courseContent?.modules?.length || 0} Modules</span>
          </div>
          <div className="flex items-center gap-2">
            <HiClock className="w-5 h-5 text-white/70" />
            <span>{course?.duration || 'Self-paced'}</span>
          </div>
          <div className="flex items-center gap-2">
            <HiAcademicCap className="w-5 h-5 text-white/70" />
            <span>{course?.certificate ? 'Certificate Included' : 'No Certificate'}</span>
          </div>
        </div>
      </div>

      {/* Progress Card - Compact */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Your Progress</span>
              <span className="text-sm font-bold text-brand-green">{course?.progress || 0}%</span>
            </div>
            <Progress progress={course?.progress || 0} color="green" size="sm" />
          </div>
          <div className="text-xs text-gray-500 whitespace-nowrap">
            {course?.completedLessons || 0}/{course?.totalLessons || 0} lessons
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow p-0 overflow-hidden">
          <button
            type="button"
            onClick={() => navigate(`/dashboard?tab=course-${course?.id}-weeks`)}
            className="w-full p-6 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2"
            aria-label="Continue learning this course"
          >
            <HiPlay className="w-10 h-10 mx-auto text-brand-green mb-2" />
            <h4 className="font-semibold">Continue Learning</h4>
            <p className="text-sm text-gray-500">Pick up where you left off</p>
          </button>
        </Card>
        <Card className="text-center cursor-pointer hover:shadow-lg transition-shadow">
          <HiVideoCamera className="w-10 h-10 mx-auto text-purple-600 mb-2" />
          <h4 className="font-semibold">Live Sessions</h4>
          <p className="text-sm text-gray-500">{courseContent?.upcomingLiveSessions || 0} upcoming</p>
        </Card>
        <Card className="text-center cursor-pointer hover:shadow-lg transition-shadow">
          <HiDocumentText className="w-10 h-10 mx-auto text-orange-600 mb-2" />
          <h4 className="font-semibold">Assignments</h4>
          <p className="text-sm text-gray-500">{courseContent?.pendingAssignments || 0} pending</p>
        </Card>
        <Card className="text-center hover:shadow-lg transition-shadow">
          <Avatar
            img={instructorAvatar}
            rounded
            size="lg"
            className="mx-auto mb-2"
          />
          <h4 className="font-semibold">Your Instructor</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 truncate">{instructorName}</p>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{instructorTitle}</p>
        </Card>
      </div>
    </div>
  );

  const renderModules = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Course Modules</h2>
        <Button color="green" onClick={() => navigate(`/dashboard?tab=course-${course?.id}-weeks`)}>
          <HiPlay className="w-4 h-4 mr-2" />
          Continue Learning
        </Button>
      </div>

      <div className="space-y-4">
        {(courseContent?.modules || []).map((module, index) => {
          const isCompleted = module.status === 'completed' || module.progress === 100;
          const isInProgress = module.status === 'in-progress' || (module.progress > 0 && module.progress < 100);
          const isLocked = module.status === 'locked';

          return (
            <Card
              key={module.id || index}
              className={`${activeModule?.id === module.id ? 'ring-2 ring-brand-green' : ''} ${isLocked ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start gap-4">
                {/* Status Icon */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
                  ${isCompleted ? 'bg-brand-green/10 dark:bg-brand-green/10' : 
                    isInProgress ? 'bg-brand-yellow/10 dark:bg-brand-yellow/10' : 
                    'bg-gray-100 dark:bg-gray-700'}
                `}>
                  {isCompleted ? (
                    <HiCheckCircle className="w-6 h-6 text-brand-green" />
                  ) : isLocked ? (
                    <HiLockClosed className="w-5 h-5 text-gray-400" />
                  ) : (
                    <span className="text-lg font-bold text-brand-green">{index + 1}</span>
                  )}
                </div>

                {/* Module Info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      {module.title || `Week ${index + 1}`}
                    </h3>
                    {isCompleted && <Badge color="success">Completed</Badge>}
                    {isInProgress && <Badge color="warning">In Progress</Badge>}
                    {isLocked && <Badge color="gray">Locked</Badge>}
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-3">{module.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <HiBookOpen className="w-4 h-4" />
                      {module.lessons?.length || 0} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <HiClock className="w-4 h-4" />
                      {module.duration || '~1 hour'}
                    </span>
                    {module.assignment && (
                      <span className="flex items-center gap-1 text-orange-600">
                        <HiDocumentText className="w-4 h-4" />
                        Assignment
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {!isLocked && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Progress</span>
                        <span className="text-brand-green font-medium">{module.progress || 0}%</span>
                      </div>
                      <Progress progress={module.progress || 0} color="green" size="sm" />
                    </div>
                  )}

                  {/* Lessons List (Expandable) */}
                  {activeModule?.id === module.id && module.lessons && (
                    <div className="mt-4 pt-4 border-t space-y-2">
                      {module.lessons.map((lesson, lIndex) => (
                        <button
                          type="button"
                          key={lesson.id || lIndex}
                          className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700"
                          onClick={() => navigate(`/dashboard?tab=course-${course?.id}-weeks`)}
                          aria-label={`Open lesson ${lesson.title}`}
                        >
                          {lesson.completed ? (
                            <HiCheckCircle className="w-5 h-5 text-brand-green" />
                          ) : (
                            <HiPlay className="w-5 h-5 text-gray-400" />
                          )}
                          <span className="text-sm flex-1">{lesson.title}</span>
                          <span className="text-xs text-gray-400">{lesson.duration || '10 min'}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Expand/Action Button */}
                {!isLocked && (
                  <button
                    onClick={() => setActiveModule(activeModule?.id === module.id ? null : module)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <HiChevronRight className={`w-5 h-5 transition-transform ${activeModule?.id === module.id ? 'rotate-90' : ''}`} />
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderAssignments = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Assignments</h2>

      {(courseContent?.assignments || []).length === 0 ? (
        <Card className="text-center py-8">
          <HiDocumentText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">No Assignments Yet</h3>
          <p className="text-gray-500">Assignments will appear here as you progress through the course.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {(courseContent?.assignments || []).map((assignment, index) => (
            <Card key={assignment.id || index}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-800 dark:text-white">{assignment.title}</h3>
                    {assignment.status === 'submitted' && <Badge color="success">Submitted</Badge>}
                    {assignment.status === 'pending' && <Badge color="warning">Pending</Badge>}
                    {assignment.status === 'graded' && <Badge color="info">Graded: {assignment.grade}</Badge>}
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{assignment.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <HiCalendar className="w-4 h-4" />
                      Due: {assignment.dueDate || 'No deadline'}
                    </span>
                    <span className="flex items-center gap-1">
                      <HiStar className="w-4 h-4" />
                      {assignment.points || 100} points
                    </span>
                  </div>
                </div>
                <Button color={assignment.status === 'submitted' ? 'gray' : 'green'} size="sm">
                  {assignment.status === 'submitted' ? 'View Submission' : 'Submit'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderLiveSessions = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Live Sessions</h2>

      {/* Upcoming Session */}
      {courseContent?.upcomingLiveSession && (
        <div className="bg-brand-green rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
              <HiVideoCamera className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-white/70">Upcoming Live Session</p>
              <h3 className="text-xl font-bold">{courseContent.upcomingLiveSession.title}</h3>
            </div>
          </div>
          <div className="flex flex-wrap gap-6 mb-4">
            <div className="flex items-center gap-2">
              <HiCalendar className="w-5 h-5 text-white/70" />
              <span>{courseContent.upcomingLiveSession.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <HiClock className="w-5 h-5 text-white/70" />
              <span>{courseContent.upcomingLiveSession.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <HiUsers className="w-5 h-5 text-white/70" />
              <span>Host: {courseContent.upcomingLiveSession.host}</span>
            </div>
          </div>
          <Button color="light">
            <HiVideoCamera className="w-5 h-5 mr-2" />
            Join Session
          </Button>
        </div>
      )}

      {/* Past Recordings */}
      <Card>
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">Past Recordings</h3>
        {(courseContent?.pastRecordings || []).length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recordings available yet.</p>
        ) : (
          <div className="space-y-3">
            {(courseContent?.pastRecordings || []).map((recording, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <HiVideoCamera className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{recording.title}</h4>
                    <p className="text-xs text-gray-500">{recording.date} • {recording.duration}</p>
                  </div>
                </div>
                <Button size="sm" color="gray">
                  <HiPlay className="w-4 h-4 mr-1" /> Watch
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );

  const renderResources = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Course Resources</h2>

      {/* Resource Categories */}
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { title: 'Toolkits & Templates', icon: HiOutlineDocumentDownload, count: courseContent?.toolkits?.length || 0 },
          { title: 'Guides & Handbooks', icon: HiBookOpen, count: courseContent?.guides?.length || 0 },
          { title: 'Case Studies', icon: HiOutlineCollection, count: courseContent?.caseStudies?.length || 0 },
          { title: 'Discussion Materials', icon: HiOutlineChat, count: courseContent?.discussionMaterials?.length || 0 }
        ].map((category, idx) => (
          <Card key={idx} className="cursor-pointer hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-brand-green/10 dark:bg-brand-green/10 rounded-lg">
                <category.icon className="w-6 h-6 text-brand-green" />
              </div>
              <Badge color="green">{category.count} items</Badge>
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white">{category.title}</h3>
          </Card>
        ))}
      </div>

      {/* All Resources List */}
      <Card>
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">All Resources</h3>
        {(courseContent?.resources || []).length === 0 ? (
          <p className="text-gray-500 text-center py-4">No resources available yet.</p>
        ) : (
          <div className="space-y-2">
            {(courseContent?.resources || []).map((resource, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <HiDownload className="w-5 h-5 text-gray-400" />
                  <div>
                    <h4 className="font-medium text-sm">{resource.name}</h4>
                    <p className="text-xs text-gray-500">{resource.type} • {resource.size}</p>
                  </div>
                </div>
                <Button size="xs" color="gray">
                  Download
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );

  const renderDiscussions = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Discussions</h2>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300">Course Discussions</h3>
          <Button size="sm" color="blue">New Discussion</Button>
        </div>
        
        <div className="space-y-4">
          {(courseContent?.discussions || []).length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No discussions yet. Start a conversation with your peers!
            </p>
          ) : (
            (courseContent?.discussions || []).map((discussion, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                <div className="flex items-start gap-3">
                  <Avatar size="sm" rounded />
                  <div className="flex-1">
                    <h4 className="font-medium">{discussion.title}</h4>
                    <p className="text-sm text-gray-500 line-clamp-2">{discussion.preview}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>{discussion.author}</span>
                      <span>{discussion.replies} replies</span>
                      <span>{discussion.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'modules':
        return renderModules();
      case 'assignments':
        return renderAssignments();
      case 'live-sessions':
        return renderLiveSessions();
      case 'resources':
        return renderResources();
      case 'discussions':
        return renderDiscussions();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
        >
          <HiArrowLeft className="w-5 h-5" />
          <span>Back to My Courses</span>
        </button>
      )}

      {renderContent()}
    </div>
  );
}
