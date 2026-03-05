/**
 * TipTapEditor — Drop-in replacement for React Quill.
 *
 * Powered by TipTap (same engine Substack, GitLab, and many modern CMS use).
 *
 * Features:
 *  - Full rich-text toolbar (headings, formatting, lists, alignment, tables, code blocks)
 *  - Drag-and-drop / paste image upload to Cloudinary
 *  - YouTube embed support
 *  - Callout / alert blocks
 *  - Link editing popover
 *  - Word + character count
 *  - Syntax-highlighted code blocks via lowlight / highlight.js
 *  - Auto-typography (smart quotes, em-dashes, etc.)
 *  - Keyboard shortcuts (Ctrl+B, Ctrl+I, Ctrl+K, etc.)
 *
 * Props:
 *  - content       (string)    — HTML to load on mount / reset
 *  - onChange       (fn)        — Called with HTML string on every edit
 *  - placeholder    (string)    — Shown when editor is empty
 *  - editable       (boolean)   — Toggle read-only
 *  - className      (string)    — Extra classes on the outer wrapper
 *  - minHeight      (string)    — CSS min-height for the editor area (default "300px")
 *
 * @component
 */
import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect, useRef } from 'react';

// ── Core ──────────────────────────────────────────────────────────────
import StarterKit from '@tiptap/starter-kit';

// ── Extensions ────────────────────────────────────────────────────────
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Link } from '@tiptap/extension-link';
import { Highlight } from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Superscript } from '@tiptap/extension-superscript';
import { Subscript } from '@tiptap/extension-subscript';
import { CharacterCount } from '@tiptap/extension-character-count';
import { Typography } from '@tiptap/extension-typography';
import { Youtube } from '@tiptap/extension-youtube';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';

// highlight.js (tree-shaken)
import { common, createLowlight } from 'lowlight';

// ── Custom extensions ─────────────────────────────────────────────────
import ImageUpload from './extensions/ImageUpload';
import Callout from './extensions/Callout';

// ── UI ────────────────────────────────────────────────────────────────
import EditorToolbar from './EditorToolbar';

// ── Styles ────────────────────────────────────────────────────────────
import './editor.css';

// Create lowlight with common languages
const lowlight = createLowlight(common);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function TipTapEditor({
  content = '',
  onChange,
  placeholder = 'Start writing your article…',
  editable = true,
  className = '',
  minHeight = '300px',
}) {
  // Track whether we should skip the next onChange (for programmatic setContent)
  const skipUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // We use our own code block with syntax highlighting
        codeBlock: false,
        // We use our custom image extension
        dropcursor: { color: '#14b8a6', width: 3 },
        // Disable built-in extensions we're replacing with configured versions
        strike: false,
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: '_blank' },
      }),
      Highlight.configure({ multicolor: false }),
      TextStyle,
      Color,
      Superscript,
      Subscript,
      CharacterCount,
      Typography,
      Youtube.configure({
        inline: false,
        HTMLAttributes: {
          class: 'aspect-video w-full rounded-lg my-4',
        },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({ lowlight }),
      ImageUpload.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4',
        },
      }),
      Callout,
    ],
    content,
    editable,
    onUpdate({ editor: ed }) {
      if (skipUpdate.current) {
        skipUpdate.current = false;
        return;
      }
      onChange?.(ed.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-lg max-w-none focus:outline-none',
        style: `min-height: ${minHeight}; padding: 1rem;`,
      },
    },
  });

  // Sync external `content` prop → editor (for loading existing posts)
  useEffect(() => {
    if (!editor) return;
    const currentHTML = editor.getHTML();
    // Only update if content actually differs (avoids cursor-jump loops)
    if (content !== currentHTML && content !== undefined) {
      skipUpdate.current = true;
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  // Toggle editable
  useEffect(() => {
    editor?.setEditable(editable);
  }, [editable, editor]);

  return (
    <div className={`border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-900 ${className}`}>
      {editable && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}
