/**
 * Post Table Row Component
 * 
 * @component
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

import React from 'react';
import { Table } from 'flowbite-react';
import { FiEdit2 } from 'react-icons/fi';

function formatCategoryLabel(value) {
  if (!value) return 'uncategorized';
  return String(value)
    .trim()
    .toLowerCase()
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function PostTableRow({ post, onEdit, onDelete }) {
  return (
    <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
      <Table.Cell>{new Date(post.updatedAt).toLocaleDateString()}</Table.Cell>
      <Table.Cell>
        <PostImagePreview image={post.image} content={post.content} title={post.title} />
      </Table.Cell>
      <Table.Cell className="font-medium text-gray-900 dark:text-white">
        {post.title}
      </Table.Cell>
      <Table.Cell className="capitalize">
        {formatCategoryLabel(post.category)}
      </Table.Cell>
      <Table.Cell>
        <button
          onClick={() => onDelete(post.id)}
          className="font-medium text-red-500 hover:underline"
        >
          Delete
        </button>
      </Table.Cell>
      <Table.Cell>
        <button
          onClick={() => onEdit(post)}
          className="font-medium text-blue-500 hover:underline flex items-center gap-1"
        >
          <FiEdit2 /> Edit
        </button>
      </Table.Cell>
    </Table.Row>
  );
}

const LOGO_FALLBACK = 'https://res.cloudinary.com/dcrubaesi/image/upload/v1737333837/ECODEED_COLORED_LOGO_wj2yy8.png';

function extractFirstImage(html) {
  if (!html) return null;
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

function PostImagePreview({ image, content, title }) {
  const [failed, setFailed] = React.useState(false);
  const src = (!image || image.trim() === '' || failed)
    ? (extractFirstImage(content) || LOGO_FALLBACK)
    : image;

  if (src === LOGO_FALLBACK) {
    return (
      <div className="w-20 h-12 bg-gray-50 dark:bg-gray-700 rounded-md overflow-hidden flex items-center justify-center">
        <img src={LOGO_FALLBACK} alt="placeholder" className="w-12 h-auto object-contain opacity-60" loading="lazy" />
      </div>
    );
  }

  return (
    <div className="w-20 h-12 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden relative">
      <img
        src={src}
        alt={title || 'Post thumbnail'}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </div>
  );
}