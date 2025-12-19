import React from 'react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DashSidebar from '../components/Admin/DashSidebar';
import DashProfile from '../components/Admin/Users/DashProfile';
import DashPosts from '../components/Admin/Posts/DashPosts';
import DashUsers from '../components/Admin/Users/DashUsers';
import DashComments from '../components/Admin/Comments/DashComments';
import DashboardComponent from '../components/Admin/DashboardComponent';
import DashServices from '../components/Admin/Services/DashServices';
import { DashCourses } from '../components/Admin/Courses/DashCourses';
import DashNewsletter from '../components/Admin/DashNewsletter';
import { useSelector } from 'react-redux';
//import UserCourses from '../components/UserCourses';
import axios from 'axios';

export default function Dashboard() {
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

  //useEffect(() => {
   // if (currentUser) {
      //const fetchPurchasedCourses = async () => {
       // try {
       //   const res = await axios.get(`/api/user/${currentUser._id}/courses`, {
        //    withCredentials: true,
        //    headers: {
        //      Authorization: `Bearer ${currentUser.token}`
        //    }
        //  });
        //  setPurchasedCourses(res.data);
        //} catch (err) {
        //  console.error('Error fetching purchased courses:', err);
     //   } finally {
//setLoading(false);
    //    }
    //  };
     // fetchPurchasedCourses();
   // }

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
        {/*{tab === 'user-courses' && <UserCourses purchasedCourses={purchasedCourses} loading={loading} />} */}
      </div>
    </div>
  );
}