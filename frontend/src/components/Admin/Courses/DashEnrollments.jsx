import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Table, Button, Modal } from 'flowbite-react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { apiFetch } from '../../../utils/api';

export default function DashEnrollments() {
  const { currentUser } = useSelector((state) => state.user);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [enrollmentIdToDelete, setEnrollmentIdToDelete] = useState('');

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        if (currentUser.isAdmin) {
          const data = await apiFetch('/api/v1/enrollments/');
          setEnrollments(data);
          setLoading(false);
        }
      } catch (error) {
        console.error(error.message);
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

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

  return (
    <div className='table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500'>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Enrollments & Sales</h2>
      </div>
      
      {currentUser.isAdmin && enrollments.length > 0 ? (
        <>
          <Table hoverable className='shadow-md'>
            <Table.Head>
              <Table.HeadCell>Date Enrolled</Table.HeadCell>
              <Table.HeadCell>Student</Table.HeadCell>
              <Table.HeadCell>Course Title</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Price</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className='divide-y'>
              {enrollments.map((enrollment) => (
                <Table.Row key={enrollment.id} className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                  <Table.Cell>
                    {new Date(enrollment.enrolled_at).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    {enrollment.student_username || enrollment.student_email || enrollment.user} 
                  </Table.Cell>
                  <Table.Cell className='font-medium text-gray-900 dark:text-white'>
                    {enrollment.course_details?.title || 'Unknown Course'}
                  </Table.Cell>
                  <Table.Cell>{enrollment.status}</Table.Cell>
                  <Table.Cell>
                    {enrollment.course_details?.is_free ? 'Free' : `$${enrollment.course_details?.price}`}
                  </Table.Cell>
                  <Table.Cell>
                    <span
                      onClick={() => {
                        setShowModal(true);
                        setEnrollmentIdToDelete(enrollment.id);
                      }}
                      className='font-medium text-red-500 hover:underline cursor-pointer'
                    >
                      Revoke
                    </span>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </>
      ) : (
        <p>You have no enrollments yet!</p>
      )}
      
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size='md'
      >
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
