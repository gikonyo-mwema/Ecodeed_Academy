import { useState, useCallback, useRef } from 'react';
import { 
  Button, 
  Label, 
  TextInput,
  Modal,
  Spinner
} from 'flowbite-react';
import { 
  HiOutlinePhotograph, 
  HiOutlineUpload, 
  HiOutlineX, 
  HiOutlineLink,
  HiOutlineEye,
  HiOutlineCheck
} from 'react-icons/hi';
import { uploadImage } from '../../Editor/extensions/ImageUpload';

const FeaturedImageUpload = ({ value, onChange, label = "Course Thumbnail" }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, GIF, etc.)');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const imageUrl = await uploadImage(file);
      onChange(imageUrl);
    } catch (err) {
      setError(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setIsDragging(false);

    const files = Array.from(event.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (!imageFile) {
      setError('Please drop an image file (JPEG, PNG, GIF, etc.)');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const imageUrl = await uploadImage(imageFile);
      onChange(imageUrl);
    } catch (err) {
      setError(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handlePaste = async (event) => {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    const imageItem = Array.from(items).find(item => item.type.startsWith('image/'));
    
    if (imageItem) {
      const blob = imageItem.getAsFile();
      setIsUploading(true);
      setError(null);

      try {
        const imageUrl = await uploadImage(blob);
        onChange(imageUrl);
      } catch (err) {
        setError(err.message || 'Failed to upload image. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (urlValue.trim()) {
      onChange(urlValue.trim());
      setUrlValue('');
      setShowUrlInput(false);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setError(null);
  };

  const handlePreview = () => {
    setShowPreviewModal(true);
  };

  return (
    <div className="space-y-3">
      <Label value={label} />
      
      {/* Has an image already */}
      {value ? (
        <div className="relative group">
          <div className="flex flex-col">
            <img
              src={value}
              alt="Thumbnail preview"
              className="w-full max-h-64 object-cover rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer"
              onError={() => setError('Failed to load image preview')}
              onClick={handlePreview}
            />
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                color="light"
                onClick={handlePreview}
                className="flex items-center gap-1"
              >
                <HiOutlineEye className="w-4 h-4" /> Preview
              </Button>
              <Button
                size="sm"
                color="failure"
                onClick={handleRemove}
                className="flex items-center gap-1"
              >
                <HiOutlineX className="w-4 h-4" /> Remove
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1.5 truncate">{value}</p>
        </div>
      ) : (
        /* Upload zone */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onPaste={handlePaste}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              fileInputRef.current?.click();
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Upload featured image"
          className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-lg p-8 cursor-pointer transition-colors ${
            isDragging
              ? 'border-brand-green bg-brand-green/10 dark:bg-brand-green/5'
              : 'border-gray-300 dark:border-gray-600 hover:border-brand-green hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Spinner size="lg" />
              <p className="text-sm text-gray-500 mt-2">Uploading image...</p>
            </div>
          ) : (
            <>
              <HiOutlinePhotograph size={32} className="text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                <span className="font-medium text-brand-green">Click to upload</span>{' '}
                or drag and drop
              </p>
              <p className="text-xs text-gray-400">JPG, PNG, GIF, WebP up to 5 MB</p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      )}

      {/* Image from URL toggle */}
      {!value && (
        <div>
          <button
            type="button"
            onClick={() => setShowUrlInput((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-green transition-colors"
          >
            <HiOutlineLink size={12} />
            {showUrlInput ? 'Cancel' : 'Or enter image URL'}
          </button>
          {showUrlInput && (
            <form onSubmit={handleUrlSubmit} className="flex gap-2 mt-2">
              <TextInput
                type="url"
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1"
              />
              <Button type="submit" size="sm" color="success">
                <HiOutlineCheck className="w-4 h-4" />
              </Button>
            </form>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/40 rounded-lg text-sm text-red-700 dark:text-red-300">
          {error}
          <button 
            onClick={() => setError(null)} 
            className="float-right text-red-500 hover:text-red-700"
          >
            <HiOutlineX className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Preview Modal */}
      <Modal show={showPreviewModal} onClose={() => setShowPreviewModal(false)} size="4xl">
        <Modal.Header>Thumbnail Preview</Modal.Header>
        <Modal.Body>
          <div className="flex justify-center">
            <img 
              src={value} 
              alt="Thumbnail preview" 
              className="max-w-full max-h-[70vh] object-contain"
              onError={() => setError('Failed to load image preview')}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowPreviewModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FeaturedImageUpload;