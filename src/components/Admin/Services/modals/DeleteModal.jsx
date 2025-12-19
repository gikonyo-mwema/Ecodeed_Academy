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