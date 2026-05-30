/**
 * Dashboard Courses Management Component
 *
 * Enriched course table with instructor name, enrollment count, status.
 * Clicking a row drills into CourseDetailView (assignments, sessions,
 * resources, enrollments — all scoped to that course).
 *
 * @component
 * @version 2.0.0
 * @author Gikonyo Mwema
 */

import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Badge } from 'flowbite-react';
import { HiOutlinePlus, HiOutlinePencilAlt, HiOutlineExclamationCircle, HiEye, HiOutlineEye } from 'react-icons/hi';
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
        instructor_name: c.instructor_name || null,
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
    <div className="table-auto overflow-x-scroll md:mx-auto p-3">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {isAdmin ? 'All Courses' : 'My Courses'}
        </h2>
        <Link to="/create-course">
          <Button color="none" className="bg-gradient-to-r from-brand-green to-brand-yellow hover:from-brand-green/90 hover:to-brand-yellow/90 text-white border-0 focus:ring-4 focus:ring-brand-green/25">
            <HiOutlinePlus className="mr-2" />
            Add New Course
          </Button>
        </Link>
      </div>

      {loading && courses.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse text-gray-500">Loading courses...</div>
        </div>
      ) : courses.length > 0 ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Course</Table.HeadCell>
              {isAdmin && <Table.HeadCell>Instructor</Table.HeadCell>}
              <Table.HeadCell>Price</Table.HeadCell>
              <Table.HeadCell>Students</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {courses.map((course) => (
                <Table.Row
                  key={course.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      {course.image && (
                        <img src={course.image} alt="" className="w-12 h-8 rounded object-cover hidden sm:block" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{course.title}</p>
                        <p className="text-xs text-gray-500">{course.category}</p>
                      </div>
                    </div>
                  </Table.Cell>
                  {isAdmin && (
                    <Table.Cell className="text-sm text-gray-600 dark:text-gray-300">
                      {course.instructor_name || '—'}
                    </Table.Cell>
                  )}
                  <Table.Cell>
                    {course.is_free ? (
                      <Badge color="success" size="sm">Free</Badge>
                    ) : (
                      <span className="text-sm font-medium">
                        KES {Number(course.price).toLocaleString()}
                      </span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-green/10 text-brand-green text-sm font-bold">
                      {course.enrollment_count}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-1.5">
                      {course.is_live ? (
                        <Badge color="success" size="sm">Live</Badge>
                      ) : (
                        <Badge color="gray" size="sm">Draft</Badge>
                      )}
                      {course.isPopular && (
                        <Badge color="warning" size="sm">Popular</Badge>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex space-x-2">
                      <Button
                        size="xs" color="light"
                        onClick={() => setSelectedCourse(course)}
                      >
                        <HiEye className="mr-1 w-4 h-4" /> View
                      </Button>
                      {course.slug && (
                        <Link to={`/learn/${course.slug}?preview=1`}>
                          <Button
                            outline
                            color="none"
                            size="xs"
                            className="!border-brand-green !text-brand-green hover:!bg-brand-green hover:!text-white transition-colors"
                          >
                            <HiOutlineEye className="mr-1 w-4 h-4" /> Student View
                          </Button>
                        </Link>
                      )}
                      <Link to={`/edit-course/${course.id}`}>
                        <Button outline color="none" size="xs" className="!border-brand-green !text-brand-green hover:!bg-brand-green hover:!text-white transition-colors">
                          <HiOutlinePencilAlt className="mr-1" /> Edit
                        </Button>
                      </Link>
                      <Button
                        color="failure" outline size="xs"
                        onClick={() => { setShowModal(true); setCourseIdToDelete(course.id); }}
                      >
                        Delete
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>

          {showMore && (
            <button
              onClick={handleShowMore}
              className="w-full text-brand-green py-7 text-sm hover:text-brand-green/70 transition-colors"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Show more'}
            </button>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No courses found</p>
          <Link to="/create-course">
            <Button color="none" className="bg-gradient-to-r from-brand-green to-brand-yellow hover:from-brand-green/90 hover:to-brand-yellow/90 text-white border-0 focus:ring-4 focus:ring-brand-green/25">
              Create Your First Course
            </Button>
          </Link>
        </div>
      )}

      <Modal show={showModal} onClose={() => setShowModal(false)} size="md">
        <Modal.Header className="border-b-0 pb-0">Confirm Deletion</Modal.Header>
        <Modal.Body className="pt-4">
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="mb-5 text-lg font-normal text-gray-500">
              Are you sure you want to delete this course?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="gray" onClick={() => setShowModal(false)} className="px-5">Cancel</Button>
              <Button color="failure" onClick={handleDeleteCourse} className="px-5">Yes, delete</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};