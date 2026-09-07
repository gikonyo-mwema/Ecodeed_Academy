/**
 * Dashboard Services Table Component
 * 
 * Comprehensive services management interface with full CRUD operations.
 * Displays all services in a table format with editing, deletion, and preview capabilities.
 * 
 * Features:
 * - Service listing with sorting and filtering
 * - Create new services with modal form
 * - Edit existing services with inline updates
 * - Delete services with confirmation modal
 * - Preview service details before publishing
 * - Version history tracking and rollback
 * - Bulk operations for multiple services
 * - Real-time table updates
 * - Loading states and error handling
 * - Pagination for large datasets
 * 
 * Modal Operations:
 * - ServiceFormModal: Create/edit services
 * - DeleteModal: Confirm service deletion
 * - PreviewModal: View service before publishing
 * - VersionHistoryModal: Track version changes
 * 
 * State Management:
 * - Services list with loading states
 * - Modal visibility controls
 * - Form validation and error handling
 * - Retry mechanisms for failed operations
 * 
 * @component
 * @version 1.0.0
 * @author Gikonyo Mwema
 * 
 * @returns {JSX.Element} Services table with CRUD interface
 * 
 * @example
 * ```jsx
 * <DashServicesTable />
 * ```
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  Button, 
  Modal, 
  Alert, 
  Badge,
  Spinner
} from 'flowbite-react';
import { 
  HiOutlineExclamationCircle,
  HiOutlinePlus,
  HiOutlinePencilAlt
} from 'react-icons/hi';

// Import existing components
import { useServices } from './hooks/useServices';
import { sanitizeServicePayload } from '../../../utils/serviceSanitizer';
import { useServiceForm } from './hooks/useServiceForm';

export default function DashServicesTable() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  
  // Services hook
  const {
    services,
    loading,
    alert,
    fetchServices,
    deleteService,
    createService,
    updateService,
    showAlert
  } = useServices();

  // Local state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentService, setCurrentService] = useState(null);

  // Default form data to prevent undefined in form components
  const defaultFormData = {
    title: '',
    shortDescription: '',
    description: '',
    category: '',
    metaTitle: '',
    metaDescription: '',
    tags: [],
    icon: '📋',
    duration: '',
    processSteps: [],
    projectTypes: [],
    benefits: [],
    features: [],
    isFeatured: false,
    isPublished: false
  };

  const normalizeServiceForForm = (svc) => ({
    title: svc?.title || '',
    category: svc?.category || '',
    icon: svc?.icon || '📋',
    duration: svc?.duration || '',
    shortDescription: svc?.shortDescription || '',
    description: svc?.description || svc?.fullDescription || '',
    metaTitle: svc?.metaTitle || svc?.title || '',
    metaDescription: svc?.metaDescription || svc?.shortDescription || '',
    isPublished: Boolean(svc?.isPublished),
    isFeatured: Boolean(svc?.isFeatured),
    projectTypes: Array.isArray(svc?.projectTypes) ? svc.projectTypes.filter(t => t?.trim()) : [],
    benefits: Array.isArray(svc?.benefits) && svc.benefits.length ? svc.benefits.filter(b => b?.title?.trim()) : [],
    features: Array.isArray(svc?.features) && svc.features.length ? svc.features.filter(f => f?.title?.trim()) : [],
    prerequisites: Array.isArray(svc?.prerequisites) ? svc.prerequisites.filter(p => p?.trim()) : [],
    processSteps: Array.isArray(svc?.processSteps) && svc.processSteps.length ? svc.processSteps.filter(p => p?.title?.trim() || p?.step?.trim()) : [],
    tags: Array.isArray(svc?.tags) ? svc.tags.filter(t => t?.trim()) : []
  });

  const {
    formData,
    errors,
    isValid,
    updateFormData,
    resetForm,
    setFormData,
    validateForm,
    handleChange,
    handleProcessStepChange,
    addProcessStep,
    removeProcessStep,
    handleExampleChange,
    addExample,
    removeExample,
    handleProjectTypeChange,
    addProjectType,
    removeProjectType,
    handleBenefitChange,
    addBenefit,
    removeBenefit,
    handleFeatureChange,
    addFeature,
    removeFeature
  } = useServiceForm(defaultFormData);

  // Effects
  useEffect(() => {
    if (!services.length) {
      fetchServices();
    }
  }, [fetchServices, services.length]);

  // Event handlers
  const handleAddClick = () => {
    navigate('/create-service');
  };

  const handleEditClick = (service) => {
    navigate(`/edit-service/${service.id}`);
  };

  // Get unique categories from services
  const categories = ['all', ...new Set(services.map(service => service.category).filter(Boolean))];
  
  // Use services directly without filtering
  const filteredServices = Array.isArray(services) ? services : [];

  const handleDeleteClick = (service) => {
    setCurrentService(service);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteService(currentService.id);
      setShowDeleteModal(false);
      setCurrentService(null);
      showAlert('Service deleted successfully', 'success');
    } catch (error) {
      showAlert('Failed to delete service', 'failure');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Alert Display */}
      {alert.message && (
        <Alert 
          color={alert.type === 'success' ? 'success' : 'failure'}
          onDismiss={() => showAlert('', 'success')}
        >
          {alert.message}
        </Alert>
      )}

      {/* Header with Add Service Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Service Management
        </h1>
        
        <Button
          className="bg-gradient-to-r from-brand-green to-brand-yellow hover:from-brand-green/90 hover:to-brand-yellow/90 text-white border-0 focus:ring-4 focus:ring-brand-green/25"
          onClick={handleAddClick}
        >
          <HiOutlinePlus className="mr-2" />
          Add New Service
        </Button>
      </div>

      {/* Services Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
  {loading.table ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
            <span className="ml-3">Loading services...</span>
          </div>
        ) : filteredServices.length > 0 ? (
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Service</Table.HeadCell>
              <Table.HeadCell>Category</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Created</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
              <Table.HeadCell>Edit</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {filteredServices.map((service) => (
                <Table.Row 
                  key={service.id} 
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <Table.Cell>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{service.icon || '📋'}</span>
                      <div>
                        <div className="text-base font-semibold text-gray-900 dark:text-white">
                          {service.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {service.shortDescription?.substring(0, 60)}...
                        </div>
                      </div>
                    </div>
                  </Table.Cell>
                  
                  <Table.Cell>
                    <Badge color="info" size="sm">
                      {service.category || 'Uncategorized'}
                    </Badge>
                  </Table.Cell>
                  
                  <Table.Cell>
                    <div className="flex flex-col space-y-1">
                      <Badge 
                        color={service.isPublished ? 'success' : 'warning'}
                        size="sm"
                      >
                        {service.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                      {service.isFeatured && (
                        <Badge color="purple" size="sm">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </Table.Cell>
                  
                  <Table.Cell>
                    {formatDate(service.createdAt)}
                  </Table.Cell>
                  
                  <Table.Cell>
                    <button
                      onClick={() => handleDeleteClick(service)}
                      className="font-medium text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </Table.Cell>
                  
                  <Table.Cell>
                    <button
                      onClick={() => handleEditClick(service)}
                      className="font-medium text-blue-500 hover:underline flex items-center gap-1"
                    >
                      <HiOutlinePencilAlt /> Edit
                    </button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No services found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Get started by creating your first service
            </p>
            <Button
              className="bg-gradient-to-r from-brand-green to-brand-yellow hover:from-brand-green/90 hover:to-brand-yellow/90 text-white border-0"
              onClick={handleAddClick}
            >
              <HiOutlinePlus className="mr-2" />
              Add First Service
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        size="md"
        onClose={() => setShowDeleteModal(false)}
        popup
        className="delete-modal dark:bg-gray-900"
      >
        <Modal.Header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700" />
        <Modal.Body className="bg-white dark:bg-gray-800">
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this service?
            </h3>
            <div className="flex justify-center gap-4">
              <Button 
                color="failure" 
                onClick={handleDeleteConfirm}
                disabled={loading.operation}
              >
                {loading.operation ? 'Deleting...' : 'Yes, delete'}
              </Button>
              <Button 
                color="gray" 
                onClick={() => setShowDeleteModal(false)}
                disabled={loading.operation}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
