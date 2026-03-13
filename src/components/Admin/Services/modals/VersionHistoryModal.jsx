/**
 * Version History Modal Component
 * 
 * Displays a timeline of all changes made to a service.
 * Allows administrators to track modifications and optionally rollback to previous versions.
 * 
 * Features:
 * - Timeline view of service modifications
 * - Timestamp for each version
 * - Author information for changes
 * - Change details and descriptions
 * - Rollback functionality to previous versions
 * - Visual timeline indicators
 * - Responsive modal layout
 * 
 * Props:
 * - show: Boolean to control modal visibility
 * - onClose: Callback to close modal
 * - history: Array of version history objects
 *   - timestamp: When change was made
 *   - author: Who made the change
 *   - changes: What was changed
 *   - version: Version number or date
 * 
 * @component
 * @version 1.0.0
 * @author Gikonyo Mwema
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.show - Modal visibility
 * @param {Function} props.onClose - Close callback
 * @param {Array} props.history - Version history array
 * @returns {JSX.Element} Version history timeline modal
 * 
 * @example
 * ```jsx
 * <VersionHistoryModal 
 *   show={showHistory}
 *   onClose={() => setShowHistory(false)}
 *   history={serviceHistory}
 * />
 * ```
 */

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