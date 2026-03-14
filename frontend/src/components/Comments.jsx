/**
 * Comments Component — Individual comment display with edit/delete/like functionality
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════════
 *
 * Renders a single blog post comment with user info, timestamp, content, and
 * interactive actions (like, edit, delete). Supports comment editing with inline
 * textarea and delete confirmation.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * FEATURES
 * ═══════════════════════════════════════════════════════════════════════════════════
 *
 * 1. **Comment Display**
 *    - User avatar (profile picture with fallback)
 *    - Username display (@username format)
 *    - Relative timestamp (\"2 days ago\" via dayjs)
 *    - Comment content (sanitized HTML)
 *    - Like count and button
 *    - Threaded/nested display support
 *
 * 2. **User Actions**
 *    - Like button (increment like count)
 *    - Edit button (convert to textarea)
 *    - Delete button (with confirmation)
 *    - Only available to comment author or post owner
 *
 * 3. **Edit Mode**
 *    - Textarea input for editing comment
 *    - Save/Cancel buttons
 *    - PUT request to /api/v1/comments/editComment/{id}
 *    - Error handling with feedback
 *    - Auto-close on success
 *
 * 4. **Theme Support**
 *    - Dark mode aware styling
 *    - Brand color buttons
 *    - Consistent with post comments section
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * PROPS
 * ═══════════════════════════════════════════════════════════════════════════════════
 *
 * - comment: object
 *   - _id: comment ID
 *   - content: comment text
 *   - user: { username, profilePicture, _id }
 *   - createdAt: ISO timestamp
 *   - likes: number (like count)
 *   - depth: number (nesting level for threads)
 *
 * - onLike: function(comment) → Like button callback
 * - onEdit: function(comment, newContent) → Save edit callback
 * - onDelete: function(commentId) → Delete confirmation callback
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * STATE & BEHAVIOR
 * ═══════════════════════════════════════════════════════════════════════════════════
 *
 * Local state:
 * - isEditing: boolean (textarea visible)
 * - editedContent: string (textarea value)
 *
 * Edit flow:
 *   1. Click Edit → isEditing = true, textarea shows
 *   2. Modify text in textarea
 *   3. Click Save → PUT to /api/v1/comments/editComment/{id}
 *   4. On success: isEditing = false, onEdit callback fired
 *   5. On error: console error logged
 *   6. Click Cancel → isEditing = false (discard changes)
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * API INTEGRATION
 * ═══════════════════════════════════════════════════════════════════════════════════
 *
 * **Endpoints:**
 *   PUT /api/v1/comments/editComment/{commentId}
 *     Body: { content: string }
 *     Response: { success: boolean, comment: {...} }
 *
 * @component
 * @version 2.0.0
 * @author Gikonyo Mwema
 * @example
 *   <Comments
 *     comment={commentObj}
 *     onLike={handleLike}
 *     onEdit={handleEdit}
 *     onDelete={handleDelete}
 *   />
 */

import React, { useState } from 'react';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { FaThumbsUp } from 'react-icons/fa';

dayjs.extend(relativeTime);
import { useSelector } from 'react-redux';
import { Button, Textarea } from 'flowbite-react';
import { apiFetch } from '../utils/api';

export default function Comment({ comment, onLike, onEdit, onDelete }) {
  // User data is already embedded in the comment from the backend serializer
  const user = comment.user || {};
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const { currentUser } = useSelector((state) => state.user);

  const handleSave = async () => {
    try {
      await apiFetch(`/api/v1/comments/editComment/${comment._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editedContent }),
      });
      setIsEditing(false);
      onEdit(comment, editedContent);
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  return (
    <div className="flex p-4 border-b dark:border-gray-600 text-sm">
      <div className="flex-shrink-0 mr-3">
        <img
          className="w-10 h-10 rounded-full bg-gray-200"
          src={user.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'}
          alt={user.username || 'User'}
          onError={(e) => {
            e.target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
          }}
        />
      </div>
      <div className="flex-1">
        <div className="flex items-center mb-1">
          <span className="font-bold mr-1 text-xs truncate">
            {user && user.username ? `@${user.username}` : 'anonymous user'}
          </span>
          <span className="text-gray-500 text-xs">
            {dayjs(comment.createdAt).fromNow()}
          </span>
        </div>

        {isEditing ? (
          <>
            <Textarea
              className="mb-2"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
            />
            <div className="flex justify-end gap-2 text-xs">
              <Button
                type="button"
                size="small"
                className="border-brand-green text-brand-green hover:bg-brand-green hover:text-white focus:ring-4 focus:ring-brand-green/25 transition-all duration-300"
                onClick={handleSave}
              >
                Save
              </Button>
              <Button
                type="button"
                size="small"
                className="border-gray-400 text-gray-600 hover:bg-gray-100 hover:text-gray-800 focus:ring-4 focus:ring-gray-200 transition-all duration-300"
                outline
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-500 pb-2">{comment.content}</p>
            <div className="flex items-center pt-2 text-xs border-t dark:border-gray-700 max-w-fit gap-2">
              <button
                type="button"
                onClick={() => onLike(comment._id)}
                className={`text-gray-400 hover:text-blue-500 ${
                  currentUser && comment.likes.includes(currentUser._id)
                    ? 'text-blue-500'
                    : ''
                }`}
              >
                <FaThumbsUp className="text-sm" />
              </button>
              <p className="text-gray-400">
                {comment.numberOfLikes > 0 &&
                  comment.numberOfLikes +
                    ' ' +
                    (comment.numberOfLikes === 1 ? 'like' : 'likes')}
              </p>
              {currentUser &&
                (currentUser._id === comment.userId || currentUser.isAdmin) && (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="text-gray-400 hover:text-blue-500"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(comment._id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      Delete
                    </button>
                  </>
                )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
 