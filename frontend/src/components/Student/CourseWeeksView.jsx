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
  HiOutlineCalendar,
  HiOutlineChartBar,
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Spinner size="xl" className="text-blue-600" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading your learning journey...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto space-y-4">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <HiArrowLeft className="w-4 h-4" />
            Back to My Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors group"
        >
          <HiArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to My Courses</span>
        </button>
      )}

      {/* Course Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 text-white shadow-xl">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
        
        <div className="relative">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
            {weeksData?.course_title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-blue-100 mb-6">
            <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
              <HiBookOpen className="w-4 h-4" />
              {weeksData?.total_weeks} {weeksData?.total_weeks === 1 ? 'Week' : 'Weeks'}
            </span>
            <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
              {weeksData?.pacing_type === 'self_paced' ? (
                <HiOutlineChartBar className="w-4 h-4" />
              ) : (
                <HiOutlineCalendar className="w-4 h-4" />
              )}
              {weeksData?.pacing_type === 'self_paced' ? 'Self-Paced' : 'Scheduled'}
            </span>
          </div>

          {/* Overall Progress */}
          <div className="max-w-md">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-blue-100">Overall Progress</span>
              <span className="font-semibold bg-white/20 px-2.5 py-1 rounded-full text-xs">
                {overallProgress}%
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-white rounded-full h-2.5 transition-all duration-700 ease-out"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pacing hint */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl px-5 py-4 text-sm text-blue-700 dark:text-blue-300">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {weeksData?.pacing_type === 'self_paced' ? (
              <HiOutlineChartBar className="w-5 h-5 text-blue-500" />
            ) : (
              <HiOutlineCalendar className="w-5 h-5 text-blue-500" />
            )}
          </div>
          <div>
            <span className="font-semibold block mb-1">
              {weeksData?.pacing_type === 'self_paced' ? 'Self-Paced Learning' : 'Scheduled Learning'}
            </span>
            <span className="text-blue-600/80 dark:text-blue-300/80">
              {weeksData?.pacing_type === 'self_paced' ? (
                <>Complete all lessons in a week to unlock the next one. Learn at your own pace.</>
              ) : (
                <>A new week of content unlocks every week after your enrollment date. Stay on track!</>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Weeks List */}
      <div className="space-y-4">
        {weeksData?.weeks?.map((week) => {
          const isExpanded = expandedWeek === week.id;
          const progressPercent =
            week.total_count > 0
              ? Math.round((week.completed_count / week.total_count) * 100)
              : 0;

          return (
            <div
              key={week.id}
              className={`group bg-white dark:bg-gray-800 rounded-2xl border transition-all duration-300 overflow-hidden
                ${week.is_current
                  ? 'border-blue-300 dark:border-blue-700 shadow-lg shadow-blue-100/50 dark:shadow-blue-900/20'
                  : week.is_unlocked
                    ? 'border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-lg'
                    : 'border-gray-200 dark:border-gray-700 opacity-70'
                }
              `}
            >
              {/* Week Header — Always clickable to toggle */}
              <button
                onClick={() => toggleWeek(week.id)}
                className="w-full flex items-center gap-4 p-5 md:p-6 text-left transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
              >
                {/* Week Number / Status Circle */}
                <div
                  className={`relative w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 font-semibold text-lg transition-all duration-300
                    ${week.all_completed
                      ? 'bg-gradient-to-br from-green-400 to-green-500 text-white shadow-md shadow-green-200 dark:shadow-green-900/30'
                      : week.is_current
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/30'
                        : week.is_unlocked
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                    }
                  `}
                >
                  {week.all_completed ? (
                    <HiCheckCircle className="w-7 h-7" />
                  ) : week.is_unlocked ? (
                    <span>{week.week_number}</span>
                  ) : (
                    <HiLockClosed className="w-5 h-5" />
                  )}
                </div>

                {/* Week Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h3
                      className={`font-semibold text-lg tracking-tight
                        ${!week.is_unlocked
                          ? 'text-gray-400 dark:text-gray-500'
                          : 'text-gray-800 dark:text-white'
                        }
                      `}
                    >
                      Week {week.week_number}: {week.title}
                    </h3>

                    {/* Badges */}
                    <div className="flex gap-1.5">
                      {week.all_completed && (
                        <Badge color="success" size="sm" className="rounded-full px-3 py-0.5 text-xs font-medium">
                          Completed
                        </Badge>
                      )}
                      {week.is_current && !week.all_completed && (
                        <Badge color="info" size="sm" className="rounded-full px-3 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                          Current
                        </Badge>
                      )}
                      {!week.is_unlocked && (
                        <Badge color="gray" size="sm" className="rounded-full px-3 py-0.5 text-xs font-medium">
                          <HiLockClosed className="w-3 h-3 mr-1 inline" />
                          Locked
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Meta info */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <HiBookOpen className="w-3.5 h-3.5" />
                      {week.total_count} {week.total_count === 1 ? 'lesson' : 'lessons'}
                    </span>
                    {week.is_unlocked && (
                      <span className="flex items-center gap-1.5">
                        <HiCheckCircle className="w-3.5 h-3.5" />
                        {week.completed_count}/{week.total_count} completed
                      </span>
                    )}
                  </div>

                  {/* Mini Progress - only when not expanded */}
                  {!isExpanded && week.is_unlocked && week.total_count > 0 && (
                    <div className="mt-3 w-full max-w-xs bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`rounded-full h-1.5 transition-all duration-500 ease-out
                          ${week.all_completed ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Action Buttons - Right side */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {week.is_unlocked && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWeekClick(week);
                      }}
                      className={`
                        px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5
                        transition-all hover:scale-105
                        ${week.all_completed
                          ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400'}
                      `}
                    >
                      <HiPlay className="w-3 h-3" />
                      {week.all_completed ? 'Review' :
                       (week.completed_count > 0 || visitedWeeks.has(week.id)) ? 'Continue' : 'Start'}
                    </button>
                  )}

                  {/* Expand Icon */}
                  <div className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    <HiChevronDown className="w-5 h-5" />
                  </div>
                </div>
              </button>

              {/* Expanded Lessons List */}
              {isExpanded && (
                <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/50 px-5 md:px-6 py-4 animate-slideDown">
                  {week.lessons.length === 0 ? (
                    <p className="text-sm text-gray-400 py-3 text-center">
                      No lessons in this week yet.
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {week.lessons.map((lesson, lIdx) => (
                        <div
                          key={lesson.id}
                          onClick={() => handleLessonClick(lesson, week)}
                          className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200
                            ${lesson.is_accessible
                              ? 'cursor-pointer hover:bg-white dark:hover:bg-gray-700 group'
                              : 'cursor-not-allowed opacity-60'
                            }
                          `}
                        >
                          {/* Lesson Status Icon */}
                          <div className="flex-shrink-0">
                            {lesson.is_completed ? (
                              <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <HiCheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                              </div>
                            ) : lesson.is_accessible ? (
                              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                                <HiPlay className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                <HiLockClosed className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                              </div>
                            )}
                          </div>

                          {/* Lesson Title */}
                          <div className="flex-1 min-w-0">
                            <span
                              className={`text-sm font-medium
                                ${lesson.is_accessible
                                  ? 'text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                                  : 'text-gray-400 dark:text-gray-500'
                                }
                              `}
                            >
                              {lesson.title}
                            </span>
                          </div>

                          {/* Duration */}
                          {lesson.duration > 0 && (
                            <span className="text-xs text-gray-400 flex items-center gap-1.5 flex-shrink-0 bg-white dark:bg-gray-700 px-2 py-1 rounded-full">
                              <HiClock className="w-3 h-3" />
                              {Math.ceil(lesson.duration / 60)} min
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
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
