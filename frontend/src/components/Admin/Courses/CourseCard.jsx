import { Link } from 'react-router-dom';
import { Card } from 'flowbite-react';

export default function CourseCard({ course }) {
  return (
    <Link to={`/courses/${course.slug}`} className="block h-full">
      <Card className="h-full hover:shadow-lg transition-shadow duration-300">
        <div className="flex flex-col items-center text-center h-full">
          <div className="mb-4">
            {course.icon}
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
          <p className="text-gray-600 flex-grow">{course.shortDescription}</p>
          <div className="mt-4 text-teal-600 font-medium">
            Learn more →
          </div>
        </div>
      </Card>
    </Link>
  );
}

import { Link } from 'react-router-dom';
import { Card, Badge } from 'flowbite-react';
import { HiOutlineShieldCheck, HiOutlineDocumentText } from 'react-icons/hi';

export default function CourseCard({ course }) {
  // Dynamic icon selection based on course category
  const getIcon = () => {
    switch(course.category) {
      case 'compliance':
        return <HiOutlineShieldCheck className="w-8 h-8 mb-3 text-teal-600" />;
      default:
        return <HiOutlineDocumentText className="w-8 h-8 mb-3 text-teal-600" />;
    }
  };

  return (
    <div className="h-full">
      <Card className="h-full hover:shadow-lg transition-shadow duration-300">
        <div className="flex flex-col h-full">
          <div className="flex justify-center mb-3">
            {getIcon()}
          </div>
          
          <h3 className="text-xl font-bold text-teal-800 mb-2 line-clamp-2">
            {course.title}
          </h3>
          
          <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
            {course.shortDescription}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge color="info">
              {course.level[0]}
            </Badge>
            {course.isPopular && (
              <Badge color="success">Popular</Badge>
            )}
          </div>
          
          <div className="flex justify-between items-center mt-auto">
            <span className="font-bold text-teal-800">
              Ksh {course.price.toLocaleString()}
            </span>
            <Link 
              to={`/courses/${course.slug}`}
              className="text-teal-600 hover:text-teal-800 font-medium text-sm"
            >
              Learn more →
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}