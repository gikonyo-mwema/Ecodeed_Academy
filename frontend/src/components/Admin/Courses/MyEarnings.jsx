/**
 * MyEarnings – Instructor earnings overview.
 *
 * Displays revenue information based on course enrollments and payments
 * for the current instructor.
 *
 * @component
 * @version 1.0.0
 */

import React, { useEffect, useState } from 'react';
import { Table, Badge } from 'flowbite-react';
import { HiCurrencyDollar, HiAcademicCap, HiUsers, HiTrendingUp } from 'react-icons/hi';
import { useSelector } from 'react-redux';
import { apiFetch } from '../../../utils/api';

const StatCard = ({ icon: Icon, label, value, sub, color = 'brand-green' }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 flex items-center gap-4">
    <div className={`p-3 rounded-full bg-${color}/10`}>
      <Icon className={`w-6 h-6 text-${color}`} />
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  </div>
);

export default function MyEarnings() {
  const { currentUser } = useSelector((state) => state.user);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseData, enrollData, paymentData] = await Promise.all([
          apiFetch('/api/v1/courses/my-taught-courses/'),
          apiFetch('/api/v1/enrollments/'),
          apiFetch('/api/v1/payments/').catch(() => []),
        ]);

        const courseList = Array.isArray(courseData) ? courseData : (courseData.results || []);
        const enrollList = Array.isArray(enrollData) ? enrollData : (enrollData.results || []);
        const payList = Array.isArray(paymentData) ? paymentData : (paymentData.results || []);

        setCourses(courseList);
        setEnrollments(enrollList);
        setPayments(payList);
      } catch (err) {
        console.error('Failed to fetch earnings data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.isInstructor || currentUser?.isAdmin) fetchData();
  }, [currentUser]);

  /* ── Compute stats ── */
  const courseIds = new Set(courses.map((c) => c.id));
  const myEnrollments = enrollments.filter((e) => courseIds.has(e.course));
  const uniqueStudents = new Set(myEnrollments.map((e) => e.user)).size;

  // Revenue from payments linked to instructor courses
  const myPayments = payments.filter((p) => courseIds.has(p.course));
  const totalRevenue = myPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // Revenue per course
  const courseRevenue = courses.map((c) => {
    const enrollCount = myEnrollments.filter((e) => e.course === c.id).length;
    const paidEnroll = myPayments.filter((p) => p.course === c.id);
    const revenue = paidEnroll.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    return { ...c, enrollCount, revenue };
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-gray-500">Loading earnings…</div>
      </div>
    );
  }

  return (
    <div className="p-3 md:mx-auto max-w-6xl">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-5">My Earnings</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={HiCurrencyDollar} label="Total Revenue" value={`KES ${totalRevenue.toLocaleString()}`} color="brand-green" />
        <StatCard icon={HiAcademicCap} label="Courses" value={courses.length} color="brand-blue" />
        <StatCard icon={HiUsers} label="Students" value={uniqueStudents} color="brand-yellow" />
        <StatCard icon={HiTrendingUp} label="Enrollments" value={myEnrollments.length} color="brand-green" />
      </div>

      {/* Revenue breakdown by course */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Revenue by Course</h3>
      {courseRevenue.length > 0 ? (
        <Table hoverable className="shadow-md">
          <Table.Head>
            <Table.HeadCell>Course</Table.HeadCell>
            <Table.HeadCell>Price</Table.HeadCell>
            <Table.HeadCell>Enrollments</Table.HeadCell>
            <Table.HeadCell>Revenue</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {courseRevenue.map((c) => (
              <Table.Row key={c.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                <Table.Cell className="font-medium text-gray-900 dark:text-white">{c.title}</Table.Cell>
                <Table.Cell>
                  {c.is_free ? (
                    <Badge color="success" size="sm">Free</Badge>
                  ) : (
                    `KES ${Number(c.price).toLocaleString()}`
                  )}
                </Table.Cell>
                <Table.Cell>{c.enrollCount}</Table.Cell>
                <Table.Cell className="font-semibold text-brand-green">
                  KES {c.revenue.toLocaleString()}
                </Table.Cell>
                <Table.Cell>
                  {c.is_live ? (
                    <Badge color="success" size="sm">Live</Badge>
                  ) : (
                    <Badge color="gray" size="sm">Draft</Badge>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No courses yet. Create a course to start earning.
        </div>
      )}
    </div>
  );
}
