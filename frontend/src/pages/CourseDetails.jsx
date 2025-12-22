import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  HiOutlineCheckCircle, 
  HiOutlineClock, 
  HiOutlineUserCircle,
  HiOutlineDocumentText,
  HiOutlineShieldCheck,
  HiOutlineAcademicCap,
  HiOutlineVideoCamera
} from 'react-icons/hi';
import { Button, Badge, Accordion, Alert, Spinner } from 'flowbite-react';
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
      "Compliance requirements"
    ],
    curriculum: [
      {
        title: "Introduction",
        items: [
          "Understanding effluent licensing",
          "Legal requirements"
        ]
      },
      {
        title: "Application Process",
        items: [
          "Required documents",
          "Submission procedure"
        ]
      }
    ],
    faqs: [
      {
        question: "How long does approval take?",
        answer: "Typically 2-4 weeks with complete documentation"
      }
    ],
    targetAudience: [
      "Manufacturing businesses",
      "Environmental consultants"
    ],
    resources: [
      "Document templates",
      "Checklists"
    ],
    externalUrl: "https://payment-platform.com/enroll",
    category: "compliance"
  }
};

export default function CourseDetails() {
  const { slug } = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const [courseRes, enrollmentRes] = await Promise.all([
          fetch(`/api/courses/${slug}`),
          currentUser && fetch(`/api/enrollments/check?userId=${currentUser._id}&courseSlug=${slug}`)
        ]);

        let courseData;
        
        if (courseRes.ok) {
          courseData = await courseRes.json();
        } else {
          // Fallback to local data if API fails
          courseData = fallbackCourses[slug];
          if (!courseData) throw new Error('Course not found');
        }

        setCourse(courseData);

        if (currentUser && enrollmentRes?.ok) {
          const enrollmentData = await enrollmentRes.json();
          setIsEnrolled(enrollmentData.isEnrolled);
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
      await apiFetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser._id,
          courseId: course._id,
          paymentData
        })
      });
      
      setIsEnrolled(true);
      setShowPaymentModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <Alert color="failure" className="max-w-2xl">
        {error}
      </Alert>
    </div>
  );
  if (!course) return <div className="text-center py-12">Course not found</div>;

  // Dynamic icon based on course category
  const getCourseIcon = () => {
    switch(course.category) {
      case 'compliance':
        return <HiOutlineShieldCheck className="w-8 h-8 text-teal-600" />;
      case 'webinar':
        return <HiOutlineVideoCamera className="w-8 h-8 text-teal-600" />;
      default:
        return <HiOutlineAcademicCap className="w-8 h-8 text-teal-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Course Header */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
              <div className="flex items-center gap-4 mb-4">
                {getCourseIcon()}
                <h1 className="text-3xl font-bold text-teal-800">{course.title}</h1>
              </div>
              <p className="text-lg text-gray-700 mb-6">{course.shortDescription}</p>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <Badge color="info" icon={HiOutlineUserCircle}>
                  Level: {Array.isArray(course.level) ? course.level.join(', ') : course.level}
                </Badge>
                <Badge color="purple" icon={HiOutlineClock}>
                  Format: {Array.isArray(course.format) ? course.format.join(' + ') : course.format}
                </Badge>
                {course.isPopular && (
                  <Badge color="success">Bestseller</Badge>
                )}
                {course.isFree && (
                  <Badge color="warning">Free</Badge>
                )}
              </div>
            </div>
            
            <div className="md:w-1/3 bg-teal-50 rounded-lg p-6 border border-teal-100">
              <h3 className="text-xl font-semibold mb-4">
                {isEnrolled ? 'Course Access' : 'Enroll in Course'}
              </h3>
              
              {!isEnrolled ? (
                <>
                  {!course.isFree && (
                    <>
                      <p className="text-2xl font-bold text-teal-800 mb-2">
                        Ksh {course.price?.toLocaleString()}
                      </p>
                      <p className="text-gray-600 mb-6">One-time payment</p>
                    </>
                  )}
                  
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
                      'Start Course Now'
                    ) : (
                      'Enroll Now'
                    )}
                  </Button>
                  
                  <div className="text-sm text-gray-600">
                    <p className="flex items-center mb-2">
                      <HiOutlineCheckCircle className="mr-2 text-teal-500" />
                      Lifetime access
                    </p>
                    <p className="flex items-center">
                      <HiOutlineCheckCircle className="mr-2 text-teal-500" />
                      Certificate of completion
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <Badge color="success" className="mb-4">
                    You're enrolled!
                  </Badge>
                  <Link to={`/learn/${course.slug}`}>
                    <Button gradientDuoTone="tealToLime" className="w-full">
                      Continue Learning
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Course Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 font-medium ${activeTab === 'overview' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500'}`}
            >
              Course Overview
            </button>
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`py-4 px-1 font-medium ${activeTab === 'curriculum' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500'}`}
            >
              Curriculum
            </button>
            <button
              onClick={() => setActiveTab('faqs')}
              className={`py-4 px-1 font-medium ${activeTab === 'faqs' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500'}`}
            >
              FAQs
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-teal-800 mb-6">About This Course</h2>
            <div className="prose max-w-none mb-8">
              <p>{course.fullDescription}</p>
            </div>

            <h3 className="text-xl font-semibold mb-4">What You'll Learn</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {course.features?.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <HiOutlineCheckCircle className="h-5 w-5 text-teal-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <h3 className="text-xl font-semibold mb-4">Who This Course Is For</h3>
            <div className="flex flex-wrap gap-2 mb-8">
              {course.targetAudience?.map((audience, index) => (
                <Badge key={index} color="gray">
                  {audience}
                </Badge>
              ))}
            </div>

            <h3 className="text-xl font-semibold mb-4">Course Resources</h3>
            <div className="flex flex-wrap gap-2">
              {course.resources?.map((resource, index) => (
                <Badge key={index} color="info" icon={HiOutlineDocumentText}>
                  {resource}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'curriculum' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <Accordion alwaysOpen={true}>
              {course.curriculum?.map((section, index) => (
                <Accordion.Panel key={index}>
                  <Accordion.Title className="font-medium">
                    Section {index + 1}: {section.title}
                  </Accordion.Title>
                  <Accordion.Content>
                    <ul className="space-y-2">
                      {section.items?.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start">
                          <HiOutlineCheckCircle className="h-4 w-4 text-teal-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Accordion.Content>
                </Accordion.Panel>
              ))}
            </Accordion>
          </div>
        )}

        {activeTab === 'faqs' && (
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-teal-800 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {course.faqs?.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enrollment CTA */}
        {!isEnrolled && (
          <div className="bg-teal-50 rounded-xl p-8 border border-teal-100 text-center">
            <h2 className="text-2xl font-bold text-teal-800 mb-4">
              Ready to {course.category === 'compliance' ? 'Master Compliance' : 'Start Learning'}?
            </h2>
            <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
              {course.isFree ? (
                'Get immediate access to all course materials and resources'
              ) : (
                'Enroll today and get immediate access to all course materials, templates, and resources'
              )}
            </p>
            <Button
              gradientDuoTone="tealToLime"
              size="xl"
              className="mx-auto"
              onClick={handleEnroll}
              disabled={processing}
            >
              {processing ? (
                <Spinner aria-label="Processing..." />
              ) : course.isFree ? (
                'Start Course Now'
              ) : (
                `Enroll Now for Ksh ${course.price?.toLocaleString()}`
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal 
        show={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)}
        course={course}
        onSuccess={enrollUser}
      />
    </div>
  );
}