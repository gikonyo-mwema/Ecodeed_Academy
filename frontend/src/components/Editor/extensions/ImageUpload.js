/**
 * Image Upload Extension for TipTap Editor — Multi-method image insertion with upload.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * Extends TipTap's built-in Image node with rich upload capabilities:
 * drag-and-drop, paste from clipboard, file picker, and URL insertion.
 * Handles upload progress with placeholder SVG, automatic Cloudinary uploads,
 * and graceful error handling with cleanup.\n *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * UPLOAD METHODS
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 1. Drag & Drop: Drop images directly onto editor
 * 2. Paste: Ctrl+V / Cmd+V or paste from clipboard data
 * 3. File Picker: toolbar button → opens native file dialog
 * 4. URL Paste: Paste raw image URL (Unsplash, Pexels, etc.)\n *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * UPLOAD FLOW
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 1. File validation: Check MIME type (image/*), size (5 MB max)
 * 2. Placeholder insertion: Insert SVG loading indicator
 * 3. API upload: POST to /api/v1/upload/upload with FormData
 * 4. URL replacement: Replace placeholder with Cloudinary secure URL
 * 5. Error cleanup: Remove placeholder if upload fails\n *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * API ENDPOINT
 * ═══════════════════════════════════════════════════════════════════════════════════
 * POST /api/v1/upload/upload
 *
 * Request: FormData with file field 'image'
 * Response: { secureUrl: 'https://res.cloudinary.com/...' }
 *
 * Max file size: 5 MB (enforced client + server)\n *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * EDITOR COMMANDS
 * ═══════════════════════════════════════════════════════════════════════════════════
 * editor.chain().focus().uploadImage().run()
 *   → Opens native file picker, uploads multiple images
 *
 * editor.chain().focus().setImageFromUrl(url).run()
 *   → Inserts image by URL (no upload)\n *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * PLACEHOLDER RENDERING
 * ═══════════════════════════════════════════════════════════════════════════════════
 * Data URL SVG while uploading:
 *   <svg>
 *     <rect fill="#f3f4f6" rx="8"/> (Tailwind gray-100)
 *     <text "Uploading…" fill="#9ca3af"/> (Tailwind gray-400)
 *   </svg>\n *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * ERROR HANDLING
 * ═══════════════════════════════════════════════════════════════════════════════════
 * • MIME type check: Only image/* files accepted
 * • Size validation: 5 MB max (with helpful error message)
 * • Upload failure: Removes placeholder, throws error to parent
 * • No URL returned: Throws error if Cloudinary response missing\n *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * USAGE IN EDITOR COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════════
 * import ImageUpload from '@/components/Editor/extensions/ImageUpload';
 * import { useEditor, EditorContent } from '@tiptap/react';
 *
 * const editor = useEditor({
 *   extensions: [ImageUpload, ...otherExtensions],
 * });
 *
 * // Toolbar button for file picker:
 * <button onClick={() => editor.chain().focus().uploadImage().run()}>
 *   📷 Upload Image
 * </button>\n *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * HTML ATTRIBUTES
 * ═══════════════════════════════════════════════════════════════════════════════════
 * • loading="lazy": Deferred image loading
 * • decoding="async": Async image decode (non-blocking)\n *
 * @extension ImageUploadExtension
 * @type {TipTap Node Extension}
 * @version 1.0.0
 * @author Gikonyo Mwema
 * @tiptap-api https://tiptap.dev/guide/extending-nodes
 */

/**
 * Custom TipTap Image Extension — Drag-and-drop, paste, and file-picker upload.
 *
 * Extends the built-in Image node to add:
 *  - Drag-and-drop images onto the editor
 *  - Paste images from clipboard
 *  - File picker via toolbar button
 *  - Upload progress placeholder
 *  - Automatic Cloudinary upload via /api/v1/upload/upload
 *
 * @module ImageUpload
 */
import Image from '@tiptap/extension-image';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { apiFetch } from '../../../utils/api';

const UPLOAD_ENDPOINT = '/api/v1/upload/upload';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB (matches backend limit)

/**
 * Upload a single image file to the backend.
 * Returns the Cloudinary secure URL.
 */
export async function uploadImage(file) {
  if (!file) throw new Error('No file provided');
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max is 10 MB.`);
  }

  const formData = new FormData();
  formData.append('image', file);

  const result = await apiFetch(UPLOAD_ENDPOINT, {
    method: 'POST',
    body: formData,
  });

  if (!result?.secureUrl) {
    throw new Error('Upload succeeded but no image URL returned');
  }

  return result.secureUrl;
}

/**
 * Insert a loading placeholder, upload the file, then replace with the real image.
 */
async function handleImageFile(file, view) {
  const { state, dispatch } = view;
  const PLACEHOLDER = 'data:image/svg+xml;base64,' +
    btoa(
      `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150">
        <rect width="100%" height="100%" fill="#f3f4f6" rx="8"/>
        <text x="50%" y="50%" font-family="system-ui" font-size="14" fill="#9ca3af"
              text-anchor="middle" dy=".3em">Uploading…</text>
      </svg>`
    );

  // Insert placeholder at current cursor (or end)
  const pos = state.selection.from;
  let tr = state.tr.replaceWith(
    pos,
    pos,
    state.schema.nodes.image.create({ src: PLACEHOLDER, alt: 'Uploading…' })
  );
  dispatch(tr);

  try {
    const url = await uploadImage(file);

    // Find and replace the placeholder
    const { doc } = view.state;
    doc.descendants((node, nodePos) => {
      if (node.type.name === 'image' && node.attrs.src === PLACEHOLDER) {
        const replTr = view.state.tr.setNodeMarkup(nodePos, undefined, {
          ...node.attrs,
          src: url,
          alt: file.name || 'Uploaded image',
        });
        view.dispatch(replTr);
        return false; // stop traversal
      }
    });
  } catch (err) {
    console.error('Image upload failed:', err);
    // Remove placeholder on failure
    const { doc } = view.state;
    doc.descendants((node, nodePos) => {
      if (node.type.name === 'image' && node.attrs.src === PLACEHOLDER) {
        const delTr = view.state.tr.delete(nodePos, nodePos + node.nodeSize);
        view.dispatch(delTr);
        return false;
      }
    });
    // Surface error to the user via a brief alert or toast
    // The parent component can hook into this if needed
    throw err;
  }
}

/**
 * Checks whether a File is an image (by MIME type).
 */
function isImageFile(file) {
  return file && file.type.startsWith('image/');
}

/**
 * Extended Image extension with upload capabilities.
 */
const ImageUpload = Image.extend({
  name: 'image',

  addAttributes() {
    return {
      ...this.parent?.(),
      loading: { default: 'lazy' },
      decoding: { default: 'async' },
    };
  },

  addProseMirrorPlugins() {
    const existingPlugins = this.parent?.() || [];

    return [
      ...existingPlugins,
      new Plugin({
        key: new PluginKey('imageUpload'),
        props: {
          // Handle pasted images
          handlePaste(view, event) {
            const items = Array.from(event.clipboardData?.items || []);
            const imageItem = items.find((item) => item.type.startsWith('image/'));

            if (imageItem) {
              event.preventDefault();
              const file = imageItem.getAsFile();
              if (file) handleImageFile(file, view);
              return true;
            }
            return false;
          },

          // Handle dropped images
          handleDrop(view, event) {
            const files = Array.from(event.dataTransfer?.files || []);
            const imageFiles = files.filter(isImageFile);

            if (imageFiles.length > 0) {
              event.preventDefault();
              // Upload all dropped images sequentially
              imageFiles.reduce(
                (chain, file) => chain.then(() => handleImageFile(file, view)),
                Promise.resolve()
              );
              return true;
            }
            return false;
          },
        },
      }),
    ];
  },

  /**
   * Custom command: open file picker and upload.
   * Used by the toolbar button.
   */
  addCommands() {
    return {
      ...this.parent?.(),

      uploadImage:
        () =>
        ({ view }) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.multiple = true;
          input.onchange = () => {
            const files = Array.from(input.files || []);
            files
              .filter(isImageFile)
              .reduce(
                (chain, file) => chain.then(() => handleImageFile(file, view)),
                Promise.resolve()
              );
          };
          input.click();
          return true;
        },

      /**
       * Insert image by URL (for Unsplash / Pexels paste).
       */
      setImageFromUrl:
        (url) =>
        ({ commands }) => {
          return commands.setImage({ src: url, alt: '' });
        },
    };
  },
});

export default ImageUpload;
