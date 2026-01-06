import { useState, useCallback } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

/**
 * Custom hook for managing services in the admin panel.
 * Handles CRUD, bulk operations, version history, alerts, and retry mechanisms.
 */
export const useServices = () => {
  const { currentUser } = useSelector((state) => state.user);
  
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
   * Get axios config with proper authentication headers
   */
  const getAxiosConfig = useCallback(() => {
    const token = currentUser?.token || localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        // Let axios set Content-Type for FormData; default to JSON for objects in calls below
      },
      withCredentials: true,
    };
  }, [currentUser]);

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
        const { data } = await axios.get('/api/services', {
          params,
          ...getAxiosConfig(),
        });
        
        // Extract services array from API response format
        const servicesArray = data?.data?.services || data?.services || data || [];
        setServices(servicesArray);
      } catch (err) {
        console.error('Error fetching services:', err);
        showAlert(
          `Failed to load services: ${err.response?.data?.message || err.message}`,
          'failure'
        );
      } finally {
        setLoading(prev => ({ ...prev, table: false }));
      }
    },
    [showAlert, getAxiosConfig]
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
        const { data } = await axios.post('/api/services', serviceData, {
          ...getAxiosConfig(),
          headers: { 'Content-Type': 'application/json', ...(getAxiosConfig().headers || {}) }
        });
        const newService = data?.data?.service || data?.service || data;
        setServices(prev => [newService, ...prev]);
        showAlert('Service created successfully');
        return newService;
      } catch (error) {
        console.error('Create failed:', error);
        console.error('Error response:', error.response?.data);
        const fieldErrors = error.response?.data?.errors;
        if (fieldErrors && typeof fieldErrors === 'object') {
          const firstKey = Object.keys(fieldErrors)[0];
          const firstMsg = fieldErrors[firstKey];
          showAlert(`Validation failed: ${firstKey} → ${firstMsg}`, 'failure');
        } else {
          showAlert(
            `Create failed: ${error.response?.data?.message || error.message}`,
            'failure'
          );
        }
        throw error;
      } finally {
        setLoading(prev => ({ ...prev, operation: false }));
      }
    });
  }, [retryOperation, getAxiosConfig, showAlert]);

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
        const { data } = await axios.put(`/api/services/${id}`, serviceData, getAxiosConfig());
        const updatedService = data?.data?.service || data?.service || data;
        setServices(prev => prev.map(s => (s._id === id ? updatedService : s)));
        showAlert('Service updated successfully');
        return updatedService;
      } catch (error) {
        console.error('Update failed:', error);
        showAlert(
          `Update failed: ${error.response?.data?.message || error.message}`,
          'failure'
        );
        throw error;
      } finally {
        setLoading(prev => ({ ...prev, operation: false }));
      }
    });
  }, [retryOperation, getAxiosConfig, showAlert]);

  /**
   * Delete a service by ID with retry mechanism.
   * @param {string} id - Service ID
   * @returns {boolean} True if deleted, false otherwise
   */
  const deleteService = useCallback(async (id) => {
    return retryOperation(async () => {
      try {
        setLoading(prev => ({ ...prev, operation: true }));
        await axios.delete(`/api/services/${id}`, getAxiosConfig());
        setServices(prev => prev.filter(s => s._id !== id));
        showAlert('Service deleted successfully');
        return true;
      } catch (error) {
        console.error('Delete failed:', error);
        showAlert(
          `Delete failed: ${error.response?.data?.message || error.message}`,
          'failure'
        );
        throw error;
      } finally {
        setLoading(prev => ({ ...prev, operation: false }));
      }
    });
  }, [retryOperation, getAxiosConfig, showAlert]);

  /**
   * Duplicate a service by ID with retry mechanism.
   * @param {string} serviceId - Service ID to duplicate
   * @returns {object} Duplicated service data
   */
  const duplicateService = useCallback(async (serviceId) => {
    return retryOperation(async () => {
      try {
        setLoading(prev => ({ ...prev, operation: true }));
        const { data } = await axios.post(
          `/api/services/${serviceId}/duplicate`,
          {},
          getAxiosConfig()
        );
        const duplicatedService = data?.data?.service || data?.service || data;
        setServices(prev => [...prev, duplicatedService]);
        showAlert(`Service duplicated as "${duplicatedService.title}"`);
        return duplicatedService;
      } catch (error) {
        console.error('Duplicate failed:', error);
        showAlert('Failed to duplicate service', 'failure');
        throw error;
      } finally {
        setLoading(prev => ({ ...prev, operation: false }));
      }
    });
  }, [retryOperation, getAxiosConfig, showAlert]);

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
            await axios.delete(`/api/services/${id}`, getAxiosConfig());
            results.successful.push(id);
          } catch (error) {
            results.failed.push({ id, error: error.response?.data?.message || error.message });
          }
        }
        
        // Update state to remove successfully deleted services
        if (results.successful.length > 0) {
          setServices(prev => prev.filter(s => !results.successful.includes(s._id)));
          showAlert(`Successfully deleted ${results.successful.length} service(s)`);
        }
        
        if (results.failed.length > 0) {
          showAlert(`Failed to delete ${results.failed.length} service(s)`, 'failure');
        }
        
        return results;
      } catch (error) {
        console.error('Bulk delete failed:', error);
        showAlert('Bulk delete operation failed', 'failure');
        throw error;
      } finally {
        setLoading(prev => ({ ...prev, operation: false }));
      }
    });
  }, [retryOperation, getAxiosConfig, showAlert]);

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
