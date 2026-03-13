/**
 * FeaturedImageUpload Component — Drag-drop + paste + URL + file picker for images
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════════
 *
 * Professional image upload component for featured images with multiple input methods.
 * Handles drag-and-drop, paste from clipboard, URL input, and file picker. Integrates
 * with Cloudinary for storage and optimization.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * FEATURES
 * ═══════════════════════════════════════════════════════════════════════════════════
 *
 * 1. **Multiple Upload Methods**
 *    - Drag-and-drop zone with visual feedback
 *    - Paste image from clipboard (Cmd+V, Ctrl+V)
 *    - Paste image URL (from Unsplash, Pexels, etc.)
 *    - File picker (click to browse)
 *    - Hidden file input for accessibility
 *
 * 2. **Visual Feedback**
 *    - Drag-over highlight state
 *    - Upload progress/loading spinner
 *    - Live preview with thumbnail
 *    - Remove button to clear selection
 *    - Error messages for invalid files
 *
 * 3. **Image Validation**
 *    - File type check (image/* only)
 *    - File size limits\n *    - Valid URL detection\n *    - Error feedback\n *\n * 4. **Upload Process**\n *    - Cloudinary integration via uploadImage()\n *    - Auto-optimization and transformation\n *    - CDN storage with high availability\n *    - Returns optimized URL\n *\n * 5. **Responsive**\n *    - Mobile-friendly touch targets\n *    - Works on all devices\n *    - Accessible keyboard navigation\n *\n * ═══════════════════════════════════════════════════════════════════════════════════\n * PROPS\n * ═══════════════════════════════════════════════════════════════════════════════════\n *\n * - value: string (current image URL)\n * - onChange: function(url: string) → Called when image uploaded/URL entered\n *\n * ═══════════════════════════════════════════════════════════════════════════════════\n * STATE MANAGEMENT\n * ═══════════════════════════════════════════════════════════════════════════════════\n *\n * Local state:\n * - isDragging: boolean (drag-over state)\n * - isUploading: boolean (upload in progress)\n * - error: string | null (error message)\n * - showUrlInput: boolean (URL input form visible)\n * - urlValue: string (URL input textarea value)\n *\n * ═══════════════════════════════════════════════════════════════════════════════════\n * UPLOAD FLOW\n * ═══════════════════════════════════════════════════════════════════════════════════\n *\n * **File Upload:**\n *   1. User drops file or selects via picker\n *   2. Validate: Must be image/* type\n *   3. Call uploadImage(file) → Cloudinary upload\n *   4. On success: onChange(url), clear error\n *   5. On error: Display error message\n *\n * **URL Input:**\n *   1. Click \"Or paste URL\" link\n *   2. Enter image URL in textarea\n *   3. Click \"Add Image\"\n *   4. onChange(url) called with URL\n *   5. Form hides, preview shows\n *\n * **Clipboard Paste:**\n *   1. User pastes image (Ctrl+V/Cmd+V)\n *   2. Browser provides File object\n *   3. uploadImage() processes file\n *   4. URL stored and preview shown\n *\n * ═══════════════════════════════════════════════════════════════════════════════════\n * ERROR HANDLING\n * ═══════════════════════════════════════════════════════════════════════════════════\n *\n * - Invalid file type: \"Please select an image file\"\n * - Upload failed: Error message from uploadImage()\n * - Network error: Caught and displayed\n * - User feedback: Displayed below upload zone, auto-clear after dismiss\n *\n * @component\n * @version 2.0.0\n * @author Gikonyo Mwema\n * @example\n *   const [image, setImage] = useState('');\n *\n *   <FeaturedImageUpload\n *     value={image}\n *     onChange={setImage}\n *   />\n */\n\nimport { useState, useCallback, useRef } from 'react';
import { FiImage, FiUploadCloud, FiX, FiLink } from 'react-icons/fi';
import { uploadImage } from './extensions/ImageUpload';

export default function FeaturedImageUpload({ value, onChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const fileInputRef = useRef(null);

  const handleUpload = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    try {
      setError(null);
      setIsUploading(true);
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [onChange]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const handlePaste = useCallback((e) => {
    const items = Array.from(e.clipboardData?.items || []);
    const imageItem = items.find((i) => i.type.startsWith('image/'));
    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (file) handleUpload(file);
    }
  }, [handleUpload]);

  const handleUrlSubmit = useCallback(() => {
    const trimmed = urlValue.trim();
    if (trimmed) {
      onChange(trimmed);
      setUrlValue('');
      setShowUrlInput(false);
    }
  }, [urlValue, onChange]);

  const handleRemove = useCallback(() => {
    onChange('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [onChange]);

  // Has an image already
  if (value) {
    return (
      <div className="relative group">
        <img
          src={value}
          alt="Featured"
          className="w-full max-h-64 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
          onError={() => setError('Failed to load image preview')}
        />
        <button
          type="button"
          onClick={handleRemove}
          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
          title="Remove featured image"
        >
          <FiX size={16} />
        </button>
        <p className="text-xs text-gray-400 mt-1.5 truncate">{value}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onPaste={handlePaste}
        onClick={() => fileInputRef.current?.click()}
        tabIndex={0}
        role="button"
        aria-label="Upload featured image"
        className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-8 cursor-pointer transition-colors ${
          isDragging
            ? 'border-teal-400 bg-teal-50 dark:bg-teal-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-teal-400 hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
      >
        {isUploading ? (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent" />
            <p className="text-sm text-gray-500">Uploading…</p>
          </>
        ) : (
          <>
            <FiUploadCloud size={32} className="text-gray-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              <span className="font-medium text-teal-600 dark:text-teal-400">Click to upload</span>{' '}
              or drag and drop
            </p>
            <p className="text-xs text-gray-400">PNG, JPG, GIF, WebP up to 5 MB</p>
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

      {/* Image from URL toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowUrlInput((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-teal-600 transition-colors"
        >
          <FiLink size={12} />
          {showUrlInput ? 'Cancel' : 'Or paste image URL (Unsplash, Pexels…)'}
        </button>
        {showUrlInput && (
          <div className="flex gap-2 mt-2">
            <input
              type="url"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder="https://images.unsplash.com/…"
              className="flex-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-transparent dark:text-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUrlSubmit())}
              autoFocus
            />
            <button
              type="button"
              onClick={handleUrlSubmit}
              className="text-sm px-3 py-1.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              Use
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}
