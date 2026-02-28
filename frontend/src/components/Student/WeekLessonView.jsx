/**
 * Week Lesson View Component
 *
 * Renders the main content area when a student opens a specific week.
 * Shows the active lesson's content (text + video) with navigation
 * to switch between lessons, plus assignment / resource / live-session
 * sub-views for the same week.
 *
 * @component
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactPlayer from 'react-player';
import { Badge, Button, Spinner } from 'flowbite-react';
import {
  HiArrowLeft,
  HiChevronLeft,
  HiChevronRight,
  HiCheckCircle,
  HiPlay,
  HiBookOpen,
  HiClipboardCheck,
  HiDownload,
  HiVideoCamera,
  HiExternalLink,
  HiClock,
} from 'react-icons/hi';
import { apiFetch } from '../../utils/api';

/**
 * Props
 *  - week        : week object from the /weeks/ API (lessons, assignments, resources, live_sessions)
 *  - course      : enrolled course object (id, slug, title …)
 *  - weekSection : 'lessons' | 'assignments' | 'resources' | 'live-session'
 *  - activeLessonId : id of the lesson to show (null → first lesson)
 *  - onBack      : callback to go back to weeks list
 *  - onLessonChange(lessonId)   : tell parent the active lesson changed
 *  - onSectionChange(section)   : tell parent the active week-section changed
 *  - enrollmentId : enrollment id (for marking lessons complete)
 */
export default function WeekLessonView({
  week,
  weeksData,
  course,
  weekSection = 'lessons',
  activeLessonId = null,
  onBack,
  onLessonChange,
  onSectionChange,
  onWeekComplete,
  enrollmentId,
}) {
  // ──────────── lesson state ────────────
  const topRef = useRef(null);
  const lessons = useMemo(() => week?.lessons || [], [week]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedSet, setCompletedSet] = useState(new Set());
  const [markingComplete, setMarkingComplete] = useState(false);

  // Scroll to top whenever the active lesson changes
  useEffect(() => {
    if (currentLesson) {
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentLesson]);

  // Initialise completed set from week data
  useEffect(() => {
    const done = new Set(
      lessons.filter((l) => l.is_completed).map((l) => l.id)
    );
    setCompletedSet(done);
  }, [lessons]);

  // Pick active lesson
  useEffect(() => {
    if (weekSection !== 'lessons') return;
    if (activeLessonId) {
      const found = lessons.find((l) => l.id === activeLessonId);
      if (found) { setCurrentLesson(found); return; }
    }
    // Default → first incomplete, or first overall
    const first = lessons.find((l) => !completedSet.has(l.id)) || lessons[0] || null;
    setCurrentLesson(first);
  }, [activeLessonId, lessons, weekSection, completedSet]);

  const currentIndex = useMemo(
    () => (currentLesson ? lessons.findIndex((l) => l.id === currentLesson.id) : -1),
    [currentLesson, lessons]
  );

  const goTo = (lesson) => {
    setCurrentLesson(lesson);
    onLessonChange?.(lesson.id);
  };

  const goPrev = () => {
    if (currentIndex > 0) goTo(lessons[currentIndex - 1]);
  };
  const goNext = () => {
    if (currentIndex < lessons.length - 1) goTo(lessons[currentIndex + 1]);
  };

  // Mark lesson complete via existing backend endpoint
  const markComplete = async () => {
    if (!currentLesson) return;
    try {
      setMarkingComplete(true);
      // Optimistically update local state first
      const newCompleted = new Set([...completedSet, currentLesson.id]);
      setCompletedSet(newCompleted);
      // Persist to backend if enrollmentId is available
      if (enrollmentId) {
        await apiFetch(`/api/enrollments/${enrollmentId}/complete-lesson/`, {
          method: 'POST',
          body: JSON.stringify({ lesson_id: currentLesson.id }),
        });
      }
      // Check if ALL lessons in this week are now complete
      const allDone = lessons.every((l) => newCompleted.has(l.id));
      if (allDone) {
        // Navigate to the next week
        onWeekComplete?.();
      } else if (currentIndex < lessons.length - 1) {
        // Auto-advance to next lesson in this week
        goNext();
      }
    } catch (err) {
      console.error('Error marking lesson complete:', err);
      // Still keep the local state update so the UI responds
    } finally {
      setMarkingComplete(false);
    }
  };

  // ──────────── render helpers ────────────

  const renderLessonContent = () => {
    if (!currentLesson) {
      return (
        <div className="text-center py-16 text-gray-400">
          <HiBookOpen className="w-16 h-16 mx-auto mb-4" />
          <p>No lessons available for this week.</p>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Lesson Title */}
        <div>
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
            Lesson {currentIndex + 1} of {lessons.length}
          </p>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {currentLesson.title}
          </h2>
        </div>

        {/* Lesson Description / Introduction — read first */}
        {currentLesson.content && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
            <div className="prose dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
            </div>
          </div>
        )}

        {/* Video Player — watch after reading */}
        {currentLesson.video_url && (
          <div className="aspect-video rounded-xl overflow-hidden bg-black">
            <ReactPlayer
              url={currentLesson.video_url}
              width="100%"
              height="100%"
              controls
              playing={false}
            />
          </div>
        )}

        {/* No content placeholder */}
        {!currentLesson.video_url && !currentLesson.content && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 text-center text-gray-400">
            Content for this lesson is coming soon.
          </div>
        )}

        {/* Bottom Nav & Complete */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={goPrev}
            disabled={currentIndex <= 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
              disabled:opacity-40 disabled:cursor-not-allowed
              text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <HiChevronLeft className="w-4 h-4" /> Previous Lesson
          </button>

          {completedSet.has(currentLesson.id) ? (
            <Badge color="success" size="sm" className="px-3 py-1.5">
              <HiCheckCircle className="w-4 h-4 mr-1.5 inline" /> Completed
            </Badge>
          ) : (
            <button
              onClick={markComplete}
              disabled={markingComplete}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium
                bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-60"
            >
              {markingComplete ? (
                <Spinner size="sm" light />
              ) : (
                <HiCheckCircle className="w-4 h-4" />
              )}
              Mark as Complete
            </button>
          )}

          <button
            onClick={goNext}
            disabled={currentIndex >= lessons.length - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
              disabled:opacity-40 disabled:cursor-not-allowed
              text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Next Lesson <HiChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const renderAssignments = () => {
    const assignments = week?.assignments || [];
    if (assignments.length === 0) {
      return (
        <div className="text-center py-16 text-gray-400">
          <HiClipboardCheck className="w-16 h-16 mx-auto mb-4" />
          <p>No assignments for this week.</p>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Week {week.week_number} — Assignments
        </h2>
        {assignments.map((a) => (
          <div
            key={a.id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3"
          >
            <h3 className="font-semibold text-lg text-gray-800 dark:text-white">{a.title}</h3>
            {a.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{a.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
              {a.due_date && (
                <span className="flex items-center gap-1">
                  <HiClock className="w-4 h-4" />
                  Due: {new Date(a.due_date).toLocaleDateString()}
                </span>
              )}
              {a.resource_url && (
                <a
                  href={a.resource_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <HiDownload className="w-4 h-4" /> Download Template
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderResources = () => {
    const resources = week?.resources || [];
    if (resources.length === 0) {
      return (
        <div className="text-center py-16 text-gray-400">
          <HiDownload className="w-16 h-16 mx-auto mb-4" />
          <p>No resources for this week.</p>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Week {week.week_number} — Resources
        </h2>
        {resources.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <HiDownload className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-medium text-gray-800 dark:text-white">{r.title}</span>
            </div>
            {r.file_url && (
              <a
                href={r.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                Open <HiExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderLiveSession = () => {
    const sessions = week?.live_sessions || [];
    if (sessions.length === 0) {
      return (
        <div className="text-center py-16 text-gray-400">
          <HiVideoCamera className="w-16 h-16 mx-auto mb-4" />
          <p>No live session scheduled for this week.</p>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Week {week.week_number} — Live Session
        </h2>
        {sessions.map((s) => (
          <div
            key={s.id}
            className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white space-y-4"
          >
            <div className="flex items-center gap-3">
              <HiVideoCamera className="w-8 h-8" />
              <h3 className="text-xl font-bold">{s.title}</h3>
            </div>
            {s.description && <p className="text-purple-100">{s.description}</p>}
            <div className="flex flex-wrap gap-4 text-sm">
              {s.date_time && (
                <span className="flex items-center gap-1">
                  <HiClock className="w-4 h-4" />
                  {new Date(s.date_time).toLocaleString()}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {s.zoom_link && (
                <a
                  href={s.zoom_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2 bg-white text-purple-700 rounded-lg font-medium hover:bg-purple-50 transition-colors"
                >
                  <HiVideoCamera className="w-5 h-5" /> Join Meeting
                </a>
              )}
              {s.recording_url && (
                <a
                  href={s.recording_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors"
                >
                  <HiPlay className="w-5 h-5" /> Watch Recording
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ──────────── main render ────────────

  const renderSection = () => {
    switch (weekSection) {
      case 'assignments':
        return renderAssignments();
      case 'resources':
        return renderResources();
      case 'live-session':
        return renderLiveSession();
      default:
        return renderLessonContent();
    }
  };

  return (
    <div ref={topRef} className="space-y-6">
      {/* Back to weeks list */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <HiArrowLeft className="w-5 h-5" />
          <span>Back to Weeks</span>
        </button>
      )}

      {/* Week Header Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl px-6 py-4 text-white flex items-center justify-between">
        <div>
          <p className="text-blue-200 text-sm font-medium">Week {week?.week_number}</p>
          <h1 className="text-xl font-bold">{week?.title}</h1>
        </div>
        <div className="text-sm text-blue-100">
          {week?.completed_count}/{week?.total_count} lessons completed
        </div>
      </div>

      {renderSection()}
    </div>
  );
}
