import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  HiOutlineTrendingUp,
  HiOutlineUserCircle,
  HiOutlineDocumentText,
  HiOutlineShieldCheck,
  HiOutlineOfficeBuilding,
  HiOutlineTruck,
  HiOutlineShoppingBag,
  HiOutlineBadgeCheck,
  HiOutlineGlobe,
  HiOutlineLightningBolt,
  HiOutlineScale,
  HiOutlineClock,
  HiOutlineChartBar,
  HiOutlineClipboardCheck,
  HiOutlineVideoCamera
} from 'react-icons/hi';
import { Button, Badge } from 'flowbite-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { apiFetch } from '../utils/api';

// Course categories with their respective icons
const categoryIcons = {
  specialized: HiOutlineTrendingUp,
  masterclass: HiOutlineGlobe,
  webinar: HiOutlineVideoCamera,
  coaching: HiOutlineUserCircle,
  compliance: HiOutlineShieldCheck,
  licensing: HiOutlineDocumentText
};

export default function Courses() {
  const [courses, setCourses] = useState({
    specialized: [],
    masterclass: [],
    webinar: null,
    coaching: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await apiFetch('/api/courses/by-category');
        
        // Transform backend data to match frontend structure
        const transformedData = {
          specialized: data.filter(c => c.category === 'specialized'),
          masterclass: data.filter(c => c.category === 'masterclass'),
          webinar: data.find(c => c.category === 'webinar') || null,
          coaching: data.filter(c => c.category === 'coaching')
        };
        setCourses(transformedData);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
        // Fallback to local data if API fails
        setCourses(getLocalCourses());
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Local data fallback
  const getLocalCourses = () => {
    return {
      specialized: [
        {
          _id: '2.1',
          title: "How to Start and Grow Your Environmental Consulting Business",
          shortDescription: "Step-by-step guide to launching your consulting business",
          features: ["Business setup guide", "Overcoming zero-experience", "Essential tools", "Scaling strategies"],
          slug: "start-environmental-business",
          price: 15000,
          category: "specialized",
          isPopular: true
        },
        // Add other courses from your original data...
      ],
      masterclass: [
        // Add masterclass courses...
      ],
      webinar: {
        _id: '4.1',
        title: "Weekly Live Webinar: Environmental Approvals",
        shortDescription: "Learn how to get approvals faster and avoid delays",
        features: ["Process optimization", "Avoiding delays", "Case studies"],
        slug: "approvals-webinar",
        price: 0,
        category: "webinar",
        isLive: true
      },
      coaching: [
        // Add coaching sessions...
      ]
    };
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <div className="text-red-500 text-center py-12">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Specialized Courses */}
        {courses.specialized.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-teal-800 dark:text-teal-300 mb-8 text-center">
              Specialized Courses
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.specialized.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          </section>
        )}

        {/* Free Masterclasses */}
        {courses.masterclass.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-teal-800 dark:text-teal-300 mb-8 text-center">
              Free Masterclasses
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.masterclass.map((course) => (
                <CourseCard key={course._id} course={{ ...course, isFree: true }} />
              ))}
            </div>
          </section>
        )}

        {/* Weekly Webinar */}
        {courses.webinar && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-teal-800 dark:text-teal-300 mb-8 text-center">
              Weekly Live Webinar
            </h2>
            <div className="max-w-3xl mx-auto">
              <CourseCard course={{ ...courses.webinar, isLive: true }} />
            </div>
          </section>
        )}

        {/* Coaching Sessions */}
        {courses.coaching.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-teal-800 dark:text-teal-300 mb-8 text-center">
              Coaching Sessions
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {courses.coaching.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function CourseCard({ course }) {
  const IconComponent = categoryIcons[course.category] || HiOutlineDocumentText;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-teal-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <div className="p-6 flex flex-col h-full">
        <div className="flex justify-center mb-4">
          <IconComponent className="w-8 h-8 text-teal-600 dark:text-teal-400" />
        </div>
        
        <h3 className="text-xl font-bold text-teal-800 dark:text-teal-300 mb-4 text-center flex-grow">
          {course.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {course.shortDescription}
        </p>
        
        <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300 mb-6">
          {course.features.slice(0, 3).map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
        
        <div className="mt-auto">
          <div className="flex flex-wrap gap-2 mb-3">
            {course.isFree && (
              <Badge color="success" className="inline-flex">
                Free Masterclass
              </Badge>
            )}
            {course.isLive && (
              <Badge color="red" className="inline-flex">
                Live Event
              </Badge>
            )}
            {course.isPopular && (
              <Badge color="info" className="inline-flex">
                Popular
              </Badge>
            )}
            {course.price > 0 && (
              <Badge color="gray" className="inline-flex">
                Ksh {course.price.toLocaleString()}
              </Badge>
            )}
          </div>
          
          <Link to={`/courses/${course.slug}`}>
            <Button 
              color="light"
              className="w-full border border-teal-600 text-teal-600 hover:bg-teal-50 dark:text-teal-300 dark:border-teal-300 dark:hover:bg-gray-700"
            >
              Learn More
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}