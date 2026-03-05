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
