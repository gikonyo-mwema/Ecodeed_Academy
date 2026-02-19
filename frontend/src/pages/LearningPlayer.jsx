import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { Button, Sidebar, Progress, Accordion, Checkbox, Tooltip } from 'flowbite-react';
import { HiOutlineChevronLeft, HiOutlineCheckCircle, HiOutlineLockClosed, HiOutlinePlay, HiOutlineDocumentText } from 'react-icons/hi';
import { apiFetch } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function LearningPlayer() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await apiFetch(`/api/courses/${slug}/content`);
        setCourse(data);
        
        // Auto-select first lesson if available and nothing selected
        if (data.modules?.length > 0 && data.modules[0].lessons?.length > 0) {
            setCurrentLesson(data.modules[0].lessons[0]);
        }
      } catch (error) {
        console.error("Access error:", error);
        // Redirect to course sales page if access denied
        navigate(`/courses/${slug}`); 
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [slug, navigate]);

  const handleLessonSelect = (lesson) => {
    setCurrentLesson(lesson);
    // On mobile, maybe close sidebar
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const isLessonCompleted = (id) => completedLessons.includes(id);

  const markComplete = async () => {
      // TODO: Implement backend completion call
      if (currentLesson && !completedLessons.includes(currentLesson.id)) {
          setCompletedLessons([...completedLessons, currentLesson.id]);
      }
      autoAdvance();
  };

  const autoAdvance = () => {
       // Logic to find next lesson
       if (!course || !currentLesson) return;
       
       let foundCurrent = false;
       for (const module of course.modules) {
           for (const lesson of module.lessons) {
               if (foundCurrent) {
                   setCurrentLesson(lesson);
                   return;
               }
               if (lesson.id === currentLesson.id) foundCurrent = true;
           }
       }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!course) return <div>Course content unavailable.</div>;

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sidebar - Curriculum */}
      <div className={`${sidebarOpen ? 'w-full md:w-80' : 'w-0'} flex-shrink-0 bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="font-bold truncate" title={course.title}>{course.title}</h2>
          <Button color="gray" size="xs" onClick={() => navigate('/dashboard')}>
             Exit
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {course.modules?.map((module, mIndex) => (
            <div key={module.id} className="border-b border-gray-700">
              <div className="px-4 py-3 bg-gray-900 font-semibold text-sm text-gray-300">
                Section {mIndex + 1}: {module.title}
              </div>
              <div>
                {module.lessons?.map((lesson, lIndex) => (
                  <button
                    key={lesson.id}
                    onClick={() => handleLessonSelect(lesson)}
                    className={`w-full text-left px-4 py-3 text-sm flex items-start space-x-3 hover:bg-gray-700 transition-colors ${
                      currentLesson?.id === lesson.id ? 'bg-gray-700 border-l-4 border-brand-green' : 'border-l-4 border-transparent'
                    }`}
                  >
                    <div className="mt-0.5">
                       {isLessonCompleted(lesson.id) ? (
                           <HiOutlineCheckCircle className="text-green-400 w-5 h-5" />
                       ) : (
                           lesson.video_url ? <HiOutlinePlay className="w-5 h-5 opacity-70" /> : <HiOutlineDocumentText className="w-5 h-5 opacity-70" />
                       )}
                    </div>
                    <div className="flex-1">
                        <p className={`${currentLesson?.id === lesson.id ? 'text-white' : 'text-gray-400'}`}>
                            {lIndex + 1}. {lesson.title}
                        </p>
                        <span className="text-xs text-gray-500">{Math.floor(lesson.duration / 60)} min</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        {/* Top Bar (Mobile Toggle) */}
        {!sidebarOpen && (
             <div className="p-4 bg-gray-800 md:hidden">
                 <Button size="xs" onClick={() => setSidebarOpen(true)}>Show Menu</Button>
             </div>
        )}

        {/* Video Player Area */}
        <div className="bg-black aspect-video w-full max-h-[70vh] relative shadow-2xl">
            {currentLesson?.video_url ? (
                <ReactPlayer
                    url={currentLesson.video_url}
                    width="100%"
                    height="100%"
                    controls={true}
                    playing={false}
                    onEnded={markComplete}
                    config={{
                        youtube: { playerVars: { showinfo: 1 } },
                        vimeo: { playerOptions: { byline: false, portrait: false } }
                    }}
                />
            ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                        <HiOutlineDocumentText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-xl">Text / Reading Lesson</p>
                    </div>
                </div>
            )}
        </div>

        {/* Lesson Content & Controls */}
        <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
            <div className="flex justify-between items-start mb-6 border-b border-gray-700 pb-6">
                <div>
                   <h1 className="text-2xl font-bold mb-2">{currentLesson?.title}</h1>
                   <div className="flex items-center space-x-4 text-sm text-gray-400">
                       <span>{currentLesson?.duration ? `${Math.floor(currentLesson.duration / 60)} mins` : ''}</span>
                   </div>
                </div>
                <Button 
                    color={completedLessons.includes(currentLesson?.id) ? "success" : "light"} 
                    onClick={markComplete}
                >
                    {completedLessons.includes(currentLesson?.id) ? "Completed" : "Mark as Complete"}
                </Button>
            </div>

            <div className="prose prose-invert max-w-none">
                {currentLesson?.content ? (
                    <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                ) : (
                    <p className="text-gray-500 italic">No description provided for this lesson.</p>
                )}
            </div>
            
            <div className="mt-12 flex justify-between">
                 <Button color="gray" outline disabled>Previous Lesson</Button>
                 <Button gradientDuoTone="tealToLime" onClick={autoAdvance}>Next Lesson</Button>
            </div>
        </div>
      </div>
      
      {/* Floating Toggle for Desktop */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed bottom-6 right-6 z-50 p-3 bg-gray-800 rounded-full shadow-lg border border-gray-600 hover:bg-gray-700 hidden md:block"
      >
          {sidebarOpen ? <HiOutlineChevronLeft className="w-6 h-6" /> : "Menu"}
      </button>
    </div>
  );
}
