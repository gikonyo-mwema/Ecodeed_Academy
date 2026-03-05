/**
 * Custom TipTap Image Extension — Drag-and-drop, paste, and file-picker upload.
 *
 * Extends the built-in Image node to add:
 *  - Drag-and-drop images onto the editor
 *  - Paste images from clipboard
 *  - File picker via toolbar button
 *  - Upload progress placeholder
 *  - Automatic Cloudinary upload via /api/upload/upload
 *
 * @module ImageUpload
 */
import Image from '@tiptap/extension-image';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { apiFetch } from '../../../utils/api';

const UPLOAD_ENDPOINT = '/api/upload/upload';
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
