/**
 * DashInstructors — Admin view of all instructors and their courses.
 *
 * Shows every instructor on the platform with their courses and a Revoke button.
 * Revoke demotes the instructor to STUDENT and is admin-only.
 *
 * Option C warning: if the instructor teaches any live courses, the admin sees
 * a stronger confirmation that names the course count before proceeding.
 *
 * @component
 */

import React, { useEffect, useState, useMemo } from 'react';
import { Table, Badge, Button, Modal, Avatar, TextInput, Spinner } from 'flowbite-react';
import { HiSearch, HiOutlineExclamationCircle } from 'react-icons/hi';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { apiFetch } from '../../../utils/api';

export default function DashInstructors() {
  const { currentUser } = useSelector((state) => state.user);
  const isAdmin = currentUser?.isAdmin;

  const [instructors, setInstructors] = useState([]);
  const [coursesByInstructor, setCoursesByInstructor] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Revoke modal state
  const [revokeTarget, setRevokeTarget] = useState(null); // { id, name, liveCourseCount }
  const [revoking, setRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState('');

  /* ─── Fetch data ─── */
  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      try {
        setLoading(true);
        // Fetch a large page of users + all courses in parallel
        const [usersRes, coursesRes] = await Promise.all([
          apiFetch('/api/v1/auth/users/getUsers?startIndex=0&limit=1000'),
          apiFetch('/api/v1/courses/'),
        ]);

        const allUsers = usersRes.users || [];
        const allCourses = Array.isArray(coursesRes)
          ? coursesRes
          : coursesRes.results || [];

        // Filter to instructors only
        const instructorList = allUsers.filter((u) => u.isInstructor);

        // Map instructor id → their courses
        const map = {};
        instructorList.forEach((u) => { map[u.id] = []; });
        allCourses.forEach((c) => {
          const iid = c.instructor?.id;
          if (iid && map[iid] !== undefined) {
            map[iid].push(c);
          }
        });

        setInstructors(instructorList);
        setCoursesByInstructor(map);
      } catch (err) {
        console.error('DashInstructors fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [isAdmin]);

  /* ─── Filter ─── */
  const filtered = useMemo(() => {
    if (!search.trim()) return instructors;
    const q = search.toLowerCase();
    return instructors.filter(
      (u) =>
        (u.username || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (`${u.firstName || u.first_name || ''} ${u.lastName || u.last_name || ''}`).toLowerCase().includes(q),
    );
  }, [instructors, search]);

  /* ─── Open revoke modal (Option C check) ─── */
  const handleRevokeClick = (instructor) => {
    const courses = coursesByInstructor[instructor.id] || [];
    const liveCourseCount = courses.filter((c) => c.is_live).length;
    setRevokeError('');
    setRevokeTarget({
      id: instructor.id,
      name: instructor.username || instructor.email,
      liveCourseCount,
      totalCourseCount: courses.length,
    });
  };

  /* ─── Confirm revoke ─── */
  const handleRevokeConfirm = async () => {
    if (!revokeTarget) return;
    try {
      setRevoking(true);
      setRevokeError('');
      await apiFetch(`/api/v1/auth/users/updateRole/${revokeTarget.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ user_type: 'STUDENT' }),
      });
      // Remove from local list
      setInstructors((prev) => prev.filter((u) => u.id !== revokeTarget.id));
      setRevokeTarget(null);
    } catch (err) {
      setRevokeError(err.message || 'Failed to revoke instructor role.');
    } finally {
      setRevoking(false);
    }
  };

  /* ─── Guards ─── */
  if (!isAdmin) {
    return <p className="p-6 text-gray-500">Admin access required.</p>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FaChalkboardTeacher className="text-yellow-500" />
            Instructors
          </h2>
          <p className="text-sm text-gray-500">
            {instructors.length} instructor{instructors.length !== 1 ? 's' : ''} on platform
          </p>
        </div>
        <TextInput
          icon={HiSearch}
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64"
        />
      </div>

      {filtered.length > 0 ? (
        <Table hoverable className="shadow-md">
          <Table.Head>
            <Table.HeadCell>Instructor</Table.HeadCell>
            <Table.HeadCell>Email</Table.HeadCell>
            <Table.HeadCell>Courses</Table.HeadCell>
            <Table.HeadCell>Live</Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {filtered.map((instructor) => {
              const courses = coursesByInstructor[instructor.id] || [];
              const liveCount = courses.filter((c) => c.is_live).length;
              const isSelf = instructor.id === currentUser?.id;

              return (
                <Table.Row key={instructor.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        img={instructor.profilePicture || undefined}
                        rounded
                        size="sm"
                        placeholderInitials={
                          (instructor.firstName || instructor.first_name || instructor.username || 'I')[0].toUpperCase()
                        }
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {instructor.firstName || instructor.first_name}{' '}
                          {instructor.lastName || instructor.last_name}
                        </p>
                        <p className="text-xs text-gray-500">@{instructor.username}</p>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="text-gray-600 dark:text-gray-300">
                    {instructor.email}
                  </Table.Cell>
                  <Table.Cell>
                    {courses.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {courses.slice(0, 3).map((c) => (
                          <span key={c.id} className="text-xs text-gray-700 dark:text-gray-300 truncate max-w-[160px]">
                            {c.title}
                          </span>
                        ))}
                        {courses.length > 3 && (
                          <span className="text-xs text-gray-400">+{courses.length - 3} more</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No courses</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {liveCount > 0 ? (
                      <Badge color="success" size="sm">{liveCount} live</Badge>
                    ) : (
                      <Badge color="gray" size="sm">None live</Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Button
                      size="xs"
                      color="warning"
                      disabled={isSelf}
                      title={isSelf ? "Cannot revoke your own instructor role" : "Revoke instructor role"}
                      onClick={() => handleRevokeClick(instructor)}
                    >
                      Revoke
                    </Button>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      ) : (
        <div className="text-center py-12 text-gray-500">
          {search ? 'No instructors match your search.' : 'No instructors on the platform yet.'}
        </div>
      )}

      {/* ── Revoke Confirmation Modal (Option C) ── */}
      <Modal show={!!revokeTarget} onClose={() => !revoking && setRevokeTarget(null)} popup size="md">
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-yellow-400 mb-4 mx-auto" />
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              Revoke Instructor Role
            </h3>

            {revokeTarget?.liveCourseCount > 0 ? (
              /* Option C — has live courses, stronger warning */
              <div className="mb-4 space-y-3">
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">{revokeTarget?.name}</span> currently teaches{' '}
                  <span className="font-semibold text-yellow-600">
                    {revokeTarget.liveCourseCount} live course{revokeTarget.liveCourseCount !== 1 ? 's' : ''}
                  </span>
                  {revokeTarget.totalCourseCount > revokeTarget.liveCourseCount && (
                    <> (+{revokeTarget.totalCourseCount - revokeTarget.liveCourseCount} draft)</>
                  )}.
                </p>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-sm p-3 rounded-lg text-left">
                  <p className="font-semibold mb-1">⚠️ Before you continue:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Their courses will stay on the platform but remain unmanaged.</li>
                    <li>They will no longer have access to the instructor dashboard.</li>
                    <li>Enrolled students will not be affected.</li>
                    <li>You can reassign courses to another instructor later.</li>
                  </ul>
                </div>
                <p className="text-sm text-gray-500">Revoke anyway?</p>
              </div>
            ) : (
              /* No live courses — simple confirmation */
              <p className="mb-5 text-gray-500 dark:text-gray-400">
                Are you sure you want to revoke instructor access for{' '}
                <span className="font-semibold">{revokeTarget?.name}</span>? They will be returned to student status.
              </p>
            )}

            {revokeError && (
              <p className="mb-3 text-sm text-red-500">{revokeError}</p>
            )}

            <div className="flex justify-center gap-4">
              <Button color="warning" onClick={handleRevokeConfirm} disabled={revoking}>
                {revoking ? <Spinner size="sm" /> : 'Yes, revoke'}
              </Button>
              <Button color="gray" onClick={() => setRevokeTarget(null)} disabled={revoking}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
