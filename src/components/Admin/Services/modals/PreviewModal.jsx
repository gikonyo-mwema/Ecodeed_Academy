 /**
 * Service Preview Modal Component
 * 
 * Displays a preview of service information as it will appear to users.
 * Allows administrators to verify service content before publishing.
 * 
 * Features:
 * - Full service content preview
 * - Rich text rendering
 * - Images and media display
 * - Responsive preview layout
 * - Mobile-friendly view
 * - Read-only content display
 * - Full description rendering
 * 
 * Props:
 * - show: Boolean to control modal visibility
 * - onClose: Callback to close modal
 * - service: Service object with content to preview
 *   - title: Service title
 *   - fullDescription: Complete description with rich text
 *   - images: Associated images
 *   - features: Feature list
 * 
 * @component
 * @version 1.0.0
 * @author Gikonyo Mwema
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.show - Modal visibility
 * @param {Function} props.onClose - Close callback
 * @param {Object} props.service - Service data
 * @returns {JSX.Element} Service preview modal
 * 
 * @example
 * ```jsx
 * <PreviewModal 
 *   show={showPreview}
 *   onClose={() => setShowPreview(false)}
 *   service={serviceData}
 * />
 * ```
 */

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