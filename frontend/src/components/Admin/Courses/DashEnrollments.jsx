/**
 * Dashboard Enrollments Management Component
 *
 * Admin/Instructor interface for managing student course enrollments.
 * Displays all enrollment records with student info, course details, and status.
 * Allows admins/instructors to delete enrollments and manage student access.
 *
 * Features:
 * - Enrollment Table: Shows all student-course enrollment pairs
 * - Search/Filter: Real-time search by student username, email, or course title
 * - Enrollment Data: Display student name, course, enrollment date, status
 * - Delete Enrollments: Remove student access to courses (with confirmation modal)
 * - Loading States: Spinner during initial data fetch
 * - Responsive Design: Mobile-optimized table layout
 * - Permission Gating: Only admins/instructors can view enrollments
 *
 * API Endpoints:
 * - GET /api/v1/enrollments/: Fetch all enrollment records
 * - DELETE /api/v1/enrollments/{enrollmentId}/: Delete specific enrollment
 *
 * @component
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Table, Button, Modal, Badge, TextInput } from 'flowbite-react';
import { HiOutlineExclamationCircle, HiSearch } from 'react-icons/hi';
import { apiFetch } from '../../../utils/api';

export default function DashEnrollments() {
  const { currentUser } = useSelector((state) => state.user);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [enrollmentIdToDelete, setEnrollmentIdToDelete] = useState('');
  const [search, setSearch] = useState('');

  const isAdmin = currentUser?.isAdmin;
  const isInstructor = currentUser?.isInstructor;

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        if (isAdmin || isInstructor) {
          const data = await apiFetch('/api/v1/enrollments/');
          const list = Array.isArray(data) ? data : (data.results || []);
          setEnrollments(list);
        }
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, [currentUser]);

  const handleDeleteEnrollment = async () => {
    try {
      await apiFetch(`/api/v1/enrollments/${enrollmentIdToDelete}/`, {
        method: 'DELETE',
      });
      setEnrollments((prev) =>
        prev.filter((enrollment) => enrollment.id !== enrollmentIdToDelete)
      );
      setShowModal(false);
    } catch (error) {
      console.error(error.message);
    }
  };

  const filtered = enrollments.filter((e) => {
    const q = search.toLowerCase();
    if (!q) return true;
    const student = (e.student_username || e.student_email || '').toLowerCase();
    const course = (e.course_details?.title || '').toLowerCase();
    return student.includes(q) || course.includes(q);
  });

  if (!isAdmin && !isInstructor) {
    return <p className="p-6 text-gray-500">You don't have permission to view enrollments.</p>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-gray-500">Loading enrollments…</div>
      </div>
    );
  }

  return (
    <div className='table-auto overflow-x-scroll md:mx-auto p-3'>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {isAdmin ? 'All Enrollments' : 'My Course Enrollments'}
          </h2>
          <p className="text-sm text-gray-500">{filtered.length} enrollment{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <TextInput
          icon={HiSearch}
          placeholder="Search student or course…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64"
        />
      </div>

      {filtered.length > 0 ? (
        <Table hoverable className='shadow-md'>
          <Table.Head>
            <Table.HeadCell>Date</Table.HeadCell>
            <Table.HeadCell>Student</Table.HeadCell>
            <Table.HeadCell>Course</Table.HeadCell>
            <Table.HeadCell>Progress</Table.HeadCell>
            <Table.HeadCell>Price</Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body className='divide-y'>
            {filtered.map((enrollment) => {
              const pct = enrollment.total_lessons > 0
                ? Math.round((enrollment.completed_count / enrollment.total_lessons) * 100)
                : 0;
              return (
                <Table.Row key={enrollment.id} className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                  <Table.Cell className="text-sm text-gray-500">
                    {new Date(enrollment.enrolled_at).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell className="font-medium text-gray-900 dark:text-white">
                    {enrollment.student_username || enrollment.student_email || enrollment.user}
                  </Table.Cell>
                  <Table.Cell>
                    {enrollment.course_details?.title || 'Unknown Course'}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                        <div className="bg-brand-green h-2 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{pct}%</span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    {enrollment.course_details?.is_free ? (
                      <Badge color="success" size="sm">Free</Badge>
                    ) : (
                      <span className="text-sm">KES {Number(enrollment.course_details?.price || 0).toLocaleString()}</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <span
                      onClick={() => {
                        setShowModal(true);
                        setEnrollmentIdToDelete(enrollment.id);
                      }}
                      className='font-medium text-red-500 hover:underline cursor-pointer text-sm'
                    >
                      Revoke
                    </span>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      ) : (
        <div className="text-center py-12 text-gray-500">
          {search ? 'No enrollments match your search.' : 'No enrollments yet.'}
        </div>
      )}

      <Modal show={showModal} onClose={() => setShowModal(false)} popup size='md'>
        <Modal.Header />
        <Modal.Body>
          <div className='text-center'>
            <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto' />
            <h3 className='mb-5 text-lg text-gray-500 dark:text-gray-400'>
              Are you sure you want to revoke this enrollment? The student will lose access.
            </h3>
            <div className='flex justify-center gap-4'>
              <Button color='failure' onClick={handleDeleteEnrollment}>
                Yes, I'm sure
              </Button>
              <Button color='gray' onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
