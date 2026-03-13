/**
 * EditorToolbar — Substack / Ghost-style formatting toolbar for TipTap.
 *
 * Features:
 *  - Text formatting (bold, italic, underline, strike, code)
 *  - Heading levels (1-4)
 *  - Lists (ordered, unordered)
 *  - Alignment (left, center, right, justify)
 *  - Links, images (upload + URL), YouTube embeds
 *  - Tables (insert, add/remove row/col)
 *  - Callout blocks (info, warning, success, danger)
 *  - Code blocks with language selection
 *  - Undo / Redo
 *  - Character & word count
 *
 * @component
 */
import { useCallback, useState, useRef, useEffect } from 'react';
import {
  FiBold, FiItalic, FiUnderline, FiCode, FiImage, FiLink,
  FiAlignLeft, FiAlignCenter, FiAlignRight, FiAlignJustify,
  FiList, FiMinus, FiCornerUpLeft, FiCornerUpRight, FiType,
  FiYoutube, FiGrid, FiInfo, FiChevronDown, FiGlobe,
} from 'react-icons/fi';
import {
  FaStrikethrough, FaListOl, FaQuoteLeft, FaSuperscript, FaSubscript,
  FaHighlighter, FaTable,
} from 'react-icons/fa';

// ---------------------------------------------------------------------------
// Toolbar button
// ---------------------------------------------------------------------------
function ToolbarButton({ onClick, isActive, disabled, title, children, className = '' }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); // keep editor focus
        onClick?.();
      }}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        isActive
          ? 'bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />;
}

// ---------------------------------------------------------------------------
// Dropdown wrapper (closes on outside click)
// ---------------------------------------------------------------------------
function Dropdown({ trigger, children, className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          setOpen((o) => !o);
        }}
        className="flex items-center gap-1 px-2 py-1.5 rounded text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        {trigger}
        <FiChevronDown size={12} />
      </button>
      {open && (
        <div
          className={`absolute z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1 ${className}`}
          onMouseDown={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Link input popover
// ---------------------------------------------------------------------------
function LinkPopover({ editor, onClose }) {
  const [url, setUrl] = useState(editor.getAttributes('link').href || '');

  const apply = () => {
    if (url.trim()) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
    } else {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }
    onClose();
  };

  return (
    <div className="absolute z-50 mt-1 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3 flex gap-2 items-center min-w-[320px]">
      <FiGlobe size={16} className="text-gray-400 flex-shrink-0" />
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com"
        className="flex-1 text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-transparent dark:text-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
        onKeyDown={(e) => e.key === 'Enter' && apply()}
        autoFocus
      />
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); apply(); }}
        className="text-sm px-3 py-1 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
      >
        Apply
      </button>
      {editor.isActive('link') && (
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().unsetLink().run();
            onClose();
          }}
          className="text-sm px-2 py-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
        >
          Remove
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Image URL input popover
// ---------------------------------------------------------------------------
function ImageUrlPopover({ editor, onClose }) {
  const [url, setUrl] = useState('');

  const apply = () => {
    if (url.trim()) {
      editor.chain().focus().setImage({ src: url.trim() }).run();
    }
    onClose();
  };

  return (
    <div className="absolute z-50 mt-1 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3 flex gap-2 items-center min-w-[360px]">
      <FiImage size={16} className="text-gray-400 flex-shrink-0" />
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste image URL (Unsplash, Pexels…)"
        className="flex-1 text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-transparent dark:text-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
        onKeyDown={(e) => e.key === 'Enter' && apply()}
        autoFocus
      />
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); apply(); }}
        className="text-sm px-3 py-1 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
      >
        Insert
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// YouTube URL input popover
// ---------------------------------------------------------------------------
function YouTubePopover({ editor, onClose }) {
  const [url, setUrl] = useState('');

  const apply = () => {
    if (url.trim()) {
      editor.chain().focus().setYoutubeVideo({ src: url.trim() }).run();
    }
    onClose();
  };

  return (
    <div className="absolute z-50 mt-1 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3 flex gap-2 items-center min-w-[360px]">
      <FiYoutube size={16} className="text-gray-400 flex-shrink-0" />
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://youtube.com/watch?v=…"
        className="flex-1 text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-transparent dark:text-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
        onKeyDown={(e) => e.key === 'Enter' && apply()}
        autoFocus
      />
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); apply(); }}
        className="text-sm px-3 py-1 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
      >
        Embed
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main toolbar component
// ---------------------------------------------------------------------------
export default function EditorToolbar({ editor }) {
  const [showLink, setShowLink] = useState(false);
  const [showImageUrl, setShowImageUrl] = useState(false);
  const [showYouTube, setShowYouTube] = useState(false);

  const closeAll = useCallback(() => {
    setShowLink(false);
    setShowImageUrl(false);
    setShowYouTube(false);
  }, []);

  if (!editor) return null;

  const icon = 16;

  return (
    <div className="sticky top-0 z-30 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600 px-2 py-1.5 flex flex-wrap items-center gap-0.5">

      {/* ── Heading dropdown ───────────────────────────── */}
      <Dropdown trigger={<><FiType size={icon} /> Heading</>} className="min-w-[160px]">
        {[1, 2, 3, 4].map((level) => (
          <button
            key={level}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleHeading({ level }).run();
            }}
            className={`block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
              editor.isActive('heading', { level }) ? 'text-teal-600 font-semibold' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            Heading {level}
          </button>
        ))}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().setParagraph().run();
          }}
          className={`block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
            editor.isActive('paragraph') && !editor.isActive('heading') ? 'text-teal-600 font-semibold' : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          Paragraph
        </button>
      </Dropdown>

      <Divider />

      {/* ── Text formatting ────────────────────────────── */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold (Ctrl+B)">
        <FiBold size={icon} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic (Ctrl+I)">
        <FiItalic size={icon} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline (Ctrl+U)">
        <FiUnderline size={icon} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough">
        <FaStrikethrough size={icon - 2} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Inline code">
        <FiCode size={icon} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} title="Highlight">
        <FaHighlighter size={icon - 2} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleSuperscript().run()} isActive={editor.isActive('superscript')} title="Superscript">
        <FaSuperscript size={icon - 2} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleSubscript().run()} isActive={editor.isActive('subscript')} title="Subscript">
        <FaSubscript size={icon - 2} />
      </ToolbarButton>

      <Divider />

      {/* ── Alignment ──────────────────────────────────── */}
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align left">
        <FiAlignLeft size={icon} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align center">
        <FiAlignCenter size={icon} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align right">
        <FiAlignRight size={icon} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} title="Justify">
        <FiAlignJustify size={icon} />
      </ToolbarButton>

      <Divider />

      {/* ── Lists & blocks ─────────────────────────────── */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet list">
        <FiList size={icon} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numbered list">
        <FaListOl size={icon - 2} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Blockquote">
        <FaQuoteLeft size={icon - 2} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Code block">
        <span className="text-xs font-mono">{'{}'}</span>
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule">
        <FiMinus size={icon} />
      </ToolbarButton>

      <Divider />

      {/* ── Callout dropdown ───────────────────────────── */}
      <Dropdown trigger={<><FiInfo size={icon} /> Callout</>} className="min-w-[140px]">
        {[
          { type: 'info', label: 'ℹ️ Info' },
          { type: 'warning', label: '⚠️ Warning' },
          { type: 'success', label: '✅ Success' },
          { type: 'danger', label: '❌ Danger' },
        ].map(({ type, label }) => (
          <button
            key={type}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleCallout({ type }).run();
            }}
            className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {label}
          </button>
        ))}
      </Dropdown>

      {/* ── Table dropdown ─────────────────────────────── */}
      <Dropdown trigger={<><FaTable size={icon - 2} /> Table</>} className="min-w-[170px]">
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
          }}
          className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Insert table (3×3)
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addColumnAfter().run(); }}
          className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          disabled={!editor.can().addColumnAfter()}
        >
          Add column →
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addRowAfter().run(); }}
          className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          disabled={!editor.can().addRowAfter()}
        >
          Add row ↓
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteColumn().run(); }}
          className="block w-full text-left px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
          disabled={!editor.can().deleteColumn()}
        >
          Delete column
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteRow().run(); }}
          className="block w-full text-left px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
          disabled={!editor.can().deleteRow()}
        >
          Delete row
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteTable().run(); }}
          className="block w-full text-left px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
          disabled={!editor.can().deleteTable()}
        >
          Delete table
        </button>
      </Dropdown>

      <Divider />

      {/* ── Media: link, image, YouTube ─────────────────── */}
      <div className="relative">
        <ToolbarButton
          onClick={() => { closeAll(); setShowLink((v) => !v); }}
          isActive={editor.isActive('link')}
          title="Insert link (Ctrl+K)"
        >
          <FiLink size={icon} />
        </ToolbarButton>
        {showLink && <LinkPopover editor={editor} onClose={() => setShowLink(false)} />}
      </div>

      {/* Image — split button: click = file picker, dropdown = URL */}
      <ToolbarButton onClick={() => editor.commands.uploadImage()} title="Upload image">
        <FiImage size={icon} />
      </ToolbarButton>
      <div className="relative">
        <ToolbarButton
          onClick={() => { closeAll(); setShowImageUrl((v) => !v); }}
          title="Image from URL"
        >
          <FiGlobe size={12} />
        </ToolbarButton>
        {showImageUrl && <ImageUrlPopover editor={editor} onClose={() => setShowImageUrl(false)} />}
      </div>

      <div className="relative">
        <ToolbarButton
          onClick={() => { closeAll(); setShowYouTube((v) => !v); }}
          title="Embed YouTube"
        >
          <FiYoutube size={icon} />
        </ToolbarButton>
        {showYouTube && <YouTubePopover editor={editor} onClose={() => setShowYouTube(false)} />}
      </div>

      <Divider />

      {/* ── Undo / Redo ────────────────────────────────── */}
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)">
        <FiCornerUpLeft size={icon} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Shift+Z)">
        <FiCornerUpRight size={icon} />
      </ToolbarButton>

      {/* ── Stats (far right) ──────────────────────────── */}
      <div className="ml-auto text-xs text-gray-400 dark:text-gray-500 select-none tabular-nums">
        {editor.storage.characterCount?.words() ?? 0} words ·{' '}
        {editor.storage.characterCount?.characters() ?? 0} chars
      </div>
    </div>
  );
}
