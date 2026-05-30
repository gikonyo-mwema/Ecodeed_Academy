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
import DOMPurify from 'dompurify';
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
import { getEmbedFallbackUrl, getPlayableVideoUrl } from '../../utils/videoEmbed';

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

  const playerUrl = useMemo(
    () => getPlayableVideoUrl(currentLesson?.video_url),
    [currentLesson?.video_url]
  );
  const fallbackEmbedUrl = useMemo(
    () => getEmbedFallbackUrl(currentLesson?.video_url),
    [currentLesson?.video_url]
  );
  const canPlayWithReactPlayer = useMemo(
    () => !!(playerUrl && ReactPlayer.canPlay(playerUrl)),
    [playerUrl]
  );

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
      // Persist to backend FIRST so unlock logic has correct data
      if (enrollmentId) {
        await apiFetch(`/api/v1/enrollments/${enrollmentId}/complete-lesson/`, {
          method: 'POST',
          body: JSON.stringify({ lesson_id: currentLesson.id }),
        });
      }
      // Update local state after backend confirms
      const newCompleted = new Set([...completedSet, currentLesson.id]);
      setCompletedSet(newCompleted);

      // Check if ALL lessons in this week are now complete
      const allDone = lessons.every((l) => newCompleted.has(l.id));
      if (allDone) {
        // Week complete — tell parent to navigate to next week
        setMarkingComplete(false);
        onWeekComplete?.();
        return;
      }
      // Auto-advance to next lesson in this week
      if (currentIndex < lessons.length - 1) {
        goNext();
      }
    } catch (err) {
      console.error('Error marking lesson complete:', err);
      // Still update local state so UI responds
      const newCompleted = new Set([...completedSet, currentLesson.id]);
      setCompletedSet(newCompleted);
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
          <p className="text-sm text-brand-green dark:text-brand-green/80 font-medium mb-1">
            Lesson {currentIndex + 1} of {lessons.length}
          </p>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {currentLesson.title}
          </h2>
        </div>

        {/* Lesson Description / Introduction — read first */}
        {currentLesson.content && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
            <div className="prose dark:prose-invert max-w-none lesson-content text-gray-800 dark:text-gray-100">
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentLesson.content) }} />
            </div>
          </div>
        )}

        {/* Video Player — watch after reading */}
        {currentLesson.video_url && (
          <div className="aspect-video rounded-xl overflow-hidden bg-black">
            {canPlayWithReactPlayer ? (
              <ReactPlayer
                url={playerUrl}
                width="100%"
                height="100%"
                controls
                playing={false}
                config={{
                  youtube: {
                    playerVars: {
                      rel: 0,
                      modestbranding: 1,
                      playsinline: 1,
                      origin: typeof window !== 'undefined' ? window.location.origin : undefined,
                    },
                  },
                }}
              />
            ) : fallbackEmbedUrl ? (
              <iframe
                src={fallbackEmbedUrl}
                title={currentLesson.title || 'Lesson video'}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-6 text-center text-white/85">
                <div>
                  <p className="font-semibold mb-2">Video preview unavailable in embedded mode.</p>
                  <a
                    href={currentLesson.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-brand-yellow"
                  >
                    Open video in a new tab
                  </a>
                </div>
              </div>
            )}
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
            <div className="flex items-center gap-3">
              <Badge color="success" size="sm" className="px-3 py-1.5">
                <HiCheckCircle className="w-4 h-4 mr-1.5 inline" /> Completed
              </Badge>
              {currentIndex < lessons.length - 1 ? (
                <button
                  onClick={goNext}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                    bg-brand-green text-white hover:bg-brand-green/90 transition-colors"
                >
                  Next Lesson <HiChevronRight className="w-4 h-4" />
                </button>
              ) : (
                lessons.every((l) => completedSet.has(l.id)) && (
                  <button
                    onClick={() => onWeekComplete?.()}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                      bg-brand-green text-white hover:bg-brand-green/90 transition-colors"
                  >
                    Next Week <HiChevronRight className="w-4 h-4" />
                  </button>
                )
              )}
            </div>
          ) : (
            <button
              onClick={markComplete}
              disabled={markingComplete}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium
                bg-brand-green text-white hover:bg-brand-green/90 transition-colors disabled:opacity-60"
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
                  className="flex items-center gap-1 text-brand-green hover:underline"
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
              <div className="p-2 bg-brand-green/5 dark:bg-brand-green/10 rounded-lg">
                <HiDownload className="w-5 h-5 text-brand-green" />
              </div>
              <span className="font-medium text-gray-800 dark:text-white">{r.title}</span>
            </div>
            {r.file_url && (
              <a
                href={r.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-brand-green hover:underline"
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
            className="bg-brand-green rounded-2xl p-6 text-white space-y-4"
          >
            <div className="flex items-center gap-3">
              <HiVideoCamera className="w-8 h-8" />
              <h3 className="text-xl font-bold">{s.title}</h3>
            </div>
            {s.description && <p className="text-white/70">{s.description}</p>}
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
                  className="inline-flex items-center gap-2 px-5 py-2 bg-white text-brand-green rounded-lg font-medium hover:bg-brand-green/5 transition-colors"
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
      <div className="bg-brand-green rounded-xl px-6 py-4 text-white flex items-center justify-between">
        <div>
          <p className="text-white/70 text-sm font-medium">Week {week?.week_number}</p>
          <h1 className="text-xl font-bold">{week?.title}</h1>
        </div>
        <div className="text-sm text-white/80">
          {week?.completed_count}/{week?.total_count} lessons completed
        </div>
      </div>

      {renderSection()}

      <style>{`
        .lesson-content,
        .lesson-content * {
          color: inherit;
        }

        .dark .lesson-content a {
          color: #93c5fd;
        }

        .dark .lesson-content strong {
          color: #ffffff;
        }
      `}</style>
    </div>
  );
}
