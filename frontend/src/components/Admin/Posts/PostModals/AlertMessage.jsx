import { Alert } from 'flowbite-react';

export default function AlertMessage({ message, onDismiss }) {
  return (
    <Alert color="failure" className="mb-4" onDismiss={onDismiss}>
      {message}
    </Alert>
  );
}