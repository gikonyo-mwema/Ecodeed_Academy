import { useCallback, useState, useEffect } from 'react';
import { Button } from 'flowbite-react';
import PostCategorySelect from './PostCategorySelect';
import PostEditor from './PostEditor';
import PostImageUpload from './PostImageUpload';
import usePostForm from '../hooks/usePostForm';
import { apiFetch } from '../../../../utils/api';

export default function PostForm({ post, isEdit, onCancel, onSuccess, currentUser }) {
  // State to manage the image file, upload progress, and errors
  const [imageFile, setImageFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [localPreview, setLocalPreview] = useState(null);

  // Get setFormData from the hook so we can update the image URL
  const {
    formData,
    setFormData,
    isSubmitting,
    error,
    handleSubmit
  } = usePostForm(post, isEdit, currentUser, onSuccess);

// Enhanced image upload function with better error handling
  const handleImageUpload = async (event) => {
    const imageFile = event.target.files[0];
    setUploadError(null);
    setUploadProgress(0);

    if (!imageFile) return;

    if (imageFile.size > 5 * 1024 * 1024) { // 5MB limit
      setUploadError('File size must be less than 5MB');
      return;
    }

    try {
      setUploadProgress(20);
    
      const formDataToUpload = new FormData();
      formDataToUpload.append('image', imageFile);

      console.log('Uploading file:', {
        name: imageFile.name,
        type: imageFile.type,
        size: imageFile.size
      });

      // Add Authorization header with current user token for development
      const uploadOptions = {
        method: 'POST',
        body: formDataToUpload,
        // Don't set Content-Type header, let the browser set it with boundary
      };

      // Add token from Redux store if available (fallback for development)
      if (currentUser?.token) {
        uploadOptions.headers = {
          'Authorization': `Bearer ${currentUser.token}`
        };
      }

      const result = await apiFetch('/api/upload/upload', uploadOptions);

      setUploadProgress(70);

      console.log('Upload success response:', result);
      setUploadProgress(100);

      // Validate the response has the expected secureUrl
      if (!result.secureUrl) {
        throw new Error('Upload succeeded but no image URL returned');
      }

      // This line is CRITICAL - it updates the form data with the image URL
      setFormData(prev => ({ ...prev, image: result.secureUrl }));
      setUploadError(null);

      // Clear local preview after successful upload
      setTimeout(() => {
        if (localPreview) {
          URL.revokeObjectURL(localPreview);
          setLocalPreview(null);
        }
      }, 500);

    } catch (error) {
      console.error('Upload error details:', {
        message: error.message,
        stack: error.stack,
        fileName: imageFile?.name,
        fileSize: imageFile?.size,
        fileType: imageFile?.type
      });
      setUploadError(error.message || 'Failed to upload image');
    } finally {
      setUploadProgress(0);
    }
  };

  // Function to handle file selection and create preview
  const handleFileSelect = useCallback((selectedFile) => {
    setImageFile(selectedFile);
    
    // Create preview URL
    if (selectedFile) {
      const previewUrl = URL.createObjectURL(selectedFile);
      setLocalPreview(previewUrl);
    } else {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
        setLocalPreview(null);
      }
    }
    
    if (uploadError) setUploadError(null);
  }, [uploadError, localPreview]);

  // Clean up preview URLs on unmount
  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  // Memoize all change handlers to prevent unnecessary re-renders
  const handleTitleChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, title: e.target.value }));
  }, [setFormData]);

  const handleCategoryChange = useCallback((category) => {
    setFormData(prev => ({ ...prev, category }));
  }, [setFormData]);

  const handleContentChange = useCallback((content) => {
    setFormData(prev => ({ ...prev, content }));
  }, [setFormData]);

  // Memoize the form JSX to prevent unnecessary re-renders
  const formContent = (
    <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
      <div className='flex flex-col gap-4 sm:flex-row justify-between'>
        <input
          type='text'
          placeholder='Title'
          required
          value={formData.title}
          onChange={handleTitleChange}
          className='flex-1 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500 dark:text-white'
        />
        <PostCategorySelect
          value={formData.category}
          onChange={handleCategoryChange}
        />
      </div>

      {/* Image Upload Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Featured Image <span className="text-gray-500">(Optional if you add images in content)</span>
        </label>
        <PostImageUpload
          file={imageFile}
          setFile={handleFileSelect}
          image={formData.image}
          uploadProgress={uploadProgress}
          error={uploadError}
          onUpload={handleImageUpload}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          <strong>Featured Image:</strong> This is the main image for social media previews, 
          article headers, and thumbnail displays. You can also add images within your content using the editor toolbar.
        </p>
        {/* Show current image if editing and one already exists */}
        {isEdit && formData.image && !imageFile && (
          <div className='mt-2'>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Image:</p>
            <img
              src={formData.image}
              alt="Current post preview"
              className="w-full max-w-xs h-auto object-cover rounded-lg border"
            />
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Post Content
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          <strong>Content Images:</strong> Use the image button in the toolbar to add images 
          within your article content. These will be embedded in the text flow.
        </p>
        <PostEditor
          content={formData.content}
          onChange={handleContentChange}
          currentUser={currentUser}
        />
      </div>
      
      {(error || uploadError) && (
        <div className="p-4 text-red-700 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-100">
          {error || uploadError}
        </div>
      )}
      
      <div className="flex gap-4 pt-2">
        <Button
          type='submit'
          className="flex-1 sm:flex-none bg-gradient-to-r from-brand-green to-brand-blue hover:from-brand-blue hover:to-brand-green text-white border-0 focus:ring-4 focus:ring-brand-green/25"
          disabled={isSubmitting || uploadProgress > 0}
          isProcessing={isSubmitting}
        >
          {isEdit ? 'Update Post' : 'Publish Post'}
        </Button>
        <Button 
          color="gray" 
          onClick={onCancel}
          className="flex-1 sm:flex-none"
          disabled={isSubmitting || uploadProgress > 0}
        >
          Cancel
        </Button>
      </div>
    </form>
  );

  return (
    <div className='mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
      {formContent}
    </div>
  );
}
