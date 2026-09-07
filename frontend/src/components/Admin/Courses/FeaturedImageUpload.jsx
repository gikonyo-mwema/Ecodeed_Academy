import { useState, useEffect, useRef } from 'react';
import { Button, Alert, Label } from 'flowbite-react';
import { HiOutlineUpload, HiOutlineX, HiOutlinePlus } from 'react-icons/hi';
import { apiFetch } from '../../../utils/api';

/**
 * FeaturedImageUpload Component for Course Thumbnails
 * 
 * Simplified implementation based on PostImageUpload pattern
 * Features:
 * - File input with visible upload button
 * - Local preview after file selection
 * - Upload progress indication
 * - Clear error messages
 * - Option to upload new image after initial upload
 * 
 * @component
 */
export default function FeaturedImageUpload({ value, onChange, label = "Course Thumbnail" }) {
  const [file, setFile] = useState(null);
  const [localPreview, setLocalPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [isSelectingNewImage, setIsSelectingNewImage] = useState(false);
  const fileInputRef = useRef(null);

  // Handle file selection with local preview
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, GIF, etc.)');
      return;
    }

    setFile(selectedFile);
    setError(null);
    
    // Create local preview URL
    const previewUrl = URL.createObjectURL(selectedFile);
    setLocalPreview(previewUrl);
  };

  // Upload the selected file
  const handleUploadClick = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const result = await apiFetch('/api/v1/upload/upload', {
        method: 'POST',
        body: formData,
      });
      
      // Update with uploaded image URL
      onChange(result.secureUrl || result.url);
      
      // Clear local state
      setFile(null);
      setLocalPreview(null);
      setUploadProgress(0);
      setIsSelectingNewImage(false);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle upload a new image (when one already exists)
  const handleUploadNew = () => {
    setIsSelectingNewImage(true);
    setFile(null);
    setLocalPreview(null);
    setError(null);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 0);
  };

  // Remove the uploaded image
  const handleRemove = () => {
    onChange(null);
    setFile(null);
    setLocalPreview(null);
    setError(null);
  };

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  return (
    <div className="space-y-3">
      <Label value={label} />
      
      {/* Currently uploaded image display (only if not selecting new image) */}
      {value && !isSelectingNewImage && !localPreview && (
        <div className="space-y-3">
          <div className="flex justify-center bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 p-4">
            {imageLoadFailed ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-4xl mb-2">🖼️</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Current image unavailable
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-1">
                  Upload a new image to replace it
                </p>
              </div>
            ) : (
              <img
                src={value}
                alt="Course thumbnail"
                className="w-full max-w-sm h-64 object-cover rounded-lg"
                onError={() => setImageLoadFailed(true)}
              />
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              color="light"
              size="sm"
              onClick={handleUploadNew}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <HiOutlinePlus className="w-4 h-4" /> Upload New Image
            </Button>
            <Button
              type="button"
              color="failure"
              size="sm"
              onClick={handleRemove}
              className="flex items-center justify-center gap-2"
            >
              <HiOutlineX className="w-4 h-4" /> Remove
            </Button>
          </div>
        </div>
      )}

      {/* File input and upload button (show when no image OR selecting new image OR has preview) */}
      {(!value || isSelectingNewImage || localPreview) && (
        <div className="space-y-3">
          <div className="flex gap-3 items-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:border-brand-green hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block flex-1 text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-brand-green/10 file:text-brand-green
                hover:file:bg-brand-green/20
                disabled:opacity-50"
              disabled={!!isUploading}
            />
            <Button
              type="button"
              className="bg-gradient-to-r from-brand-green to-brand-yellow hover:from-brand-green/90 hover:to-brand-yellow/90 text-white border-0 focus:ring-4 focus:ring-brand-green/25 whitespace-nowrap"
              size="sm"
              onClick={handleUploadClick}
              disabled={!file || isUploading}
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <HiOutlineUpload className="w-4 h-4 mr-1" /> Upload Image
                </>
              )}
            </Button>
          </div>

          {/* Local preview after file selection */}
          {localPreview && (
            <div className="flex justify-center">
              <img
                src={localPreview}
                alt="Preview"
                className="w-full max-w-sm h-64 object-cover rounded-lg border border-brand-green/30"
              />
            </div>
          )}

          {/* Cancel button when selecting new image */}
          {isSelectingNewImage && (
            <Button
              type="button"
              color="light"
              size="sm"
              onClick={() => {
                setIsSelectingNewImage(false);
                setFile(null);
                setLocalPreview(null);
                setError(null);
              }}
              className="w-full"
            >
              Cancel
            </Button>
          )}
        </div>
      )}

      {/* Error alert */}
      {error && (
        <Alert color="failure" onDismiss={() => setError(null)}>
          <span className="font-medium">{error}</span>
        </Alert>
      )}

      {/* File size info */}
      <p className="text-xs text-gray-500 dark:text-gray-400">Recommended: JPG, PNG (max 5 MB)</p>
    </div>
  );
}