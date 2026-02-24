import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { refreshUser } from '../redux/user/userSlice';
import { 
  HiOutlineCheckCircle, 
  HiOutlineClock, 
  HiOutlineUserCircle,
  HiOutlineDocumentText,
  HiOutlineShieldCheck,
  HiOutlineAcademicCap,
  HiOutlineVideoCamera,
  HiOutlineStar,
  HiOutlineUsers,
  HiOutlineGlobe,
  HiOutlineBookOpen,
  HiOutlineCog,
  HiOutlineLightningBolt,
  HiOutlineChartBar,
  HiOutlineDownload,
  HiOutlinePlay,
  HiOutlineChevronRight,
  HiOutlineQuestionMarkCircle
} from 'react-icons/hi';
import { Button, Badge, Accordion, Alert, Spinner, Progress, Tabs, Card } from 'flowbite-react';
import PaymentModal from '../components/Modal/PaymentModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { apiFetch } from '../utils/api';

// Fallback course data (can be moved to separate file)
const fallbackCourses = {
  'effluent-discharge-license': {
    title: "How to Apply for Effluent Discharge License by NEMA",
    shortDescription: "Step-by-step guidance to apply and renew your Effluent Discharge License",
    fullDescription: "Your business can't afford to ignore this...", // Full description
    price: 5000,
    isFree: false,
    level: ["Business Owners", "Environmental Managers"],
    format: ["Self-paced", "Practical tools"],
    features: [
      "Step-by-step application process",
      "Document preparation guidance",
      "Compliance requirements",
      "NEMA liaison strategies",
      "Renewal procedures",
      "Common pitfalls to avoid"
    ],
    curriculum: [
      {
        title: "Introduction to Effluent Discharge Licensing",
        items: [
          { title: "Understanding effluent licensing", duration: "15 min", type: "video" },
          { title: "Legal requirements and framework", duration: "20 min", type: "video" },
          { title: "NEMA's role and responsibilities", duration: "10 min", type: "reading" }
        ]
      },
      {
        title: "Application Process",
        items: [
          { title: "Required documents checklist", duration: "25 min", type: "interactive" },
          { title: "Step-by-step submission procedure", duration: "30 min", type: "video" },
          { title: "Common mistakes to avoid", duration: "15 min", type: "video" }
        ]
      },
      {
        title: "Post-Approval & Renewal",
        items: [
          { title: "Maintaining compliance", duration: "20 min", type: "video" },
          { title: "Annual renewal process", duration: "15 min", type: "reading" },
          { title: "Handling inspections", duration: "20 min", type: "video" }
        ]
      }
    ],
    faqs: [
      {
        question: "How long does approval take?",
        answer: "Typically 2-4 weeks with complete documentation. However, processing times may vary depending on NEMA's current workload and the complexity of your application. Our course includes tips to expedite the process."
      },
      {
        question: "What documents do I need to prepare?",
        answer: "You'll need your business registration certificate, site plans, effluent characterization report, environmental management plan, and proof of payment. Our course provides detailed checklists and templates for each document."
      },
      {
        question: "Is this license renewable?",
        answer: "Yes, the Effluent Discharge License must be renewed annually. The course covers both initial applications and the renewal process to ensure continued compliance."
      },
      {
        question: "What happens if I operate without a license?",
        answer: "Operating without a valid license can result in significant fines, legal action, and potential closure of your facility. NEMA conducts regular inspections and takes non-compliance seriously."
      }
    ],
    targetAudience: [
      "Manufacturing businesses",
      "Environmental consultants",
      "Factory managers",
      "Compliance officers"
    ],
    resources: [
      "Application templates",
      "Document checklists",
      "Sample reports",
      "NEMA liaison guide",
      "Regulatory updates"
    ],
    externalUrl: "https://payment-platform.com/enroll",
    category: "compliance",
    duration: "4 hours total",
    students: "1,234 enrolled",
    rating: 4.8,
    reviews: 156,
    lastUpdated: "January 2025",
    language: "English",
    certificate: false
  }
};

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
        const courseRes = await fetch(`/api/courses/${slug}/`);
        
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
          
          // Merge with fallback data for empty fields
          const fallback = fallbackCourses[slug] || {};
          courseData.fullDescription = courseData.fullDescription || fallback.fullDescription || 'Course description coming soon.';
          courseData.features = courseData.features?.length ? courseData.features : fallback.features || [];
          courseData.faqs = courseData.faqs?.length ? courseData.faqs : fallback.faqs || [];
          courseData.targetAudience = courseData.targetAudience?.length ? courseData.targetAudience : fallback.targetAudience || [];
          courseData.resources = courseData.resources?.length ? courseData.resources : fallback.resources || [];
          courseData.curriculum = courseData.curriculum?.length ? courseData.curriculum : fallback.curriculum || [];
          courseData.duration = courseData.duration || fallback.duration || 'Self-paced';
          courseData.students = courseData.students || fallback.students || 'New course';
          courseData.rating = courseData.rating || fallback.rating || 4.5;
          courseData.reviews = courseData.reviews || fallback.reviews || 0;
          courseData.language = courseData.language || fallback.language || 'English';
          courseData.certificate = courseData.hasCertificate !== undefined ? courseData.hasCertificate : false;
        } else {
          // Fallback to local data if API fails
          courseData = fallbackCourses[slug];
          if (!courseData) throw new Error('Course not found');
        }

        setCourse(courseData);

        // Check enrollment status if user is logged in
        if (currentUser) {
          try {
            const enrollmentData = await apiFetch(`/api/enrollments/check/?userId=${currentUser.id || currentUser._id}&courseSlug=${slug}`);
            setIsEnrolled(enrollmentData?.isEnrolled || false);
          } catch (enrollErr) {
            // Enrollment check failed (possibly not logged in properly), default to not enrolled
            console.log('Enrollment check failed:', enrollErr);
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
    if (course.isFree) {
      enrollUser();
    } else if (course.externalUrl) {
      // External payment platform
      setProcessing(true);
      window.location.href = course.externalUrl;
    } else {
      // Show our payment modal
      setShowPaymentModal(true);
    }
  };

  const enrollUser = async (paymentData = null) => {
    try {
      setProcessing(true);
      
      if (!course.isFree && !paymentData) {
         throw new Error("Payment required for this course.");
      }

      await apiFetch('/api/enrollments/', {
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
      
      // Navigate to the learning page after successful enrollment
      navigate(`/learn/${course.slug}`);
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
            <Button gradientDuoTone="tealToLime">
              Browse Other Courses
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
  if (!course) return <div className="text-center py-12">Course not found</div>;

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
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
              <div className="bg-white rounded-2xl shadow-2xl p-6">
                <div className="text-center mb-6">
                  {!course.isFree ? (
                    <>
                      <span className="text-4xl font-bold text-gray-800">
                        Ksh {course.price?.toLocaleString()}
                      </span>
                      <span className="text-gray-500 ml-2">one-time</span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-green-600">Free</span>
                  )}
                </div>

                {!isEnrolled ? (
                  <>
                    <Button
                      gradientDuoTone="tealToLime"
                      size="lg"
                      className="w-full mb-4"
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

                    <div className="space-y-3 text-sm text-gray-600">
                      <p className="flex items-center">
                        <HiOutlineCheckCircle className="mr-2 text-teal-500 w-5 h-5" />
                        Lifetime access
                      </p>
                      {course.certificate && (
                        <p className="flex items-center">
                          <HiOutlineCheckCircle className="mr-2 text-teal-500 w-5 h-5" />
                          Certificate of completion
                        </p>
                      )}
                      <p className="flex items-center">
                        <HiOutlineCheckCircle className="mr-2 text-teal-500 w-5 h-5" />
                        30-day money-back guarantee
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <Badge color="success" className="mb-4">
                      ✓ You're enrolled!
                    </Badge>
                    <Button 
                      gradientDuoTone="tealToLime" 
                      className="w-full"
                      onClick={() => navigate(`/learn/${course.slug}`)}
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
              <Tabs.Group
                aria-label="Course tabs"
                style="underline"
                onActiveTabChange={(tab) => setActiveTab(tab)}
              >
                <Tabs.Item title="Overview" active={activeTab === 0}>
                  <div className="p-6">
                    <div className="prose max-w-none">
                      <h2 className="text-2xl font-bold text-gray-800 mb-4">About This Course</h2>
                      <p className="text-gray-600 leading-relaxed">
                        {showFullDescription ? course.fullDescription : `${course.fullDescription?.substring(0, 300)}...`}
                      </p>
                      {course.fullDescription?.length > 300 && (
                        <button
                          onClick={() => setShowFullDescription(!showFullDescription)}
                          className="text-teal-600 font-medium hover:text-teal-700 mt-2"
                        >
                          {showFullDescription ? 'Show less' : 'Read more'}
                        </button>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mt-8 mb-4">What You'll Learn</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {course.features?.map((feature, index) => (
                        <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                          <HiOutlineCheckCircle className="h-5 w-5 text-teal-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mt-8 mb-4">Who This Course Is For</h3>
                    <div className="flex flex-wrap gap-2">
                      {course.targetAudience?.map((audience, index) => (
                        <Badge key={index} color="indigo" className="px-3 py-1 text-sm">
                          {audience}
                        </Badge>
                      ))}
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mt-8 mb-4">Course Resources</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {course.resources?.map((resource, index) => (
                        <div key={index} className="flex items-center p-3 bg-teal-50 rounded-lg">
                          <HiOutlineDocumentText className="h-5 w-5 text-teal-500 mr-2" />
                          <span className="text-gray-700 text-sm">{resource}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Tabs.Item>

                <Tabs.Item title="Curriculum" active={activeTab === 1}>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-800">Course Curriculum</h2>
                      <Badge color="success">{course.curriculum?.length} sections</Badge>
                    </div>
                    
                    <Accordion alwaysOpen={true} className="border-none">
                      {course.curriculum?.map((section, index) => (
                        <Accordion.Panel key={index}>
                          <Accordion.Title className="bg-gray-50 hover:bg-gray-100 focus:ring-0">
                            <div className="flex items-center justify-between w-full">
                              <span className="font-medium">Section {index + 1}: {section.title}</span>
                              <Badge color="gray">{section.items?.length} lessons</Badge>
                            </div>
                          </Accordion.Title>
                          <Accordion.Content>
                            <ul className="space-y-3">
                              {section.items?.map((item, itemIndex) => (
                                <li key={itemIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center">
                                    {item.type === 'video' ? (
                                      <HiOutlinePlay className="h-4 w-4 text-red-500 mr-3" />
                                    ) : item.type === 'interactive' ? (
                                      <HiOutlineCog className="h-4 w-4 text-purple-500 mr-3" />
                                    ) : (
                                      <HiOutlineBookOpen className="h-4 w-4 text-blue-500 mr-3" />
                                    )}
                                    <span className="text-gray-700">{typeof item === 'object' ? item.title : item}</span>
                                  </div>
                                  <span className="text-sm text-gray-500">{item.duration || '10 min'}</span>
                                </li>
                              ))}
                            </ul>
                          </Accordion.Content>
                        </Accordion.Panel>
                      ))}
                    </Accordion>
                  </div>
                </Tabs.Item>

                <Tabs.Item title="FAQs" active={activeTab === 2}>
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                      {course.faqs?.map((faq, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                          <details className="group">
                            <summary className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 hover:bg-gray-100">
                              <h3 className="font-medium text-gray-800">{faq.question}</h3>
                              <HiOutlineChevronRight className="w-5 h-5 text-gray-500 group-open:rotate-90 transition-transform" />
                            </summary>
                            <div className="p-4 bg-white">
                              <p className="text-gray-600">{faq.answer}</p>
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
              <div className="lg:hidden bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="text-center mb-6">
                  {!course.isFree ? (
                    <>
                      <span className="text-4xl font-bold text-gray-800">
                        Ksh {course.price?.toLocaleString()}
                      </span>
                      <span className="text-gray-500 ml-2">one-time</span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-green-600">Free</span>
                  )}
                </div>

                {!isEnrolled ? (
                  <>
                    <Button
                      gradientDuoTone="tealToLime"
                      size="lg"
                      className="w-full mb-4"
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

                    <div className="space-y-2 text-sm text-gray-600">
                      <p className="flex items-center">
                        <HiOutlineCheckCircle className="mr-2 text-teal-500" />
                        Lifetime access
                      </p>
                      {course.certificate && (
                        <p className="flex items-center">
                          <HiOutlineCheckCircle className="mr-2 text-teal-500" />
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
                      gradientDuoTone="tealToLime" 
                      className="w-full"
                      onClick={() => navigate(`/learn/${course.slug}`)}
                    >
                      Continue Learning
                    </Button>
                  </div>
                )}
              </div>

              {/* Course Details Card */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Course Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Last updated</span>
                    <span className="font-medium text-gray-800">{course.lastUpdated}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Total duration</span>
                    <span className="font-medium text-gray-800">{course.duration}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Language</span>
                    <span className="font-medium text-gray-800">{course.language}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Certificate</span>
                    <Badge color={course.certificate ? 'success' : 'gray'}>
                      {course.certificate ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Access</span>
                    <span className="font-medium text-gray-800">Lifetime</span>
                  </div>
                </div>
              </div>

              {/* Instructor Card */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Course Instructor</h3>
                <div className="flex items-center gap-4">
                  {course.instructor?.profile_picture ? (
                    <img 
                      src={course.instructor.profile_picture} 
                      alt={course.instructor.name || course.instructor.username}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold">
                      {(course.instructor?.name || course.instructor?.username || course.instructor?.first_name || 'E')
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-gray-800">
                      {course.instructor?.name || course.instructor?.username || 
                       (course.instructor?.first_name && course.instructor?.last_name 
                         ? `${course.instructor.first_name} ${course.instructor.last_name}` 
                         : 'Ecodeed Academy')}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {course.instructor?.title || course.instructor?.bio?.substring(0, 50) || 'Environmental Expert'}
                    </p>
                    {course.instructor?.experience && (
                      <p className="text-sm text-gray-500 mt-1">{course.instructor.experience}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* What's Included */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">This course includes:</h3>
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-600">
                    <HiOutlinePlay className="w-5 h-5 text-teal-500 mr-3" />
                    {course.curriculum?.length} on-demand videos
                  </li>
                  <li className="flex items-center text-gray-600">
                    <HiOutlineDownload className="w-5 h-5 text-teal-500 mr-3" />
                    Downloadable resources
                  </li>
                  <li className="flex items-center text-gray-600">
                    <HiOutlineClock className="w-5 h-5 text-teal-500 mr-3" />
                    Lifetime access
                  </li>
                  <li className="flex items-center text-gray-600">
                    <HiOutlineQuestionMarkCircle className="w-5 h-5 text-teal-500 mr-3" />
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
        onSuccess={() => setIsEnrolled(true)}
      />
    </div>
  );
}