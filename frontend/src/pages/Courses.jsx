import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  HiOutlineTrendingUp,
  HiOutlineDocumentText,
  HiOutlineShieldCheck,
  HiOutlineBadgeCheck,
  HiOutlineGlobe,
  HiOutlineClock,
  HiOutlineVideoCamera,
  HiOutlineUsers
} from 'react-icons/hi';
import { Button, Badge } from 'flowbite-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { apiFetch } from '../utils/api';

// Enhanced category icons with more variety
const categoryIcons = {
  specialized: { icon: HiOutlineTrendingUp, color: 'from-blue-500 to-cyan-400', bg: 'bg-blue-50' },
  masterclass: { icon: HiOutlineGlobe, color: 'from-purple-500 to-pink-400', bg: 'bg-purple-50' },
  webinar: { icon: HiOutlineVideoCamera, color: 'from-red-500 to-orange-400', bg: 'bg-red-50' },
  coaching: { icon: HiOutlineUsers, color: 'from-green-500 to-emerald-400', bg: 'bg-green-50' },
  compliance: { icon: HiOutlineShieldCheck, color: 'from-indigo-500 to-blue-400', bg: 'bg-indigo-50' },
  licensing: { icon: HiOutlineDocumentText, color: 'from-yellow-500 to-amber-400', bg: 'bg-yellow-50' }
};

// Enhanced section configurations
const sectionConfigs = {
  specialized: {
    title: 'Specialized Courses',
    subtitle: 'Deep dive into specific environmental disciplines',
    gradient: 'from-blue-600 to-cyan-600',
    icon: HiOutlineTrendingUp
  },
  compliance: {
    title: 'Compliance & Auditing',
    subtitle: 'Master regulatory requirements and audit procedures',
    gradient: 'from-indigo-600 to-blue-600',
    icon: HiOutlineShieldCheck
  },
  masterclass: {
    title: 'Free Masterclasses',
    subtitle: 'Expert-led sessions to accelerate your knowledge',
    gradient: 'from-purple-600 to-pink-600',
    icon: HiOutlineGlobe
  },
  webinar: {
    title: 'Weekly Live Webinar',
    subtitle: 'Join our interactive sessions with industry experts',
    gradient: 'from-red-600 to-orange-600',
    icon: HiOutlineVideoCamera
  },
  coaching: {
    title: 'Coaching Sessions',
    subtitle: 'Personalized guidance for your professional growth',
    gradient: 'from-green-600 to-emerald-600',
    icon: HiOutlineUsers
  }
};

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await apiFetch('/api/v1/courses/by-category');
        
        const courseList = Array.isArray(data) ? data : (data.results || []);

        const formatEnrollCount = (count) => {
          if (!count || count === 0) return null;
          if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k+ enrolled`;
          return `${count} enrolled`;
        };

        const calcDuration = (c) => {
          // Sum lesson durations from modules/curriculum
          const modules = c.modules || c.curriculum || [];
          let totalMins = 0;
          modules.forEach(m => {
            const lessons = m.lessons || m.items || [];
            lessons.forEach(l => {
              totalMins += (typeof l === 'object' ? (l.duration || 0) : 0);
            });
          });
          if (totalMins === 0) return null;
          if (totalMins < 60) return `${totalMins} min`;
          const hrs = Math.floor(totalMins / 60);
          const mins = totalMins % 60;
          return mins > 0 ? `${hrs}h ${mins}m` : `${hrs} hour${hrs > 1 ? 's' : ''}`;
        };

        const normalize = (c) => ({
          ...c,
          id: c.id || c._id,
          shortDescription: c.short_description || c.shortDescription || '',
          fullDescription: c.full_description || c.fullDescription || '',
          isFree: c.is_free !== undefined ? c.is_free : c.isFree,
          isLive: c.is_live !== undefined ? c.is_live : c.isLive,
          isPopular: c.is_popular !== undefined ? c.is_popular : c.isPopular,
          features: Array.isArray(c.features) ? c.features : [],
          category: c.category || 'specialized',
          duration: calcDuration(c),
          students: formatEnrollCount(c.enrollment_count || c.enrollmentCount),
        });

        setCourses(courseList.map(normalize));
      } catch (err) {
        setError(err.message);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-green via-brand-green/90 to-brand-yellow">
        {/* Subtle decorative circles instead of grid */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-yellow/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
            Expand Your Environmental
            <span className="block text-brand-yellow drop-shadow-md">Knowledge</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-10">
            Discover our carefully curated courses designed to advance your environmental expertise
          </p>
        </div>
      </div>

      {/* All Courses */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-20">
        {courses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <CourseCard 
                key={course.id || index} 
                course={course} 
                category={course.category}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500 dark:text-gray-400">No courses available yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CourseCard({ course, category, index }) {
  const config = categoryIcons[category] || categoryIcons.specialized;
  const IconComponent = config.icon;
  
  return (
    <div 
      className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Card Header with Gradient */}
      <div className={`h-2 bg-gradient-to-r ${config.color}`}></div>
      
      {/* Image Placeholder with Icon */}
      <div className={`relative h-48 ${config.bg} dark:bg-gray-700 flex items-center justify-center overflow-hidden`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}></div>
        <IconComponent className={`w-20 h-20 text-gray-700 dark:text-gray-300 transform group-hover:scale-110 transition-transform duration-500`} />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {course.isFree && (
            <Badge color="success" className="px-3 py-1 text-sm font-semibold shadow-lg">
              🎓 Free
            </Badge>
          )}
          {course.isPopular && (
            <Badge color="warning" className="px-3 py-1 text-sm font-semibold shadow-lg">
              ⭐ Popular
            </Badge>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3 group-hover:text-brand-green dark:group-hover:text-brand-yellow transition-colors">
          {course.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {course.shortDescription}
        </p>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
          {course.duration && (
            <div className="flex items-center gap-1">
              <HiOutlineClock className="w-4 h-4" />
              <span>{course.duration}</span>
            </div>
          )}
          {course.students && (
            <div className="flex items-center gap-1">
              <HiOutlineUsers className="w-4 h-4" />
              <span>{course.students}</span>
            </div>
          )}
        </div>

        {/* Features */}
        {(course.features || []).length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              What you'll learn:
            </h4>
            <ul className="space-y-2">
              {course.features.slice(0, 3).map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <HiOutlineBadgeCheck className="w-4 h-4 text-brand-green flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Price and CTA */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div>
            {course.price > 0 && !course.isFree ? (
              <>
                <span className="text-2xl font-bold text-gray-800 dark:text-white">
                  Ksh {Number(course.price).toLocaleString()}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">one-time</span>
              </>
            ) : (
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">Free</span>
            )}
          </div>
          
          <Link to={`/courses/${course.slug}`}>
            <Button
              color="none"
              className="bg-gradient-to-r from-brand-green to-brand-yellow hover:from-brand-green/90 hover:to-brand-yellow/90 text-white border-0 hover:shadow-lg transition-all transform hover:-translate-y-0.5 px-6"
              size="md"
            >
              View More →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
