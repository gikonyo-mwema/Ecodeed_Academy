 import { Modal, Button } from 'flowbite-react';

const PreviewModal = ({ show, onClose, service }) => {
  return (
    <Modal show={show} onClose={onClose} size="7xl">
      <Modal.Header>Service Preview: {service?.title}</Modal.Header>
      <Modal.Body>
        <div className="prose max-w-none">
          <h1>{service?.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: service?.fullDescription }} />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose}>Close Preview</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PreviewModal;