/**
 * Dashboard Courses Management Component
 *
 * Clean, minimalist course table with essential information.
 * Clicking a row drills into CourseDetailView (assignments, sessions,
 * resources, enrollments — all scoped to that course).
 *
 * @component
 * @version 3.0.0 - Minimalist Design
 * @author Gikonyo Mwema
 */

import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Badge } from 'flowbite-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Unauthorized } from './Unauthorized';
import { apiFetch } from '../../../utils/api';
import CourseDetailView from './CourseDetailView';

export const DashCourses = () => {
  const { currentUser } = useSelector((state) => state.user);

  const [courses, setCourses] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [courseIdToDelete, setCourseIdToDelete] = useState('');
  const [loading, setLoading] = useState(false);

  /* ── Drill-down state ── */
  const [selectedCourse, setSelectedCourse] = useState(null);

  const isAdmin = currentUser?.isAdmin;
  const isInstructor = currentUser?.isInstructor;

  const fetchCourses = async (startIndex = 0) => {
    try {
      setLoading(true);
      const url = startIndex > 0
        ? `/api/v1/courses/my-taught-courses?startIndex=${startIndex}`
        : '/api/v1/courses/my-taught-courses/';

      const data = await apiFetch(url);
      const courseList = Array.isArray(data) ? data : (data.results || data.courses || []);

      const normalizedCourses = courseList.map(c => ({
        ...c,
        isPopular: c.is_popular !== undefined ? c.is_popular : c.isPopular,
        shortDescription: c.short_description || c.shortDescription,
        features: Array.isArray(c.features) ? c.features : [],
        // Instructor name with fallback to creator/admin
        instructor_name: c.instructor_name 
          || c.created_by_name 
          || c.created_by?.name
          || c.created_by?.username
          || c.creator?.name
          || c.creator?.username
          || currentUser?.username
          || 'Admin',
        enrollment_count: c.enrollment_count ?? 0,
      }));

      if (startIndex > 0) {
        setCourses(prev => [...prev, ...normalizedCourses]);
      } else {
        setCourses(normalizedCourses);
      }
      setShowMore(normalizedCourses.length >= 9);
    } catch (error) {
      console.error('Error fetching courses:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin || isInstructor) fetchCourses();
  }, [currentUser]);

  const handleShowMore = () => fetchCourses(courses.length);

  const handleDeleteCourse = async () => {
    try {
      await apiFetch(`/api/v1/courses/${courseIdToDelete}/`, { method: 'DELETE' });
      setCourses(prev => prev.filter(course => course.id !== courseIdToDelete));
      setShowModal(false);
    } catch (error) {
      console.error('Error deleting course:', error.message);
    }
  };

  if (!isAdmin && !isInstructor) return <Unauthorized />;

  /* ── Drill-down: show CourseDetailView ── */
  if (selectedCourse) {
    return (
      <CourseDetailView
        course={selectedCourse}
        onBack={() => setSelectedCourse(null)}
      />
    );
  }

  /* ── Courses list table ── */
  return (
    <div className="w-full p-4 md:p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isAdmin ? 'Courses' : 'My Courses'}
        </h2>
        <Link to="/create-course">
          <Button color="gray" className="text-sm font-medium">
            + New Course
          </Button>
        </Link>
      </div>

      {/* Loading state */}
      {loading && courses.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : courses.length > 0 ? (
        <>
          {/* Table */}
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            <Table hoverable>
              <Table.Head className="bg-gray-50 dark:bg-gray-900">
                <Table.HeadCell className="bg-gray-50 dark:bg-gray-900">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Course</span>
                </Table.HeadCell>
                {isAdmin && (
                  <Table.HeadCell className="bg-gray-50 dark:bg-gray-900">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Instructor</span>
                  </Table.HeadCell>
                )}
                <Table.HeadCell className="bg-gray-50 dark:bg-gray-900">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Price</span>
                </Table.HeadCell>
                <Table.HeadCell className="bg-gray-50 dark:bg-gray-900">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Enrolled</span>
                </Table.HeadCell>
                <Table.HeadCell className="bg-gray-50 dark:bg-gray-900">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Status</span>
                </Table.HeadCell>
                <Table.HeadCell className="bg-gray-50 dark:bg-gray-900">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Actions</span>
                </Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y divide-gray-200 dark:divide-gray-700">
                {courses.map((course) => (
                  <Table.Row key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    {/* Course Title */}
                    <Table.Cell>
                      <button
                        onClick={() => setSelectedCourse(course)}
                        className="text-left hover:text-brand-green transition-colors"
                      >
                        <p className="font-medium text-gray-900 dark:text-white hover:underline">
                          {course.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {course.category}
                        </p>
                      </button>
                    </Table.Cell>

                    {/* Instructor (admin only) */}
                    {isAdmin && (
                      <Table.Cell>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {course.instructor_name || 'Not assigned'}
                        </p>
                      </Table.Cell>
                    )}

                    {/* Price */}
                    <Table.Cell>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {course.is_free ? (
                          <span className="text-gray-500">Free</span>
                        ) : (
                          <span>KES {Number(course.price).toLocaleString()}</span>
                        )}
                      </p>
                    </Table.Cell>

                    {/* Enrolled Count */}
                    <Table.Cell>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {course.enrollment_count}
                      </p>
                    </Table.Cell>

                    {/* Status */}
                    <Table.Cell>
                      <div className="flex gap-1">
                        <Badge
                          color={course.is_live ? 'green' : 'gray'}
                          size="sm"
                          className="text-xs"
                        >
                          {course.is_live ? 'Live' : 'Draft'}
                        </Badge>
                      </div>
                    </Table.Cell>

                    {/* Actions */}
                    <Table.Cell>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedCourse(course)}
                          className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                        >
                          View
                        </button>
                        <span className="text-gray-300 dark:text-gray-600">·</span>
                        <Link to={`/edit-course/${course.id}`}>
                          <button className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                            Edit
                          </button>
                        </Link>
                        <span className="text-gray-300 dark:text-gray-600">·</span>
                        <button
                          onClick={() => {
                            setShowModal(true);
                            setCourseIdToDelete(course.id);
                          }}
                          className="text-sm text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>

          {/* Show More Button */}
          {showMore && (
            <button
              onClick={handleShowMore}
              className="w-full py-4 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load more'}
            </button>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-gray-400 mb-6">No courses yet</p>
          <Link to="/create-course">
            <Button color="gray">Create First Course</Button>
          </Link>
        </div>
      )}

      {/* Delete Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} size="md">
        <Modal.Body className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Delete Course?
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              color="gray"
              onClick={() => setShowModal(false)}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              color="failure"
              onClick={handleDeleteCourse}
              size="sm"
            >
              Delete
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};