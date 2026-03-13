/**
 * useServiceModal Hook
 * 
 * Custom React hook for managing modal visibility states in services management.
 * Provides centralized control over all modal dialogs and selected service data.
 * 
 * Features:
 * - Control form modal visibility
 * - Control delete confirmation modal
 * - Control preview modal
 * - Control payment modal
 * - Track selected service for operations
 * - Track current service being edited
 * - Modal state synchronization
 * 
 * Modal Types:
 * - FormModal: Create/edit service form
 * - DeleteModal: Delete confirmation
 * - PreviewModal: Service preview
 * - PaymentModal: Payment configuration
 * 
 * State Management:
 * - Separate state for each modal
 * - Service selection tracking
 * - Current edit context
 * 
 * @hook
 * @version 1.0.0
 * @author Gikonyo Mwema
 * 
 * @returns {Object} Modal state and control functions
 *   @returns {boolean} showFormModal - Form modal visibility
 *   @returns {Function} setShowFormModal - Toggle form modal
 *   @returns {boolean} showDeleteModal - Delete modal visibility
 *   @returns {Function} setShowDeleteModal - Toggle delete modal
 *   @returns {boolean} showPreviewModal - Preview modal visibility
 *   @returns {Function} setShowPreviewModal - Toggle preview modal
 *   @returns {boolean} showPaymentModal - Payment modal visibility
 *   @returns {Function} setShowPaymentModal - Toggle payment modal
 *   @returns {Object} selectedService - Currently selected service
 *   @returns {Function} setSelectedService - Set selected service
 *   @returns {Object} currentService - Service being edited
 *   @returns {Function} setCurrentService - Set current service
 * 
 * @example
 * ```jsx
 * const { showFormModal, setShowFormModal, selectedService } = useServiceModal();
 * ```
 */

import { useState } from 'react';

export const useServiceModals = () => {
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  
  const [selectedService, setSelectedService] = useState(null);
  const [currentService, setCurrentService] = useState(null);

  return {
    showFormModal, setShowFormModal,
    showDeleteModal, setShowDeleteModal,
    showPreviewModal, setShowPreviewModal,
    showPaymentModal, setShowPaymentModal,
  
    selectedService, setSelectedService,
    currentService, setCurrentService
  };
};