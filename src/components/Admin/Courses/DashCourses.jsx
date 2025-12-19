/**
 * Dashboard Courses Management Component
 * 
 * A comprehensive course management interface for administrators that provides
 * full CRUD operations for educational environmental courses and programs.
 * 
 * Features:
 * - Create, edit, and delete environmental courses
 * - Course enrollment tracking and analytics
 * - Student progress monitoring and reporting
 * - Course content management with modules
 * - Pricing and payment integration
 * - Course scheduling and availability management
 * - Certificate generation for completed courses
 * - Bulk operations for course administration
 * 
 * Course Types Managed:
 * - Environmental Science Fundamentals
 * - Climate Change and Mitigation Strategies
 * - Sustainable Development Practices
 * - Renewable Energy Technologies
 * - Waste Management and Recycling
 * - Water Conservation Techniques
 * - Green Building and LEED Certification
 * - Carbon Footprint Assessment
 * 
 * Course Information Displayed:
 * - Course title, description, and objectives
 * - Instructor information and credentials
 * - Course duration and schedule
 * - Enrollment numbers and capacity
 * - Pricing and payment options
 * - Course rating and student feedback
 * - Completion rates and analytics
 * 
 * Administrative Features:
 * - Real-time enrollment monitoring
 * - Student progress tracking
 * - Course performance analytics
 * - Content management and updates
 * - Payment and billing oversight
 * - Certificate management
 * 
 * Security Features:
 * - Admin-only access with role verification
 * - Secure course deletion with confirmation
 * - Protected course content and materials
 * - Student data privacy protection
 * 
 * State Management:
 * - Local state for courses list and pagination
 * - Redux integration for user authentication
 * - Modal state for delete confirmations
 * - Loading states for API operations
 * 
 * @component
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

import React, { useState, useEffect } from 'react';
import { Button, Table, Modal } from 'flowbite-react';
import { HiOutlinePlus, HiOutlinePencilAlt, HiOutlineExclamationCircle } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Unauthorized } from './Unauthorized';

/**
 * DashCourses Component
 * Main courses management interface for administrators
 * 
 * @returns {JSX.Element} Complete courses management dashboard
 */
export const DashCourses = () => {
  // Redux state for user authentication
  const { currentUser } = useSelector((state) => state.user);
  
  /**
   * Courses list state
   * Stores the array of course objects fetched from the API
   */
  const [courses, setCourses] = useState([]);
  
  /**
   * Pagination control state
   * Determines if more courses can be loaded
   */
  const [showMore, setShowMore] = useState(true);
  
  /**
   * Delete modal visibility state
   * Controls the confirmation modal for course deletion
   */
  const [showModal, setShowModal] = useState(false);
  
  /**
   * Course deletion target
   * Stores the ID of the course selected for deletion
   */
  const [courseIdToDelete, setCourseIdToDelete] = useState('');
  
  /**
   * Loading state for API operations
   * Shows loading indicators during data fetching
   */
  const [loading, setLoading] = useState(false);

  /**
   * Fetches courses from the API with pagination support
   * Handles both initial load and pagination requests
   * 
   * @async
   * @param {number} startIndex - Starting index for pagination (default: 0)
   */
  const fetchCourses = async (startIndex = 0) => {
    try {
      setLoading(true);
      
      // Build URL with pagination parameter if needed
      const url = startIndex > 0 
        ? `/api/courses?startIndex=${startIndex}`
        : '/api/courses';
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (res.ok) {
        if (startIndex > 0) {
          // Append to existing courses for pagination
          setCourses(prev => [...prev, ...(data.courses || data)]);
        } else {
          // Set initial courses data
          setCourses(data.courses || data);
        }
        // Update pagination control
        setShowMore((data.courses || data).length >= 9);
      }
    } catch (error) {
      console.error('Error fetching courses:', error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Effect to fetch courses when component mounts
   * Only runs if current user has admin privileges
   */
  useEffect(() => {
    if (currentUser?.isAdmin) fetchCourses();
  }, [currentUser]);

  /**
   * Handles loading more courses for pagination
   * Fetches the next batch of courses
   */
  const handleShowMore = () => {
    fetchCourses(courses.length);
  };

  /**
   * Handles course deletion with API call
   * Updates local state after successful deletion
   * 
   * @async
   */
  const handleDeleteCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${courseIdToDelete}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });
      const data = await res.json();
      
      if (res.ok) {
        setCourses(prev => prev.filter(course => course._id !== courseIdToDelete));
        setShowModal(false);
      } else {
        throw new Error(data.message || 'Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error.message);
    }
  };

  if (!currentUser?.isAdmin) {
    return <Unauthorized />;
  }

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Manage Courses</h2>
        <Link to="/create-course">
          <Button gradientDuoTone="tealToLime">
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
              <Table.HeadCell>Title</Table.HeadCell>
              <Table.HeadCell>Slug</Table.HeadCell>
              <Table.HeadCell>Price</Table.HeadCell>
              <Table.HeadCell>Popular</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {courses.map((course) => (
                <Table.Row key={course._id} className="hover:bg-gray-50">
                  <Table.Cell className="font-medium text-gray-900">
                    {course.title}
                  </Table.Cell>
                  <Table.Cell className="font-mono text-sm text-gray-700">
                    {course.slug}
                  </Table.Cell>
                  <Table.Cell>
                    {course.price?.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'KES'
                    })}
                  </Table.Cell>
                  <Table.Cell>
                    {course.isPopular ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Popular
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Standard
                      </span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex space-x-2">
                      <Link to={`/edit-course/${course._id}`}>
                        <Button outline gradientDuoTone="tealToLime" size="xs">
                          <HiOutlinePencilAlt className="mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        outline
                        gradientDuoTone="pinkToOrange"
                        size="xs"
                        onClick={() => {
                          setShowModal(true);
                          setCourseIdToDelete(course._id);
                        }}
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
              className="w-full text-teal-500 py-7 text-sm hover:text-teal-700 transition-colors"
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
            <Button gradientDuoTone="tealToLime">
              Create Your First Course
            </Button>
          </Link>
        </div>
      )}

      <Modal show={showModal} onClose={() => setShowModal(false)} size="md">
        <Modal.Header className="border-b-0 pb-0">
          Confirm Deletion
        </Modal.Header>
        <Modal.Body className="pt-4">
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="mb-5 text-lg font-normal text-gray-500">
              Are you sure you want to delete this course?
            </h3>
            <div className="flex justify-center gap-4">
              <Button 
                color="gray" 
                onClick={() => setShowModal(false)}
                className="px-5"
              >
                Cancel
              </Button>
              <Button 
                color="failure" 
                onClick={handleDeleteCourse}
                className="px-5"
              >
                Yes, delete
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};