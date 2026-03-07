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

  // Admins and instructors share the same dashboard with role-based sidebar gating
  if (currentUser.isAdmin || currentUser.isInstructor) {
      return <AdminDashboard />;
  }

  return <StudentDashboard />;
}
