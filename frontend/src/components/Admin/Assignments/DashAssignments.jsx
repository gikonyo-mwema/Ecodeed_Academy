import React, { useState, useEffect, useCallback } from 'react';
import {
  Button, Modal, TextInput, Textarea, Select, Label,
  Badge, Spinner, Alert,
} from 'flowbite-react';
import {
  HiOutlinePlus, HiOutlinePencilAlt, HiOutlineTrash,
  HiOutlineExclamationCircle, HiClipboardCheck, HiClock, HiExternalLink,
} from 'react-icons/hi';
import { useSelector } from 'react-redux';
import { apiFetch } from '../../../utils/api';

const EMPTY_FORM = {
  module: '', title: '', description: '', due_date: '', resource_url: '',
};

export default function DashAssignments() {
  const { currentUser } = useSelector((state) => state.user);

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);

  // Fetch instructor's courses
  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch('/api/v1/courses/my-taught-courses/');
        setCourses(data.results || data);
      } catch { setError('Failed to load courses'); }
    })();
  }, []);

  const fetchAssignments = useCallback(async (courseId) => {
    if (!courseId) { setAssignments([]); return; }
    try {
      setLoading(true);
      const data = await apiFetch(`/api/v1/assignments/?course=${courseId}`);
      setAssignments(data.results || data);
    } catch { setError('Failed to load assignments'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const course = courses.find(c => c.id === Number(selectedCourseId));
    setSelectedCourse(course || null);
    fetchAssignments(selectedCourseId);
  }, [selectedCourseId, courses, fetchAssignments]);

  const modules = selectedCourse?.modules || [];

  const openAdd = () => {
    setEditingAssignment(null);
    setForm({ ...EMPTY_FORM, module: modules[0]?.id || '' });
    setShowModal(true);
  };

  const openEdit = (assignment) => {
    setEditingAssignment(assignment);
    setForm({
      module: assignment.module,
      title: assignment.title,
      description: assignment.description || '',
      due_date: assignment.due_date ? assignment.due_date.slice(0, 16) : '',
      resource_url: assignment.resource_url || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true); setError(null);
      const payload = { ...form, module: Number(form.module) };
      if (!payload.due_date) payload.due_date = null;

      if (editingAssignment) {
        await apiFetch(`/api/v1/assignments/${editingAssignment.id}/`, {
          method: 'PUT', body: JSON.stringify(payload),
        });
        setSuccess('Assignment updated successfully');
      } else {
        await apiFetch('/api/v1/assignments/', {
          method: 'POST', body: JSON.stringify(payload),
        });
        setSuccess('Assignment created successfully');
      }
      await fetchAssignments(selectedCourseId);
      setShowModal(false);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      setSaving(true);
      await apiFetch(`/api/v1/assignments/${deletingId}/`, { method: 'DELETE' });
      setAssignments(prev => prev.filter(a => a.id !== deletingId));
      setShowDeleteModal(false);
      setSuccess('Assignment deleted');
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assignments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create and manage assignments for your course modules
          </p>
        </div>
        {selectedCourseId && (
          <Button gradientDuoTone="tealToLime" onClick={openAdd}>
            <HiOutlinePlus className="mr-2 h-5 w-5" /> Add Assignment
          </Button>
        )}
      </div>

      {error && <Alert color="failure" onDismiss={() => setError(null)}>{error}</Alert>}
      {success && <Alert color="success" onDismiss={() => setSuccess(null)}>{success}</Alert>}

      {/* Course Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <Label htmlFor="asnCourseSelect" value="Select Course" className="mb-2 block" />
        <Select id="asnCourseSelect" value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}>
          <option value="">— Choose a course —</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </Select>
      </div>

      {/* Content */}
      {!selectedCourseId ? (
        <div className="text-center py-16 text-gray-400">
          <HiClipboardCheck className="w-16 h-16 mx-auto mb-4" />
          <p className="text-lg">Select a course to manage assignments</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-16"><Spinner size="xl" /></div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <HiClipboardCheck className="w-16 h-16 mx-auto mb-4" />
          <p className="text-lg mb-2">No assignments yet</p>
          <p className="text-sm mb-4">Create your first assignment for this course</p>
          <Button gradientDuoTone="tealToLime" onClick={openAdd}>
            <HiOutlinePlus className="mr-2" /> Add Assignment
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {modules.map(mod => {
            const modAssignments = assignments.filter(a => a.module === mod.id);
            if (modAssignments.length === 0) return null;
            return (
              <div key={mod.id} className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                    Week {mod.order + 1}: {mod.title}
                  </h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {modAssignments.map(assignment => (
                    <div key={assignment.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 space-y-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{assignment.title}</h4>
                        {assignment.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">{assignment.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                          {assignment.due_date && (
                            <span className="flex items-center gap-1">
                              <HiClock className="w-3.5 h-3.5" />
                              Due: {new Date(assignment.due_date).toLocaleString()}
                            </span>
                          )}
                          {!assignment.due_date && (
                            <Badge color="gray" size="sm">No deadline</Badge>
                          )}
                          {assignment.resource_url && (
                            <a href={assignment.resource_url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-brand-green hover:underline">
                              <HiExternalLink className="w-3.5 h-3.5" /> Template
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button size="xs" color="light" onClick={() => openEdit(assignment)}>
                          <HiOutlinePencilAlt className="w-4 h-4" />
                        </Button>
                        <Button size="xs" color="failure" onClick={() => { setDeletingId(assignment.id); setShowDeleteModal(true); }}>
                          <HiOutlineTrash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      <Modal show={showModal} onClose={() => setShowModal(false)} size="lg">
        <Modal.Header>{editingAssignment ? 'Edit Assignment' : 'Add Assignment'}</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="asnModule" value="Week / Module" />
              <Select id="asnModule" required value={form.module}
                onChange={(e) => setForm(f => ({ ...f, module: e.target.value }))}>
                <option value="">Select week</option>
                {modules.map(m => (
                  <option key={m.id} value={m.id}>Week {m.order + 1}: {m.title}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="asnTitle" value="Title" />
              <TextInput id="asnTitle" required value={form.title}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Environmental Impact Assessment Report" />
            </div>
            <div>
              <Label htmlFor="asnDesc" value="Instructions / Description" />
              <Textarea id="asnDesc" rows={4} value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe what students need to do..." />
            </div>
            <div>
              <Label htmlFor="asnDue" value="Due Date (optional)" />
              <TextInput id="asnDue" type="datetime-local" value={form.due_date}
                onChange={(e) => setForm(f => ({ ...f, due_date: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="asnUrl" value="Template / Resource URL (optional)" />
              <TextInput id="asnUrl" type="url" value={form.resource_url}
                onChange={(e) => setForm(f => ({ ...f, resource_url: e.target.value }))}
                placeholder="https://docs.google.com/..." />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button color="gray" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" gradientDuoTone="tealToLime" disabled={saving}>
                {saving && <Spinner size="sm" className="mr-2" />}
                {editingAssignment ? 'Update' : 'Create'} Assignment
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* ── Delete Modal ── */}
      <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)} size="md" popup>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 mx-auto mb-4" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">Delete this assignment?</h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDelete} disabled={saving}>
                {saving && <Spinner size="sm" className="mr-2" />} Delete
              </Button>
              <Button color="gray" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
