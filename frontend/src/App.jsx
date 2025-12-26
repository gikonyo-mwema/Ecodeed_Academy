/**
 * Main Application Component
 * 
 * This is the root component that sets up routing and layout for the entire application.
 * It handles all route definitions including public routes, authenticated routes, and admin-only routes.
 * 
 * Route Structure:
 * - Public: Home, About, Services, Courses, Auth pages
 * - Authenticated: Dashboard, User Courses
 * - Admin-only: Create/Edit Posts, Admin Dashboard, Course Management
 * 
 * Features:
 * - React Router v6 with future flags enabled
 * - Theme provider integration
 * - Scroll to top functionality
 * - Protected routes with role-based access
 * 
 * @component
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Page Components
import Home from './pages/Home';
import About from './pages/About';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import SignUp from './pages/SignUp';
import CreatePost from './pages/CreatePost';
import UpdatePost from './pages/UpdatePost';
import PostPage from './pages/PostPage';
import Search from './pages/Search';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import Contact from './pages/Contact';
import Unsubscribe from './pages/Unsubscribe';

// Layout Components
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ThemeProvider from './components/ThemeProvider';

// Route Protection Components
import PrivateRoute from './components/PrivateRoute';
import OnlyAdminPrivateRoute from './components/OnlyAdminPrivateRoute';

// User Components
import UserCourses from './components/UserCourses';

// Admin Components
import { CreateCourse } from './components/Admin/Courses/CreateCourse';
import { EditCourse } from './components/Admin/Courses/EditCourse';
import DashServices from './components/Admin/Services/DashServices';

// OAuth Callback Components
import { TwitterOAuthCallback } from './components/SocialAuth/TwitterOAuth'; 

/**
 * App Component
 * Main application component that sets up routing and global layout
 * 
 * @returns {JSX.Element} The complete application with routing
 */
export default function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider>
        {/* Automatically scrolls to top on route changes */}
        <ScrollToTop />
        
        {/* Global header navigation */}
        <Header />
        
        <Routes>
          {/* ===== PUBLIC ROUTES ===== */}
          {/* These routes are accessible to all users */}
          <Route path='/' element={<Home />} />
          <Route path='/about' element={<About />} />
          <Route path='/services' element={<Services />} />
          <Route path='/services/:slug' element={<ServiceDetail />} /> {/* Dynamic service detail pages */}
          <Route path='/courses' element={<Courses />} />
          <Route path='/courses/:slug' element={<CourseDetails />} /> {/* Dynamic course detail pages */}
          <Route path='/sign-in' element={<SignIn />} />
          <Route path='/sign-up' element={<SignUp />} />
          <Route path='/search' element={<Search />} />
          <Route path='/projects' element={<Projects />} />
          <Route path='/post/:postSlug' element={<PostPage />} /> {/* Dynamic blog post pages */}
          <Route path="/contact" element={<Contact />} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          
          {/* OAuth Callback Routes */}
          <Route path="/auth/twitter/callback" element={<TwitterOAuthCallback />} />

          {/* ===== AUTHENTICATED USER ROUTES ===== */}
          {/* These routes require user authentication */}
          <Route element={<PrivateRoute />}>
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/my-courses' element={<UserCourses />} />
          </Route>

          {/* ===== ADMIN-ONLY ROUTES ===== */}
          {/* These routes require admin privileges */}
          <Route element={<OnlyAdminPrivateRoute />}>
            <Route path='/create-post' element={<CreatePost />} />
            <Route path='/update-post/:postId' element={<UpdatePost />} />
            <Route path='/dashboard/services' element={<DashServices />} />
            <Route path='/create-course' element={<CreateCourse />} />
            <Route path='/edit-course/:courseId' element={<EditCourse />} />
          </Route>
        </Routes>
        
        {/* Global footer */}
        <Footer />
      </ThemeProvider>
    </Router>
  );
}
