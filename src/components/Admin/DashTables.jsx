/**
 * Dashboard Tables Component
 * 
 * A reusable table component system for the admin dashboard that provides
 * consistent data display across all administrative sections.
 * 
 * Features:
 * - Generic table component for any data type
 * - Configurable columns with custom renderers
 * - Loading states and error handling
 * - Pagination controls and "load more" functionality
 * - Responsive design with mobile optimization
 * - Dark mode support with theme integration
 * - Quick navigation links to detailed views
 * - Consistent styling across all admin tables
 * 
 * Table Types Supported:
 * - Users table with profile and role information
 * - Posts table with content and publication status
 * - Comments table with moderation controls
 * - Services table with business information
 * - Courses table with enrollment data
 * 
 * Column Configuration:
 * - Flexible column definitions with key/label pairs
 * - Custom render functions for complex data
 * - Automatic fallback to direct property access
 * - Support for images, links, and formatted content
 * 
 * State Management:
 * - Centralized loading and error states
 * - Parent component data binding
 * - Callback functions for user interactions
 * 
 * @component
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

import React from "react";
import { Link } from "react-router-dom";
import { Button, Table, Spinner } from "flowbite-react";

/**
 * DataTable Component
 * Generic table component for displaying admin data
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Table title/header
 * @param {Array} props.data - Array of data objects to display
 * @param {Array} props.columns - Column configuration with key, label, and optional render function
 * @param {boolean} props.loading - Loading state indicator
 * @param {string} props.error - Error message if data fetch failed
 * @param {string} props.link - Dashboard tab link for "See all" button
 * @param {Function} props.onLoadMore - Callback for loading more data
 * @returns {JSX.Element} Rendered data table
 */
const DataTable = ({ 
  title, 
  data, 
  columns, 
  loading, 
  error, 
  link, 
  onLoadMore 
}) => (
  <div className="flex flex-col w-full md:w-auto shadow-md p-2 rounded-md dark:bg-gray-800">
    {/* Table header with title and navigation link */}
    <div className="flex justify-between p-3 text-sm font-semibold">
      <h1 className="text-center p-2">{title}</h1>
      {link && (
        <Button outline gradientDuoTone="purpleToPink">
          <Link to={`/dashboard?tab=${link}`}>See all</Link>
        </Button>
      )}
    </div>
    
    {/* Content area with error, loading, or data states */}
    {error ? (
      <div className="text-red-500 p-4 text-center">
        Error loading data: {error}
      </div>
    ) : loading ? (
      <div className="flex justify-center items-center min-h-32">
        <Spinner size="xl" />
      </div>
    ) : (
      <>
        {/* Main data table */}
        <Table hoverable>
          <Table.Head>
            {columns.map((column) => (
              <Table.HeadCell key={column.key}>{column.label}</Table.HeadCell>
            ))}
          </Table.Head>
          <Table.Body>
            {data.length > 0 ? (
              data.map((item) => (
                <Table.Row key={item._id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  {columns.map((column) => (
                    <Table.Cell key={`${item._id}-${column.key}`}>
                      {/* Use custom render function if provided, otherwise display property directly */}
                      {column.render ? column.render(item) : item[column.key]}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))
            ) : (
              // Empty state when no data is available
              <Table.Row>
                <Table.Cell colSpan={columns.length} className="text-center py-4">
                  No data available
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
        
        {/* Load more button for pagination */}
        {onLoadMore && (
          <div className="flex justify-center mt-2">
            <Button 
              outline 
              gradientDuoTone="greenToBlue"
              onClick={onLoadMore}
            >
              Load More {title.replace('Recent ', '')}
            </Button>
          </div>
        )}
      </>
    )}
  </div>
);

/**
 * DashboardTables Component
 * Main component that renders all dashboard tables with data
 * 
 * @param {Object} props - Component props
 * @param {Object} props.data - Object containing data arrays for each table type
 * @param {Object} props.loading - Object containing loading states for each table type
 * @param {Object} props.error - Object containing error messages for each table type
 * @param {Function} props.onLoadMore - Callback function for loading more data
 * @returns {JSX.Element} Grid of dashboard tables
 */
const DashboardTables = ({ 
  data, 
  loading, 
  error, 
  onLoadMore 
}) => {
  /**
   * Table configuration array
   * Defines the structure and display settings for each dashboard table
   */
  const tableConfigs = [
    {
      title: "Recent Users",
      type: "users",
      link: "users",
      columns: [
        { 
          key: "profilePicture", 
          label: "User Image", 
          render: (user) => (
            <img 
              src={user.profilePicture} 
              alt="user" 
              className="w-10 h-10 rounded-full bg-gray-500" 
            />
          )
        },
        { key: "username", label: "Username" }
      ]
    },
    {
      title: "Recent Comments",
      type: "comments",
      link: "comments",
      columns: [
        { 
          key: "content", 
          label: "Comment Content", 
          render: (comment) => (
            <p className="line-clamp-2">{comment.content}</p>
          )
        },
        { key: "numberOfLikes", label: "Likes" }
      ]
    },
    {
      title: "Recent Posts",
      type: "posts",
      link: "posts",
      columns: [
        { 
          key: "image", 
          label: "Post Image", 
          render: (post) => (
            <img 
              src={post.image} 
              alt="post" 
              className="w-14 h-10 rounded-md bg-gray-500" 
            />
          )
        },
        { key: "title", label: "Title" },
        { key: "category", label: "Category" }
      ]
    },
    {
      title: "Recent Services",
      type: "services",
      link: "services",
      columns: [
        { key: "title", label: "Title" },
        { 
          key: "category", 
          label: "Category", 
          render: (service) => (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
              {service.category}
            </span>
          )
        }
      ]
    },
    {
      title: "Recent Courses",
      type: "courses",
      link: "courses",
      columns: [
        { 
          key: "image", 
          label: "Course Image", 
          render: (course) => (
            <img 
              src={course.image} 
              alt="course" 
              className="w-14 h-10 rounded-md bg-gray-500" 
            />
          )
        },
        { key: "title", label: "Title" },
        { 
          key: "price", 
          label: "Price", 
          render: (course) => `$${course.price}`
        }
      ]
    }
  ];

  return (
    <div className="flex flex-wrap gap-4 py-3 mx-auto justify-center">
      {tableConfigs.map((config) => (
        <DataTable
          key={config.title}
          title={config.title}
          data={data[config.type]}
          columns={config.columns}
          loading={loading[config.type]}
          error={error[config.type]}
          link={config.link}
          onLoadMore={() => onLoadMore(config.type)}
        />
      ))}
    </div>
  );
};

export default DashboardTables;