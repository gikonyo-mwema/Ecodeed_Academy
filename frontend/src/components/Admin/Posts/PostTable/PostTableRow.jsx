/**
 * Post Table Row Component
 * 
 * @component
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

import React from 'react';
import { Table } from 'flowbite-react';
import { FiEdit2, FiEye } from 'react-icons/fi';

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

const STATUS_STYLES = {
  published: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  draft: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  scheduled: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  archived: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300',
};

function StatusBadge({ post }) {
  const status = post.status || 'published';
  const scheduledFor = post.scheduled_for || post.scheduledFor;
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className={`inline-flex w-fit items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
          STATUS_STYLES[status] || STATUS_STYLES.published
        }`}
      >
        {status}
      </span>
      {status === 'scheduled' && scheduledFor && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(scheduledFor).toLocaleString([], {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </span>
      )}
    </div>
  );
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
        <StatusBadge post={post} />
      </Table.Cell>
      <Table.Cell>
        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
          <FiEye className="w-3.5 h-3.5" />
          {(post.views ?? 0).toLocaleString()}
        </span>
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