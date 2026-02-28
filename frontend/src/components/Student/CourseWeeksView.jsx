/**
 * Course Weeks View Component
 * 
 * Displays weekly course content with lock/unlock logic.
 * - Self-paced courses: next week unlocks when all lessons in current week are completed
 * - Scheduled courses: weeks unlock based on enrollment date + N weeks
 * 
 * Each week is expandable to show its lessons.
 * Unlocked lessons are clickable and navigate to the LearningPlayer.
 * Locked lessons are visible but greyed out / not clickable.
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Spinner } from 'flowbite-react';
import { 
  HiLockClosed,
  HiCheckCircle,
  HiPlay,
  HiChevronDown,
  HiChevronRight,
  HiArrowLeft,
  HiBookOpen,
  HiClock,
  HiAcademicCap,
} from 'react-icons/hi';
import { apiFetch } from '../../utils/api';

export default function CourseWeeksView({ course, onBack, onWeekSelect }) {
  const navigate = useNavigate();
  const [weeksData, setWeeksData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [error, setError] = useState(null);
  const [visitedWeeks, setVisitedWeeks] = useState(new Set());
  const [fetchCount, setFetchCount] = useState(0);

  useEffect(() => {
    const fetchWeeks = async () => {
      if (!course) return;
      try {
        setLoading(true);
        setError(null);
        const data = await apiFetch(`/api/courses/${course.id}/weeks/`);
        setWeeksData(data);

        // Auto-expand the current week
        const currentWeek = data.weeks?.find(w => w.is_current);
        if (currentWeek) {
          setExpandedWeek(currentWeek.id);
        } else if (data.weeks?.length > 0) {
          // If no current week (all done or all locked), expand the first
          setExpandedWeek(data.weeks[0].id);
        }
      } catch (err) {
        console.error('Error fetching weeks:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWeeks();
  }, [course, fetchCount]);

  // Re-fetch weeks data each time the component becomes visible (e.g. returning from WeekLessonView)
  useEffect(() => {
    setFetchCount((c) => c + 1);
  }, []);

  const toggleWeek = (weekId) => {
    setExpandedWeek(expandedWeek === weekId ? null : weekId);
  };

  const handleWeekClick = (week) => {
    if (week.is_unlocked && onWeekSelect) {
      setVisitedWeeks((prev) => new Set([...prev, week.id]));
      onWeekSelect(week, weeksData);
    } else {
      toggleWeek(week.id);
    }
  };

  const handleLessonClick = (lesson, week) => {
    if (lesson.is_accessible && onWeekSelect) {
      setVisitedWeeks((prev) => new Set([...prev, week.id]));
      onWeekSelect(week, weeksData, lesson.id);
    }
  };

  // Calculate overall progress
  const overallProgress = weeksData?.weeks
    ? Math.round(
        (weeksData.weeks.reduce((sum, w) => sum + w.completed_count, 0) /
          Math.max(weeksData.weeks.reduce((sum, w) => sum + w.total_count, 0), 1)) * 100
      )
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Spinner size="xl" className="mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading course content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={onBack}
          className="text-blue-600 hover:underline"
        >
          Back to My Courses
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <HiArrowLeft className="w-5 h-5" />
          <span>Back to My Courses</span>
        </button>
      )}

      {/* Course Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          {weeksData?.course_title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-blue-100 mb-5">
          <span className="flex items-center gap-1.5">
            <HiBookOpen className="w-4 h-4" />
            {weeksData?.total_weeks} Weeks
          </span>
          <span className="flex items-center gap-1.5">
            <HiAcademicCap className="w-4 h-4" />
            {weeksData?.pacing_type === 'self_paced' ? 'Self-Paced' : 'Scheduled'}
          </span>
        </div>

        {/* Overall Progress */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Overall Progress</span>
            <span className="font-bold">{overallProgress}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2.5">
            <div
              className="bg-white rounded-full h-2.5 transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Pacing hint */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
        {weeksData?.pacing_type === 'self_paced' ? (
          <>
            <strong>Self-Paced Course:</strong> Complete all lessons in a week to unlock the next one.
          </>
        ) : (
          <>
            <strong>Scheduled Course:</strong> A new week of content unlocks every week after your enrollment date.
          </>
        )}
      </div>

      {/* Weeks List */}
      <div className="space-y-3">
        {weeksData?.weeks?.map((week) => {
          const isExpanded = expandedWeek === week.id;
          const progressPercent =
            week.total_count > 0
              ? Math.round((week.completed_count / week.total_count) * 100)
              : 0;

          return (
            <div
              key={week.id}
              className={`bg-white dark:bg-gray-800 rounded-xl border transition-all duration-200 overflow-hidden
                ${week.is_current
                  ? 'border-blue-500 shadow-md shadow-blue-100 dark:shadow-blue-900/20'
                  : week.is_unlocked
                    ? 'border-gray-200 dark:border-gray-700 hover:shadow-md'
                    : 'border-gray-200 dark:border-gray-700 opacity-70'
                }
              `}
            >
              {/* Week Header — Always clickable to toggle */}
              <button
                onClick={() => toggleWeek(week.id)}
                className="w-full flex items-center gap-4 p-4 md:p-5 text-left"
              >
                {/* Week Number / Status Circle */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg
                    ${week.all_completed
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                      : week.is_current
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                        : week.is_unlocked
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                    }
                  `}
                >
                  {week.all_completed ? (
                    <HiCheckCircle className="w-7 h-7 text-green-500" />
                  ) : week.is_unlocked ? (
                    <span>{week.week_number}</span>
                  ) : (
                    <HiLockClosed className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                {/* Week Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3
                      className={`font-semibold text-base
                        ${!week.is_unlocked
                          ? 'text-gray-400 dark:text-gray-500'
                          : 'text-gray-800 dark:text-white'
                        }
                      `}
                    >
                      Week {week.week_number}: {week.title}
                    </h3>

                    {/* Badges */}
                    {week.all_completed && (
                      <Badge color="success" size="xs">Completed</Badge>
                    )}
                    {week.is_current && !week.all_completed && (
                      <Badge color="info" size="xs">Current Week</Badge>
                    )}
                    {!week.is_unlocked && (
                      <Badge color="gray" size="xs">
                        <HiLockClosed className="w-3 h-3 mr-1 inline" />
                        Locked
                      </Badge>
                    )}
                  </div>

                  {/* Meta info */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <HiBookOpen className="w-3.5 h-3.5" />
                      {week.total_count} lesson{week.total_count !== 1 ? 's' : ''}
                    </span>
                    {week.is_unlocked && (
                      <span>
                        {week.completed_count}/{week.total_count} completed
                      </span>
                    )}
                  </div>

                  {/* Mini Progress */}
                  {week.is_unlocked && week.total_count > 0 && (
                    <div className="mt-2 w-full max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className={`rounded-full h-1.5 transition-all duration-300
                          ${week.all_completed ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Expand Icon */}
                <div className="flex-shrink-0 text-gray-400">
                  {isExpanded ? (
                    <HiChevronDown className="w-5 h-5" />
                  ) : (
                    <HiChevronRight className="w-5 h-5" />
                  )}
                </div>
              </button>

              {/* Expanded Lessons List */}
              {isExpanded && (
                <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 md:px-5 py-3">
                  {week.lessons.length === 0 ? (
                    <p className="text-sm text-gray-400 py-2">
                      No lessons in this week yet.
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {week.lessons.map((lesson, lIdx) => (
                        <div
                          key={lesson.id}
                          onClick={() => handleLessonClick(lesson, week)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                            ${lesson.is_accessible
                              ? 'cursor-pointer hover:bg-white dark:hover:bg-gray-700 group'
                              : 'cursor-not-allowed'
                            }
                          `}
                        >
                          {/* Lesson Status Icon */}
                          <div className="flex-shrink-0">
                            {lesson.is_completed ? (
                              <HiCheckCircle className="w-5 h-5 text-green-500" />
                            ) : lesson.is_accessible ? (
                              <HiPlay className="w-5 h-5 text-blue-500 group-hover:text-blue-600" />
                            ) : (
                              <HiLockClosed className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                            )}
                          </div>

                          {/* Lesson Title */}
                          <div className="flex-1 min-w-0">
                            <span
                              className={`text-sm
                                ${lesson.is_accessible
                                  ? 'text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                                  : 'text-gray-400 dark:text-gray-500'
                                }
                              `}
                            >
                              {lIdx + 1}. {lesson.title}
                            </span>
                          </div>

                          {/* Duration */}
                          {lesson.duration > 0 && (
                            <span className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
                              <HiClock className="w-3 h-3" />
                              {Math.ceil(lesson.duration / 60)} min
                            </span>
                          )}

                          {/* Arrow for accessible, incomplete lessons */}
                          {lesson.is_accessible && !lesson.is_completed && (
                            <HiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Enter Week button for unlocked weeks */}
                  {week.is_unlocked && (
                    <button
                      onClick={() => handleWeekClick(week)}
                      className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <HiPlay className="w-4 h-4" />
                      {week.all_completed ? 'Review Week' : (week.completed_count > 0 || visitedWeeks.has(week.id)) ? 'Continue Week' : 'Start Week'}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
