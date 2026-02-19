import { useState } from 'react';

export const useCourseForm = (initialState) => {
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [id]: type === 'checkbox' ? (checked !== undefined ? checked : value === 'true') : value 
    });
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeatureField = () => {
    setFormData({ ...formData, features: [...(formData.features || []), ''] });
  };

  const removeFeatureField = (index) => {
    const newFeatures = (formData.features || []).filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  // Curriculum Handlers
  const handleCurriculumChange = (sectionIndex, field, value) => {
    const newCurriculum = [...(formData.curriculum || [])];
    if (newCurriculum[sectionIndex]) {
      newCurriculum[sectionIndex] = { ...newCurriculum[sectionIndex], [field]: value };
      setFormData({ ...formData, curriculum: newCurriculum });
    }
  };

  const handleCurriculumItemChange = (sectionIndex, itemIndex, value) => {
    const newCurriculum = [...(formData.curriculum || [])];
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
      setFormData({ ...formData, curriculum: newCurriculum });
    }
  };

  const addCurriculumSection = () => {
    setFormData({ 
      ...formData, 
      curriculum: [...(formData.curriculum || []), { title: '', items: [{ title: '' }] }] 
    });
  };

  const addCurriculumItem = (sectionIndex) => {
    const newCurriculum = [...(formData.curriculum || [])];
    if (newCurriculum[sectionIndex]) {
      newCurriculum[sectionIndex] = { 
        ...newCurriculum[sectionIndex], 
        items: [...(newCurriculum[sectionIndex].items || []), { title: '' }] 
      };
      setFormData({ ...formData, curriculum: newCurriculum });
    }
  };

  const removeCurriculumItem = (sectionIndex, itemIndex) => {
    const newCurriculum = [...(formData.curriculum || [])];
    if (newCurriculum[sectionIndex]) {
      if (itemIndex !== undefined) {
        // Remove specific lesson
        const newItems = newCurriculum[sectionIndex].items.filter((_, i) => i !== itemIndex);
        newCurriculum[sectionIndex] = { ...newCurriculum[sectionIndex], items: newItems };
      } else {
        // Remove whole section
        newCurriculum.splice(sectionIndex, 1);
      }
      setFormData({ ...formData, curriculum: newCurriculum });
    }
  };

  // FAQ Handlers
  const handleFaqChange = (index, field, value) => {
    const newFaqs = [...(formData.faqs || [])];
    if (newFaqs[index]) {
      newFaqs[index] = { ...newFaqs[index], [field]: value };
      setFormData({ ...formData, faqs: newFaqs });
    }
  };

  const addFaq = () => {
    setFormData({ 
      ...formData, 
      faqs: [...(formData.faqs || []), { question: '', answer: '' }] 
    });
  };

  const removeFaq = (index) => {
    const newFaqs = (formData.faqs || []).filter((_, i) => i !== index);
    setFormData({ ...formData, faqs: newFaqs });
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
    handleFaqChange,
    addFaq,
    removeFaq
  };
};
