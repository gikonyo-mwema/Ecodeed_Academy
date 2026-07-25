/**
 * DashEnrollments — Enrollments grouped by course.
 *
 * Admin view:
 *  - All courses listed with their enrolled students
 *  - "Add Student" button per course (opens manual-enroll modal)
 *  - "Revoke" button per student row
 *
 * Instructor view:
 *  - Same layout but limited to their own courses (backend-filtered)
 *  - No Add or Revoke buttons
 *
 * @component
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Table, Button, Modal, Badge, TextInput, Select, Spinner, Label,
} from 'flowbite-react';
import {
  HiOutlineExclamationCircle, HiSearch, HiChevronDown, HiChevronRight,
  HiUserAdd,
} from 'react-icons/hi';
import { apiFetch } from '../../../utils/api';

const PAYMENT_METHODS = [
  { value: 'manual',       label: 'Manual / Other' },
  { value: 'globalpay',    label: 'GlobalPay' },
  { value: 'mpesa_global', label: 'M-Pesa Global' },
  { value: 'mpesa',        label: 'M-Pesa (Paystack)' },
  { value: 'card',         label: 'Card (Paystack)' },
];

/* ── Course Section ── */
function CourseSection({ course, enrollments, isAdmin, onRevoke, onAddStudent }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`enrollment-course-${course.id}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {open ? (
            <HiChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
          ) : (
            <HiChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
          )}
          <span className="font-semibold text-gray-900 dark:text-white truncate">{course.title}</span>
          <Badge color={course.is_free ? 'success' : 'purple'} size="sm" className="flex-shrink-0">
            {course.is_free ? 'Free' : `KES ${Number(course.price || 0).toLocaleString()}`}
          </Badge>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
          <span className="text-sm text-gray-500">
            {enrollments.length} student{enrollments.length !== 1 ? 's' : ''}
          </span>
          {isAdmin && (
            <Button
              size="xs"
              color="success"
              onClick={(e) => { e.stopPropagation(); onAddStudent(course); }}
              className="flex items-center gap-1"
            >
              <HiUserAdd className="w-3 h-3 mr-1" />
              Add Student
            </Button>
          )}
        </div>
      </button>

      {open && (
        <div id={`enrollment-course-${course.id}`}>
          {enrollments.length === 0 ? (
            <p className="px-6 py-4 text-sm text-gray-400">No students enrolled yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table hoverable>
                <Table.Head>
                  <Table.HeadCell>Student</Table.HeadCell>
                  <Table.HeadCell>Enrolled</Table.HeadCell>
                  <Table.HeadCell>Progress</Table.HeadCell>
                  <Table.HeadCell>Status</Table.HeadCell>
                  {isAdmin && <Table.HeadCell>Actions</Table.HeadCell>}
                </Table.Head>
                <Table.Body className="divide-y">
                  {enrollments.map((e) => {
                    const pct =
                      e.total_lessons > 0
                        ? Math.round((e.completed_count / e.total_lessons) * 100)
                        : 0;
                    return (
                      <Table.Row key={e.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                        <Table.Cell className="font-medium text-gray-900 dark:text-white">
                          <div>
                            <p>{e.student_username || `User #${e.user}`}</p>
                            {e.student_email && (
                              <p className="text-xs text-gray-500">{e.student_email}</p>
                            )}
                          </div>
                        </Table.Cell>
                        <Table.Cell className="text-sm text-gray-500 whitespace-nowrap">
                          {new Date(e.enrolled_at).toLocaleDateString()}
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                              <div
                                className="bg-brand-green h-2 rounded-full"
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
                        {isAdmin && (
                          <Table.Cell>
                            <span
                              className="font-medium text-red-500 hover:underline cursor-pointer text-sm"
                              onClick={() => onRevoke(e)}
                            >
                              Revoke
                            </span>
                          </Table.Cell>
                        )}
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main Component ── */
export default function DashEnrollments() {
  const { currentUser } = useSelector((state) => state.user);
  const isAdmin = currentUser?.isAdmin;

  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Revoke
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revoking, setRevoking] = useState(false);

  // Add Student modal
  const [addCourse, setAddCourse] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('manual');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState('');
  const [enrollSuccess, setEnrollSuccess] = useState('');

  const fetchEnrollments = useCallback(async () => {
    try {
      const courseEndpoint = currentUser?.isAdmin
        ? '/api/v1/courses/'
        : '/api/v1/courses/my-taught-courses/';
      const [enrollData, courseData] = await Promise.all([
        // page_size=500: full roster, newest enrollments first
        apiFetch('/api/v1/enrollments/?page_size=500'),
        apiFetch(courseEndpoint),
      ]);
      setEnrollments(Array.isArray(enrollData) ? enrollData : enrollData.results || []);
      setCourses(Array.isArray(courseData) ? courseData : courseData.results || []);
    } catch (err) {
      console.error('Enrollments fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.isAdmin || currentUser?.isInstructor) fetchEnrollments();
  }, [currentUser, fetchEnrollments]);

  /* Group by course — seed from course list first so empty courses appear */
  const courseMap = useMemo(() => {
    const map = new Map();
    // Seed every known course (including those with zero enrollments)
    courses.forEach((c) => {
      map.set(c.id, {
        course: {
          id: c.id,
          title: c.title,
          is_free: c.is_free ?? false,
          price: c.price ?? 0,
        },
        enrollments: [],
      });
    });
    // Layer in actual enrollment records
    enrollments.forEach((e) => {
      const cid = e.course_details?.id || e.course;
      if (!map.has(cid)) {
        map.set(cid, {
          course: {
            id: cid,
            title: e.course_details?.title || `Course #${cid}`,
            is_free: e.course_details?.is_free ?? false,
            price: e.course_details?.price ?? 0,
          },
          enrollments: [],
        });
      }
      map.get(cid).enrollments.push(e);
    });
    return map;
  }, [courses, enrollments]);

  const filteredCourses = useMemo(() => {
    const q = search.toLowerCase();
    return Array.from(courseMap.values()).filter(({ course, enrollments: es }) => {
      if (!q) return true;
      return (
        course.title.toLowerCase().includes(q) ||
        es.some(
          (e) =>
            (e.student_username || '').toLowerCase().includes(q) ||
            (e.student_email || '').toLowerCase().includes(q),
        )
      );
    });
  }, [courseMap, search]);

  /* Revoke */
  const handleRevoke = async () => {
    if (!revokeTarget) return;
    try {
      setRevoking(true);
      await apiFetch(`/api/v1/enrollments/${revokeTarget.id}/`, { method: 'DELETE' });
      setEnrollments((prev) => prev.filter((e) => e.id !== revokeTarget.id));
      setRevokeTarget(null);
    } catch (err) {
      console.error('Revoke error:', err.message);
    } finally {
      setRevoking(false);
    }
  };

  /* Open Add Student modal */
  const openAddStudent = async (course) => {
    setAddCourse(course);
    setUserSearch('');
    setSelectedUser(null);
    setPaymentMethod('manual');
    setAmount('');
    setNotes('');
    setEnrollError('');
    setEnrollSuccess('');
    if (allUsers.length === 0) {
      try {
        const res = await apiFetch('/api/v1/auth/users/getUsers?startIndex=0&limit=1000');
        setAllUsers(res.users || []);
      } catch (err) {
        console.error('User list error:', err.message);
      }
    }
  };

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return allUsers.slice(0, 20);
    const q = userSearch.toLowerCase();
    return allUsers
      .filter(
        (u) =>
          (u.username || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q) ||
          (`${u.firstName || u.first_name || ''} ${u.lastName || u.last_name || ''}`)
            .toLowerCase()
            .includes(q),
      )
      .slice(0, 20);
  }, [allUsers, userSearch]);

  /* Submit manual enroll */
  const handleManualEnroll = async (e) => {
    e.preventDefault();
    if (!selectedUser) { setEnrollError('Please select a student.'); return; }
    try {
      setEnrolling(true);
      setEnrollError('');
      await apiFetch(`/api/v1/courses/${addCourse.id}/manual-enroll/`, {
        method: 'POST',
        body: JSON.stringify({
          user_id: selectedUser.id,
          payment_method: paymentMethod,
          amount: Number(amount) || 0,
          notes,
        }),
      });
      setEnrollSuccess(`${selectedUser.email} enrolled in "${addCourse.title}".`);
      await fetchEnrollments();
    } catch (err) {
      setEnrollError(err.message || 'Enrollment failed.');
    } finally {
      setEnrolling(false);
    }
  };

  if (!currentUser?.isAdmin && !currentUser?.isInstructor) {
    return <p className="p-6 text-gray-500">You don't have permission to view enrollments.</p>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="p-3 md:mx-auto max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {isAdmin ? 'All Enrollments' : 'Course Enrollments'}
          </h2>
          <p className="text-sm text-gray-500">
            {enrollments.length} enrollment{enrollments.length !== 1 ? 's' : ''} across{' '}
            {courseMap.size} course{courseMap.size !== 1 ? 's' : ''}
          </p>
        </div>
        <TextInput
          icon={HiSearch}
          placeholder="Search course or student…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72"
        />
      </div>

      {filteredCourses.length > 0 ? (
        filteredCourses.map(({ course, enrollments: es }) => (
          <CourseSection
            key={course.id}
            course={course}
            enrollments={es}
            isAdmin={isAdmin}
            onRevoke={(enrollment) => setRevokeTarget(enrollment)}
            onAddStudent={openAddStudent}
          />
        ))
      ) : (
        <div className="text-center py-16 text-gray-500">
          {search ? 'No results match your search.' : 'No enrollments yet.'}
        </div>
      )}

      {/* Revoke Modal */}
      <Modal show={!!revokeTarget} onClose={() => !revoking && setRevokeTarget(null)} popup size="md">
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              Revoke{' '}
              <span className="font-semibold text-gray-800 dark:text-white">
                {revokeTarget?.student_username || revokeTarget?.student_email}
              </span>
              's enrollment? They will lose course access.
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleRevoke} disabled={revoking}>
                {revoking ? <Spinner size="sm" /> : "Yes, revoke"}
              </Button>
              <Button color="gray" onClick={() => setRevokeTarget(null)} disabled={revoking}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Add Student Modal */}
      <Modal show={!!addCourse} onClose={() => !enrolling && setAddCourse(null)} size="lg">
        <Modal.Header>
          Add Student —{' '}
          <span className="font-semibold">{addCourse?.title}</span>
        </Modal.Header>
        <Modal.Body>
          {enrollSuccess ? (
            <div className="text-center py-6">
              <div className="text-green-500 text-5xl mb-4">✓</div>
              <p className="text-gray-700 dark:text-gray-300 mb-6">{enrollSuccess}</p>
              <div className="flex justify-center gap-3">
                <Button color="success" onClick={() => { setEnrollSuccess(''); setSelectedUser(null); setUserSearch(''); }}>
                  Add Another
                </Button>
                <Button color="gray" onClick={() => setAddCourse(null)}>
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleManualEnroll} className="space-y-4">
              {/* Student search */}
              <div>
                <Label value="Student (must be a registered user)" className="mb-1 block" />
                <TextInput
                  icon={HiSearch}
                  placeholder="Type name or email to search…"
                  value={userSearch}
                  onChange={(e) => { setUserSearch(e.target.value); setSelectedUser(null); }}
                  autoComplete="off"
                />
                {userSearch && !selectedUser && (
                  <div className="mt-1 border border-gray-200 dark:border-gray-600 rounded-lg max-h-48 overflow-y-auto shadow-sm bg-white dark:bg-gray-700">
                    {filteredUsers.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-gray-400">No users found.</p>
                    ) : (
                      filteredUsers.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2"
                          onClick={() => {
                            setSelectedUser(u);
                            setUserSearch(
                              `${u.firstName || u.first_name || ''} ${u.lastName || u.last_name || ''} (${u.email})`.trim(),
                            );
                          }}
                        >
                          <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {(u.username || u.email || 'U')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {u.firstName || u.first_name} {u.lastName || u.last_name}
                              <span className="text-gray-400 font-normal ml-1">@{u.username}</span>
                            </p>
                            <p className="text-xs text-gray-500 truncate">{u.email}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
                {selectedUser && (
                  <div className="mt-2 flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg px-3 py-2">
                    <span className="text-green-600 dark:text-green-400 text-sm font-medium">✓</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{selectedUser.email}</span>
                    <button
                      type="button"
                      className="ml-auto text-xs text-red-400 hover:text-red-600"
                      onClick={() => { setSelectedUser(null); setUserSearch(''); }}
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>

              {/* Payment method */}
              <div>
                <Label value="Payment Method" className="mb-1 block" />
                <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} required>
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </Select>
              </div>

              {/* Amount */}
              <div>
                <Label
                  value={`Amount Received (KES) — course price: KES ${Number(addCourse?.price || 0).toLocaleString()}`}
                  className="mb-1 block"
                />
                <TextInput
                  type="number"
                  min="0"
                  placeholder={String(addCourse?.price || '0')}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              {/* Notes */}
              <div>
                <Label value="Reference / Notes (optional)" className="mb-1 block" />
                <TextInput
                  placeholder="e.g. GlobalPay ref #GP123, cash receipt #45"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {enrollError && <p className="text-sm text-red-500">{enrollError}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <Button color="gray" type="button" onClick={() => setAddCourse(null)} disabled={enrolling}>
                  Cancel
                </Button>
                <Button type="submit" color="success" disabled={enrolling || !selectedUser}>
                  {enrolling ? (
                    <><Spinner size="sm" /><span className="pl-2">Enrolling…</span></>
                  ) : (
                    'Enroll Student'
                  )}
                </Button>
              </div>
            </form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
