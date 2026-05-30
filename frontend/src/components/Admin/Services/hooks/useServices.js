import { useState, useCallback } from 'react';
import { apiFetch } from '../../../../utils/api';

/**
 * useServices Hook — Complete service management with CRUD, retry logic, and alerts.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * Provides full service lifecycle management for admin dashboard. Handles all CRUD
 * operations (Create, Read, Update, Delete), bulk operations, version control, and
 * API error handling with exponential backoff retry mechanism.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * CORE OPERATIONS
 * ═══════════════════════════════════════════════════════════════════════════════════
 * • fetchServices(params): GET /api/v1/services/ with optional filters
 * • createService(data): POST /api/v1/services/
 * • updateService(id, data): PUT /api/v1/services/{id}/
 * • deleteService(id): DELETE /api/v1/services/{id}/
 * • duplicateService(id): POST /api/v1/services/{id}/duplicate
 * • bulkDeleteServices(ids[]): Batch delete with fallback handling
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * ADVANCED FEATURES
 * ═══════════════════════════════════════════════════════════════════════════════════
 * Retry Mechanism: Exponential backoff (1s, 2s, 3s) on API failures, max 3 retries
 * Field Mapping: Converts camelCase (frontend) ↔ snake_case (backend)
 * Alert System: Auto-hiding notifications (5s default) with success/failure types
 * Loading States: Fine-grained control for table, operation, bulk, history views
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * FIELD MAPPING (Frontend → Backend)
 * ═══════════════════════════════════════════════════════════════════════════════════
 * shortDescription ↔ short_description
 * fullDescription/description ↔ full_description
 * isPublished ↔ is_published
 * priceSuffix ↔ price_suffix
 * processSteps ↔ process
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * HOOK STATE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * {
 *   services: object[],         // Array of service objects
 *   loading: {                  // Fine-grained loading states
 *     table: bool,              // Main list is loading
 *     operation: bool,          // Single CRUD operation in progress
 *     bulk: bool,               // Bulk operations in progress
 *     history: bool             // Version history loading
 *   },
 *   alert: {                    // Alert/toast notification state
 *     show: bool,               // Visibility flag
 *     message: string,          // Message text
 *     type: 'success'|'failure',// Alert type/severity
 *     duration: number          // Auto-hide timeout (ms)
 *   }
 * }
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * USAGE EXAMPLE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * const { services, loading, alert, fetchServices, createService, deleteService }
 *   = useServices();
 *
 * useEffect(() => { fetchServices(); }, []);
 *
 * const handleCreate = async () => {
 *   try {
 *     await createService({ title: 'New Service', ... });
 *   } catch (err) {
 *     console.error(err);
 *   }
 * };
 *
 * @hook useServices
 * @returns {object} { services, loading, alert, fetchServices, createService, updateService, deleteService, duplicateService, bulkDeleteServices, showAlert }
 * @version 2.0.0
 * @author Gikonyo Mwema
 */

/**
 * Custom hook for managing services in the admin panel.
 * Handles CRUD, bulk operations, version history, alerts, and retry mechanisms.
 */
export const useServices = () => {
  // State for the list of services
  const [services, setServices] = useState([]);
  // Loading states for different operations
  const [loading, setLoading] = useState({
    table: true,
    operation: false,
    bulk: false,
    history: false,
  });
  // Alert state for user feedback
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    type: 'success',
    duration: 5000,
  });

  /**
   * Retry mechanism for failed requests
   * @param {Function} operation - The operation to retry
   * @param {number} maxRetries - Maximum number of retries
   */
  const retryOperation = useCallback(async (operation, maxRetries = 3) => {
    let retries = 0;
    while (retries < maxRetries) {
      try {
        return await operation();
      } catch (error) {
        retries++;
        if (retries === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }
  }, []);

  /**
   * Show alert with message, type, and duration.
   * Automatically hides after duration.
   * @param {string} message - Alert message to display
   * @param {string} [type='success'] - Alert type ('success' or 'failure')
   * @param {number} [duration=5000] - Duration in ms before auto-hide
   */
  const showAlert = useCallback((message, type = 'success', duration = 5000) => {
    setAlert({ show: true, message, type, duration });
    const timer = setTimeout(() => {
      setAlert(prev => ({ ...prev, show: false }));
    }, duration);
    return () => clearTimeout(timer);
  }, []);

  /**
   * Fetch services from API with optional filters.
   * @param {object} params - Query parameters for filtering services
   */
  const fetchServices = useCallback(
    async (params = {}) => {
      try {
        setLoading(prev => ({ ...prev, table: true }));
        const query = new URLSearchParams(params).toString();
        const data = await apiFetch(`/api/v1/services/${query ? `?${query}` : ''}`);
        
        // Extract services array from API response format
        // Handle DRF paginated response (results), or other common formats
        const servicesArray = data?.results || data?.data?.services || data?.services || data || [];
        setServices(Array.isArray(servicesArray) ? servicesArray : []);
      } catch (err) {
        showAlert(
          `Failed to load services: ${err.message}`,
          'failure'
        );
      } finally {
        setLoading(prev => ({ ...prev, table: false }));
      }
    },
    [showAlert]
  );

  /**
   * Create a new service with retry mechanism.
   * @param {object} serviceData - Data for the new service
   * @returns {object} Created service data
   */
  const createService = useCallback(async (serviceData) => {
    return retryOperation(async () => {
      try {
        setLoading(prev => ({ ...prev, operation: true }));
        
        // Map frontend field names to backend field names
        const backendData = {
          title: serviceData.title,
          short_description: serviceData.shortDescription || serviceData.short_description || '',
          full_description: serviceData.fullDescription || serviceData.description || serviceData.full_description || '',
          category: serviceData.category || '',
          is_published: serviceData.isPublished ?? serviceData.is_published ?? true,
          price: serviceData.price || null,
          price_suffix: serviceData.priceSuffix || serviceData.price_suffix || null,
          features: serviceData.features || [],
          benefits: serviceData.benefits || [],
          process: serviceData.process || serviceData.processSteps || [],
          faqs: serviceData.faqs || [],
          deliverables: serviceData.deliverables || [],
          timeline: serviceData.timeline || null,
          image: serviceData.image || null,
          icon: serviceData.icon || null,
        };
        
        const data = await apiFetch('/api/v1/services/', {
          method: 'POST',
          body: JSON.stringify(backendData),
        });
        const newService = data?.data?.service || data?.service || data;
        setServices(prev => [newService, ...prev]);
        showAlert('Service created successfully');
        return newService;
      } catch (error) {
        showAlert(`Create failed: ${error.message}`, 'failure');
        throw error;
      } finally {
        setLoading(prev => ({ ...prev, operation: false }));
      }
    });
  }, [retryOperation, showAlert]);

  /**
   * Update an existing service by ID with retry mechanism.
   * @param {string} id - Service ID
   * @param {object} serviceData - Updated service data
   * @returns {object} Updated service data
   */
  const updateService = useCallback(async (id, serviceData) => {
    return retryOperation(async () => {
      try {
        setLoading(prev => ({ ...prev, operation: true }));
        
        // Map frontend field names to backend field names
        const backendData = {
          title: serviceData.title,
          short_description: serviceData.shortDescription || serviceData.short_description || '',
          full_description: serviceData.fullDescription || serviceData.description || serviceData.full_description || '',
          category: serviceData.category || '',
          is_published: serviceData.isPublished ?? serviceData.is_published ?? true,
          price: serviceData.price || null,
          price_suffix: serviceData.priceSuffix || serviceData.price_suffix || null,
          features: serviceData.features || [],
          benefits: serviceData.benefits || [],
          process: serviceData.process || serviceData.processSteps || [],
          faqs: serviceData.faqs || [],
          deliverables: serviceData.deliverables || [],
          timeline: serviceData.timeline || null,
          image: serviceData.image || null,
          icon: serviceData.icon || null,
        };
        
        const data = await apiFetch(`/api/v1/services/${id}/`, {
          method: 'PUT',
          body: JSON.stringify(backendData),
        });
        const updatedService = data?.data?.service || data?.service || data;
        setServices(prev => prev.map(s => (s.id === id ? updatedService : s)));
        showAlert('Service updated successfully');
        return updatedService;
      } catch (error) {
        showAlert(`Update failed: ${error.message}`, 'failure');
        throw error;
      } finally {
        setLoading(prev => ({ ...prev, operation: false }));
      }
    });
  }, [retryOperation, showAlert]);

  /**
   * Delete a service by ID with retry mechanism.
   * @param {string} id - Service ID
   * @returns {boolean} True if deleted, false otherwise
   */
  const deleteService = useCallback(async (id) => {
    return retryOperation(async () => {
      try {
        setLoading(prev => ({ ...prev, operation: true }));
        await apiFetch(`/api/v1/services/${id}/`, { method: 'DELETE' });
        setServices(prev => prev.filter(s => s.id !== id));
        showAlert('Service deleted successfully');
        return true;
      } catch (error) {
        showAlert(
          `Delete failed: ${error.message}`,
          'failure'
        );
        throw error;
      } finally {
        setLoading(prev => ({ ...prev, operation: false }));
      }
    });
  }, [retryOperation, showAlert]);

  /**
   * Duplicate a service by ID with retry mechanism.
   * @param {string} serviceId - Service ID to duplicate
   * @returns {object} Duplicated service data
   */
  const duplicateService = useCallback(async (serviceId) => {
    return retryOperation(async () => {
      try {
        setLoading(prev => ({ ...prev, operation: true }));
        const data = await apiFetch(`/api/v1/services/${serviceId}/duplicate`, {
          method: 'POST',
        });
        const duplicatedService = data?.data?.service || data?.service || data;
        setServices(prev => [...prev, duplicatedService]);
        showAlert(`Service duplicated as "${duplicatedService.title}"`);
        return duplicatedService;
      } catch (error) {
        showAlert('Failed to duplicate service', 'failure');
        throw error;
      } finally {
        setLoading(prev => ({ ...prev, operation: false }));
      }
    });
  }, [retryOperation, showAlert]);

  /**
   * Bulk delete multiple services with retry mechanism.
   * @param {string[]} ids - Array of service IDs to delete
   * @returns {object} Deletion results
   */
  const bulkDeleteServices = useCallback(async (ids) => {
    return retryOperation(async () => {
      try {
        setLoading(prev => ({ ...prev, operation: true }));
        
        const results = { successful: [], failed: [] };
        
        for (const id of ids) {
          try {
            await apiFetch(`/api/v1/services/${id}`, { method: 'DELETE' });
            results.successful.push(id);
          } catch (error) {
            results.failed.push({ id, error: error.message });
          }
        }
        
        // Update state to remove successfully deleted services
        if (results.successful.length > 0) {
          setServices(prev => prev.filter(s => !results.successful.includes(s.id)));
          showAlert(`Successfully deleted ${results.successful.length} service(s)`);
        }
        
        if (results.failed.length > 0) {
          showAlert(`Failed to delete ${results.failed.length} service(s)`, 'failure');
        }
        
        return results;
      } catch (error) {
        showAlert('Bulk delete operation failed', 'failure');
        throw error;
      } finally {
        setLoading(prev => ({ ...prev, operation: false }));
      }
    });
  }, [retryOperation, showAlert]);

  // Expose state and handlers for use in components
  return {
    services,        // List of services
    loading,         // Loading states for UI feedback
    alert,           // Alert state for notifications
    fetchServices,   // Fetch all services
    createService,   // Create a new service
    updateService,   // Update an existing service
    deleteService,   // Delete a service
    duplicateService,// Duplicate a service
    bulkDeleteServices, // Bulk delete services
    showAlert,       // Show alert messages
  };
};
