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
import DashAssignments from './Assignments/DashAssignments';
import DashLiveSessions from './LiveSessions/DashLiveSessions';
import DashResources from './Resources/DashResources';
import { useSelector } from 'react-redux';
import UserCourses from '../UserCourses';

export default function AdminDashboard() {
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.user);
  const [tab, setTab] = useState('profile');
  //const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

  return (
    <div className='min-h-screen flex flex-col md:flex-row'>
      <div className='md:w-56'>
        <DashSidebar />
      </div>
      <div className="flex-1 p-4 md:p-8">
        {tab === 'profile' && <DashProfile />}
        {tab === 'posts' && <DashPosts />}
        {tab === 'users' && <DashUsers />}
        {tab === 'comments' && <DashComments />}
        {tab === 'newsletter' && <DashNewsletter />}
        {tab === 'dash' && <DashboardComponent />}
        {tab === 'services' && <DashServices />}
        {tab === 'courses' && <DashCourses />}
        {tab === 'enrollments' && <DashEnrollments />}
        {tab === 'assignments' && <DashAssignments />}
        {tab === 'live-session' && <DashLiveSessions />}
        {tab === 'resources' && <DashResources />}
        {/* {tab === 'learning' && <UserCourses />} */ }
        {/* Re-enable learning for admin if they want to see it? Or maybe separate check. For now excluding Student view parts */}
      </div>
    </div>
  );
}
