import React from 'react';
import { useSelector } from 'react-redux';
import AdminDashboard from '../components/Admin/AdminDashboard';
import StudentDashboard from '../components/Student/StudentDashboard';

export default function Dashboard() {
  const { currentUser } = useSelector((state) => state.user);

  if (!currentUser) {
      return (
          <div className='min-h-screen flex items-center justify-center text-xl text-gray-500'>
              Please sign in to access your dashboard.
          </div>
      );
  }

  // Check if user is admin
  // Based on the user model, we might use isAdmin or is_staff or role.
  // Assuming 'isAdmin' is the standard field on frontend model.
  if (currentUser.isAdmin) {
      return <AdminDashboard />;
  }

  return <StudentDashboard />;
}
