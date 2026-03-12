/**
 * Dashboard Overview Component
 * 
 * Role-aware overview: admins see platform-wide KPIs, instructors
 * see their own course / student / earnings summary.
 *
 * @component
 * @version 2.0.0
 * @author Gikonyo Mwema
 */

import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { apiFetch } from "../../utils/api";
import { Spinner } from "flowbite-react";
import {
  HiAcademicCap, HiOutlineUserGroup, HiCurrencyDollar,
  HiDocumentText, HiAnnotation, HiClipboardCheck, HiShoppingBag,
} from "react-icons/hi";

/* ── Stat Card ── */
const StatCard = ({ icon: Icon, label, value, color = "brand-green", loading }) => (
  <div className="flex items-center gap-4 p-5 bg-white dark:bg-gray-800 rounded-xl shadow">
    <div className={`p-3 rounded-lg bg-${color}/10`}>
      <Icon className={`w-7 h-7 text-${color}`} />
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      {loading ? (
        <Spinner size="sm" />
      ) : (
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value ?? "—"}</p>
      )}
    </div>
  </div>
);

/* ════════════════ ADMIN OVERVIEW ════════════════ */
function AdminOverview() {
  const [data, setData] = useState({
    users: [], comments: [], posts: [], services: [],
    courses: [], payments: [], enrollments: [],
  });
  const [loading, setLoading] = useState({
    users: true, posts: true, comments: true, services: true,
    courses: true, payments: true, enrollments: true,
  });

  const fetchData = useCallback(async (type, endpoint) => {
    try {
      setLoading(prev => ({ ...prev, [type]: true }));
      const response = await apiFetch(endpoint);
      const responseData =
        response[type] || response.users || response.posts ||
        response.comments || response.services || response.courses ||
        response.payments || response.data || response.results || [];
      setData(prev => ({
        ...prev,
        [type]: Array.isArray(responseData) ? responseData : [],
      }));
    } catch (err) {
      console.error(`Failed to load ${type}:`, err.message);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  }, []);

  const endpoints = {
    users:       "/api/v1/auth/users/getUsers",
    posts:       "/api/v1/posts/",
    comments:    "/api/v1/comments/getComments",
    services:    "/api/v1/services/",
    courses:     "/api/v1/courses/",
    payments:    "/api/v1/payments/history/",
    enrollments: "/api/v1/enrollments/",
  };

  useEffect(() => {
    Object.entries(endpoints).forEach(([type, endpoint]) => {
      fetchData(type, endpoint);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Compute totals (data arrays are the full first-page lists) */
  const totalUsers       = data.users.length;
  const totalPosts       = data.posts.length;
  const totalCourses     = data.courses.length;
  const totalEnrollments = data.enrollments.length;
  const totalRevenue     = data.payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <div className="p-3 md:mx-auto space-y-6">
      {/* ── KPI cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={HiOutlineUserGroup} label="Total Users"       value={totalUsers}       loading={loading.users} />
        <StatCard icon={HiAcademicCap}      label="Total Courses"     value={totalCourses}     loading={loading.courses} />
        <StatCard icon={HiShoppingBag}      label="Total Enrollments" value={totalEnrollments} loading={loading.enrollments} />
        <StatCard icon={HiDocumentText}     label="Total Posts"       value={totalPosts}       loading={loading.posts} />
        <StatCard icon={HiCurrencyDollar}   label="Total Revenue"     value={`KES ${totalRevenue.toLocaleString()}`} loading={loading.payments} />
      </div>
    </div>
  );
}

/* ════════════════ INSTRUCTOR OVERVIEW ════════════════ */
function InstructorOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        /* Fetch instructor's own courses */
        const coursesRes = await apiFetch("/api/v1/courses/my-taught-courses/");
        const courses = Array.isArray(coursesRes) ? coursesRes : (coursesRes.results || []);

        /* Fetch enrollments for those courses */
        const enrollRes = await apiFetch("/api/v1/enrollments/");
        const enrollments = Array.isArray(enrollRes) ? enrollRes : (enrollRes.results || []);

        /* Compute KPIs */
        const courseIds = new Set(courses.map(c => c.id));
        const myEnrollments = enrollments.filter(
          e => courseIds.has(e.course_details?.id || e.course)
        );
        const uniqueStudents = new Set(myEnrollments.map(e => e.student_email || e.user));
        const totalRevenue = myEnrollments.reduce(
          (sum, e) => sum + (Number(e.course_details?.price) || 0),
          0
        );

        setStats({
          courses,
          totalCourses: courses.length,
          totalStudents: uniqueStudents.size,
          totalEnrollments: myEnrollments.length,
          totalRevenue,
          recentEnrollments: myEnrollments.slice(0, 5),
        });
      } catch (err) {
        console.error("Instructor overview fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!stats) {
    return <p className="text-center text-gray-500 py-8">Failed to load overview data.</p>;
  }

  return (
    <div className="p-3 md:mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Instructor Overview</h1>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={HiAcademicCap}      label="My Courses"       value={stats.totalCourses} />
        <StatCard icon={HiOutlineUserGroup}  label="My Students"      value={stats.totalStudents} />
        <StatCard icon={HiShoppingBag}       label="Total Enrollments" value={stats.totalEnrollments} />
        <StatCard icon={HiCurrencyDollar}    label="Total Revenue"    value={`KES ${stats.totalRevenue.toLocaleString()}`} />
      </div>

      {/* ── My courses quick list ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">My Courses</h2>
        {stats.courses.length === 0 ? (
          <p className="text-gray-500">You haven't created any courses yet.</p>
        ) : (
          <div className="space-y-3">
            {stats.courses.map(course => (
              <div key={course.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center gap-3">
                  {course.image && (
                    <img src={course.image} alt="" className="w-12 h-8 rounded object-cover" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{course.title}</p>
                    <p className="text-xs text-gray-500">
                      {course.is_free ? "Free" : `KES ${Number(course.price).toLocaleString()}`}
                      {" · "}
                      {course.modules?.length || 0} modules
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${course.is_popular ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                  {course.is_popular ? "Popular" : "Standard"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Recent enrollments ── */}
      {stats.recentEnrollments.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Enrollments</h2>
          <div className="space-y-2">
            {stats.recentEnrollments.map(e => (
              <div key={e.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{e.student_email || "Student"}</p>
                  <p className="text-xs text-gray-500">{e.course_details?.title}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(e.enrolled_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════ MAIN EXPORT ════════════════ */
export default function DashboardComponent() {
  const { currentUser } = useSelector((state) => state.user);

  if (currentUser?.isAdmin) return <AdminOverview />;
  if (currentUser?.isInstructor) return <InstructorOverview />;

  return (
    <div className="text-center p-4">
      <p className="text-red-500 font-medium">
        You do not have permission to view this page.
      </p>
    </div>
  );
}