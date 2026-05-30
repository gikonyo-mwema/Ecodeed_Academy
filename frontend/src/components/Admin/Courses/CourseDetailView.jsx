/**
 * Course Detail View — drill-down component
 *
 * When an admin/instructor clicks a course row in DashCourses, this view
 * shows everything about that course in nested tabs:
 *   Info · Enrollments · Assignments · Live Sessions · Resources
 *
 * This replaces the old top-level sidebar tabs for assignments,
 * live sessions, and resources (which each required a redundant
 * course-selector dropdown).
 *
 * @component
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Button, Badge, Spinner, Alert, Table, Modal,
  TextInput, Textarea, Select, Label,
} from 'flowbite-react';
import {
  HiArrowLeft, HiOutlinePlus, HiOutlinePencilAlt, HiOutlineTrash,
  HiOutlineExclamationCircle, HiClipboardCheck, HiVideoCamera,
  HiArchive, HiShoppingBag, HiInformationCircle, HiClock,
  HiExternalLink, HiDownload, HiOutlineEye,
} from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { apiFetch } from '../../../utils/api';

/* ── Tab Button ── */
const TabBtn = ({ label, icon: Icon, active, onClick, count }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
      active
        ? 'bg-brand-green text-white shadow-sm'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
    {count !== undefined && (
      <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-600'}`}>
        {count}
      </span>
    )}
  </button>
);

/* ═══════════════════════════════════════════════════
   ── MAIN CourseDetailView ──
   ═══════════════════════════════════════════════════ */
export default function CourseDetailView({ course, onBack }) {
  const { currentUser } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState('info');

  /* ── Enrollments ── */
  const [enrollments, setEnrollments] = useState([]);
  const [enrollLoading, setEnrollLoading] = useState(false);

  /* ── Assignments ── */
  const [assignments, setAssignments] = useState([]);
  const [asnLoading, setAsnLoading] = useState(false);

  /* ── Live Sessions ── */
  const [sessions, setSessions] = useState([]);
  const [sesLoading, setSesLoading] = useState(false);

  /* ── Resources ── */
  const [resources, setResources] = useState([]);
  const [resLoading, setResLoading] = useState(false);

  /* ── Shared ── */
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const modules = course?.modules || [];

  /* ────────────── Fetchers ────────────── */

  const fetchEnrollments = useCallback(async () => {
    try {
      setEnrollLoading(true);
      const data = await apiFetch(`/api/v1/enrollments/?course=${course.id}`);
      setEnrollments(Array.isArray(data) ? data : (data.results || []));
    } catch { setError('Failed to load enrollments'); }
    finally { setEnrollLoading(false); }
  }, [course.id]);

  const fetchAssignments = useCallback(async () => {
    try {
      setAsnLoading(true);
      const data = await apiFetch(`/api/v1/assignments/?course=${course.id}`);
      setAssignments(Array.isArray(data) ? data : (data.results || []));
    } catch { setError('Failed to load assignments'); }
    finally { setAsnLoading(false); }
  }, [course.id]);

  const fetchSessions = useCallback(async () => {
    try {
      setSesLoading(true);
      const data = await apiFetch(`/api/v1/live-sessions/?course=${course.id}`);
      setSessions(Array.isArray(data) ? data : (data.results || []));
    } catch { setError('Failed to load sessions'); }
    finally { setSesLoading(false); }
  }, [course.id]);

  const fetchResources = useCallback(async () => {
    try {
      setResLoading(true);
      const data = await apiFetch(`/api/v1/resources/?course=${course.id}`);
      setResources(Array.isArray(data) ? data : (data.results || []));
    } catch { setError('Failed to load resources'); }
    finally { setResLoading(false); }
  }, [course.id]);

  /* Fetch data when tab changes */
  useEffect(() => {
    if (activeTab === 'enrollments') fetchEnrollments();
    if (activeTab === 'assignments') fetchAssignments();
    if (activeTab === 'sessions') fetchSessions();
    if (activeTab === 'resources') fetchResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, course.id]);

  /* ────────────── CRUD helpers ────────────── */

  /* Generic delete */
  const handleDelete = async (endpoint, id, setter, label) => {
    if (!window.confirm(`Delete this ${label}?`)) return;
    try {
      await apiFetch(`${endpoint}${id}/`, { method: 'DELETE' });
      setter(prev => prev.filter(item => item.id !== id));
      setSuccess(`${label} deleted`);
    } catch (err) { setError(err.message); }
  };

  /* ── Modals for Assignment / Session / Resource CRUD ── */
  const [modal, setModal] = useState(null);        // { type, editing, form }

  const openAdd = (type) => {
    const defaults = {
      assignments: { module: modules[0]?.id || '', title: '', description: '', due_date: '', resource_url: '' },
      sessions:    { module: modules[0]?.id || '', title: '', description: '', date_time: '', zoom_link: '', recording_url: '' },
      resources:   { module: modules[0]?.id || '', title: '', description: '', file_url: '', resource_type: 'link' },
    };
    setModal({ type, editing: null, form: defaults[type] });
  };

  const openEdit = (type, item) => {
    const forms = {
      assignments: { module: item.module, title: item.title, description: item.description || '', due_date: item.due_date ? item.due_date.slice(0, 16) : '', resource_url: item.resource_url || '' },
      sessions:    { module: item.module, title: item.title, description: item.description || '', date_time: item.date_time ? item.date_time.slice(0, 16) : '', zoom_link: item.zoom_link || '', recording_url: item.recording_url || '' },
      resources:   { module: item.module, title: item.title, description: item.description || '', file_url: item.file_url || '', resource_type: item.resource_type || 'link' },
    };
    setModal({ type, editing: item, form: forms[type] });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!modal) return;
    const { type, editing, form } = modal;
    const endpointMap = {
      assignments: '/api/v1/assignments/',
      sessions:    '/api/v1/live-sessions/',
      resources:   '/api/v1/resources/',
    };
    const payload = { ...form, module: Number(form.module) };
    // Clean empties
    if (type === 'assignments' && !payload.due_date) payload.due_date = null;
    if (type === 'sessions' && !payload.date_time) delete payload.date_time;

    try {
      if (editing) {
        await apiFetch(`${endpointMap[type]}${editing.id}/`, { method: 'PUT', body: JSON.stringify(payload) });
        setSuccess('Updated successfully');
      } else {
        await apiFetch(endpointMap[type], { method: 'POST', body: JSON.stringify(payload) });
        setSuccess('Created successfully');
      }
      setModal(null);
      // Re-fetch
      if (type === 'assignments') fetchAssignments();
      if (type === 'sessions') fetchSessions();
      if (type === 'resources') fetchResources();
    } catch (err) { setError(err.message); }
  };

  const updateForm = (field, value) => {
    setModal(prev => ({ ...prev, form: { ...prev.form, [field]: value } }));
  };

  /* ── Revoke enrollment ── */
  const [revokeId, setRevokeId] = useState(null);
  const handleRevoke = async () => {
    try {
      await apiFetch(`/api/v1/enrollments/${revokeId}/`, { method: 'DELETE' });
      setEnrollments(prev => prev.filter(e => e.id !== revokeId));
      setRevokeId(null);
      setSuccess('Enrollment revoked');
    } catch (err) { setError(err.message); }
  };

  /* ═══════════════ RENDER ═══════════════ */

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button color="gray" size="sm" onClick={onBack}>
          <HiArrowLeft className="mr-2 w-4 h-4" /> Back to Courses
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{course.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {course.is_free ? 'Free' : `KES ${Number(course.price).toLocaleString()}`}
            {' · '}
            {modules.length} module{modules.length !== 1 ? 's' : ''}
            {course.instructor_name && ` · ${course.instructor_name}`}
          </p>
        </div>
        <Link to={`/edit-course/${course.id}`}>
          <Button color="none" size="sm" className="bg-gradient-to-r from-brand-green to-brand-yellow hover:from-brand-green/90 hover:to-brand-yellow/90 text-white border-0">
            <HiOutlinePencilAlt className="mr-2 w-4 h-4" /> Edit Course
          </Button>
        </Link>
        {course?.slug && (
          <Link to={`/learn/${course.slug}?preview=1`}>
            <Button outline color="none" size="sm" className="!border-brand-green !text-brand-green hover:!bg-brand-green hover:!text-white transition-colors">
              <HiOutlineEye className="mr-2 w-4 h-4" /> Open Student View
            </Button>
          </Link>
        )}
      </div>

      {error && <Alert color="failure" onDismiss={() => setError(null)}>{error}</Alert>}
      {success && <Alert color="success" onDismiss={() => setSuccess(null)}>{success}</Alert>}

      {/* ── Tab bar ── */}
      <div className="flex flex-wrap gap-2 bg-white dark:bg-gray-800 rounded-xl p-2 shadow">
        <TabBtn label="Info"          icon={HiInformationCircle} active={activeTab === 'info'}        onClick={() => setActiveTab('info')} />
        <TabBtn label="Enrollments"   icon={HiShoppingBag}       active={activeTab === 'enrollments'} onClick={() => setActiveTab('enrollments')} count={enrollments.length || undefined} />
        <TabBtn label="Assignments"   icon={HiClipboardCheck}    active={activeTab === 'assignments'} onClick={() => setActiveTab('assignments')} count={assignments.length || undefined} />
        <TabBtn label="Live Sessions" icon={HiVideoCamera}       active={activeTab === 'sessions'}    onClick={() => setActiveTab('sessions')} count={sessions.length || undefined} />
        <TabBtn label="Resources"     icon={HiArchive}           active={activeTab === 'resources'}   onClick={() => setActiveTab('resources')} count={resources.length || undefined} />
      </div>

      {/* ── Tab content ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">

        {/* ═══ INFO ═══ */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div><p className="text-xs text-gray-500">Category</p><p className="font-medium text-gray-900 dark:text-white capitalize">{course.category}</p></div>
              <div><p className="text-xs text-gray-500">Pacing</p><p className="font-medium text-gray-900 dark:text-white capitalize">{course.pacing_type?.replace('_', ' ')}</p></div>
              <div><p className="text-xs text-gray-500">Certificate</p><p className="font-medium text-gray-900 dark:text-white">{course.has_certificate ? 'Yes' : 'No'}</p></div>
              <div><p className="text-xs text-gray-500">Status</p>
                <Badge color={course.is_live ? 'success' : 'gray'}>{course.is_live ? 'Live' : 'Draft'}</Badge>
              </div>
            </div>
            {course.short_description && (
              <div><p className="text-xs text-gray-500 mb-1">Short Description</p><p className="text-gray-700 dark:text-gray-300">{course.short_description || course.shortDescription}</p></div>
            )}
            {modules.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Modules ({modules.length})</p>
                <div className="space-y-2">
                  {modules.map((mod, i) => (
                    <div key={mod.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                      <span className="text-xs font-bold text-brand-green w-8 text-center">W{i + 1}</span>
                      <span className="text-sm text-gray-800 dark:text-gray-200">{mod.title}</span>
                      <span className="ml-auto text-xs text-gray-500">{mod.lessons?.length || 0} lessons</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ ENROLLMENTS ═══ */}
        {activeTab === 'enrollments' && (
          enrollLoading ? <div className="flex justify-center py-12"><Spinner size="xl" /></div> :
          enrollments.length === 0 ? (
            <p className="text-center py-12 text-gray-500">No students enrolled yet.</p>
          ) : (
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>Student</Table.HeadCell>
                <Table.HeadCell>Enrolled</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                <Table.HeadCell>Progress</Table.HeadCell>
                <Table.HeadCell>Actions</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {enrollments.map(e => {
                  const pct = e.progress?.percentage ?? 0;
                  return (
                    <Table.Row key={e.id}>
                      <Table.Cell className="font-medium text-gray-900 dark:text-white">
                        {e.student_email || e.student_username || 'Student'}
                      </Table.Cell>
                      <Table.Cell>{new Date(e.enrolled_at).toLocaleDateString()}</Table.Cell>
                      <Table.Cell>
                        <Badge color={e.status === 'active' ? 'success' : 'gray'}>{e.status}</Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2 max-w-[120px]">
                            <div className="bg-brand-green h-2 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-500">{pct}%</span>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <button onClick={() => setRevokeId(e.id)} className="text-red-500 text-sm hover:underline">
                          Revoke
                        </button>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          )
        )}

        {/* ═══ ASSIGNMENTS ═══ */}
        {activeTab === 'assignments' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800 dark:text-white">Assignments</h3>
              <Button size="sm" color="none" className="bg-gradient-to-r from-brand-green to-brand-yellow text-white border-0" onClick={() => openAdd('assignments')}>
                <HiOutlinePlus className="mr-1 w-4 h-4" /> Add
              </Button>
            </div>
            {asnLoading ? <div className="flex justify-center py-8"><Spinner size="xl" /></div> :
            assignments.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No assignments yet.</p>
            ) : (
              <div className="space-y-4">
                {modules.map((mod, i) => {
                  const items = assignments.filter(a => a.module === mod.id);
                  if (!items.length) return null;
                  return (
                    <div key={mod.id}>
                      <p className="text-xs font-bold text-gray-500 mb-2">Week {i + 1}: {mod.title}</p>
                      {items.map(a => (
                        <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 mb-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{a.title}</p>
                            {a.due_date && <p className="text-xs text-gray-500 flex items-center gap-1"><HiClock className="w-3 h-3" /> Due: {new Date(a.due_date).toLocaleString()}</p>}
                          </div>
                          <div className="flex gap-2">
                            <Button size="xs" color="light" onClick={() => openEdit('assignments', a)}><HiOutlinePencilAlt className="w-4 h-4" /></Button>
                            <Button size="xs" color="failure" onClick={() => handleDelete('/api/v1/assignments/', a.id, setAssignments, 'Assignment')}><HiOutlineTrash className="w-4 h-4" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ═══ LIVE SESSIONS ═══ */}
        {activeTab === 'sessions' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800 dark:text-white">Live Sessions</h3>
              <Button size="sm" color="none" className="bg-gradient-to-r from-brand-green to-brand-yellow text-white border-0" onClick={() => openAdd('sessions')}>
                <HiOutlinePlus className="mr-1 w-4 h-4" /> Add
              </Button>
            </div>
            {sesLoading ? <div className="flex justify-center py-8"><Spinner size="xl" /></div> :
            sessions.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No live sessions yet.</p>
            ) : (
              <div className="space-y-4">
                {modules.map((mod, i) => {
                  const items = sessions.filter(s => s.module === mod.id);
                  if (!items.length) return null;
                  return (
                    <div key={mod.id}>
                      <p className="text-xs font-bold text-gray-500 mb-2">Week {i + 1}: {mod.title}</p>
                      {items.map(s => (
                        <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 mb-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{s.title}</p>
                            {s.date_time && <p className="text-xs text-gray-500 flex items-center gap-1"><HiClock className="w-3 h-3" /> {new Date(s.date_time).toLocaleString()}</p>}
                            <div className="flex gap-3 mt-1">
                              {s.zoom_link && <a href={s.zoom_link} target="_blank" rel="noreferrer" className="text-xs text-brand-green hover:underline flex items-center gap-1"><HiExternalLink className="w-3 h-3" />Join</a>}
                              {s.recording_url && <a href={s.recording_url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1"><HiVideoCamera className="w-3 h-3" />Recording</a>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="xs" color="light" onClick={() => openEdit('sessions', s)}><HiOutlinePencilAlt className="w-4 h-4" /></Button>
                            <Button size="xs" color="failure" onClick={() => handleDelete('/api/v1/live-sessions/', s.id, setSessions, 'Session')}><HiOutlineTrash className="w-4 h-4" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ═══ RESOURCES ═══ */}
        {activeTab === 'resources' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800 dark:text-white">Resources</h3>
              <Button size="sm" color="none" className="bg-gradient-to-r from-brand-green to-brand-yellow text-white border-0" onClick={() => openAdd('resources')}>
                <HiOutlinePlus className="mr-1 w-4 h-4" /> Add
              </Button>
            </div>
            {resLoading ? <div className="flex justify-center py-8"><Spinner size="xl" /></div> :
            resources.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No resources yet.</p>
            ) : (
              <div className="space-y-4">
                {modules.map((mod, i) => {
                  const items = resources.filter(r => r.module === mod.id);
                  if (!items.length) return null;
                  return (
                    <div key={mod.id}>
                      <p className="text-xs font-bold text-gray-500 mb-2">Week {i + 1}: {mod.title}</p>
                      {items.map(r => (
                        <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 mb-2">
                          <div className="flex items-center gap-3">
                            <Badge color={r.resource_type === 'pdf' ? 'failure' : r.resource_type === 'video' ? 'purple' : r.resource_type === 'link' ? 'info' : 'gray'} size="sm">
                              {r.resource_type?.toUpperCase()}
                            </Badge>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{r.title}</p>
                              {r.file_url && <a href={r.file_url} target="_blank" rel="noreferrer" className="text-xs text-brand-green hover:underline flex items-center gap-1"><HiDownload className="w-3 h-3" />Open</a>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="xs" color="light" onClick={() => openEdit('resources', r)}><HiOutlinePencilAlt className="w-4 h-4" /></Button>
                            <Button size="xs" color="failure" onClick={() => handleDelete('/api/v1/resources/', r.id, setResources, 'Resource')}><HiOutlineTrash className="w-4 h-4" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* ══════════ ADD/EDIT MODAL ══════════ */}
      {modal && (
        <Modal show={!!modal} onClose={() => setModal(null)} size="lg">
          <Modal.Header>
            {modal.editing ? 'Edit' : 'Add'} {modal.type === 'assignments' ? 'Assignment' : modal.type === 'sessions' ? 'Live Session' : 'Resource'}
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label value="Week / Module" />
                <Select required value={modal.form.module} onChange={(e) => updateForm('module', e.target.value)}>
                  <option value="">Select week</option>
                  {modules.map((m, i) => (
                    <option key={m.id} value={m.id}>Week {i + 1}: {m.title}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label value="Title" />
                <TextInput required value={modal.form.title} onChange={(e) => updateForm('title', e.target.value)} placeholder="Title" />
              </div>
              <div>
                <Label value="Description" />
                <Textarea rows={3} value={modal.form.description} onChange={(e) => updateForm('description', e.target.value)} />
              </div>

              {/* Type-specific fields */}
              {modal.type === 'assignments' && (
                <>
                  <div>
                    <Label value="Due Date (optional)" />
                    <TextInput type="datetime-local" value={modal.form.due_date} onChange={(e) => updateForm('due_date', e.target.value)} />
                  </div>
                  <div>
                    <Label value="Template URL (optional)" />
                    <TextInput type="url" value={modal.form.resource_url} onChange={(e) => updateForm('resource_url', e.target.value)} />
                  </div>
                </>
              )}
              {modal.type === 'sessions' && (
                <>
                  <div>
                    <Label value="Date & Time" />
                    <TextInput type="datetime-local" value={modal.form.date_time} onChange={(e) => updateForm('date_time', e.target.value)} />
                  </div>
                  <div>
                    <Label value="Zoom / Meet Link" />
                    <TextInput type="url" value={modal.form.zoom_link} onChange={(e) => updateForm('zoom_link', e.target.value)} />
                  </div>
                  <div>
                    <Label value="Recording URL (optional)" />
                    <TextInput type="url" value={modal.form.recording_url} onChange={(e) => updateForm('recording_url', e.target.value)} />
                  </div>
                </>
              )}
              {modal.type === 'resources' && (
                <>
                  <div>
                    <Label value="Resource Type" />
                    <Select value={modal.form.resource_type} onChange={(e) => updateForm('resource_type', e.target.value)}>
                      <option value="link">External Link</option>
                      <option value="pdf">PDF</option>
                      <option value="video">Video</option>
                      <option value="document">Document</option>
                      <option value="spreadsheet">Spreadsheet</option>
                      <option value="other">Other</option>
                    </Select>
                  </div>
                  <div>
                    <Label value="File / URL" />
                    <TextInput type="url" required value={modal.form.file_url} onChange={(e) => updateForm('file_url', e.target.value)} />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button color="gray" onClick={() => setModal(null)}>Cancel</Button>
                <Button type="submit" color="none" className="bg-gradient-to-r from-brand-green to-brand-yellow text-white border-0">
                  {modal.editing ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </Modal.Body>
        </Modal>
      )}

      {/* ══════════ REVOKE ENROLLMENT MODAL ══════════ */}
      <Modal show={!!revokeId} onClose={() => setRevokeId(null)} size="md" popup>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 mx-auto mb-4" />
            <h3 className="mb-5 text-lg text-gray-500">Revoke this enrollment? The student will lose access.</h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleRevoke}>Yes, revoke</Button>
              <Button color="gray" onClick={() => setRevokeId(null)}>Cancel</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
