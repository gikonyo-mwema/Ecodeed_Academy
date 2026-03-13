/**
 * MyStudents – Instructor view of all enrolled students across their courses.
 *
 * Shows every unique student who is enrolled in one of the instructor's
 * courses, with the course name, enrollment date, and progress.
 *
 * @component
 * @version 1.0.0
 */

import React, { useEffect, useState } from 'react';
import { Table, Badge, TextInput, Select } from 'flowbite-react';
import { HiSearch } from 'react-icons/hi';
import { useSelector } from 'react-redux';
import { apiFetch } from '../../../utils/api';

export default function MyStudents() {
  const { currentUser } = useSelector((state) => state.user);
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enrollData, courseData] = await Promise.all([
          apiFetch('/api/v1/enrollments/'),
          apiFetch('/api/v1/courses/my-taught-courses/'),
        ]);
        const enrollList = Array.isArray(enrollData) ? enrollData : (enrollData.results || []);
        const courseList = Array.isArray(courseData) ? courseData : (courseData.results || []);

        setCourses(courseList);
        setEnrollments(enrollList);
      } catch (err) {
        console.error('Failed to fetch students:', err.message);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser?.isInstructor || currentUser?.isAdmin) fetchData();
  }, [currentUser]);

  /* ── Filter logic ── */
  const filtered = enrollments.filter((e) => {
    const studentName = (e.student_username || e.student_email || '').toLowerCase();
    const courseTitle = (e.course_details?.title || '').toLowerCase();
    const matchesSearch = studentName.includes(search.toLowerCase()) || courseTitle.includes(search.toLowerCase());
    const matchesCourse = filterCourse ? String(e.course) === filterCourse : true;
    return matchesSearch && matchesCourse;
  });

  /* ── Unique student count ── */
  const uniqueStudents = new Set(filtered.map((e) => e.user)).size;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-gray-500">Loading students…</div>
      </div>
    );
  }

  return (
    <div className="p-3 md:mx-auto max-w-6xl">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">My Students</h2>
      <p className="text-sm text-gray-500 mb-5">
        {uniqueStudents} unique student{uniqueStudents !== 1 ? 's' : ''} across {courses.length} course{courses.length !== 1 ? 's' : ''}
      </p>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <TextInput
          icon={HiSearch}
          placeholder="Search by student name or course…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} className="sm:w-56">
          <option value="">All Courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </Select>
      </div>

      {filtered.length > 0 ? (
        <Table hoverable className="shadow-md">
          <Table.Head>
            <Table.HeadCell>Student</Table.HeadCell>
            <Table.HeadCell>Course</Table.HeadCell>
            <Table.HeadCell>Enrolled</Table.HeadCell>
            <Table.HeadCell>Progress</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {filtered.map((e) => {
              const pct = e.total_lessons > 0
                ? Math.round((e.completed_count / e.total_lessons) * 100)
                : 0;
              return (
                <Table.Row key={e.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="font-medium text-gray-900 dark:text-white">
                    {e.student_username || e.student_email || `User #${e.user}`}
                  </Table.Cell>
                  <Table.Cell>{e.course_details?.title || '—'}</Table.Cell>
                  <Table.Cell className="text-sm text-gray-500">
                    {new Date(e.enrolled_at).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                        <div
                          className="bg-brand-green h-2 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{pct}%</span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    {pct === 100 ? (
                      <Badge color="success" size="sm">Completed</Badge>
                    ) : pct > 0 ? (
                      <Badge color="info" size="sm">In Progress</Badge>
                    ) : (
                      <Badge color="gray" size="sm">Not Started</Badge>
                    )}
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      ) : (
        <div className="text-center py-12 text-gray-500">
          {search || filterCourse ? 'No students match your filters.' : 'No students enrolled yet.'}
        </div>
      )}
    </div>
  );
}
