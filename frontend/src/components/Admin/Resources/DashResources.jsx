import React, { useState, useEffect, useCallback } from 'react';
import {
  Button, Modal, TextInput, Textarea, Select, Label,
  Badge, Spinner, Alert,
} from 'flowbite-react';
import {
  HiOutlinePlus, HiOutlinePencilAlt, HiOutlineTrash,
  HiOutlineExclamationCircle, HiDownload, HiExternalLink, HiDocumentText,
} from 'react-icons/hi';
import { useSelector } from 'react-redux';
import { apiFetch } from '../../../utils/api';

const TYPE_LABELS = {
  pdf: 'PDF',
  link: 'External Link',
  video: 'Video',
  document: 'Document',
  spreadsheet: 'Spreadsheet',
  other: 'Other',
};
const TYPE_COLORS = {
  pdf: 'failure', link: 'info', video: 'purple', document: 'warning',
  spreadsheet: 'success', other: 'gray',
};

const EMPTY_FORM = {
  module: '', title: '', description: '', file_url: '', resource_type: 'link',
};

export default function DashResources() {
  const { currentUser } = useSelector((state) => state.user);

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
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

  // Fetch resources when course changes
  const fetchResources = useCallback(async (courseId) => {
    if (!courseId) { setResources([]); return; }
    try {
      setLoading(true);
      const data = await apiFetch(`/api/v1/resources/?course=${courseId}`);
      setResources(data.results || data);
    } catch { setError('Failed to load resources'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const course = courses.find(c => c.id === Number(selectedCourseId));
    setSelectedCourse(course || null);
    fetchResources(selectedCourseId);
  }, [selectedCourseId, courses, fetchResources]);

  const modules = selectedCourse?.modules || [];

  const openAdd = () => {
    setEditingResource(null);
    setForm({ ...EMPTY_FORM, module: modules[0]?.id || '' });
    setShowModal(true);
  };

  const openEdit = (resource) => {
    setEditingResource(resource);
    setForm({
      module: resource.module,
      title: resource.title,
      description: resource.description || '',
      file_url: resource.file_url || '',
      resource_type: resource.resource_type || 'link',
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true); setError(null);
      const payload = { ...form, module: Number(form.module) };

      if (editingResource) {
        await apiFetch(`/api/v1/resources/${editingResource.id}/`, {
          method: 'PUT', body: JSON.stringify(payload),
        });
        setSuccess('Resource updated successfully');
      } else {
        await apiFetch('/api/v1/resources/', {
          method: 'POST', body: JSON.stringify(payload),
        });
        setSuccess('Resource added successfully');
      }
      await fetchResources(selectedCourseId);
      setShowModal(false);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      setSaving(true);
      await apiFetch(`/api/v1/resources/${deletingId}/`, { method: 'DELETE' });
      setResources(prev => prev.filter(r => r.id !== deletingId));
      setShowDeleteModal(false);
      setSuccess('Resource deleted');
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resources</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage PDFs, external links, and downloadable materials for your courses
          </p>
        </div>
        {selectedCourseId && (
          <Button color="none" className="bg-gradient-to-r from-brand-green to-brand-yellow hover:from-brand-green/90 hover:to-brand-yellow/90 text-white border-0 focus:ring-4 focus:ring-brand-green/25" onClick={openAdd}>
            <HiOutlinePlus className="mr-2 h-5 w-5" /> Add Resource
          </Button>
        )}
      </div>

      {error && <Alert color="failure" onDismiss={() => setError(null)}>{error}</Alert>}
      {success && <Alert color="success" onDismiss={() => setSuccess(null)}>{success}</Alert>}

      {/* Course Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <Label htmlFor="resCourseSelect" value="Select Course" className="mb-2 block" />
        <Select id="resCourseSelect" value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}>
          <option value="">— Choose a course —</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </Select>
      </div>

      {/* Content */}
      {!selectedCourseId ? (
        <div className="text-center py-16 text-gray-400">
          <HiDownload className="w-16 h-16 mx-auto mb-4" />
          <p className="text-lg">Select a course to manage resources</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-16"><Spinner size="xl" /></div>
      ) : resources.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <HiDownload className="w-16 h-16 mx-auto mb-4" />
          <p className="text-lg mb-2">No resources yet</p>
          <p className="text-sm mb-4">Add PDFs, links, or other materials for students</p>
          <Button color="none" className="bg-gradient-to-r from-brand-green to-brand-yellow hover:from-brand-green/90 hover:to-brand-yellow/90 text-white border-0 focus:ring-4 focus:ring-brand-green/25" onClick={openAdd}>
            <HiOutlinePlus className="mr-2" /> Add Resource
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {modules.map(mod => {
            const modResources = resources.filter(r => r.module === mod.id);
            if (modResources.length === 0) return null;
            return (
              <div key={mod.id} className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                    Week {mod.order + 1}: {mod.title}
                  </h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {modResources.map(resource => (
                    <div key={resource.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium text-gray-900 dark:text-white">{resource.title}</h4>
                          <Badge color={TYPE_COLORS[resource.resource_type] || 'gray'} size="sm">
                            {TYPE_LABELS[resource.resource_type] || resource.resource_type}
                          </Badge>
                        </div>
                        {resource.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">{resource.description}</p>
                        )}
                        {resource.file_url && (
                          <a href={resource.file_url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-brand-green hover:underline">
                            <HiExternalLink className="w-3.5 h-3.5" /> {resource.file_url.length > 60 ? resource.file_url.slice(0, 60) + '…' : resource.file_url}
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button size="xs" color="light" onClick={() => openEdit(resource)}>
                          <HiOutlinePencilAlt className="w-4 h-4" />
                        </Button>
                        <Button size="xs" color="failure" onClick={() => { setDeletingId(resource.id); setShowDeleteModal(true); }}>
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
        <Modal.Header>{editingResource ? 'Edit Resource' : 'Add Resource'}</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="resModule" value="Week / Module" />
              <Select id="resModule" required value={form.module}
                onChange={(e) => setForm(f => ({ ...f, module: e.target.value }))}>
                <option value="">Select week</option>
                {modules.map(m => (
                  <option key={m.id} value={m.id}>Week {m.order + 1}: {m.title}</option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="resTitle" value="Title" />
                <TextInput id="resTitle" required value={form.title}
                  onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Environmental Audit Checklist" />
              </div>
              <div>
                <Label htmlFor="resType" value="Resource Type" />
                <Select id="resType" value={form.resource_type}
                  onChange={(e) => setForm(f => ({ ...f, resource_type: e.target.value }))}>
                  {Object.entries(TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="resUrl" value="URL (PDF link, Google Drive, website, etc.)" />
              <TextInput id="resUrl" type="url" required value={form.file_url}
                onChange={(e) => setForm(f => ({ ...f, file_url: e.target.value }))}
                placeholder="https://drive.google.com/... or https://example.com/guide.pdf" />
            </div>
            <div>
              <Label htmlFor="resDesc" value="Description (optional)" />
              <Textarea id="resDesc" rows={3} value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of this resource" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button color="gray" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" color="none" className="bg-gradient-to-r from-brand-green to-brand-yellow hover:from-brand-green/90 hover:to-brand-yellow/90 text-white border-0 focus:ring-4 focus:ring-brand-green/25" disabled={saving}>
                {saving && <Spinner size="sm" className="mr-2" />}
                {editingResource ? 'Update' : 'Add'} Resource
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
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">Delete this resource?</h3>
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
