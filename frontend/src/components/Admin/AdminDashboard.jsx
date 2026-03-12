import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DashSidebar from './DashSidebar';
import DashProfile from './Users/DashProfile';
import DashPosts from './Posts/DashPosts';
import DashUsers from './Users/DashUsers';
import DashComments from './Comments/DashComments';
import DashboardComponent from './DashboardComponent';
import DashServices from './Services/DashServices';
import { DashCourses } from './Courses/DashCourses';
import DashEnrollments from './Courses/DashEnrollments';
import DashNewsletter from './DashNewsletter';
import DashAnnouncement from './DashAnnouncement';
import MyStudents from './Courses/MyStudents';
import MyEarnings from './Courses/MyEarnings';
import { useSelector } from 'react-redux';

export default function AdminDashboard() {
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.user);
  const [tab, setTab] = useState('dash');

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

  return (
    <div className='min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900'>
      <div className='md:w-56'>
        <DashSidebar />
      </div>
      <div className="flex-1 p-4 md:p-8">
        {/* Shared */}
        {tab === 'dash' && <DashboardComponent />}
        {tab === 'profile' && <DashProfile />}
        {tab === 'courses' && <DashCourses />}
        {tab === 'enrollments' && <DashEnrollments />}

        {/* Instructor-specific */}
        {tab === 'my-students' && <MyStudents />}
        {tab === 'my-earnings' && <MyEarnings />}

        {/* Admin-only */}
        {tab === 'posts' && <DashPosts />}
        {tab === 'users' && <DashUsers />}
        {tab === 'comments' && <DashComments />}
        {tab === 'newsletter' && <DashNewsletter />}
        {tab === 'announcement' && <DashAnnouncement />}
        {tab === 'services' && <DashServices />}
      </div>
    </div>
  );
}
