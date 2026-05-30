/**
 * Dashboard Newsletter Management Component
 *
 * Admin interface for managing email newsletters and broadcast campaigns.
 * Compose emails, segment audiences, send broadcasts, track campaign history.
 *
 * Features:
 * - Statistics Dashboard: Subscriber counts, growth metrics, recent subscribers list
 * - Newsletter Compose: Rich text editor with TipTap for HTML email content
 * - Audience Segmentation: 6 audience types (newsletter, all users, students, instructors, course-specific)
 * - Campaign History: Past broadcasts with status tracking (draft/sending/sent/failed)
 * - CSV Export: Download subscriber list for external tools
 * - Campaign Preview: Full-text view before sending
 * - Status Badges: Visual indicators for campaign states
 *
 * API Endpoints:
 * - GET /api/v1/messages/newsletter/stats: Fetch subscriber statistics
 * - GET /api/v1/messages/broadcast/: Fetch campaign history
 * - POST /api/v1/messages/broadcast/: Send broadcast campaign
 * - GET /api/v1/courses/: Fetch courses for audience filtering
 *
 * @component
 * @version 2.0.0
 * @author Gikonyo Mwema
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Table, Button, Alert, Badge, Spinner, Select, TextInput, Modal } from 'flowbite-react';
import {
  HiMail, HiUsers, HiTrendingUp, HiDownload,
  HiPaperAirplane, HiPencilAlt, HiClock, HiCheckCircle,
  HiExclamationCircle, HiEye, HiChevronDown, HiChevronUp,
} from 'react-icons/hi';
import DOMPurify from 'dompurify';
import { apiFetch } from '../../utils/api';
import TipTapEditor from '../Editor/TipTapEditor';

const AUDIENCE_OPTIONS = [
  { value: '', label: 'Select audience...' },
  { value: 'newsletter', label: '📬 Newsletter Subscribers' },
  { value: 'all_users', label: '👥 All Registered Users' },
  { value: 'all_students', label: '🎓 All Students' },
  { value: 'all_mentors', label: '🧑‍🏫 All Instructors / Mentors' },
  { value: 'course_students', label: '📚 Students in a Specific Course' },
];

const STATUS_BADGE = {
  draft: { color: 'gray', icon: HiPencilAlt, label: 'Draft' },
  sending: { color: 'warning', icon: HiClock, label: 'Sending' },
  sent: { color: 'success', icon: HiCheckCircle, label: 'Sent' },
  failed: { color: 'failure', icon: HiExclamationCircle, label: 'Failed' },
};

export default function DashNewsletter() {
  const { currentUser } = useSelector((state) => state.user);

  // ── Stats state ──
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Compose state ──
  const [showCompose, setShowCompose] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [audienceType, setAudienceType] = useState('');
  const [courseId, setCourseId] = useState('');
  const [courses, setCourses] = useState([]);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null); // { type: 'success'|'failure', message }

  // ── Campaign history state ──
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [previewCampaign, setPreviewCampaign] = useState(null);

  // ── Fetch stats ──
  useEffect(() => {
    if (!currentUser?.isAdmin) return;
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/v1/messages/newsletter/stats', {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch newsletter statistics');
        const data = await response.json();
        setStats(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [currentUser]);

  // ── Fetch courses (for course_students audience) ──
  useEffect(() => {
    if (!currentUser?.isAdmin) return;
    const fetchCourses = async () => {
      try {
        const data = await apiFetch('/api/v1/courses/');
        setCourses(data.results || data || []);
      } catch {
        // non-critical
      }
    };
    fetchCourses();
  }, [currentUser]);

  // ── Fetch campaign history ──
  const fetchCampaigns = async () => {
    try {
      setCampaignsLoading(true);
      const data = await apiFetch('/api/v1/messages/broadcast/');
      setCampaigns(Array.isArray(data) ? data : data.results || []);
    } catch {
      // non-critical
    } finally {
      setCampaignsLoading(false);
    }
  };

  useEffect(() => {
    if (showHistory && currentUser?.isAdmin) fetchCampaigns();
  }, [showHistory, currentUser]);

  // ── Export CSV ──
  const exportSubscribers = () => {
    try {
      const csvContent =
        'data:text/csv;charset=utf-8,' +
        'Email,Subscribed Date,Source\n' +
        stats.recentSubscribers
          .map(
            (sub) =>
              `${sub.email},${new Date(sub.subscribedAt).toLocaleDateString()},${sub.source}`
          )
          .join('\n');
      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(csvContent));
      link.setAttribute(
        'download',
        `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  // ── Send broadcast ──
  const handleSendBroadcast = async () => {
    if (!subject.trim() || !body.trim() || !audienceType) return;
    if (audienceType === 'course_students' && !courseId) return;

    setSending(true);
    setSendResult(null);

    try {
      const payload = {
        subject: subject.trim(),
        body,
        audience_type: audienceType,
      };
      if (audienceType === 'course_students') {
        payload.course = parseInt(courseId, 10);
      }

      const data = await apiFetch('/api/v1/messages/broadcast/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setSendResult({
        type: 'success',
        message: data.message || `Broadcast sent to ${data.sent} recipients.`,
      });
      // Reset form
      setSubject('');
      setBody('');
      setAudienceType('');
      setCourseId('');
      // Refresh history if open
      if (showHistory) fetchCampaigns();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to send broadcast. Please try again.';
      setSendResult({ type: 'failure', message: msg });
    } finally {
      setSending(false);
    }
  };

  // ── Guards ──
  if (!currentUser?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Alert color="failure">
          <span className="font-medium">Access Denied!</span> Only administrators can view newsletter statistics.
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Spinner size="xl" />
        <span className="ml-3 text-lg">Loading newsletter statistics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Alert color="failure">
          <span className="font-medium">Error!</span> {error}
        </Alert>
      </div>
    );
  }

  const isComposeValid =
    subject.trim() &&
    body.trim() &&
    body !== '<p><br></p>' &&
    audienceType &&
    (audienceType !== 'course_students' || courseId);

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      {/* ── Fixed alert for send result ── */}
      {sendResult && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <Alert
            color={sendResult.type === 'success' ? 'success' : 'failure'}
            icon={sendResult.type === 'success' ? HiCheckCircle : HiExclamationCircle}
            onDismiss={() => setSendResult(null)}
          >
            {sendResult.message}
          </Alert>
        </div>
      )}

      {/* ── Header ── */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Newsletter Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage subscribers and send broadcast emails
          </p>
        </div>
        <Button
          color="green"
          onClick={() => setShowCompose((v) => !v)}
        >
          <HiPaperAirplane className="mr-2 h-5 w-5" />
          {showCompose ? 'Hide Composer' : 'Compose Broadcast'}
        </Button>
      </div>

      {/* ── Compose Broadcast ── */}
      {showCompose && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <HiPaperAirplane className="text-brand-green" />
              Compose Email Broadcast
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Send an email to a selected audience. The email will be sent via Brevo.
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Audience selector */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Audience *
              </label>
              <Select
                value={audienceType}
                onChange={(e) => {
                  setAudienceType(e.target.value);
                  if (e.target.value !== 'course_students') setCourseId('');
                }}
                required
              >
                {AUDIENCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Course picker (conditional) */}
            {audienceType === 'course_students' && (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Select Course *
                </label>
                <Select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  required
                >
                  <option value="">Choose a course...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {/* Subject line */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Subject *
              </label>
              <TextInput
                type="text"
                placeholder="e.g. Exciting new course launch!"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            {/* Rich text body */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Email Body *
              </label>
              <TipTapEditor
                content={body}
                onChange={setBody}
                placeholder="Write your email content here…"
                minHeight="200px"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                color="green"
                disabled={!isComposeValid || sending}
                onClick={handleSendBroadcast}
              >
                {sending ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <HiPaperAirplane className="mr-2 h-5 w-5" />
                    Send Broadcast
                  </>
                )}
              </Button>
              <Button
                color="gray"
                onClick={() => {
                  setShowCompose(false);
                  setSubject('');
                  setBody('');
                  setAudienceType('');
                  setCourseId('');
                  setSendResult(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Statistics Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Subscribers
              </p>
              <p className="text-3xl font-bold text-brand-green">
                {stats?.totalSubscribers || 0}
              </p>
            </div>
            <HiUsers className="text-4xl text-brand-green" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Unsubscribed
              </p>
              <p className="text-3xl font-bold text-gray-500">
                {stats?.totalUnsubscribed || 0}
              </p>
            </div>
            <HiMail className="text-4xl text-gray-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Growth Rate
              </p>
              <p className="text-3xl font-bold text-brand-blue">
                {stats?.totalSubscribers > 0
                  ? Math.round(
                      (stats.totalSubscribers /
                        (stats.totalSubscribers + stats.totalUnsubscribed)) *
                        100
                    )
                  : 0}
                %
              </p>
            </div>
            <HiTrendingUp className="text-4xl text-brand-blue" />
          </div>
        </div>
      </div>

      {/* ── Recent Subscribers Table ── */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-8">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Subscribers
            </h2>
            <Button
              onClick={exportSubscribers}
              color="gray"
              size="sm"
              className="flex items-center gap-2"
            >
              <HiDownload />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table striped>
            <Table.Head>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Subscribed Date</Table.HeadCell>
              <Table.HeadCell>Source</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {stats?.recentSubscribers?.length > 0 ? (
                stats.recentSubscribers.map((subscriber) => (
                  <Table.Row
                    key={subscriber.id}
                    className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {subscriber.email}
                    </Table.Cell>
                    <Table.Cell>
                      {new Date(subscriber.subscribedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color="info" size="sm">
                        {subscriber.source || 'unknown'}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color="success" size="sm">
                        Active
                      </Badge>
                    </Table.Cell>
                  </Table.Row>
                ))
              ) : (
                <Table.Row>
                  <Table.Cell
                    colSpan={4}
                    className="text-center py-8 text-gray-500 dark:text-gray-400"
                  >
                    No subscribers found
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </div>
      </div>

      {/* ── Campaign History ── */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-8">
        <button
          onClick={() => setShowHistory((v) => !v)}
          className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-t-lg transition-colors"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <HiMail className="text-brand-blue" />
            Broadcast History
          </h2>
          {showHistory ? (
            <HiChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <HiChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>

        {showHistory && (
          <div className="border-t border-gray-200 dark:border-gray-700">
            {campaignsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
                <span className="ml-2 text-gray-500">Loading campaigns...</span>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <HiMail className="mx-auto h-12 w-12 mb-3 opacity-40" />
                <p>No broadcasts sent yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table striped>
                  <Table.Head>
                    <Table.HeadCell>Subject</Table.HeadCell>
                    <Table.HeadCell>Audience</Table.HeadCell>
                    <Table.HeadCell>Recipients</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                    <Table.HeadCell>Sent At</Table.HeadCell>
                    <Table.HeadCell>Actions</Table.HeadCell>
                  </Table.Head>
                  <Table.Body className="divide-y">
                    {campaigns.map((c) => {
                      const badge = STATUS_BADGE[c.status] || STATUS_BADGE.draft;
                      const BadgeIcon = badge.icon;
                      return (
                        <Table.Row
                          key={c.id}
                          className="bg-white dark:border-gray-700 dark:bg-gray-800"
                        >
                          <Table.Cell className="font-medium text-gray-900 dark:text-white max-w-xs truncate">
                            {c.subject}
                          </Table.Cell>
                          <Table.Cell>
                            <Badge color="info" size="sm">
                              {AUDIENCE_OPTIONS.find((o) => o.value === c.audience_type)?.label?.replace(/^..\s/, '') || c.audience_type}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>{c.recipient_count}</Table.Cell>
                          <Table.Cell>
                            <Badge color={badge.color} size="sm" icon={BadgeIcon}>
                              {badge.label}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            {c.sent_at
                              ? new Date(c.sent_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '—'}
                          </Table.Cell>
                          <Table.Cell>
                            <Button
                              size="xs"
                              color="gray"
                              onClick={() => setPreviewCampaign(c)}
                            >
                              <HiEye className="h-4 w-4" />
                            </Button>
                          </Table.Cell>
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

      {/* ── Campaign Preview Modal ── */}
      <Modal
        show={!!previewCampaign}
        onClose={() => setPreviewCampaign(null)}
        size="xl"
      >
        <Modal.Header>
          {previewCampaign?.subject || 'Campaign Preview'}
        </Modal.Header>
        <Modal.Body>
          {previewCampaign && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span>
                  <strong>Audience:</strong>{' '}
                  {AUDIENCE_OPTIONS.find((o) => o.value === previewCampaign.audience_type)?.label?.replace(/^..\s/, '') || previewCampaign.audience_type}
                </span>
                <span>
                  <strong>Sent by:</strong> {previewCampaign.sent_by_email || '—'}
                </span>
                <span>
                  <strong>Recipients:</strong> {previewCampaign.recipient_count}
                </span>
                {previewCampaign.sent_at && (
                  <span>
                    <strong>Date:</strong>{' '}
                    {new Date(previewCampaign.sent_at).toLocaleString()}
                  </span>
                )}
              </div>
              <hr className="dark:border-gray-600" />
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(previewCampaign.body || '') }}
              />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setPreviewCampaign(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Integration Status ── */}
      <div className="p-4 bg-brand-green/5 dark:bg-brand-green/10 rounded-lg border border-brand-green/20 dark:border-brand-green/30">
        <h3 className="text-lg font-semibold text-brand-green dark:text-brand-green/80 mb-2">
          Newsletter Integration Status
        </h3>
        <div className="text-sm text-brand-green/80 dark:text-brand-green/70 space-y-1">
          <p>✅ Contact form integration: Active</p>
          <p>✅ Newsletter signup: Active (RightSidebar)</p>
          <p>✅ Email notifications: Configured (Brevo)</p>
          <p>✅ Unsubscribe functionality: Available</p>
          <p>✅ Broadcast email composer: Ready</p>
          <p>✅ Campaign history & tracking: Active</p>
        </div>
      </div>
    </div>
  );
}
