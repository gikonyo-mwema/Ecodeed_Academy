import { useState } from 'react';

export const useCourseForm = (initialState) => {
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? (checked !== undefined ? checked : value === 'true') : value,
    }));
  };

  // ── Features ──
  const handleFeatureChange = (index, value) => {
    setFormData(prev => {
      const f = [...(prev.features || [])];
      f[index] = value;
      return { ...prev, features: f };
    });
  };
  const addFeatureField = () => setFormData(prev => ({ ...prev, features: [...(prev.features || []), ''] }));
  const removeFeatureField = (index) => setFormData(prev => ({
    ...prev, features: (prev.features || []).filter((_, i) => i !== index),
  }));

  // ── Target Audience ──
  const handleTargetAudienceChange = (index, value) => {
    setFormData(prev => {
      const ta = [...(prev.targetAudience || [])];
      ta[index] = value;
      return { ...prev, targetAudience: ta };
    });
  };
  const addTargetAudience = () => setFormData(prev => ({ ...prev, targetAudience: [...(prev.targetAudience || []), ''] }));
  const removeTargetAudience = (index) => setFormData(prev => ({
    ...prev, targetAudience: (prev.targetAudience || []).filter((_, i) => i !== index),
  }));

  // ── Curriculum (Weeks/Modules) ──
  const _updateSection = (sectionIndex, updater) => {
    setFormData(prev => {
      const c = [...(prev.curriculum || [])];
      if (c[sectionIndex]) c[sectionIndex] = updater(c[sectionIndex]);
      return { ...prev, curriculum: c };
    });
  };

  const handleCurriculumChange = (sectionIndex, field, value) => {
    _updateSection(sectionIndex, sec => ({ ...sec, [field]: value }));
  };

  const handleCurriculumItemChange = (sectionIndex, itemIndex, value) => {
    _updateSection(sectionIndex, sec => {
      const items = [...(sec.items || [])];
      const cur = items[itemIndex];
      items[itemIndex] = typeof cur === 'object' && cur !== null
        ? { ...cur, title: value }
        : { title: value };
      return { ...sec, items };
    });
  };

  const addCurriculumSection = () => {
    setFormData(prev => ({
      ...prev,
      curriculum: [...(prev.curriculum || []), {
        title: '', items: [{ title: '' }], live_sessions: [], resources: [],
      }],
    }));
  };

  const addCurriculumItem = (sectionIndex) => {
    _updateSection(sectionIndex, sec => ({
      ...sec,
      items: [...(sec.items || []), { title: '' }],
    }));
  };

  const removeCurriculumItem = (sectionIndex, itemIndex) => {
    setFormData(prev => {
      const c = [...(prev.curriculum || [])];
      if (!c[sectionIndex]) return prev;
      if (itemIndex !== undefined) {
        c[sectionIndex] = {
          ...c[sectionIndex],
          items: c[sectionIndex].items.filter((_, i) => i !== itemIndex),
        };
      } else {
        c.splice(sectionIndex, 1);
      }
      return { ...prev, curriculum: c };
    });
  };

  // Lesson detail handler — update any field on a curriculum lesson item
  const handleLessonDetailChange = (sectionIndex, itemIndex, field, value) => {
    _updateSection(sectionIndex, sec => {
      const items = [...(sec.items || [])];
      const cur = items[itemIndex];
      items[itemIndex] = typeof cur === 'object' && cur !== null
        ? { ...cur, [field]: value }
        : { title: cur || '', [field]: value };
      return { ...sec, items };
    });
  };

  // ── Live Sessions per week ──
  const addLiveSession = (sectionIndex) => {
    _updateSection(sectionIndex, sec => ({
      ...sec,
      live_sessions: [...(sec.live_sessions || []), { title: '', zoom_link: '', description: '', date_time: '' }],
    }));
  };

  const updateLiveSession = (sectionIndex, lsIndex, field, value) => {
    _updateSection(sectionIndex, sec => {
      const ls = [...(sec.live_sessions || [])];
      ls[lsIndex] = { ...ls[lsIndex], [field]: value };
      return { ...sec, live_sessions: ls };
    });
  };

  const removeLiveSession = (sectionIndex, lsIndex) => {
    _updateSection(sectionIndex, sec => ({
      ...sec,
      live_sessions: (sec.live_sessions || []).filter((_, i) => i !== lsIndex),
    }));
  };

  // ── Resources per week ──
  const addResource = (sectionIndex) => {
    _updateSection(sectionIndex, sec => ({
      ...sec,
      resources: [...(sec.resources || []), { title: '', file_url: '', description: '', resource_type: 'link' }],
    }));
  };

  const updateResource = (sectionIndex, rIndex, field, value) => {
    _updateSection(sectionIndex, sec => {
      const res = [...(sec.resources || [])];
      res[rIndex] = { ...res[rIndex], [field]: value };
      return { ...sec, resources: res };
    });
  };

  const removeResource = (sectionIndex, rIndex) => {
    _updateSection(sectionIndex, sec => ({
      ...sec,
      resources: (sec.resources || []).filter((_, i) => i !== rIndex),
    }));
  };

  // ── FAQs ──
  const handleFaqChange = (index, field, value) => {
    setFormData(prev => {
      const f = [...(prev.faqs || [])];
      if (f[index]) f[index] = { ...f[index], [field]: value };
      return { ...prev, faqs: f };
    });
  };
  const addFaq = () => setFormData(prev => ({
    ...prev, faqs: [...(prev.faqs || []), { question: '', answer: '' }],
  }));
  const removeFaq = (index) => setFormData(prev => ({
    ...prev, faqs: (prev.faqs || []).filter((_, i) => i !== index),
  }));

  return {
    formData, setFormData, error, setError, loading, setLoading,
    handleChange,
    handleFeatureChange, addFeatureField, removeFeatureField,
    handleTargetAudienceChange, addTargetAudience, removeTargetAudience,
    handleCurriculumChange, handleCurriculumItemChange,
    addCurriculumSection, addCurriculumItem, removeCurriculumItem,
    handleLessonDetailChange,
    addLiveSession, updateLiveSession, removeLiveSession,
    addResource, updateResource, removeResource,
    handleFaqChange, addFaq, removeFaq,
  };
};
