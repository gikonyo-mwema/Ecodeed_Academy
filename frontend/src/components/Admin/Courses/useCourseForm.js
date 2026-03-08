import { useState } from 'react';

export const useCourseForm = (initialState) => {
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [id]: type === 'checkbox' ? (checked !== undefined ? checked : value === 'true') : value 
    }));
  };

  const handleFeatureChange = (index, value) => {
    setFormData(prev => {
      const newFeatures = [...(prev.features || [])];
      newFeatures[index] = value;
      return { ...prev, features: newFeatures };
    });
  };

  const addFeatureField = () => {
    setFormData(prev => ({ ...prev, features: [...(prev.features || []), ''] }));
  };

  const removeFeatureField = (index) => {
    setFormData(prev => {
      const newFeatures = (prev.features || []).filter((_, i) => i !== index);
      return { ...prev, features: newFeatures };
    });
  };

  // Curriculum Handlers
  const handleCurriculumChange = (sectionIndex, field, value) => {
    setFormData(prev => {
      const newCurriculum = [...(prev.curriculum || [])];
      if (newCurriculum[sectionIndex]) {
        newCurriculum[sectionIndex] = { ...newCurriculum[sectionIndex], [field]: value };
      }
      return { ...prev, curriculum: newCurriculum };
    });
  };

  const handleCurriculumItemChange = (sectionIndex, itemIndex, value) => {
    setFormData(prev => {
      const newCurriculum = [...(prev.curriculum || [])];
      if (newCurriculum[sectionIndex] && Array.isArray(newCurriculum[sectionIndex].items)) {
        const newItems = [...newCurriculum[sectionIndex].items];
        
        // Update object if it's an object, or convert string to object (migration safety)
        const currentItem = newItems[itemIndex];
        if (typeof currentItem === 'object' && currentItem !== null) {
           newItems[itemIndex] = { ...currentItem, title: value };
        } else {
           newItems[itemIndex] = { title: value };
        }
        
        newCurriculum[sectionIndex] = { ...newCurriculum[sectionIndex], items: newItems };
      }
      return { ...prev, curriculum: newCurriculum };
    });
  };

  const addCurriculumSection = () => {
    setFormData(prev => ({ 
      ...prev, 
      curriculum: [...(prev.curriculum || []), { title: '', items: [{ title: '' }] }] 
    }));
  };

  const addCurriculumItem = (sectionIndex) => {
    setFormData(prev => {
      const newCurriculum = [...(prev.curriculum || [])];
      if (newCurriculum[sectionIndex]) {
        newCurriculum[sectionIndex] = { 
          ...newCurriculum[sectionIndex], 
          items: [...(newCurriculum[sectionIndex].items || []), { title: '' }] 
        };
      }
      return { ...prev, curriculum: newCurriculum };
    });
  };

  const removeCurriculumItem = (sectionIndex, itemIndex) => {
    setFormData(prev => {
      const newCurriculum = [...(prev.curriculum || [])];
      if (newCurriculum[sectionIndex]) {
        if (itemIndex !== undefined) {
          // Remove specific lesson
          const newItems = newCurriculum[sectionIndex].items.filter((_, i) => i !== itemIndex);
          newCurriculum[sectionIndex] = { ...newCurriculum[sectionIndex], items: newItems };
        } else {
          // Remove whole section
          newCurriculum.splice(sectionIndex, 1);
        }
      }
      return { ...prev, curriculum: newCurriculum };
    });
  };

  // Lesson detail handler — update any field on a curriculum lesson item
  const handleLessonDetailChange = (sectionIndex, itemIndex, field, value) => {
    setFormData(prev => {
      const newCurriculum = [...(prev.curriculum || [])];
      if (newCurriculum[sectionIndex] && Array.isArray(newCurriculum[sectionIndex].items)) {
        const newItems = [...newCurriculum[sectionIndex].items];
        const currentItem = newItems[itemIndex];
        if (typeof currentItem === 'object' && currentItem !== null) {
          newItems[itemIndex] = { ...currentItem, [field]: value };
        } else {
          newItems[itemIndex] = { title: currentItem || '', [field]: value };
        }
        newCurriculum[sectionIndex] = { ...newCurriculum[sectionIndex], items: newItems };
      }
      return { ...prev, curriculum: newCurriculum };
    });
  };

  // FAQ Handlers
  const handleFaqChange = (index, field, value) => {
    setFormData(prev => {
      const newFaqs = [...(prev.faqs || [])];
      if (newFaqs[index]) {
        newFaqs[index] = { ...newFaqs[index], [field]: value };
      }
      return { ...prev, faqs: newFaqs };
    });
  };

  const addFaq = () => {
    setFormData(prev => ({ 
      ...prev, 
      faqs: [...(prev.faqs || []), { question: '', answer: '' }] 
    }));
  };

  const removeFaq = (index) => {
    setFormData(prev => {
      const newFaqs = (prev.faqs || []).filter((_, i) => i !== index);
      return { ...prev, faqs: newFaqs };
    });
  };

  return {
    formData,
    setFormData,
    error,
    setError,
    loading,
    setLoading,
    handleChange,
    handleFeatureChange,
    addFeatureField,
    removeFeatureField,
    handleCurriculumChange,
    handleCurriculumItemChange,
    addCurriculumSection,
    addCurriculumItem,
    removeCurriculumItem,
    handleLessonDetailChange,
    handleFaqChange,
    addFaq,
    removeFaq
  };
};
