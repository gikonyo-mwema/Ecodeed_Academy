/**
 * CourseDetails Page — Comprehensive course information and enrollment
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * Displays detailed course information including full description, curriculum,
 * features, FAQs, target audience, and resources. Handles course enrollment with
 * payment modal for paid courses and direct enrollment for free courses.
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 * FEATURES
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * 1. **Course Information Sections**
 *    - Hero section with course image and title
 *    - Course metadata (rating, reviews, students, language, duration)
 *    - Tabs for Different content areas (Overview, Curriculum, FAQs, Reviews)
 *    - Full course description with expandable text
 * 
 * 2. **Curriculum Display**
 *    - Weekly/Module structure view
 *    - Lessons within each module with duration
 *    - Expandable sections for mobile
 *    - Lesson count and total course duration
 * 
 * 3. **Enrollment System**
 *    - Checks current enrollment status for logged-in users
 *    - \"Enroll\" button triggers payment modal for paid courses
 *    - Paid courses use Paystack payment integration (PaymentModal)
 *    - Free courses bypass payment and enroll directly
 *    - Progress bar showing personal course progress (if enrolled)
 * 
 * 4. **Additional Content**
 *    - Target audience: Who should take this course
 *    - Course features: Key learning outcomes
 *    - FAQs: Accordion-based frequently asked questions
 *    - Resources: Downloadable course materials
 *    - Certificate: Badge if course offers certification
 * 
 * 5. **Responsive Tabs**
 *    - Overview: Description, features, audience, resources
 *    - Curriculum: Full course structure with modules and lessons
 *    - FAQs: Accordion with common questions
 *    - Reviews: Student testimonials and ratings
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 * API INTEGRATION
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * **Endpoints:**
 *   GET /api/v1/courses/{slug}/ — Fetch course details by slug
 *   GET /api/v1/enrollments/check/?userId={id}&courseSlug={slug} — Check enrollment
 *   POST /api/v1/enrollments/ — Enroll in free course
 *   POST /api/v1/payments/ — Process payment for paid courses (via PaymentModal)
 * 
 * **Course Data Structure:**
 *   - id, slug, title, category
 *   - short_description, full_description (with HTML)
 *   - price (0 = free, >0 = paid)
 *   - is_free, isFree (boolean flags)
 *   - image (featured image URL)
 *   - rating, reviews (student feedback)
 *   - students (enrollment count)
 *   - language, duration (course metadata)
 *   - has_certificate, hasCertificate (boolean)
 *   - is_popular (featured status)
 *   - modules/curriculum (lessons structure)
 *   - features, target_audience (learning outcomes)
 *   - faqs, resources (additional content)
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 * STATE MANAGEMENT
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * Local state:
 * - course: normalized course object
 * - isEnrolled: boolean (enrollment status)
 * - loading: boolean (initial fetch)
 * - error: string | null (error message)
 * - activeTab: number (current tab index)
 * - showPaymentModal: boolean (payment modal visibility)
 * - processing: boolean (enrollment in progress)
 * - showFullDescription: boolean (description expanded)
 * 
 * Redux state:
 * - currentUser: from user reducer (for enrollment checks)
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 * PAYMENT FLOW
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * FREE COURSES:
 *   User clicks \"Enroll\" → Direct enrollment → Redirect to /dashboard
 * 
 * PAID COURSES:
 *   User clicks \"Enroll\" → PaymentModal shows → Paystack payment processing
 *   On success: Create enrollment → Redirect to /dashboard
 *   On cancel: Modal closes, user remains on course page
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 *
 * @component
 * @version 2.0.0
 * @author Gikonyo Mwema
 * @example
 * // In App.jsx router:
 * <Route path=\"/courses/:slug\" element={<CourseDetails />} />
 * 
 * // Navigation from course card:
 * navigate(`/courses/${course.slug}`);
 */

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { refreshUser } from '../redux/user/userSlice';
import { 
  HiOutlineCheckCircle, 
  HiOutlineClock, 
  HiOutlineShieldCheck,
  HiOutlineAcademicCap,
  HiOutlineVideoCamera,
  HiOutlineStar,
  HiOutlineUsers,
  HiOutlineGlobe,
  HiOutlineBookOpen,
  HiOutlineCog,
  HiOutlineDownload,
  HiOutlinePlay,
  HiOutlineChevronRight,
  HiOutlineQuestionMarkCircle
} from 'react-icons/hi';
import { Button, Badge, Accordion, Alert, Spinner, Progress, Tabs, Card } from 'flowbite-react';
import PaymentModal from '../components/Modal/PaymentModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { apiFetch } from '../utils/api';

export default function CourseDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        // Fetch course data
        const courseRes = await fetch(`/api/v1/courses/${slug}/`);
        
        let courseData;
        
        if (courseRes.ok) {
          const apiData = await courseRes.json();
          
          // Normalize API data (snake_case to camelCase) and handle empty values
          // Industry standard: price of 0 or null means FREE course - bypass payment
          const price = parseFloat(apiData.price) || 0;
          courseData = {
            ...apiData,
            fullDescription: apiData.full_description || apiData.fullDescription,
            shortDescription: apiData.short_description || apiData.shortDescription,
            targetAudience: apiData.target_audience || apiData.targetAudience || [],
            isFree: price === 0 || apiData.is_free === true || apiData.isFree === true,
            isPopular: apiData.is_popular !== undefined ? apiData.is_popular : apiData.isPopular,
            hasCertificate: apiData.has_certificate !== undefined ? apiData.has_certificate : apiData.hasCertificate,
            lastUpdated: apiData.updated_at ? new Date(apiData.updated_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently',
            externalUrl: apiData.external_url || apiData.externalUrl,
            price: price,
          };
          
          // Apply sensible defaults for any missing fields
          courseData.fullDescription = courseData.fullDescription || 'Course description coming soon.';
          courseData.features = courseData.features?.length ? courseData.features : [];
          courseData.faqs = courseData.faqs?.length ? courseData.faqs : [];
          courseData.targetAudience = courseData.targetAudience?.length ? courseData.targetAudience : [];
          courseData.resources = courseData.resources?.length ? courseData.resources : [];
          courseData.curriculum = courseData.curriculum?.length ? courseData.curriculum : [];
          courseData.duration = courseData.duration || 'Self-paced';
          courseData.students = courseData.students || 'New course';
          courseData.rating = courseData.rating || 0;
          courseData.reviews = courseData.reviews || 0;
          courseData.language = courseData.language || 'English';
          courseData.certificate = courseData.hasCertificate !== undefined ? courseData.hasCertificate : false;
        } else if (courseRes.status === 404) {
          throw new Error('Course not found');
        } else {
          throw new Error('Failed to load course. Please try again later.');
        }

        setCourse(courseData);

        // Check enrollment status if user is logged in
        if (currentUser) {
          try {
            const enrollmentData = await apiFetch(`/api/v1/enrollments/check/?userId=${currentUser.id || currentUser._id}&courseSlug=${slug}`);
            setIsEnrolled(enrollmentData?.isEnrolled || false);
          } catch (enrollErr) {
            // Enrollment check failed, default to not enrolled
            setIsEnrolled(false);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [slug, currentUser]);

  const handleEnroll = () => {
    if (!currentUser) {
      navigate(`/sign-in?redirect=/courses/${slug}`);
      return;
    }
    if (course.isFree) {
      enrollUser();
    } else {
      // Show Paystack payment modal
      setShowPaymentModal(true);
    }
  };

  const enrollUser = async (paymentData = null) => {
    try {
      setProcessing(true);
      
      if (!course.isFree && !paymentData) {
         throw new Error("Payment required for this course.");
      }

      await apiFetch('/api/v1/enrollments/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          course: course.id || course._id,  // Backend expects 'course' field with course ID
        })
      });
      
      setIsEnrolled(true);
      setShowPaymentModal(false);
      
      // Refresh user data to update hasEnrollments flag (for header dropdown)
      dispatch(refreshUser());
      
      // Navigate to the student dashboard after successful enrollment
      navigate(`/dashboard?tab=course-${course.id || course._id}-overview`);
    } catch (err) {
      setError(err.message || 'Failed to enroll. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
            <HiOutlineShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Course Unavailable</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/courses">
            <Button color="none" className="bg-gradient-to-r from-brand-green to-brand-yellow hover:from-brand-green/90 hover:to-brand-yellow/90 text-white border-0 focus:ring-4 focus:ring-brand-green/25">
              Browse Other Courses
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
  if (!course) return <div className="text-center py-12">Course not found</div>;

  const formatLessonDuration = (seconds) => {
    const totalSeconds = Number(seconds) || 0;
    if (totalSeconds <= 0) return '—';
    if (totalSeconds < 60) return `${totalSeconds}s`;
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins} min`;
  };

  // Prefer explicit curriculum payload; gracefully fall back to modules/lessons
  const curriculumSections = (
    Array.isArray(course.curriculum) && course.curriculum.length > 0
      ? course.curriculum
      : Array.isArray(course.modules)
        ? course.modules.map((module) => ({
            ...module,
            items: Array.isArray(module.items) ? module.items : (module.lessons || []),
          }))
        : []
  ).map((section) => ({
    ...section,
    items: Array.isArray(section.items) ? section.items : [],
  }));
  const totalLessons = curriculumSections.reduce((total, section) => total + section.items.length, 0);

  // Dynamic icon based on course category
  const getCourseIcon = () => {
    switch(course.category) {
      case 'compliance':
        return { icon: HiOutlineShieldCheck, color: 'from-indigo-500 to-blue-500', bg: 'bg-indigo-50' };
      case 'webinar':
        return { icon: HiOutlineVideoCamera, color: 'from-red-500 to-orange-500', bg: 'bg-red-50' };
      case 'masterclass':
        return { icon: HiOutlineGlobe, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50' };
      default:
        return { icon: HiOutlineAcademicCap, color: 'from-teal-500 to-emerald-500', bg: 'bg-teal-50' };
    }
  };

  const courseIcon = getCourseIcon();
  const IconComponent = courseIcon.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-brand-blue dark:to-gray-900">
      {/* Hero Section */}
      <div className={`relative overflow-hidden bg-gradient-to-r ${courseIcon.color} text-white`}>
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0 bg-grid-white/[0.2] bg-grid"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm text-white/80 mb-8">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <HiOutlineChevronRight className="w-4 h-4 mx-2" />
            <Link to="/courses" className="hover:text-white transition-colors">Courses</Link>
            <HiOutlineChevronRight className="w-4 h-4 mx-2" />
            <span className="text-white">{course.title}</span>
          </nav>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-xl ${courseIcon.bg} bg-white/10 backdrop-blur-sm`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold">{course.title}</h1>
              </div>
              
              <p className="text-xl text-white/90 mb-8">{course.shortDescription}</p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <HiOutlineUsers className="w-5 h-5 text-white/80" />
                  <span className="text-white/90">{course.students}</span>
                </div>
                <div className="flex items-center gap-2">
                  <HiOutlineStar className="w-5 h-5 text-yellow-300" />
                  <span className="text-white/90">{course.rating} ({course.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <HiOutlineClock className="w-5 h-5 text-white/80" />
                  <span className="text-white/90">{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <HiOutlineGlobe className="w-5 h-5 text-white/80" />
                  <span className="text-white/90">{course.language}</span>
                </div>
              </div>
            </div>

            {/* Price Card - Desktop */}
            <div className="hidden lg:block">
              <div className="bg-white dark:bg-brand-blue rounded-2xl shadow-2xl border border-gray-200 dark:border-brand-yellow/20 p-6">
                <div className="text-center mb-6">
                  {!course.isFree ? (
                    <>
                      <span className="text-4xl font-bold text-gray-800 dark:text-white">
                        Ksh {course.price?.toLocaleString()}
                      </span>
                      <span className="text-gray-500 dark:text-gray-300 ml-2">one-time</span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-green-600">Free</span>
                  )}
                </div>

                {!isEnrolled ? (
                  <>
                    <Button
                      color="none"
                      size="lg"
                      className="w-full mb-4 bg-gradient-to-r from-brand-green to-brand-yellow hover:from-brand-green/90 hover:to-brand-yellow/90 text-white border-0 focus:ring-4 focus:ring-brand-green/25"
                      onClick={handleEnroll}
                      disabled={processing}
                    >
                      {processing ? (
                        <Spinner aria-label="Processing..." />
                      ) : course.isFree ? (
                        'Start Learning Now'
                      ) : (
                        'Enroll Now'
                      )}
                    </Button>

                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-200">
                      <p className="flex items-center">
                          <HiOutlineCheckCircle className="mr-2 text-brand-green w-5 h-5" />
                        Lifetime access
                      </p>
                      {course.certificate && (
                        <p className="flex items-center">
                          <HiOutlineCheckCircle className="mr-2 text-brand-green w-5 h-5" />
                          Certificate of completion
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <Badge color="success" className="mb-4">
                      ✓ You're enrolled!
                    </Badge>
                    <Button 
                      color="none"
                      className="w-full bg-gradient-to-r from-brand-green to-brand-yellow hover:from-brand-green/90 hover:to-brand-yellow/90 text-white border-0"
                      onClick={() => navigate(`/dashboard?tab=course-${course.id || course._id}-weeks`)}
                    >
                      Continue Learning
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Course Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white dark:bg-brand-blue rounded-xl shadow-sm border border-gray-200 dark:border-brand-yellow/20 mb-8">
              <Tabs.Group
                aria-label="Course tabs"
                style="underline"
                onActiveTabChange={(tab) => setActiveTab(tab)}
              >
                <Tabs.Item title="Overview" active={activeTab === 0}>
                  <div className="p-6">
                    <div className="prose max-w-none dark:prose-invert">
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">About This Course</h2>
                      <p className="text-gray-600 dark:text-gray-200 leading-relaxed">
                        {showFullDescription ? course.fullDescription : `${course.fullDescription?.substring(0, 300)}...`}
                      </p>
                      {course.fullDescription?.length > 300 && (
                        <button
                          onClick={() => setShowFullDescription(!showFullDescription)}
                          className="text-brand-green dark:text-brand-yellow font-medium hover:text-brand-green/70 dark:hover:text-brand-yellow/80 mt-2"
                        >
                          {showFullDescription ? 'Show less' : 'Read more'}
                        </button>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mt-8 mb-4">What You'll Learn</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {course.features?.map((feature, index) => (
                        <div key={index} className="flex items-start p-3 bg-gray-50 dark:bg-white/5 border border-transparent dark:border-white/10 rounded-lg">
                          <HiOutlineCheckCircle className="h-5 w-5 text-brand-green mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-100">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mt-8 mb-4">Who This Course Is For</h3>
                    <div className="flex flex-wrap gap-2">
                      {course.targetAudience?.map((audience, index) => (
                        <Badge
                          key={index}
                          className="px-3 py-1 text-sm bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-white/10 dark:text-brand-yellow dark:border-brand-yellow/30"
                        >
                          {audience}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Tabs.Item>

                <Tabs.Item title="Curriculum" active={activeTab === 1}>
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Course Curriculum</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                          Learn in bite-sized sections with clear lesson flow
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-brand-green/10 text-brand-green dark:bg-brand-yellow/20 dark:text-brand-yellow">
                          {curriculumSections.length} sections
                        </span>
                        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-white/10 dark:text-blue-200">
                          {curriculumSections.reduce((total, s) => total + s.items.length, 0)} lessons
                        </span>
                      </div>
                    </div>

                    {curriculumSections.length === 0 ? (
                      <Alert color="info" className="rounded-lg dark:!bg-white/5 dark:!text-blue-100 dark:!border-blue-400/30">
                        Curriculum is being updated. Please check back shortly.
                      </Alert>
                    ) : (
                      <Accordion alwaysOpen={true} className="border-none space-y-3">
                        {curriculumSections.map((section, index) => (
                          <Accordion.Panel
                            key={section.id || index}
                            className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-white/5"
                          >
                            <Accordion.Title className="!bg-gray-50 hover:!bg-gray-100 dark:!bg-brand-blue/70 dark:hover:!bg-brand-blue/90 focus:!ring-0">
                              <div className="flex items-center justify-between w-full">
                                <span className="font-medium text-gray-800 dark:text-white pr-3">
                                  Section {index + 1}: {section.title}
                                </span>
                                <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-white text-gray-700 border border-gray-200 dark:bg-white/10 dark:text-gray-100 dark:border-white/20">
                                  {section.items.length} lessons
                                </span>
                              </div>
                            </Accordion.Title>
                            <Accordion.Content className="!bg-white dark:!bg-brand-blue/40">
                              <ul className="space-y-2">
                                {section.items.map((item, itemIndex) => {
                                  const isObjectItem = typeof item === 'object' && item !== null;
                                  const itemTitle = isObjectItem ? item.title : item;
                                  const itemType = isObjectItem
                                    ? (item.type || (item.video_url ? 'video' : 'reading'))
                                    : 'reading';
                                  const durationText = isObjectItem
                                    ? formatLessonDuration(item.duration)
                                    : '—';

                                  return (
                                    <li
                                      key={item.id || itemIndex}
                                      className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/80 dark:border-white/10 dark:bg-white/5"
                                    >
                                      <div className="flex items-center min-w-0">
                                        {itemType === 'video' ? (
                                          <HiOutlinePlay className="h-4 w-4 text-brand-yellow mr-3 flex-shrink-0" />
                                        ) : itemType === 'interactive' ? (
                                          <HiOutlineCog className="h-4 w-4 text-brand-green mr-3 flex-shrink-0" />
                                        ) : (
                                          <HiOutlineBookOpen className="h-4 w-4 text-blue-500 mr-3 flex-shrink-0" />
                                        )}
                                        <span className="text-gray-700 dark:text-gray-100 truncate">
                                          {itemTitle || `Lesson ${itemIndex + 1}`}
                                        </span>
                                      </div>
                                      <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-300 ml-3 whitespace-nowrap">
                                        {durationText}
                                      </span>
                                    </li>
                                  );
                                })}
                              </ul>
                            </Accordion.Content>
                          </Accordion.Panel>
                        ))}
                      </Accordion>
                    )}
                  </div>
                </Tabs.Item>

                <Tabs.Item title="FAQs" active={activeTab === 2}>
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                      {course.faqs?.map((faq, index) => (
                        <div key={index} className="border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden bg-white dark:bg-white/5">
                          <details className="group">
                            <summary className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-brand-blue/70 dark:hover:bg-brand-blue/90">
                              <h3 className="font-medium text-gray-800 dark:text-gray-100">{faq.question}</h3>
                              <HiOutlineChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-300 group-open:rotate-90 transition-transform" />
                            </summary>
                            <div className="p-4 bg-white dark:bg-brand-blue/40">
                              <p className="text-gray-600 dark:text-gray-200">{faq.answer}</p>
                            </div>
                          </details>
                        </div>
                      ))}
                    </div>
                  </div>
                </Tabs.Item>
              </Tabs.Group>
            </div>
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Price Card - Mobile/Tablet */}
              <div className="lg:hidden bg-white dark:bg-brand-blue rounded-xl shadow-lg border border-gray-200 dark:border-brand-yellow/20 p-6">
                <div className="text-center mb-6">
                  {!course.isFree ? (
                    <>
                      <span className="text-4xl font-bold text-gray-800 dark:text-white">
                        Ksh {course.price?.toLocaleString()}
                      </span>
                      <span className="text-gray-500 dark:text-gray-300 ml-2">one-time</span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-green-600">Free</span>
                  )}
                </div>

                {!isEnrolled ? (
                  <>
                    <Button
                      color="none"
                      size="lg"
                      className="w-full mb-4 bg-gradient-to-r from-brand-green to-brand-yellow hover:from-brand-green/90 hover:to-brand-yellow/90 text-white border-0 focus:ring-4 focus:ring-brand-green/25"
                      onClick={handleEnroll}
                      disabled={processing}
                    >
                      {processing ? (
                        <Spinner aria-label="Processing..." />
                      ) : course.isFree ? (
                        'Start Learning Now'
                      ) : (
                        'Enroll Now'
                      )}
                    </Button>

                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-200">
                      <p className="flex items-center">
                        <HiOutlineCheckCircle className="mr-2 text-brand-green" />
                        Lifetime access
                      </p>
                      {course.certificate && (
                        <p className="flex items-center">
                          <HiOutlineCheckCircle className="mr-2 text-brand-green" />
                          Certificate of completion
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <Badge color="success" className="mb-4">
                      ✓ You're enrolled!
                    </Badge>
                    <Button 
                      color="none"
                      className="w-full bg-gradient-to-r from-brand-green to-brand-yellow hover:from-brand-green/90 hover:to-brand-yellow/90 text-white border-0"
                      onClick={() => navigate(`/dashboard?tab=course-${course.id || course._id}-weeks`)}
                    >
                      Continue Learning
                    </Button>
                  </div>
                )}
              </div>

              {/* Course Details Card */}
              <div className="bg-white dark:bg-brand-blue rounded-xl shadow-lg border border-gray-200 dark:border-brand-yellow/20 p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Course Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-white/10">
                    <span className="text-gray-600 dark:text-gray-300">Last updated</span>
                    <span className="font-medium text-gray-800 dark:text-gray-100">{course.lastUpdated}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-white/10">
                    <span className="text-gray-600 dark:text-gray-300">Total duration</span>
                    <span className="font-medium text-gray-800 dark:text-gray-100">{course.duration}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-white/10">
                    <span className="text-gray-600 dark:text-gray-300">Language</span>
                    <span className="font-medium text-gray-800 dark:text-gray-100">{course.language}</span>
                  </div>
                  {course.certificate && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-white/10">
                      <span className="text-gray-600 dark:text-gray-300">Certificate</span>
                      <Badge color="success">Yes</Badge>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600 dark:text-gray-300">Access</span>
                    <span className="font-medium text-gray-800 dark:text-gray-100">Lifetime</span>
                  </div>
                </div>
              </div>

              {/* Instructor Card */}
              <div className="bg-white dark:bg-brand-blue rounded-xl shadow-lg border border-gray-200 dark:border-brand-yellow/20 p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Course Instructor</h3>
                <div className="flex items-center gap-4">
                  {course.instructor?.profile_picture ? (
                    <img 
                      src={course.instructor.profile_picture} 
                      alt={course.instructor_name || 'Instructor'}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold">
                      {(course.instructor_name || course.instructor?.first_name || 'E')
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-100">
                      {course.instructor_name || 
                       (course.instructor?.first_name && course.instructor?.last_name 
                         ? `${course.instructor.first_name} ${course.instructor.last_name}` 
                         : course.instructor?.email || 'Ecodeed')}
                    </h4>
                    {course.instructor?.bio && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {course.instructor.bio.length > 80 
                          ? `${course.instructor.bio.substring(0, 80)}...` 
                          : course.instructor.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* What's Included */}
              <div className="bg-white dark:bg-brand-blue rounded-xl shadow-lg border border-gray-200 dark:border-brand-yellow/20 p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">This course includes:</h3>
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-600 dark:text-gray-200">
                    <HiOutlinePlay className="w-5 h-5 text-brand-yellow mr-3" />
                    {totalLessons} on-demand videos
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-200">
                    <HiOutlineDownload className="w-5 h-5 text-brand-green mr-3" />
                    Downloadable resources
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-200">
                    <HiOutlineClock className="w-5 h-5 text-brand-yellow mr-3" />
                    Lifetime access
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-200">
                    <HiOutlineQuestionMarkCircle className="w-5 h-5 text-brand-green mr-3" />
                    Q&A support
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal 
        show={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)}
        course={course}
        user={currentUser}
        onSuccess={() => {
          setIsEnrolled(true);
          // ensure header and other components know user now has enrollments
          dispatch(refreshUser());
        }}
      />
    </div>
  );
}