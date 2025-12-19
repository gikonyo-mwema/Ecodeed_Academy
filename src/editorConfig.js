import hljs from 'highlight.js';

// ===== Font Configuration =====
const Font = typeof window !== 'undefined' ? window.Quill?.import('formats/font') : null;
if (Font) {
  Font.whitelist = [
    'arial', 
    'comic-sans', 
    'courier-new', 
    'georgia', 
    'helvetica', 
    'lucida'
  ];
}

// ===== Size Configuration =====
const Size = typeof window !== 'undefined' ? window.Quill?.import('formats/size') : null;
if (Size) {
  Size.whitelist = [
    'extra-small', 
    'small', 
    'medium', 
    'large'
  ];
}

// ===== Image Resize Functionality =====
const setupImageResize = (imgElement, editor, index) => {
  if (!imgElement) return;

  const handleSize = 8;
  const handles = ['nw', 'ne', 'sw', 'se'];
  
  // Create resize handles
  handles.forEach(handle => {
    const handleElement = document.createElement('div');
    handleElement.className = `ql-resize-handle ql-resize-${handle}`;
    handleElement.style.width = `${handleSize}px`;
    handleElement.style.height = `${handleSize}px`;
    imgElement.appendChild(handleElement);
  });

  // Resize logic
  let isResizing = false;
  let startX, startY, startWidth, startHeight;

  const startResize = (e) => {
    isResizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = parseInt(document.defaultView.getComputedStyle(imgElement).width, 10);
    startHeight = parseInt(document.defaultView.getComputedStyle(imgElement).height, 10);
    e.preventDefault();
  };

  const resize = (e) => {
    if (!isResizing) return;
    const width = startWidth + e.clientX - startX;
    const height = startHeight + e.clientY - startY;
    imgElement.style.width = `${width}px`;
    imgElement.style.height = `${height}px`;
  };

  const stopResize = () => {
    isResizing = false;
    const delta = {
      ops: [{
        retain: index,
        attributes: {
          width: imgElement.style.width,
          height: imgElement.style.height
        }
      }]
    };
    editor.updateContents(delta);
  };

  // Event listeners
  imgElement.addEventListener('mousedown', startResize);
  document.addEventListener('mousemove', resize);
  document.addEventListener('mouseup', stopResize);

  // Cleanup function
  return () => {
    imgElement.removeEventListener('mousedown', startResize);
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
  };
};

// ===== UPDATED Cloudinary Image Handler =====
const createImageHandler = (quillRef) => {
  return async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const quill = quillRef.current?.getEditor();
      const range = quill?.getSelection();
      
      if (range) {
        // Insert loading placeholder
        quill.insertEmbed(range.index, 'image', 'data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==');
        quill.setSelection(range.index + 1);

        try {
          // UPDATED: Use your consistent API endpoint instead of direct Cloudinary
          const formData = new FormData();
          formData.append('image', file);

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Upload failed');
          }

          const result = await response.json();
          
          // Replace placeholder with actual image from your API
          quill.deleteText(range.index, 1);
          quill.insertEmbed(range.index, 'image', result.secureUrl);
          
          // Add resize functionality
          const imgElement = quill.getLeaf(range.index)[0].domNode;
          imgElement.classList.add('ql-image-resizable');
          imgElement.setAttribute('data-cloudinary-id', result.public_id || 'editor-image');
          setupImageResize(imgElement, quill, range.index);
          
          quill.setSelection(range.index + 1);
        } catch (error) {
          console.error('Image upload failed:', error);
          quill.deleteText(range.index, 1);
          quill.insertText(range.index, '[Image upload failed]', { 
            color: 'red',
            italic: true
          });
        }
      }
    };
  };
};

// ===== Editor Modules Configuration =====
const getModules = (quillRef) => ({
  toolbar: {
    container: [
      [
        { header: [1, 2, 3, 4, 5, 6, false] },
        { font: Font?.whitelist || [] },
        { size: Size?.whitelist || [] },
        'bold', 'italic', 'underline', 'strike',
        { color: [] }, { background: [] },
        { script: 'super' }, { script: 'sub' }
      ],
      [
        { align: [] },
        { list: 'ordered' }, { list: 'bullet' },
        { indent: '-1' }, { indent: '+1' },
        'blockquote', 'code-block',
        'link', 'image', 'clean'
      ]
    ],
    handlers: {
      image: createImageHandler(quillRef)
    }
  },
  clipboard: {
    matchVisual: false,
  },
  syntax: {
    highlight: text => hljs.highlightAuto(text).value
  },
  history: {
    delay: 500,
    maxStack: 100,
    userOnly: true
  }
});

// ===== Supported Formats =====
const formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'script',
  'align', 'list', 'bullet', 'indent',
  'blockquote', 'code-block',
  'link', 'image'
];

// ===== Editor Styles =====
const editorStyles = `
  .ql-snow .ql-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px 8px 0 0;
  }
  
  .ql-toolbar-group {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
  }
  
  .ql-snow .ql-toolbar button,
  .ql-snow .ql-toolbar .ql-picker-label {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    transition: all 0.2s;
  }
  
  .ql-snow .ql-toolbar button:hover,
  .ql-snow .ql-toolbar .ql-picker-label:hover {
    background: #e2e8f0;
  }
  
  .ql-snow .ql-toolbar button.ql-active {
    background: #cbd5e1;
  }
  
  .ql-container.ql-snow {
    border: 1px solid #e2e8f0;
    border-top: none;
    border-radius: 0 0 8px 8px;
  }
  
  .ql-editor {
    min-height: 300px;
    font-size: 16px;
    line-height: 1.6;
    padding: 12px 15px;
  }
  
  .ql-editor.ql-blank::before {
    color: rgba(0, 0, 0, 0.6);
    font-style: normal;
    left: 15px;
  }
  
  /* Image resize styles */
  .ql-image-resizable {
    position: relative;
    max-width: 100%;
    cursor: default;
  }
  
  .ql-resize-handle {
    position: absolute;
    width: 8px;
    height: 8px;
    background-color: #4299e1;
    border: 1px solid #ffffff;
    z-index: 10;
  }
  
  .ql-resize-nw { top: -4px; left: -4px; cursor: nw-resize; }
  .ql-resize-ne { top: -4px; right: -4px; cursor: ne-resize; }
  .ql-resize-sw { bottom: -4px; left: -4px; cursor: sw-resize; }
  .ql-resize-se { bottom: -4px; right: -4px; cursor: se-resize; }
  
  /* Dark mode styles */
  .dark .ql-snow .ql-toolbar {
    background: #1e293b;
    border-color: #334155;
  }
  
  .dark .ql-snow .ql-toolbar button:hover,
  .dark .ql-snow .ql-toolbar .ql-picker-label:hover {
    background: #334155;
  }
  
  .dark .ql-snow .ql-toolbar button.ql-active {
    background: #475569;
  }
  
  .dark .ql-container.ql-snow {
    border-color: #334155;
    background: #0f172a;
  }
  
  .dark .ql-editor {
    color: #f8fafc;
  }
  
  .dark .ql-editor.ql-blank::before {
    color: #94a3b8;
  }
`;

// ===== Fix for findDOMNode warning =====
const forwardQuillRef = (ref, quillRef) => {
  if (ref) {
    if (typeof ref === 'function') {
      ref(quillRef.current);
    } else {
      ref.current = quillRef.current;
    }
  }
};

export {
  getModules as modules,
  formats,
  editorStyles,
  Font,
  Size,
  forwardQuillRef
};