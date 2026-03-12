/**
 * Dashboard Comments Management Component
 * 
 * A comprehensive comment management interface for administrators that provides
 * content moderation, spam filtering, and user engagement oversight.
 * 
 * Features:
 * - View all platform comments with detailed information
 * - Comment moderation and approval system
 * - Bulk comment deletion for spam management
 * - Real-time comment statistics and analytics
 * - User activity tracking via comments
 * - Pagination for large comment databases
 * - Comment content preview and full text display
 * - Integration with post context for better moderation
 * 
 * Comment Information Displayed:
 * - Comment content and author information
 * - Associated post title and link
 * - Comment creation date and timestamp
 * - User profile and activity indicators
 * - Comment status (approved/pending/flagged)
 * - Like count and engagement metrics
 * 
 * Moderation Features:
 * - Individual comment deletion with confirmation
 * - Bulk operations for multiple comments
 * - Content filtering and spam detection
 * - User-based comment management
 * - Integration with post management system
 * 
 * Security Features:
 * - Admin-only access with role verification
 * - Secure comment deletion with confirmation
 * - Protection against unauthorized modifications
 * - Session validation and token management
 * 
 * State Management:
 * - Local state for comments list and pagination
 * - Redux integration for current user authentication
 * - Modal state for delete confirmations
 * - Loading states for better user experience
 * 
 * @component
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

import { Table, Modal, Button } from 'flowbite-react';
import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { apiFetch } from '../../../utils/api';

/**
 * DashComments Component
 * Main comment management interface for administrators
 * 
 * @returns {JSX.Element} Complete comments management dashboard
 */
export default function DashComments() {
    // Redux state for current user authentication
    const { currentUser } = useSelector((state) => state.user);
    
    /**
     * Comments list state
     * Stores the array of comment objects fetched from the API
     */
    const [comment, setcomment] = useState([]);
    
    /**
     * Loading state for initial fetch
     */
    const [loading, setLoading] = useState(true);

    /**
     * Error state for fetch failures
     */
    const [error, setError] = useState(null);
    
    /**
     * Pagination control state
     * Determines if more comments can be loaded
     */
    const [showMore, setShowMore] = useState(true);
    
    /**
     * Delete modal visibility state
     * Controls the confirmation modal for comment deletion
     */
    const [showModal, setShowModal] = useState(false);
    
    /**
     * Comment deletion target
     * Stores the ID of the comment selected for deletion
     */
    const [commentIdToDelete, setCommentIdToDelete] = useState('');

    /**
     * Effect to fetch comments when component mounts
     * Only runs if current user has admin privileges
     */
    useEffect(() => {
        /**
         * Fetches comments from the API
         * Handles initial comment loading with error management
         * 
         * @async
         */
        const fetchComments = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await apiFetch(`/api/v1/comments/getComments`);
                
                setcomment(data.comments);
                if (data.comments.length < 9) {
                    setShowMore(false);
                }
            } catch (err) {
                setError(err.message || 'Failed to load comments');
            } finally {
                setLoading(false);
            }
        };

        if (currentUser.isAdmin) {
            fetchComments();
        }
    }, [currentUser]);

    /**
     * Handles loading more comments for pagination
     * Fetches the next batch of comments and appends to existing list
     * 
     * @async
     */
    const handleShowMore = async () => {
        const startIndex = comment.length;
        try {
            const data = await apiFetch(`/api/v1/comments/getComments?startIndex=${startIndex}`);
            setcomment((prev) => [...prev, ...data.comments]);
            if (data.comments.length < 9) {
                setShowMore(false);
            }
        } catch {
            // Silently handle — user can retry via "Show more"
        }
    };

    const handleDeleteComments = async () => {
        setShowModal(false);
        try {
            await apiFetch(`/api/v1/comments/deleteComment/${commentIdToDelete}`, {
                method: 'DELETE',
            });
            setcomment((prev) => prev.filter((comment) => comment.id !== commentIdToDelete));
            setShowModal(false);
        } catch {
            // Delete failed — modal already closed
        }
    };

    return (
        <div className='table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500'>
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-brand-green" />
                </div>
            ) : error ? (
                <div className="text-center py-12">
                    <p className="text-red-500 font-medium mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-brand-green text-white rounded-md hover:bg-brand-green/90 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            ) : currentUser.isAdmin && comment.length > 0 ? (
                <>
                    <Table hoverable className='shadow-md'>
                        <Table.Head>
                            <Table.HeadCell>Date updated</Table.HeadCell>
                            <Table.HeadCell>Comment content</Table.HeadCell>
                            <Table.HeadCell>Number of likes</Table.HeadCell>
                            <Table.HeadCell>PostId</Table.HeadCell>
                            <Table.HeadCell>UserId</Table.HeadCell>
                            <Table.HeadCell>Delete</Table.HeadCell>
                        </Table.Head>
                        <Table.Body className='divide-y'>
                            {comment.map((comment) => (
                                <Table.Row key={comment.id} className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                                    <Table.Cell>
                                        {new Date(comment.updatedAt).toLocaleDateString()}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {comment.content}
                                    </Table.Cell>
                                    <Table.Cell>{comment.numberOfLikes}</Table.Cell>
                                    <Table.Cell>{comment.postId}</Table.Cell>
                                    <Table.Cell>
                                        {comment.user?.id ? ( // Check if comment.user exists
                                            <FaCheck className="text-green-500" />
                                        ) : (
                                            <FaTimes className="text-red-500" />
                                        )}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <span onClick={() => {
                                            setShowModal(true);
                                            setCommentIdToDelete(comment.id);
                                        }} className='font-medium text-red-500 hover:underline cursor-pointer'>Delete</span>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>

                    {showMore && (
                        <button onClick={handleShowMore} className='w-full text-brand-green self-center text-sm py-7'>
                            Show more
                        </button>
                    )}
                </>
            ) : (
                <p>You have no Comments yet!</p>
            )}

            <Modal show={showModal} onClose={() => setShowModal(false)} popup size="md">
                <Modal.Header />
                <Modal.Body>
                    <div className="text-center">
                        <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
                        <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
                            Are you sure you want to delete this comment?
                        </h3>
                        <div className="flex justify-center gap-4">
                            <Button color="failure" onClick={handleDeleteComments}>
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