 /**
 * Delete Service Modal Component
 * 
 * Confirmation dialog for deleting a service.
 * Displays service information and requires user confirmation before deletion.
 * 
 * Features:
 * - Service confirmation display
 * - Clear deletion warning
 * - Cancel and confirm buttons
 * - Loading state during deletion
 * - Service title display for confirmation
 * - Error handling for failed deletions
 * 
 * Props:
 * - show: Boolean to control modal visibility
 * - onClose: Callback to close modal without deleting
 * - service: Service object to delete (contains title)
 * - onConfirm: Callback for delete confirmation
 * - loading: Loading state during deletion
 * 
 * @component
 * @version 1.0.0
 * @author Gikonyo Mwema
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.show - Modal visibility
 * @param {Function} props.onClose - Close without delete
 * @param {Object} props.service - Service being deleted
 * @param {Function} props.onConfirm - Delete confirmation
 * @param {boolean} props.loading - Delete in progress
 * @returns {JSX.Element} Delete confirmation modal
 * 
 * @example
 * ```jsx
 * <DeleteModal 
 *   show={showDelete}
 *   service={selectedService}
 *   onConfirm={handleDelete}
 *   loading={isDeleting}
 * />
 * ```
 */

import { Modal, Button } from 'flowbite-react';

const DeleteModal = ({ show, onClose, service, onConfirm, loading }) => {
  return (
    <Modal show={show} onClose={onClose} size="md">
      <Modal.Header>Confirm Deletion</Modal.Header>
      <Modal.Body>
        <div className="text-center">
          <p className="mb-4">Are you sure you want to delete this service?</p>
          <p className="font-semibold">{service?.title}</p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="flex justify-end gap-2 w-full">
          <Button color="gray" onClick={onClose}>
            Cancel
          </Button>
          <Button
            color="failure"
            onClick={onConfirm}
            disabled={loading}
          >
            Delete Service
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteModal;