import React, { useState, useEffect, useCallback } from 'react';
import {
  Button, Modal, TextInput, Textarea, Select, Label,
  Badge, Spinner, Alert,
} from 'flowbite-react';
import {
  HiOutlinePlus, HiOutlinePencilAlt, HiOutlineTrash,
  HiOutlineExclamationCircle, HiVideoCamera, HiClock, HiExternalLink,
} from 'react-icons/hi';
import { useSelector } from 'react-redux';
import { apiFetch } from '../../../utils/api';

const EMPTY_FORM = {
  module: '', title: '', description: '', date_time: '', zoom_link: '', recording_url: '',
};

export default function DashLiveSessions() {
  const { currentUser } = useSelector((state) => state.user);

  // ── course selection ──
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);

  // ── data ──
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // ── modals ──
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [saving, setSaving] = useState(false);

  // ── form ──
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

  // Fetch sessions when course changes
  const fetchSessions = useCallback(async (courseId) => {
    if (!courseId) { setSessions([]); return; }
    try {
      setLoading(true);
      const data = await apiFetch(`/api/v1/live-sessions/?course=${courseId}`);
      setSessions(data.results || data);
    } catch { setError('Failed to load sessions'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const course = courses.find(c => c.id === Number(selectedCourseId));
    setSelectedCourse(course || null);
    fetchSessions(selectedCourseId);
  }, [selectedCourseId, courses, fetchSessions]);

  const modules = selectedCourse?.modules || [];

  // ── actions ──
  const openAdd = () => {
    setEditingSession(null);
    setForm({ ...EMPTY_FORM, module: modules[0]?.id || '' });
    setShowModal(true);
  };

  const openEdit = (session) => {
    setEditingSession(session);
    setForm({
      module: session.module,
      title: session.title,
      description: session.description || '',
      date_time: session.date_time ? session.date_time.slice(0, 16) : '',
      zoom_link: session.zoom_link || '',
      recording_url: session.recording_url || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true); setError(null);
      const payload = { ...form, module: Number(form.module) };
      if (!payload.date_time) delete payload.date_time;

      if (editingSession) {
        await apiFetch(`/api/v1/live-sessions/${editingSession.id}/`, {
          method: 'PUT', body: JSON.stringify(payload),
        });
        setSuccess('Session updated successfully');
      } else {
        await apiFetch('/api/v1/live-sessions/', {
          method: 'POST', body: JSON.stringify(payload),
        });
        setSuccess('Session created successfully');
      }
      await fetchSessions(selectedCourseId);
      setShowModal(false);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      setSaving(true);
      await apiFetch(`/api/v1/live-sessions/${deletingId}/`, { method: 'DELETE' });
      setSessions(prev => prev.filter(s => s.id !== deletingId));
      setShowDeleteModal(false);
      setSuccess('Session deleted');
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  // ── render ──
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Live Sessions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Schedule live classes and manage Zoom / Google Meet links
          </p>
        </div>
        {selectedCourseId && (
          <Button gradientDuoTone="tealToLime" onClick={openAdd}>
            <HiOutlinePlus className="mr-2 h-5 w-5" /> Add Session
          </Button>
        )}
      </div>

      {/* Alerts */}
      {error && <Alert color="failure" onDismiss={() => setError(null)}>{error}</Alert>}
      {success && <Alert color="success" onDismiss={() => setSuccess(null)}>{success}</Alert>}

      {/* Course Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <Label htmlFor="courseSelect" value="Select Course" className="mb-2 block" />
        <Select id="courseSelect" value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}>
          <option value="">— Choose a course —</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </Select>
      </div>

      {/* Content */}
      {!selectedCourseId ? (
        <div className="text-center py-16 text-gray-400">
          <HiVideoCamera className="w-16 h-16 mx-auto mb-4" />
          <p className="text-lg">Select a course to manage live sessions</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-16"><Spinner size="xl" /></div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <HiVideoCamera className="w-16 h-16 mx-auto mb-4" />
          <p className="text-lg mb-2">No live sessions yet</p>
          <p className="text-sm mb-4">Schedule your first live class for this course</p>
          <Button gradientDuoTone="tealToLime" onClick={openAdd}>
            <HiOutlinePlus className="mr-2" /> Add Session
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {modules.map(mod => {
            const modSessions = sessions.filter(s => s.module === mod.id);
            if (modSessions.length === 0) return null;
            return (
              <div key={mod.id} className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                    Week {mod.order + 1}: {mod.title}
                  </h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {modSessions.map(session => (
                    <div key={session.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium text-gray-900 dark:text-white">{session.title}</h4>
                          {session.date_time && new Date(session.date_time) > new Date() && (
                            <Badge color="success" size="sm">Upcoming</Badge>
                          )}
                          {session.date_time && new Date(session.date_time) <= new Date() && (
                            <Badge color="gray" size="sm">Past</Badge>
                          )}
                        </div>
                        {session.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">{session.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                          {session.date_time && (
                            <span className="flex items-center gap-1">
                              <HiClock className="w-3.5 h-3.5" />
                              {new Date(session.date_time).toLocaleString()}
                            </span>
                          )}
                          {session.zoom_link && (
                            <a href={session.zoom_link} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-brand-green hover:underline">
                              <HiExternalLink className="w-3.5 h-3.5" /> Meeting Link
                            </a>
                          )}
                          {session.recording_url && (
                            <a href={session.recording_url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-purple-600 hover:underline">
                              <HiVideoCamera className="w-3.5 h-3.5" /> Recording
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button size="xs" color="light" onClick={() => openEdit(session)}>
                          <HiOutlinePencilAlt className="w-4 h-4" />
                        </Button>
                        <Button size="xs" color="failure" onClick={() => { setDeletingId(session.id); setShowDeleteModal(true); }}>
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
        <Modal.Header>{editingSession ? 'Edit Session' : 'Add Live Session'}</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="sessionModule" value="Week / Module" />
              <Select id="sessionModule" required value={form.module}
                onChange={(e) => setForm(f => ({ ...f, module: e.target.value }))}>
                <option value="">Select week</option>
                {modules.map(m => (
                  <option key={m.id} value={m.id}>Week {m.order + 1}: {m.title}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="sessionTitle" value="Session Title" />
              <TextInput id="sessionTitle" required value={form.title}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Weekly Q&A — Environmental Auditing" />
            </div>
            <div>
              <Label htmlFor="sessionDesc" value="Description (optional)" />
              <Textarea id="sessionDesc" rows={3} value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="What will be covered in this session?" />
            </div>
            <div>
              <Label htmlFor="sessionDate" value="Date & Time" />
              <TextInput id="sessionDate" type="datetime-local" value={form.date_time}
                onChange={(e) => setForm(f => ({ ...f, date_time: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="sessionLink" value="Meeting Link (Zoom, Google Meet, etc.)" />
              <TextInput id="sessionLink" type="url" required value={form.zoom_link}
                onChange={(e) => setForm(f => ({ ...f, zoom_link: e.target.value }))}
                placeholder="https://zoom.us/j/..." />
            </div>
            <div>
              <Label htmlFor="sessionRecording" value="Recording URL (optional — add after the session)" />
              <TextInput id="sessionRecording" type="url" value={form.recording_url}
                onChange={(e) => setForm(f => ({ ...f, recording_url: e.target.value }))}
                placeholder="https://youtube.com/..." />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button color="gray" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" gradientDuoTone="tealToLime" disabled={saving}>
                {saving && <Spinner size="sm" className="mr-2" />}
                {editingSession ? 'Update' : 'Create'} Session
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
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">Delete this live session?</h3>
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
