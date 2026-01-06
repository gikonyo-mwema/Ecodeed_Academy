import { Table, Button, Spinner } from 'flowbite-react';
import PostTableHeader from './PostTableHeader';
import PostTableRow from './PostTableRow';

export default function PostTable({ posts, loading, showMore, onShowMore, onEdit, onDelete }) {
  return (
    <>
      {loading && posts.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="xl" />
        </div>
      ) : posts.length > 0 ? (
        <>
          <Table hoverable className="shadow-md">
            <PostTableHeader />
            <Table.Body className="divide-y">
              {posts.map((post) => (
                <PostTableRow 
                  key={post._id} 
                  post={post} 
                  onEdit={onEdit} 
                  onDelete={onDelete} 
                />
              ))}
            </Table.Body>
          </Table>

          {showMore && (
            <div className="flex justify-center mt-4">
              <Button
                outline
                className="bg-gradient-to-r from-brand-green to-brand-blue hover:from-brand-blue hover:to-brand-green text-white border-0 focus:ring-4 focus:ring-brand-green/25"
                onClick={onShowMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Show More'}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-500 dark:text-gray-400">
            You have no posts yet!
          </p>
        </div>
      )}
    </>
  );
}