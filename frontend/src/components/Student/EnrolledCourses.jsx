/**
 * Enrolled Courses Component
 * 
 * Displays all courses the student has enrolled in with progress tracking
 * and quick access to continue learning.
 * 
 * @component
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Progress, Badge, Card } from 'flowbite-react';
import { 
  HiPlay, 
  HiClock, 
  HiBookOpen, 
  HiCheckCircle,
  HiAcademicCap,
  HiArrowRight
} from 'react-icons/hi';

export default function EnrolledCourses({ courses = [], onCourseSelect, loading = false }) {
  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <HiAcademicCap className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          No Courses Yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          You haven't enrolled in any courses yet. Browse our catalog to get started!
        </p>
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Browse Courses
          <HiArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">My Courses</h2>
        <Link
          to="/courses"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
        >
          Browse More <HiArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card
            key={course.id}
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => onCourseSelect && onCourseSelect(course)}
          >
            {/* Course Image */}
            <div className="relative -mx-6 -mt-6 mb-4">
              <img
                src={course.image || '/placeholder-course.jpg'}
                alt={course.title}
                className="w-full h-40 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              
              {/* Progress Overlay */}
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center justify-between text-white text-sm mb-1">
                  <span>{course.progress || 0}% complete</span>
                  <span>{course.completedLessons || 0}/{course.totalLessons || 0} lessons</span>
                </div>
                <Progress
                  progress={course.progress || 0}
                  color="blue"
                  size="sm"
                  className="bg-white/30"
                />
              </div>

              {/* Status Badge */}
              {course.progress === 100 ? (
                <Badge color="success" className="absolute top-3 right-3">
                  <HiCheckCircle className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              ) : course.progress > 0 ? (
                <Badge color="warning" className="absolute top-3 right-3">
                  In Progress
                </Badge>
              ) : (
                <Badge color="info" className="absolute top-3 right-3">
                  Not Started
                </Badge>
              )}
            </div>

            {/* Course Info */}
            <h3 className="font-bold text-gray-800 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {course.title}
            </h3>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
              {course.shortDescription || course.description}
            </p>

            {/* Course Meta */}
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
              <span className="flex items-center gap-1">
                <HiBookOpen className="w-4 h-4" />
                {course.totalModules || course.modules?.length || 0} modules
              </span>
              <span className="flex items-center gap-1">
                <HiClock className="w-4 h-4" />
                {course.duration || 'Self-paced'}
              </span>
            </div>

            {/* Action Button */}
            <button
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <HiPlay className="w-5 h-5" />
              {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
