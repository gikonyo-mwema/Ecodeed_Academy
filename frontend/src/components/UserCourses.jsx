import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Spinner, Progress } from 'flowbite-react';
import { HiOutlineBookOpen, HiOutlinePlay } from 'react-icons/hi';
import { apiFetch } from '../utils/api';
import { Link } from 'react-router-dom';

const UserCourses = ({ purchasedCourses: propCourses }) => {
  const [courses, setCourses] = useState(propCourses || []);
  const [loading, setLoading] = useState(!propCourses);

  useEffect(() => {
    if (!propCourses) {
      const fetchCourses = async () => {
        try {
          const data = await apiFetch('/api/enrollments/my-courses');
          setCourses(data);
        } catch (error) {
          console.error("Failed to fetch courses:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchCourses();
    }
  }, [propCourses]);

  if (loading) return <div className="flex justify-center p-10"><Spinner size="xl" /></div>;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <HiOutlineBookOpen className="text-teal-600" />
        My Learning Dashboard
      </h2>
      
      {courses.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-lg shadow dark:bg-gray-800">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Course</Table.HeadCell>
              <Table.HeadCell>Progress</Table.HeadCell>
              <Table.HeadCell>Enrolled On</Table.HeadCell>
              <Table.HeadCell>Action</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {courses.map(enrollment => {
                const course = enrollment.course_details || enrollment;
                return (
                    <Table.Row key={enrollment.id || enrollment._id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                    <Table.Cell className="font-medium text-gray-900 dark:text-white">
                        {course.title}
                    </Table.Cell>
                    <Table.Cell>
                        <div className="w-full min-w-[150px]">
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">
                                   {enrollment.progress?.percentage ? Math.round(enrollment.progress.percentage) : 0}%
                                </span>
                                <Badge color="success" className="w-fit">
                                    {enrollment.status || 'Active'}
                                </Badge>
                            </div>
                            <Progress 
                                progress={enrollment.progress?.percentage || 0} 
                                color="teal" 
                                size="sm" 
                            />
                        </div>
                    </Table.Cell>
                    <Table.Cell>
                        {new Date(enrollment.enrolled_at || enrollment.purchasedAt).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell>
                        <Link to={`/dashboard?tab=course-${course.id || course._id}-weeks`}>
                            <Button 
                            gradientDuoTone="tealToLime" 
                            size="sm"
                            >
                            <HiOutlinePlay className="mr-2 h-4 w-4" />
                            Continue Learning
                            </Button>
                        </Link>
                    </Table.Cell>
                    </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow dark:bg-gray-800">
          <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet</p>
          <Button gradientDuoTone="tealToLime" as={Link} to="/courses">
            Browse Courses
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserCourses;