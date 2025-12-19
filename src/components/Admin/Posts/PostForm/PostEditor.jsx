import React, { lazy, Suspense, useRef, useCallback, useMemo, useEffect, forwardRef } from 'react';
import { modules, formats } from "../../../../editorConfig.js";
import { uploadToCloudinary } from '../../../../utils/cloudinary.js';
import { apiFetch } from '../../../../utils/api';

const ReactQuill = lazy(() => import('react-quill').then(module => ({ default: module.default })));
import 'react-quill/dist/quill.snow.css';

// Helper to forward the ref
function forwardQuillRef(forwardedRef, quillRef) {
  if (!forwardedRef) return;
  if (typeof forwardedRef === 'function') {
    forwardedRef(quillRef.current);
  } else {
    forwardedRef.current = quillRef.current;
  }
}

const PostEditor = forwardRef(({ content, onChange, currentUser }, ref) => {
  const quillRef = useRef(null);

  // Forward the ref
  useEffect(() => {
    forwardQuillRef(ref, quillRef);
  }, [ref]);

  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      console.log('PostEditor: Image selected:', file.name, file.type, file.size);

      const quill = quillRef.current?.getEditor();
      const range = quill?.getSelection();
      
      if (!range) {
        console.error('PostEditor: No selection range available');
        return;
      }

      try {
        const originalRange = range.index;
        console.log('PostEditor: Inserting placeholder at range:', originalRange);
        
        // Insert placeholder image with loading text
        quill.insertEmbed(
          originalRange, 
          'image', 
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+'
        );
        quill.setSelection(originalRange + 1);

        console.log('PostEditor: Starting upload...');
        
        // Upload to your backend API (which handles Cloudinary)
        const formData = new FormData();
        formData.append('image', file);

        // Prepare upload options with authentication
        const uploadOptions = {
          method: 'POST',
          body: formData,
        };

        // Add token from Redux store if available (fallback for development)
        if (currentUser?.token) {
          uploadOptions.headers = {
            'Authorization': `Bearer ${currentUser.token}`
          };
        }

        const result = await apiFetch('/api/upload/upload', uploadOptions);

        console.log('PostEditor: Upload success:', result);
        
        // Replace placeholder with actual image
        quill.deleteText(originalRange, 1);
        quill.insertEmbed(originalRange, 'image', result.secureUrl);

        // Wait for Quill to render the image before adding attributes
        setTimeout(() => {
          const imgElements = quill.root.querySelectorAll(`img[src="${result.secureUrl}"]`);
          if (imgElements.length > 0) {
            const imgElement = imgElements[0];
            imgElement.classList.add('ql-image-uploaded');
            imgElement.setAttribute('data-cloudinary-id', result.public_id || 'content-image');
            imgElement.setAttribute('alt', 'Post content image');
            imgElement.style.maxWidth = '100%';
            imgElement.style.height = 'auto';
            console.log('PostEditor: Image attributes set:', imgElement);
          }
        }, 100);
        
        quill.setSelection(originalRange + 1);
        console.log('PostEditor: Image upload complete');
        
      } catch (error) {
        console.error('PostEditor: Image upload failed:', error);
        // Replace placeholder with error message
        quill.deleteText(originalRange, 1);
        quill.insertText(originalRange, '[Image upload failed: ' + error.message + ']', { 
          color: 'red',
          italic: true
        });
      }
    };
  }, []);

  const editorModules = useMemo(() => {
    const baseModules = modules(quillRef);
    return {
      ...baseModules,
      toolbar: {
        ...baseModules.toolbar,
        handlers: {
          ...baseModules.toolbar?.handlers,
          image: imageHandler
        }
      }
    };
  }, [imageHandler]);

  const EditorComponent = useMemo(() => (
    <ReactQuill
      ref={quillRef}
      theme="snow"
      placeholder="Write your post content here..."
      className="min-h-[300px] bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
      value={content}
      onChange={onChange}
      modules={editorModules}
      formats={formats}
      preserveWhitespace
    />
  ), [content, onChange, editorModules]);

  return (
    <div className="editor-container border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden mb-4">
      <Suspense fallback={
        <div className="h-72 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading editor...</p>
        </div>
      }>
        {EditorComponent}
      </Suspense>
    </div>
  );
});

export default PostEditor;