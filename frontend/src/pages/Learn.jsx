import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Sidebar, Spinner, Accordion, Button, Alert } from 'flowbite-react';
import { 
  HiOutlinePlay, 
  HiMenu, 
  HiCheckCircle, 
  HiOutlineCheckCircle,
  HiOutlineChevronLeft 
} from 'react-icons/hi';
import ReactPlayer from 'react-player';

export default function Learn() {
  const { slug } = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Parse course content to find initial lesson
  const findFirstLesson = (courseData) => {
    if (courseData.modules?.[0]?.lessons?.[0]) {
      return courseData.modules[0].lessons[0];
    }
    return null;
  };

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/courses/${slug}/content`, {
           headers: {
             'Authorization': token ? `Bearer ${token}` : '',
           }
        });

        if (res.status === 403) {
           setError('You must be enrolled to access this course.');
           // Redirect after 3 seconds
           setTimeout(() => navigate(`/courses/${slug}`), 3000);
           return;
        }

        if (!res.ok) throw new Error('Failed to load course content.');

        const data = await res.json();
        setCourse(data);
        
        // Auto-select first lesson if none selected
        if (!activeLesson) {
          const first = findFirstLesson(data);
          if (first) setActiveLesson(first);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchContent();
    } else {
      setLoading(false);
      setError('Please log in to continue.');
    }
  }, [slug, currentUser, navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <Spinner size="xl" />
        <p className="mt-4">Loading Classroom...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Alert color="failure" withBorderAccent>
        <span className="font-medium">Access Denied!</span> {error}
      </Alert>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Curriculum */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} bg-white border-r border-gray-200 transition-all duration-300 md:relative absolute z-20 h-full flex flex-col`}>
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-brand-green text-white">
          <h2 className="font-bold truncate" title={course.title}>{course.title}</h2>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden">
             <HiOutlineChevronLeft className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
           {course.modules && course.modules.map((module, mIndex) => (
             <div key={module.id} className="border-b border-gray-100">
               <div className="p-3 bg-gray-50 font-medium text-sm text-gray-700">
                 Section {mIndex + 1}: {module.title}
               </div>
               <div>
                 {module.lessons && module.lessons.map((lesson, lIndex) => (
                   <button
                     key={lesson.id}
                     onClick={() => setActiveLesson(lesson)}
                     className={`w-full text-left p-3 flex items-start gap-3 hover:bg-gray-50 transition-colors text-sm ${
                       activeLesson?.id === lesson.id ? 'bg-teal-50 border-r-4 border-teal-500' : ''
                     }`}
                   >
                     {/* Status Icon */}
                     <div className="mt-0.5">
                       {/* TODO: Check completed_lessons state */}
                       <HiOutlinePlay className={`w-4 h-4 ${activeLesson?.id === lesson.id ? 'text-teal-600' : 'text-gray-400'}`} />
                     </div>
                     <div className={activeLesson?.id === lesson.id ? 'text-teal-700 font-medium' : 'text-gray-600'}>
                       {lIndex + 1}. {lesson.title}
                       <div className="text-xs text-gray-400 mt-1">{Math.floor(lesson.duration / 60)} min</div>
                     </div>
                   </button>
                 ))}
               </div>
             </div>
           ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Top Bar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center px-4 justify-between shrink-0">
          <div className="flex items-center gap-4">
             {!sidebarOpen && (
               <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
                 <HiMenu className="w-6 h-6 text-gray-600" />
               </button>
             )}
             <Button color="gray" size="xs" onClick={() => navigate('/dashboard')}>
               Back to Dashboard
             </Button>
          </div>
          <h1 className="text-lg font-bold text-gray-800 truncate hidden md:block">
            {activeLesson?.title || 'Course Intro'}
          </h1>
          <div className="w-8"></div> {/* Spacer */}
        </div>

        {/* Video Player Area */}
        <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden">
          {activeLesson ? (
             <div className="w-full h-full">
               {activeLesson.video_url ? (
                 <ReactPlayer 
                    url={activeLesson.video_url} 
                    width="100%" 
                    height="100%" 
                    controls={true}
                    playing={true}
                 />
               ) : (
                 <div className="text-white text-center p-8">
                   <h3 className="text-xl mb-4">{activeLesson.title}</h3>
                   <div className="prose prose-invert max-w-2xl mx-auto text-left">
                     {activeLesson.content || 'No content provided for this lesson.'}
                   </div>
                 </div>
               )}
             </div>
          ) : (
            <div className="text-gray-500">Select a lesson to start learning</div>
          )}
        </div>
        
        {/* Lesson Footer */}
        {activeLesson && (
          <div className="bg-white border-t border-gray-200 p-4 shrink-0 flex justify-between items-center">
            <div>
              <h3 className="font-medium text-gray-900 md:hidden">{activeLesson.title}</h3>
            </div>
            <div className="flex gap-3">
               {/* <Button color="light">Previous</Button> */}
               <Button gradientDuoTone="tealToLime">
                 Mark as Complete <HiCheckCircle className="ml-2 h-5 w-5" />
               </Button>
               {/* <Button color="light">Next</Button> */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
