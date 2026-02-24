import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  HiCheckCircle, 
  HiLockClosed, 
  HiPlay, 
  HiDownload, 
  HiChatAlt, 
  HiVideoCamera,
  HiCalendar,
  HiClock,
  HiBookOpen,
  HiAcademicCap,
  HiUsers,
  HiLightningBolt,
  HiStar,
  HiChevronRight,
  HiOutlineDocumentDownload,
  HiOutlineCollection,
  HiOutlineChat,
} from 'react-icons/hi';
import { Badge, Progress, Avatar, Tooltip, Dropdown } from 'flowbite-react';

export default function StudentDashboard() {
  const { currentUser } = useSelector((state) => state.user);
  const [courseData, setCourseData] = useState(null);
  const [activeWeek, setActiveWeek] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Mock data with enhanced structure
  const mockWeeks = [
    { 
      id: 1, 
      title: 'Week 1: The Real World of EIA Consulting', 
      status: 'completed',
      progress: 100,
      objectives: ['Understand EIA consulting landscape', 'Identify key stakeholders', 'Learn basic methodologies'],
      duration: '2.5 hours',
      lessons: 4,
      completedAt: 'Feb 10, 2025'
    },
    { 
      id: 2, 
      title: 'Week 2: Finding & Closing EIA Clients', 
      status: 'completed',
      progress: 100,
      objectives: ['Sales strategies for consulting', 'Client communication', 'Proposal writing'],
      duration: '3 hours',
      lessons: 5,
      completedAt: 'Feb 15, 2025'
    },
    { 
      id: 3, 
      title: 'Week 3: Research & Baseline Study Methodology', 
      status: 'completed',
      progress: 100,
      objectives: ['Data collection methods', 'Environmental sampling', 'Analysis techniques'],
      duration: '4 hours',
      lessons: 6,
      completedAt: 'Feb 20, 2025'
    },
    { 
      id: 4, 
      title: 'Week 4: Public Participation Mastery', 
      status: 'in-progress',
      progress: 60,
      objectives: ['Community engagement', 'Public meeting facilitation', 'Stakeholder management'],
      duration: '3.5 hours',
      lessons: 4,
      currentLesson: 2,
      nextSession: 'Feb 24, 2025 • 2:00 PM EST'
    },
    { 
      id: 5, 
      title: 'Week 5: Regulatory Navigation', 
      status: 'locked',
      progress: 0,
      objectives: ['Understanding regulations', 'Permit applications', 'Compliance monitoring'],
      duration: '3 hours',
      lessons: 4,
      unlocksIn: '3 days'
    },
  ];

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setCourseData({
        title: 'Environmental Impact Assessment (EIA) Certification',
        subtitle: 'Master the art of environmental consulting',
        weeks: mockWeeks,
        overallProgress: 60,
        nextLiveSession: {
          title: 'Public Participation Strategies',
          date: 'Feb 24, 2025',
          time: '2:00 PM EST',
          host: 'Dr. Sarah Johnson'
        },
        achievements: [
          { title: 'Fast Learner', earned: true, icon: HiLightningBolt },
          { title: 'Consistent', earned: true, icon: HiStar },
          { title: 'Discussion Leader', earned: false, icon: HiUsers }
        ],
        stats: {
          totalHours: 12.5,
          completedLessons: 15,
          totalLessons: 25,
          discussions: 8
        }
      });
      setActiveWeek(mockWeeks[3]); // Default to in-progress week
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed':
        return <Badge color="success" className="px-2 py-0.5 text-xs">Completed</Badge>;
      case 'in-progress':
        return <Badge color="warning" className="px-2 py-0.5 text-xs">In Progress</Badge>;
      case 'locked':
        return <Badge color="gray" className="px-2 py-0.5 text-xs">Locked</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
        return <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white"><HiCheckCircle className="w-4 h-4" /></div>;
      case 'in-progress':
        return <div className="w-6 h-6 rounded-full border-2 border-blue-500 flex items-center justify-center"><div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div></div>;
      case 'locked':
        return <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500"><HiLockClosed className="w-3.5 h-3.5" /></div>;
      default:
        return null;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">{activeWeek?.title}</h2>
        <p className="text-blue-100 mb-4">Theme: Managing Communities & Conflict</p>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <HiClock className="w-4 h-4 text-blue-200" />
            <span className="text-sm text-blue-100">{activeWeek?.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <HiBookOpen className="w-4 h-4 text-blue-200" />
            <span className="text-sm text-blue-100">{activeWeek?.lessons} lessons</span>
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-700">Weekly Progress</h3>
          <span className="text-sm font-medium text-blue-600">{activeWeek?.progress}% Complete</span>
        </div>
        <Progress 
          progress={activeWeek?.progress} 
          color="blue"
          className="h-2.5 mb-4"
        />
        
        {activeWeek?.status === 'in-progress' && activeWeek?.nextSession && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <HiVideoCamera className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Next Live Session</p>
                <p className="text-sm text-purple-600 font-semibold">{activeWeek.nextSession}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Learning Objectives */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <HiAcademicCap className="w-5 h-5 text-blue-500" />
          Learning Objectives
        </h3>
        <ul className="space-y-3">
          {activeWeek?.objectives.map((objective, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
              <span className="text-gray-600">{objective}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Introduction Video */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="font-semibold text-gray-700">Week Introduction</h3>
          <p className="text-sm text-gray-500 mt-1">Get started with an overview of this week's content</p>
        </div>
        <div className="p-6 bg-gray-50">
          <div className="relative group cursor-pointer">
            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors"></div>
              <div className="relative z-10 w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <HiPlay className="w-8 h-8 text-blue-600 ml-1" />
              </div>
              <p className="absolute bottom-4 left-4 text-white text-sm font-medium">Preview this week</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLessons = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Week {activeWeek?.id} Lessons</h2>
        <Badge color="blue" className="px-3 py-1">
          {activeWeek?.currentLesson || 0}/{activeWeek?.lessons} completed
        </Badge>
      </div>
      
      {[1, 2, 3, 4].map((lesson, index) => {
        const isCompleted = index < (activeWeek?.currentLesson || 0);
        const isCurrent = index === (activeWeek?.currentLesson || 0);
        
        return (
          <div 
            key={lesson} 
            className={`group bg-white rounded-xl border transition-all hover:shadow-md
              ${isCurrent ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}
              ${isCompleted ? 'bg-gray-50' : ''}
            `}
          >
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Status Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center
                    ${isCompleted ? 'bg-green-100' : isCurrent ? 'bg-blue-100' : 'bg-gray-100'}
                  `}>
                    {isCompleted ? (
                      <HiCheckCircle className="w-5 h-5 text-green-600" />
                    ) : isCurrent ? (
                      <HiPlay className="w-5 h-5 text-blue-600 ml-0.5" />
                    ) : (
                      <HiLockClosed className="w-4 h-4 text-gray-400" />
                    )}
                  </div>

                  {/* Lesson Info */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                      Lesson {lesson}: {index === 0 ? 'Understanding Community Dynamics' : 
                                      index === 1 ? 'Stakeholder Identification & Analysis' :
                                      index === 2 ? 'Facilitating Public Meetings' : 'Managing Conflict & Objections'}
                    </h4>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <HiVideoCamera className="w-3.5 h-3.5" />
                        Video • 15 mins
                      </span>
                      {isCompleted && (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <HiCheckCircle className="w-3.5 h-3.5" />
                          Completed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  {!isCompleted ? (
                    <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${isCurrent 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={!isCurrent}
                    >
                      {isCurrent ? 'Start Lesson' : 'Locked'}
                    </button>
                  ) : (
                    <button className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                      Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Next Up Preview */}
      {activeWeek?.currentLesson === activeWeek?.lessons && (
        <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-full">
                <HiCheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Week Complete! 🎉</h3>
                <p className="text-sm text-gray-600">Ready to move to Week {activeWeek.id + 1}?</p>
              </div>
            </div>
            <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Continue to Next Week
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderResources = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Course Resources</h2>
      
      {/* Categories */}
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { title: 'Toolkits & Templates', icon: HiOutlineDocumentDownload, count: 4 },
          { title: 'Guides & Handbooks', icon: HiBookOpen, count: 6 },
          { title: 'Case Studies', icon: HiOutlineCollection, count: 3 },
          { title: 'Discussion Materials', icon: HiOutlineChat, count: 2 }
        ].map((category, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <category.icon className="w-6 h-6 text-blue-600" />
              </div>
              <Badge color="blue">{category.count} items</Badge>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">{category.title}</h3>
            <button className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1">
              View all <HiChevronRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Recent Resources */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-8">
        <div className="p-6 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-700">Recent Resources</h3>
        </div>
        <div className="divide-y">
          {[
            { name: 'Public participation toolkit', type: 'PDF', size: '2.4 MB', downloads: 234 },
            { name: 'Conflict de-escalation guide', type: 'DOC', size: '1.1 MB', downloads: 189 },
            { name: 'Stakeholder communication framework', type: 'XLSX', size: '856 KB', downloads: 156 },
          ].map((resource, idx) => (
            <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded">
                    <HiDownload className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{resource.name}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span>{resource.type}</span>
                      <span>{resource.size}</span>
                      <span>{resource.downloads} downloads</span>
                    </div>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                  <HiDownload className="w-4 h-4" />
                  <span className="text-sm font-medium">Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAssignment = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Week 4 Assignment</h2>
        <p className="text-orange-100">Public Meeting Preparation</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Public Meeting Prep</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <HiCalendar className="w-4 h-4" />
                  Due: Feb 24, 2025
                </span>
                <span className="flex items-center gap-1 text-red-500">
                  <HiClock className="w-4 h-4" />
                  2 days remaining
                </span>
              </div>
            </div>
            <Badge color="warning" className="px-3 py-1">Pending</Badge>
          </div>
        </div>

        <div className="p-6">
          <h4 className="font-semibold text-gray-700 mb-3">Assignment Details</h4>
          <p className="text-gray-600 mb-6">
            Prepare the following documents for a public meeting scenario:
          </p>
          
          <ul className="space-y-3 mb-8">
            {[
              'Public meeting notice with all required elements',
              'Attendance sheet template for participant tracking',
              'Meeting minutes template with key discussion points',
              'Stakeholder engagement log'
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                </div>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>

          {/* Submission Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 bg-gray-50 hover:border-blue-400 transition-colors">
            <div className="text-center">
              <div className="p-4 bg-white rounded-full w-20 h-20 mx-auto mb-4 shadow-sm">
                <HiDownload className="w-12 h-12 text-gray-400" />
              </div>
              <h4 className="font-semibold text-gray-700 mb-2">Submit Your Work</h4>
              <p className="text-sm text-gray-500 mb-4">Drag and drop files here or click to browse</p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Select Files
              </button>
              <p className="text-xs text-gray-400 mt-4">Supported: PDF, DOC, DOCX up to 10MB</p>
            </div>
          </div>

          {/* Rubric Preview */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <HiStar className="w-5 h-5 text-blue-500" />
              Grading Rubric
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {[
                { criterion: 'Completeness', weight: '30%' },
                { criterion: 'Accuracy', weight: '25%' },
                { criterion: 'Professional Format', weight: '25%' },
                { criterion: 'Timeliness', weight: '20%' },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 bg-white rounded">
                  <span className="text-sm text-gray-600">{item.criterion}</span>
                  <Badge color="blue">{item.weight}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLive = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Upcoming Session */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
            <HiVideoCamera className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">Live Session</h2>
            <p className="text-purple-100">Discussion + Q&A</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <HiCalendar className="w-5 h-5 text-purple-200" />
              <span>Friday, Feb 24th</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <HiClock className="w-5 h-5 text-purple-200" />
              <span>2:00 PM EST</span>
            </div>
            <div className="flex items-center gap-3">
              <HiUsers className="w-5 h-5 text-purple-200" />
              <span>Hosted by Dr. Sarah Johnson</span>
            </div>
          </div>
          
          <div className="flex items-center justify-end">
            <a href="#" className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-colors">
              <HiVideoCamera className="w-5 h-5" />
              Join Zoom Meeting
            </a>
          </div>
        </div>
      </div>

      {/* Past Recordings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-700">Past Recordings</h3>
        </div>
        <div className="divide-y">
          {[
            { title: 'Week 3: Research Methodology Deep Dive', date: 'Feb 17, 2025', duration: '1.5 hours', views: 234 },
            { title: 'Week 2: Client Acquisition Strategies', date: 'Feb 10, 2025', duration: '1.5 hours', views: 189 },
            { title: 'Week 1: Introduction to EIA Consulting', date: 'Feb 3, 2025', duration: '2 hours', views: 312 },
          ].map((recording, idx) => (
            <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <HiVideoCamera className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{recording.title}</h4>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <HiCalendar className="w-3.5 h-3.5" />
                        {recording.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <HiClock className="w-3.5 h-3.5" />
                        {recording.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <HiUsers className="w-3.5 h-3.5" />
                        {recording.views} views
                      </span>
                    </div>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors">
                  <HiPlay className="w-4 h-4" />
                  <span className="text-sm font-medium">Watch</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discussion Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <HiChatAlt className="w-5 h-5 text-purple-500" />
          Live Chat Discussion
        </h3>
        <div className="space-y-4">
          {[
            { user: 'Michael K.', message: 'Looking forward to discussing public participation strategies!', time: '5 min ago' },
            { user: 'Sarah M.', message: 'Has anyone dealt with difficult stakeholders before?', time: '12 min ago' },
          ].map((msg, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <Avatar size="sm" rounded placeholderInitials={msg.user[0]} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{msg.user}</span>
                  <span className="text-xs text-gray-400">{msg.time}</span>
                </div>
                <p className="text-sm text-gray-600">{msg.message}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="mt-4 w-full py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
          Join Discussion
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    if (!activeWeek) return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4">
            <HiBookOpen className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Select a week to begin</h3>
          <p className="text-gray-500">Choose a week from the curriculum to view content</p>
        </div>
      </div>
    );

    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'lessons':
        return renderLessons();
      case 'resources':
        return renderResources();
      case 'assignment':
        return renderAssignment();
      case 'live':
        return renderLive();
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="lg:w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* User Profile */}
        <div className="p-6 border-b bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="flex items-center gap-4 mb-4">
            <Avatar 
              rounded 
              size="lg"
              placeholderInitials={currentUser?.username?.[0] || 'S'}
              className="ring-2 ring-white shadow-lg"
            />
            <div>
              <h2 className="font-bold text-gray-800">{currentUser?.username || 'Student'}</h2>
              <p className="text-sm text-gray-600">{currentUser?.email || 'student@example.com'}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Overall Progress</span>
              <span className="font-semibold text-blue-600">{courseData?.overallProgress}%</span>
            </div>
            <Progress 
              progress={courseData?.overallProgress} 
              color="blue"
              className="h-2"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 p-4 border-b">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-gray-800">{courseData?.stats?.totalHours}h</div>
            <div className="text-xs text-gray-500">Hours Learned</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-gray-800">{courseData?.stats?.completedLessons}/{courseData?.stats?.totalLessons}</div>
            <div className="text-xs text-gray-500">Lessons Done</div>
          </div>
        </div>

        {/* Curriculum */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="font-semibold text-gray-500 text-xs uppercase tracking-wider mb-3 px-2">
            Course Curriculum
          </h3>
          <div className="space-y-1">
            {courseData?.weeks.map((week) => (
              <button
                key={week.id}
                onClick={() => week.status !== 'locked' && setActiveWeek(week)}
                disabled={week.status === 'locked'}
                className={`w-full text-left p-3 rounded-xl transition-all
                  ${activeWeek?.id === week.id 
                    ? 'bg-blue-50 border-blue-200 border shadow-sm' 
                    : 'hover:bg-gray-50 border border-transparent'
                  }
                  ${week.status === 'locked' ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(week.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{week.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(week.status)}
                      {week.status === 'in-progress' && (
                        <span className="text-xs text-gray-500">{week.progress}%</span>
                      )}
                      {week.status === 'locked' && week.unlocksIn && (
                        <span className="text-xs text-gray-400">Unlocks in {week.unlocksIn}</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="p-4 border-t bg-gray-50">
          <h3 className="font-semibold text-gray-700 text-sm mb-3">Achievements</h3>
          <div className="flex gap-2">
            {courseData?.achievements.map((achievement, idx) => {
              const Icon = achievement.icon;
              return (
                <Tooltip key={idx} content={achievement.title}>
                  <div className={`p-2 rounded-lg ${achievement.earned ? 'bg-yellow-100' : 'bg-gray-200'}`}>
                    <Icon className={`w-5 h-5 ${achievement.earned ? 'text-yellow-600' : 'text-gray-400'}`} />
                  </div>
                </Tooltip>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{courseData?.title}</h1>
              <p className="text-sm text-gray-500 mt-1">{courseData?.subtitle}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Link 
                to="/community" 
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <HiChatAlt className="w-5 h-5" />
                <span className="hidden sm:inline">Community</span>
              </Link>
              
              <Dropdown
                label={<Avatar rounded placeholderInitials={currentUser?.username?.[0] || 'S'} size="sm" />}
                arrowIcon={false}
                inline
              >
                <Dropdown.Header>
                  <span className="block text-sm">{currentUser?.username || 'Student'}</span>
                  <span className="block text-sm font-medium truncate">{currentUser?.email || 'student@example.com'}</span>
                </Dropdown.Header>
                <Dropdown.Item>Profile</Dropdown.Item>
                <Dropdown.Item>Settings</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item>Sign out</Dropdown.Item>
              </Dropdown>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-8">
          <nav className="flex space-x-8">
            {['overview', 'lessons', 'resources', 'assignment', 'live'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                disabled={activeWeek?.status === 'locked' && tab !== 'overview'}
                className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors capitalize
                  ${activeTab === tab 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                  ${activeWeek?.status === 'locked' && tab !== 'overview' ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {tab}
                {tab === 'live' && activeWeek?.nextSession && (
                  <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
          {renderContent()}
        </div>
      </div>

      {/* Inject CSS for animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
