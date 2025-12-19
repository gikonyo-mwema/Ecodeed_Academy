import { Modal, Button, Timeline } from 'flowbite-react';
import { HiOutlineClock } from 'react-icons/hi';

const VersionHistoryModal = ({ show, onClose, history }) => {
  return (
    <Modal show={show} onClose={onClose} size="xl">
      <Modal.Header>
        <div className="flex items-center gap-2">
          <HiOutlineClock />
          Version History
        </div>
      </Modal.Header>
      <Modal.Body>
        <Timeline>
          {history.map((version, index) => (
            <Timeline.Item key={index}>
              <Timeline.Point />
              <Timeline.Content>
                <Timeline.Time>
                  {new Date(version.updatedAt).toLocaleString()}
                </Timeline.Time>
                <Timeline.Title>Version {history.length - index}</Timeline.Title>
                <Timeline.Body>
                  Updated by: {version.updatedBy?.username || 'System'}
                </Timeline.Body>
              </Timeline.Content>
            </Timeline.Item>
          ))}
        </Timeline>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default VersionHistoryModal;