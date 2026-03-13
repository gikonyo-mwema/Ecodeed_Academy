/**
 * Dashboard Announcement Manager
 *
 * Allows admins to create, edit, toggle, and delete the site-wide
 * announcement banner that appears in the Header.
 *
 * @component
 */

import React, { useState, useEffect } from 'react';
import { Button, Table, TextInput, Label, ToggleSwitch, Spinner, Alert, Modal } from 'flowbite-react';
import { HiPlus, HiPencil, HiTrash, HiSpeakerphone, HiExternalLink } from 'react-icons/hi';
import { apiFetch } from '../../utils/api';

export default function DashAnnouncement() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // null = create, object = edit
  const [form, setForm] = useState({ text: '', link_url: '', link_label: '', is_active: true });
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── Fetch all announcements ──
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch('/api/v1/messages/announcements/');
      setAnnouncements(data);
    } catch (err) {
      setError(err.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  // ── Open create form ──
  const handleCreate = () => {
    setEditing(null);
    setForm({ text: '', link_url: '', link_label: '', is_active: true });
    setShowForm(true);
    setSuccess(null);
  };

  // ── Open edit form ──
  const handleEdit = (ann) => {
    setEditing(ann);
    setForm({
      text: ann.text,
      link_url: ann.link_url || ann.linkUrl || '',
      link_label: ann.link_label || ann.linkLabel || '',
      is_active: ann.is_active ?? ann.isActive ?? true,
    });
    setShowForm(true);
    setSuccess(null);
  };

  // ── Save (create or update) ──
  const handleSave = async () => {
    if (!form.text.trim()) {
      setError('Announcement text is required');
      return;
    }
    try {
      setSaving(true);
      setError(null);

      if (editing) {
        await apiFetch(`/api/v1/messages/announcements/${editing.id}/`, {
          method: 'PATCH',
          body: JSON.stringify(form),
        });
        setSuccess('Announcement updated');
      } else {
        await apiFetch('/api/v1/messages/announcements/', {
          method: 'POST',
          body: JSON.stringify(form),
        });
        setSuccess('Announcement created');
      }

      setShowForm(false);
      setEditing(null);
      await fetchAnnouncements();
    } catch (err) {
      setError(err.message || 'Failed to save announcement');
    } finally {
      setSaving(false);
    }
  };

  // ── Quick toggle active ──
  const handleToggle = async (ann) => {
    try {
      setError(null);
      await apiFetch(`/api/v1/messages/announcements/${ann.id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !(ann.is_active ?? ann.isActive) }),
      });
      await fetchAnnouncements();
    } catch (err) {
      setError(err.message || 'Failed to toggle announcement');
    }
  };

  // ── Delete ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setError(null);
      await apiFetch(`/api/v1/messages/announcements/${deleteTarget.id}/`, {
        method: 'DELETE',
      });
      setDeleteTarget(null);
      setSuccess('Announcement deleted');
      await fetchAnnouncements();
    } catch (err) {
      setError(err.message || 'Failed to delete announcement');
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <HiSpeakerphone className="w-7 h-7 text-brand-green" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Announcement Banner
          </h2>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-gradient-to-r from-brand-green to-brand-yellow text-white w-full sm:w-auto"
          color="none"
        >
          <HiPlus className="mr-2 h-4 w-4" />
          New Announcement
        </Button>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        The latest <strong>active</strong> announcement is displayed in the green banner at the top of every page. 
        Only one should be active at a time.
      </p>

      {/* Alerts */}
      {error && (
        <Alert color="failure" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert color="success" onDismiss={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            {editing ? 'Edit Announcement' : 'New Announcement'}
          </h3>

          <div>
            <Label htmlFor="ann-text" value="Announcement Text *" className="mb-1" />
            <TextInput
              id="ann-text"
              placeholder="e.g. New course: Climate Risk Assessment — Enroll now!"
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              maxLength={300}
              required
            />
            <p className="text-xs text-gray-400 mt-1">{form.text.length}/300</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ann-url" value="Link URL (optional)" className="mb-1" />
              <TextInput
                id="ann-url"
                placeholder="/courses or https://..."
                value={form.link_url}
                onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                icon={HiExternalLink}
              />
            </div>
            <div>
              <Label htmlFor="ann-label" value="Link Label (optional)" className="mb-1" />
              <TextInput
                id="ann-label"
                placeholder="e.g. View course →"
                value={form.link_label}
                onChange={(e) => setForm({ ...form, link_label: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ToggleSwitch
              checked={form.is_active}
              label="Active"
              onChange={(val) => setForm({ ...form, is_active: val })}
              color="green"
            />
            <span className="text-xs text-gray-400">
              Only the most recent active announcement is displayed
            </span>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-brand-green to-brand-yellow text-white"
              color="none"
            >
              {saving ? <Spinner size="sm" className="mr-2" /> : null}
              {editing ? 'Update' : 'Create'}
            </Button>
            <Button
              color="gray"
              onClick={() => { setShowForm(false); setEditing(null); }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Announcements Table */}
      {announcements.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <HiSpeakerphone className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No announcements yet. Create one to display a banner on your site.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Announcement</Table.HeadCell>
              <Table.HeadCell className="hidden sm:table-cell">Link</Table.HeadCell>
              <Table.HeadCell>Active</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {announcements.map((ann) => {
                const isActive = ann.is_active ?? ann.isActive;
                return (
                  <Table.Row
                    key={ann.id}
                    className={`${isActive ? 'bg-green-50 dark:bg-green-900/10' : ''}`}
                  >
                    <Table.Cell className="max-w-xs">
                      <p className="font-medium text-gray-800 dark:text-white truncate">
                        {ann.text}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(ann.created_at || ann.createdAt).toLocaleDateString()}
                      </p>
                    </Table.Cell>
                    <Table.Cell className="hidden sm:table-cell text-sm text-gray-500 dark:text-gray-400">
                      {(ann.link_url || ann.linkUrl) ? (
                        <span className="flex items-center gap-1">
                          <HiExternalLink className="w-3.5 h-3.5" />
                          {ann.link_label || ann.linkLabel || ann.link_url || ann.linkUrl}
                        </span>
                      ) : '—'}
                    </Table.Cell>
                    <Table.Cell>
                      <ToggleSwitch
                        checked={isActive}
                        onChange={() => handleToggle(ann)}
                        color="green"
                        sizing="sm"
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(ann)}
                          className="text-brand-green hover:text-green-700 transition-colors"
                          title="Edit"
                        >
                          <HiPencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(ann)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete"
                        >
                          <HiTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={!!deleteTarget} size="md" onClose={() => setDeleteTarget(null)} popup>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiTrash className="mx-auto mb-4 h-14 w-14 text-red-500" />
            <h3 className="mb-2 text-lg font-medium text-gray-800 dark:text-white">
              Delete Announcement?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              "{deleteTarget?.text?.slice(0, 80)}..."
            </p>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDelete}>
                Yes, delete
              </Button>
              <Button color="gray" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
