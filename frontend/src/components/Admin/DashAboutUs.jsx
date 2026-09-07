/**
 * Dashboard About Us Management Component
 *
 * Admin interface for editing the About Us page content.
 * Manage hero section, mission statement, founder info, values, metrics, and team.
 *
 * Features:
 * - Hero Section: Edit title, subtitle, and image URL
 * - Mission & Vision: Edit mission and vision statements
 * - Founder Information: Name, bio, and profile image
 * - Core Values: Add/edit values with descriptions
 * - Impact Metrics: Display key metrics
 * - Team Members: Add/edit team profiles
 * - Auto-save: Saves every 5 seconds
 * - Dark mode support: Full Tailwind dark mode styling
 *
 * API Endpoints:
 * - GET /api/v1/aboutus/: Fetch About Us content
 * - PUT /api/v1/aboutus/1/: Update About Us content
 *
 * @component
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Alert, Spinner, Modal, Button as FlowbiteButton } from 'flowbite-react';
import { HiSave, HiExclamation, HiCheckCircle, HiArrowLeft } from 'react-icons/hi';
import { apiFetch } from '../../utils/api';

const DashAboutUs = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [aboutUsData, setAboutUsData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const saveTimeoutRef = useRef(null);
  const [activeTab, setActiveTab] = useState('hero');

  // Fetch About Us data
  useEffect(() => {
    const fetchAboutUs = async () => {
      try {
        const response = await apiFetch('/api/v1/aboutus/');
        if (Array.isArray(response)) {
          setAboutUsData(response[0] || null);
          setFormData(response[0] || {});
        } else {
          setAboutUsData(response);
          setFormData(response);
        }
      } catch (err) {
        console.error('Error fetching About Us:', err);
        setError('Failed to load About Us content');
      } finally {
        setLoading(false);
      }
    };

    fetchAboutUs();
  }, []);

  // Auto-save form data every 5 seconds
  useEffect(() => {
    if (!formData || JSON.stringify(formData) === JSON.stringify(aboutUsData)) {
      return; // No changes
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveAboutUs();
    }, 5000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData, aboutUsData]);

  const saveAboutUs = async () => {
    if (!formData) return;

    setSaving(true);
    try {
      const response = await apiFetch(
        `/api/v1/aboutus/${aboutUsData?.id || 1}/`,
        {
          method: 'PUT',
          body: JSON.stringify(formData),
        }
      );

      setAboutUsData(response);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving About Us:', err);
      setError('Failed to save About Us content');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayChange = (field, index, subfield, value) => {
    setFormData((prev) => {
      const arr = [...(prev[field] || [])];
      if (subfield) {
        arr[index] = { ...arr[index], [subfield]: value };
      } else {
        arr[index] = value;
      }
      return { ...prev, [field]: arr };
    });
  };

  const handleArrayAdd = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), field === 'team_members' ? { name: '', role: '', bio: '', image: '' } : { name: '', description: '' }],
    }));
  };

  const handleArrayRemove = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (!formData) {
    return <Alert color="failure">Failed to load About Us content</Alert>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          About Us Page
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your company's About Us page content
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <Alert color="failure" className="mb-4">
          <HiExclamation className="mr-2 inline" /> {error}
        </Alert>
      )}
      {success && (
        <Alert color="success" className="mb-4">
          <HiCheckCircle className="mr-2 inline" /> Changes saved successfully
        </Alert>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'hero', label: '🎯 Hero Section' },
          { id: 'mission', label: '🎯 Mission & Vision' },
          { id: 'founder', label: '👤 Founder' },
          { id: 'values', label: '💎 Values' },
          { id: 'metrics', label: '📊 Metrics' },
          { id: 'team', label: '👥 Team' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-brand-green border-b-2 border-brand-green'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Hero Section */}
      {activeTab === 'hero' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Hero Title
            </label>
            <textarea
              value={formData.hero_title || ''}
              onChange={(e) => handleChange('hero_title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-green focus:border-transparent"
              rows="2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Hero Subtitle
            </label>
            <textarea
              value={formData.hero_subtitle || ''}
              onChange={(e) => handleChange('hero_subtitle', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-green focus:border-transparent"
              rows="2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Hero Image URL
            </label>
            <input
              type="url"
              value={formData.hero_image_url || ''}
              onChange={(e) => handleChange('hero_image_url', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-green focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Mission & Vision */}
      {activeTab === 'mission' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Mission Statement
            </label>
            <textarea
              value={formData.mission_statement || ''}
              onChange={(e) => handleChange('mission_statement', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-green focus:border-transparent"
              rows="4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Vision Statement
            </label>
            <textarea
              value={formData.vision_statement || ''}
              onChange={(e) => handleChange('vision_statement', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-green focus:border-transparent"
              rows="4"
            />
          </div>
        </div>
      )}

      {/* Founder */}
      {activeTab === 'founder' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Founder Name
            </label>
            <input
              type="text"
              value={formData.founder_name || ''}
              onChange={(e) => handleChange('founder_name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-green focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Founder Biography
            </label>
            <textarea
              value={formData.founder_bio || ''}
              onChange={(e) => handleChange('founder_bio', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-green focus:border-transparent"
              rows="4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Founder Image URL
            </label>
            <input
              type="url"
              value={formData.founder_image_url || ''}
              onChange={(e) => handleChange('founder_image_url', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-green focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Values */}
      {activeTab === 'values' && (
        <div className="space-y-4">
          {(formData.values || []).map((value, index) => (
            <div key={index} className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">Value #{index + 1}</h4>
                <button
                  onClick={() => handleArrayRemove('values', index)}
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-600"
                >
                  ✕
                </button>
              </div>
              <input
                type="text"
                placeholder="Value name (e.g., Integrity)"
                value={value.name || ''}
                onChange={(e) => handleArrayChange('values', index, 'name', e.target.value)}
                className="w-full px-3 py-2 mb-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm"
              />
              <textarea
                placeholder="Description"
                value={value.description || ''}
                onChange={(e) => handleArrayChange('values', index, 'description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm"
                rows="2"
              />
            </div>
          ))}
          <button
            onClick={() => handleArrayAdd('values')}
            className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-green-700"
          >
            + Add Value
          </button>
        </div>
      )}

      {/* Metrics */}
      {activeTab === 'metrics' && (
        <div className="space-y-4">
          {(formData.metrics || []).map((metric, index) => (
            <div key={index} className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">Metric #{index + 1}</h4>
                <button
                  onClick={() => handleArrayRemove('metrics', index)}
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-600"
                >
                  ✕
                </button>
              </div>
              <input
                type="text"
                placeholder="Label (e.g., Clients Served)"
                value={metric.label || ''}
                onChange={(e) => handleArrayChange('metrics', index, 'label', e.target.value)}
                className="w-full px-3 py-2 mb-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm"
              />
              <input
                type="text"
                placeholder="Value (e.g., 500+)"
                value={metric.value || ''}
                onChange={(e) => handleArrayChange('metrics', index, 'value', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm"
              />
            </div>
          ))}
          <button
            onClick={() => handleArrayAdd('metrics')}
            className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-green-700"
          >
            + Add Metric
          </button>
        </div>
      )}

      {/* Team */}
      {activeTab === 'team' && (
        <div className="space-y-4">
          {(formData.team_members || []).map((member, index) => (
            <div key={index} className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">Team Member #{index + 1}</h4>
                <button
                  onClick={() => handleArrayRemove('team_members', index)}
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-600"
                >
                  ✕
                </button>
              </div>
              <input
                type="text"
                placeholder="Name"
                value={member.name || ''}
                onChange={(e) => handleArrayChange('team_members', index, 'name', e.target.value)}
                className="w-full px-3 py-2 mb-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm"
              />
              <input
                type="text"
                placeholder="Role"
                value={member.role || ''}
                onChange={(e) => handleArrayChange('team_members', index, 'role', e.target.value)}
                className="w-full px-3 py-2 mb-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm"
              />
              <textarea
                placeholder="Bio"
                value={member.bio || ''}
                onChange={(e) => handleArrayChange('team_members', index, 'bio', e.target.value)}
                className="w-full px-3 py-2 mb-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm"
                rows="2"
              />
              <input
                type="url"
                placeholder="Image URL"
                value={member.image || ''}
                onChange={(e) => handleArrayChange('team_members', index, 'image', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm"
              />
            </div>
          ))}
          <button
            onClick={() => handleArrayAdd('team_members')}
            className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-green-700"
          >
            + Add Team Member
          </button>
        </div>
      )}

      {/* Save Status */}
      <div className="mt-6 flex items-center gap-2">
        {saving && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Spinner size="sm" className="mr-2" /> Saving...
          </div>
        )}
        {success && (
          <div className="flex items-center text-sm text-green-600 dark:text-green-400">
            <HiCheckCircle className="mr-2" /> All changes saved
          </div>
        )}
      </div>
    </div>
  );
};

export default DashAboutUs;
