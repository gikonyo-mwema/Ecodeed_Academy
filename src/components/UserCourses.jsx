import React from 'react';
import { Table, Badge, Button } from 'flowbite-react';
import { HiOutlineBookOpen } from 'react-icons/hi';

const UserCourses = ({ purchasedCourses }) => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <HiOutlineBookOpen className="text-teal-600" />
        My Courses
      </h2>
      
      {purchasedCourses.length > 0 ? (
        <div className="overflow-x-auto">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Course</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Purchase Date</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {purchasedCourses.map(course => (
                <Table.Row key={course._id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="font-medium text-gray-900 dark:text-white">
                    {course.title}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color="success" className="w-fit">
                      Active
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {new Date(course.purchasedAt).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    <Button 
                      gradientDuoTone="tealToLime" 
                      size="xs"
                      as="a"
                      href={`/service/${course._id}`}
                    >
                      Access Course
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">You haven't purchased any courses yet</p>
          <Button gradientDuoTone="tealToLime" as="a" href="/services">
            Browse Courses
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserCourses;