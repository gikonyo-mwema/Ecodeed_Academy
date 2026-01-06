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
        <PostImagePreview image={post.image} title={post.title} />
      </Table.Cell>
      <Table.Cell className="font-medium text-gray-900 dark:text-white">
        {post.title}
      </Table.Cell>
      <Table.Cell className="capitalize">
        {formatCategoryLabel(post.category)}
      </Table.Cell>
      <Table.Cell>
        <button
          onClick={() => onDelete(post._id)}
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

function PostImagePreview({ image, title }) {
  const defaultImage = 'https://res.cloudinary.com/dcrubaesi/image/upload/v1737333837/ECODEED_COLORED_LOGO_wj2yy8.png';
  const hasValidImage = image && image.trim() !== '';
  
  return (
    <div className="w-20 h-12 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden relative">
      <img
        src={hasValidImage ? image : defaultImage}
        alt={title || 'Post thumbnail'}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
        onError={(e) => {
          if (e.target.src !== defaultImage) {
            e.target.onerror = null;
            e.target.src = defaultImage;
          }
        }}
      />
    </div>
  );
}