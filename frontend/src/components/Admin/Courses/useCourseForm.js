/**
 * useCourseForm Hook — Hierarchical course curriculum management with nested arrays.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * Manages complex course form state including hierarchical curriculum structure
 * with weeks/modules, lessons, live sessions, resources, FAQs, features, and target
 * audience. Provides comprehensive handlers for deeply nested array operations.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * CURRICULUM STRUCTURE (Hierarchical)
 * ═══════════════════════════════════════════════════════════════════════════════════
 * curriculum: {
 *   [section]: {
 *     title: "Week 1",
 *     items: [          // Lessons
 *       { title: "Lesson 1", description, duration, ... }
 *     ],
 *     live_sessions: [  // Weekly live sessions
 *       { title, zoom_link, description, date_time }
 *     ],
 *     resources: [      // Weekly resources
 *       { title, file_url, resource_type, description }
 *     ]
 *   }
 * }
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * HANDLER ORGANIZATION
 * ═══════════════════════════════════════════════════════════════════════════════════
 * Basic Form:
 *   handleChange(e): Standard form field handler
 *
 * Features & Audience:
 *   handleFeatureChange(i, value): Update feature by index
 *   addFeatureField(), removeFeatureField(i)
 *   handleTargetAudienceChange(i, value)
 *   addTargetAudience(), removeTargetAudience(i)
 *
 * Curriculum (Weeks):
 *   addCurriculumSection(): New week
 *   handleCurriculumChange(sectionIdx, field, value)
 *   removeCurriculumItem(sectionIdx): Delete entire week
 *
 * Lessons (per Week):
 *   addCurriculumItem(sectionIdx): New lesson in week
 *   handleCurriculumItemChange(sectionIdx, itemIdx, value)
 *   handleLessonDetailChange(sectionIdx, itemIdx, field, value): Update any lesson field
 *   removeCurriculumItem(sectionIdx, itemIdx): Delete lesson
 *
 * Live Sessions (per Week):
 *   addLiveSession(sectionIdx): New session for week
 *   updateLiveSession(sectionIdx, sessionIdx, field, value)
 *   removeLiveSession(sectionIdx, sessionIdx)
 *
 * Resources (per Week):
 *   addResource(sectionIdx): New resource for week
 *   updateResource(sectionIdx, resourceIdx, field, value)
 *   removeResource(sectionIdx, resourceIdx)
 *
 * FAQs (Global):
 *   handleFaqChange(idx, field, value)
 *   addFaq(), removeFaq(idx)
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * FORM SCHEMA
 * ═══════════════════════════════════════════════════════════════════════════════════
 * {
 *   title: string,
 *   description: string,
 *   features: string[],
 *   targetAudience: string[],
 *   curriculum: [
 *     { title, items[], live_sessions[], resources[] }
 *   ],
 *   faqs: [{ question, answer }],
 *   ...otherFields
 * }
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * USAGE EXAMPLE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * const {
 *   formData,
 *   handleCurriculumChange,
 *   addCurriculumSection,
 *   handleLessonDetailChange,
 *   addResource, updateResource, removeResource
 * } = useCourseForm(initialCourse);
 *
 * // Add a week
 * <button onClick={addCurriculumSection}>+ Add Week</button>
 *
 * // Update week title
 * <input
 *   value={formData.curriculum[0].title}
 *   onChange={(e) => handleCurriculumChange(0, 'title', e.target.value)}
 * />
 *
 * @hook useCourseForm
 * @param {object} initialState - Initial form data with course structure
 * @returns {object} Form state and handlers for all fields (features, audience, curriculum, etc.)
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

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

  const addMultipleCurriculumItems = (sectionIndex, count = 5) => {
    const safeCount = Math.max(1, Number(count) || 1);
    _updateSection(sectionIndex, sec => ({
      ...sec,
      items: [
        ...(sec.items || []),
        ...Array.from({ length: safeCount }, () => ({ title: '' })),
      ],
    }));
  };

  const duplicateCurriculumSection = (sectionIndex) => {
    setFormData(prev => {
      const c = [...(prev.curriculum || [])];
      if (!c[sectionIndex]) return prev;
      const source = c[sectionIndex];
      const clone = {
        ...source,
        title: source.title ? `${source.title} (Copy)` : 'Untitled Week (Copy)',
        items: (source.items || []).map((item) =>
          typeof item === 'object' && item !== null ? { ...item } : { title: item || '' }
        ),
        live_sessions: (source.live_sessions || []).map((ls) => ({ ...ls })),
        resources: (source.resources || []).map((res) => ({ ...res })),
      };
      c.splice(sectionIndex + 1, 0, clone);
      return { ...prev, curriculum: c };
    });
  };

  const duplicateCurriculumLesson = (sectionIndex, itemIndex) => {
    _updateSection(sectionIndex, sec => {
      const items = [...(sec.items || [])];
      const source = items[itemIndex];
      if (source === undefined) return sec;
      const clone = typeof source === 'object' && source !== null
        ? { ...source, title: source.title ? `${source.title} (Copy)` : 'Untitled Lesson (Copy)' }
        : { title: source ? `${source} (Copy)` : 'Untitled Lesson (Copy)' };
      items.splice(itemIndex + 1, 0, clone);
      return { ...sec, items };
    });
  };

  const moveCurriculumSection = (fromIndex, toIndex) => {
    setFormData(prev => {
      const c = [...(prev.curriculum || [])];
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= c.length ||
        toIndex >= c.length ||
        fromIndex === toIndex
      ) {
        return prev;
      }
      const [moved] = c.splice(fromIndex, 1);
      c.splice(toIndex, 0, moved);
      return { ...prev, curriculum: c };
    });
  };

  const moveCurriculumLesson = (sectionIndex, fromIndex, toIndex) => {
    _updateSection(sectionIndex, sec => {
      const items = [...(sec.items || [])];
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= items.length ||
        toIndex >= items.length ||
        fromIndex === toIndex
      ) {
        return sec;
      }
      const [moved] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, moved);
      return { ...sec, items };
    });
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
    addMultipleCurriculumItems,
    duplicateCurriculumSection, duplicateCurriculumLesson,
    moveCurriculumSection, moveCurriculumLesson,
    handleLessonDetailChange,
    addLiveSession, updateLiveSession, removeLiveSession,
    addResource, updateResource, removeResource,
    handleFaqChange, addFaq, removeFaq,
  };
};
