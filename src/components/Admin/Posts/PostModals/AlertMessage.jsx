/**
 * Alert Message Modal Component
 * 
 * @component
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

import { Alert } from 'flowbite-react';

export default function AlertMessage({ message, onDismiss }) {
  return (
    <Alert color="failure" className="mb-4" onDismiss={onDismiss}>
      {message}
    </Alert>
  );
}