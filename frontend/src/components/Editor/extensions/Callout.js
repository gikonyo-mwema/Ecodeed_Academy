/**
 * Callout/Alert Block Extension for TipTap Editor — Styled notification blocks.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * Custom TipTap extension that provides styled callout/alert blocks in rich text
 * editor. Supports multiple severity types with appropriate colors, borders, and
 * emoji icons. Fully dark mode compatible with Tailwind CSS classes.\n *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * CALLOUT TYPES
 * ═══════════════════════════════════════════════════════════════════════════════════
 * Type     | Color           | Icon | Use Case
 * ---------|-----------------|------|----------------------------------------------
 * info     | Blue            | ℹ️   | General information, neutral notes
 * warning  | Amber/Yellow    | ⚠️   | Important cautions, watch out messages
 * success  | Green           | ✅   | Confirmed actions, best practices
 * danger   | Red             | ❌   | Critical alerts, errors, do not proceed\n *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * STYLING
 * ═══════════════════════════════════════════════════════════════════════════════════
 * • Left border (4px) in type color
 * • Background: Tailwind color-50 (light) / color-900/30 (dark)
 * • Rounded right corners: rounded-r-lg
 * • Padding: p-4, margin: my-4
 * • Light/dark mode responsive via dark: prefix
 * • Icon non-editable (contenteditable: false)\n *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * EDITOR COMMANDS
 * ═══════════════════════════════════════════════════════════════════════════════════
 * editor.chain().focus().toggleCallout({ type: 'info' }).run()
 * editor.chain().focus().setCallout({ type: 'warning' }).run()
 * editor.chain().focus().unsetCallout().run()\n *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * HTML OUTPUT
 * ═══════════════════════════════════════════════════════════════════════════════════
 * <div class="callout border-l-4 rounded-r-lg p-4 my-4 ..." data-callout-type="info">
 *   <div class="callout-icon mb-1 text-lg" contenteditable="false">ℹ️</div>
 *   <div class="callout-content">
 *     <!-- Content blocks -->
 *   </div>
 * </div>\n *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * USAGE IN EDITOR COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════════
 * import Callout from '@/components/Editor/extensions/Callout';
 * import { useEditor, EditorContent } from '@tiptap/react';
 *
 * const editor = useEditor({
 *   extensions: [Callout, ...otherExtensions],
 *   content: '<div class="callout" data-callout-type="info">...',
 * });
 *
 * // In toolbar buttons:
 * <button onClick={() => editor.chain().focus().toggleCallout({ type: 'warning' }).run()}>
 *   Add Warning
 * </button>\n *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * DARK MODE EXAMPLES
 * ═══════════════════════════════════════════════════════════════════════════════════
 * Info:    bg-blue-50 dark:bg-blue-900/30 border-blue-400
 * Warning: bg-amber-50 dark:bg-amber-900/30 border-amber-400
 * Success: bg-green-50 dark:bg-green-900/30 border-green-400
 * Danger:  bg-red-50 dark:bg-red-900/30 border-red-400\n *
 * @extension CalloutExtension
 * @type {TipTap Node Extension}
 * @version 1.0.0
 * @author Gikonyo Mwema
 * @tiptap-api https://tiptap.dev/guide/extending-nodes
 */

/**
 * Callout / Alert block extension for TipTap.
 *
 * Renders as a styled container with an icon + background.
 * Types: info | warning | success | danger
 *
 * Usage in toolbar: editor.chain().focus().toggleCallout({ type: 'info' }).run()
 *
 * @module CalloutExtension
 */
import { Node, mergeAttributes } from '@tiptap/react';

const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      type: {
        default: 'info',
        parseHTML: (el) => el.getAttribute('data-callout-type') || 'info',
        renderHTML: (attrs) => ({ 'data-callout-type': attrs.type }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-callout-type]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const type = HTMLAttributes['data-callout-type'] || 'info';

    const colorMap = {
      info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-400',
      warning: 'bg-amber-50 dark:bg-amber-900/30 border-amber-400',
      success: 'bg-green-50 dark:bg-green-900/30 border-green-400',
      danger: 'bg-red-50 dark:bg-red-900/30 border-red-400',
    };

    const iconMap = {
      info: 'ℹ️',
      warning: '⚠️',
      success: '✅',
      danger: '❌',
    };

    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        class: `callout border-l-4 rounded-r-lg p-4 my-4 ${colorMap[type] || colorMap.info}`,
        'data-callout-type': type,
      }),
      [
        'div',
        { class: 'callout-icon mb-1 text-lg', contenteditable: 'false' },
        iconMap[type] || iconMap.info,
      ],
      ['div', { class: 'callout-content' }, 0], // 0 = render children here
    ];
  },

  addCommands() {
    return {
      toggleCallout:
        (attrs) =>
        ({ commands }) => {
          return commands.toggleWrap(this.name, attrs);
        },
      setCallout:
        (attrs) =>
        ({ commands }) => {
          return commands.wrapIn(this.name, attrs);
        },
      unsetCallout:
        () =>
        ({ commands }) => {
          return commands.lift(this.name);
        },
    };
  },
});

export default Callout;
