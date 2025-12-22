import { Button, Alert } from 'flowbite-react';
import { useState, useEffect } from 'react'; // ADDED: useState and useEffect

export default function PostImageUpload({
  file,
  setFile,
  image,
  uploadProgress,
  error,
  onUpload
}) {
  // NEW: State for local preview
  const [localPreview, setLocalPreview] = useState(null);

  // NEW: Handle file selection with preview
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(selectedFile);
    setLocalPreview(previewUrl);
    
    if (error) onUpload(null);
  };

  // NEW: Handle upload button click
  const handleUploadClick = () => {
    if (!file) return;
    
    // Create a mock event object with the selected file
    const mockEvent = {
      target: {
        files: [file]
      }
    };
    
    onUpload(mockEvent);
  };

  // NEW: Clean up preview URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  return (
    <>
      <div className='flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3'>
        <input
          type='file'
          accept='image/*'
          onChange={handleFileChange} // CHANGED: Use new handler
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          disabled={!!uploadProgress}
        />
        <Button
          type='button'
          className="bg-gradient-to-r from-brand-green to-brand-blue hover:from-brand-blue hover:to-brand-green text-white border-0 focus:ring-4 focus:ring-brand-green/25"
          size='sm'
          onClick={handleUploadClick}
          disabled={!!uploadProgress || !file}
        >
          {uploadProgress ? `Uploading ${uploadProgress}%` : 'Upload Image'}
        </Button>
      </div>
      
      {error && (
        <Alert color='failure' onDismiss={() => onUpload(null)}>
          {error}
        </Alert>
      )}
      
      {/* UPDATED: Show local preview OR uploaded image */}
      {(localPreview || image) && (
        <div className='flex justify-center mb-4'>
          <img
            src={localPreview || image} // Show local preview first, then uploaded image
            alt='Preview'
            className='w-full max-w-xs h-auto object-cover rounded-lg'
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/default-post-image.jpg';
              onUpload('Failed to load image preview');
            }}
          />
        </div>
      )}
    </>
  );
}