/**
 * CommentSection Component — Blog post comments display and submission
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════════
 *
 * Renders the complete comments interface for blog posts. Handles comment display,
 * submission, editing, deletion, and liking. Includes authentication checks and
 * form validation.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * FEATURES
 * ═══════════════════════════════════════════════════════════════════════════════════
 *
 * 1. **Comment Submission**
 *    - Textarea for new comment input (max 200 chars)
 *    - Authentication required (login prompt if needed)
 *    - Form validation before submission
 *    - Error messages for failures
 *    - Auto-clear on success
 *
 * 2. **Comment Display**
 *    - Nested Comment components for each comment
 *    - Author info (username, avatar, timestamp)
 *    - Comment content
 *    - Like counts
 *    - Relative timestamps (\"2 days ago\")
 *
 * 3. **Comment Management**
 *    - Edit comment (author only)
 *    - Delete comment with confirmation modal
 *    - Like comment (increment count)
 *    - Threads/nested comments (if supported)
 *
 * 4. **Loading States**
 *    - Initial comment fetch on mount
 *    - Loading spinner while fetching
 *    - Empty state message
 *
 * 5. **Error Handling**
 *    - Auth required message
 *    - Length validation (max 200 chars)
 *    - API error messages
 *    - Graceful fallback
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * PROPS
 * ═══════════════════════════════════════════════════════════════════════════════════
 *
 * - postId: string | number (blog post ID)
 *   Used to fetch and submit comments for this post
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * STATE MANAGEMENT
 * ═══════════════════════════════════════════════════════════════════════════════════
 *
 * Local state:
 * - comment: string (textarea value)
 * - commentError: string | null (validation/submission error)
 * - comments: Array of comment objects (fetched from API)
 * - showModal: boolean (delete confirmation modal)
 * - commentToDelete: object | null (comment pending deletion)
 *
 * Redux state:
 * - currentUser: from user reducer (authentication check)
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * API INTEGRATION
 * ═══════════════════════════════════════════════════════════════════════════════════
 *
 * **Endpoints:**
 *   GET /api/v1/posts/{postId}/comments — Fetch post comments
 *   POST /api/v1/comments/create — Submit new comment
 *   DELETE /api/v1/comments/{commentId} — Delete comment
 *
 * **Comment Object:**
 *   - _id: comment ID
 *   - content: comment text
 *   - user: { username, profilePicture, _id }
 *   - createdAt: ISO timestamp
 *   - likes: number
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * SUBMISSION FLOW
 * ═══════════════════════════════════════════════════════════════════════════════════
 *
 * 1. User types comment in textarea
 * 2. Click \"Post Comment\" button
 * 3. Validations:
 *    - User must be logged in
 *    - Comment must not exceed 200 characters
 * 4. POST to /api/v1/comments/create with content, postId, userId
 * 5. On success:
 *    - Add new comment to comments array (prepend)
 *    - Clear textarea
 *    - Clear error message
 * 6. On error:
 *    - Display error message
 *    - Keep textarea content
 *
 * @component
 * @version 2.0.0
 * @author Gikonyo Mwema
 * @example
 *   <CommentSection postId={post._id} />
 */
import React from 'react';
import { Alert, Button, Modal, Textarea } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Comment from './Comments';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { apiFetch } from '../utils/api';

export default function CommentSection({ postId }) {
  const { currentUser } = useSelector((state) => state.user);
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState(null);
  const [comments, setComments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || !currentUser._id) {
      setCommentError('You must be logged in to comment.');
      return;
    }
    if (comment.length > 200) {
      setCommentError('Comment must be less than 200 characters.');
      return;
    }

    try {
      const data = await apiFetch('/api/v1/comments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: comment,
          postId,
          userId: currentUser._id,
        }),
      });
      // apiFetch returns parsed JSON directly, throws on error
      setComment('');
      setCommentError(null);
      setComments([data, ...comments]);
    } catch (error) {
      console.error('Comment creation error:', error);
      setCommentError(error.message || 'An error occurred. Please try again.');
    }
  };

  useEffect(() => {
    const getComments = async () => {
      try {
        const data = await apiFetch(`/api/v1/comments/getPostComments/${postId}`);
        if (Array.isArray(data)) {
          setComments(data);
        }
      } catch (error) {
        console.error('Error fetching comments:', error.message);
      }
    };
    getComments();
  }, [postId]);

  const handleDelete = async (commentId) => {
    setShowModal(false);
    try {
      if (!currentUser) {
        navigate('/sign-in');
        return;
      }
      await apiFetch(`/api/v1/comments/deleteComment/${commentId}`, {
        method: 'DELETE',
      });
      // apiFetch throws on error, so reaching here means success
      setComments(comments.filter((comment) => comment._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error.message);
    }
  };

  const handleLike = async (commentId) => {
    try {
      if (!currentUser) {
        navigate('/sign-in');
        return;
      }
      const data = await apiFetch(`/api/v1/comments/likeComment/${commentId}`, {
        method: 'PUT',
      });
      if (data) {
        setComments(
          comments.map((comment) =>
            comment._id === commentId ? data : comment
          )
        );
      }
    } catch (error) {
      console.error('Error liking comment:', error.message);
    }
  };

  const handleEdit = async (comment, editedContent) => {
    setComments(
      comments.map((c) =>
        c._id === comment._id ? { ...c, content: editedContent } : c
      )
    );
  };

  return (
    <div className="max-w-2xl mx-auto w-full p-3">
      {currentUser ? (
        <div className="flex items-center gap-1 my-5 text-gray-500 text-sm">
          <p>Signed in as:</p>
          <img
            className="h-5 w-5 object-cover rounded-full"
            src={currentUser.profilePicture}
            alt=""
          />
          <Link
            to={'/dashboard?tab=profile'}
            className="text-xs text-cyan-600 hover:underline"
          >
            @{currentUser.username}
          </Link>
        </div>
      ) : (
        <div className="text-sm text-teal-500 my-5 flex gap-1">
          You must be signed in to comment.
          <Link className="text-blue-500 hover:underline" to={'/sign-in'}>
            Sign In
          </Link>
        </div>
      )}
      {currentUser && (
        <form
          onSubmit={handleSubmit}
          className="border border-teal-500 rounded-md p-3"
        >
          <Textarea
            placeholder="Add a comment..."
            rows="3"
            maxLength="200"
            onChange={(e) => setComment(e.target.value)}
            value={comment}
          />
          <div className="flex justify-between items-center mt-5">
            <p className="text-gray-500 text-xs">
              {200 - comment.length} characters remaining
            </p>
            <Button 
              outline 
              className="border-brand-green text-brand-green hover:bg-brand-green hover:text-white focus:ring-4 focus:ring-brand-green/25 transition-all duration-300 shadow-sm hover:shadow-md font-medium" 
              type="submit"
            >
              Submit
            </Button>
          </div>
          {commentError && (
            <Alert color="failure" className="mt-5">
              {commentError}
            </Alert>
          )}
        </form>
      )}
      {comments.length === 0 ? (
        <p className="text-sm my-5">No comments yet!</p>
      ) : (
        <>
          <div className="text-sm my-5 flex items-center gap-1">
            <p>Comments</p>
            <div className="border border-gray-400 py-1 px-2 rounded-sm">
              <p>{comments.length}</p>
            </div>
          </div>
          {comments.map((comment) => (
            <Comment
              key={comment._id}
              comment={comment}
              onLike={handleLike}
              onEdit={handleEdit}
              onDelete={(commentId) => {
                setShowModal(true);
                setCommentToDelete(commentId);
              }}
            />
          ))}
        </>
      )}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this comment?
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                color="failure"
                onClick={() => handleDelete(commentToDelete)}
              >
                Yes, I'm sure
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
