import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { HiCheckCircle, HiLockClosed, HiPlay, HiDownload, HiChatAlt, HiVideoCamera } from 'react-icons/hi';

export default function StudentDashboard() {
  const { currentUser } = useSelector((state) => state.user);
  const [courseData, setCourseData] = useState(null);
  const [activeWeek, setActiveWeek] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, lessons, resources, assignment, live
  const [loading, setLoading] = useState(true);

  // Mock data for initial render (replace with API call later)
  const mockWeeks = [
    { id: 1, title: 'Week 1: The Real World of EIA Consulting', status: 'completed' },
    { id: 2, title: 'Week 2: Finding & Closing EIA Clients', status: 'completed' },
    { id: 3, title: 'Week 3: Research & Baseline Study Methodology', status: 'completed' },
    { id: 4, title: 'Week 4: Public Participation Mastery', status: 'in-progress' },
    { id: 5, title: 'Week 5: Regulatory Navigation', status: 'locked' },
    // ... add more weeks
  ];

  useEffect(() => {
    // Fetch course data here
    // const fetchCourse = async () => { ... }
    // fetchCourse();
    
    // For now, set mock data
    setCourseData({
      title: 'PROGRAM STRUCTURE OVERVIEW',
       weeks: mockWeeks
    });
    setActiveWeek(mockWeeks[3]); // Default to in-progress week
    setLoading(false);
  }, []);

  const renderContent = () => {
    if (!activeWeek) return <div>Select a week to view content</div>;

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{activeWeek.title}</h2>
            <p className="text-gray-600">Theme: Managing Communities & Conflict</p>
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <h3 className="font-semibold">Learning Objectives</h3>
              <ul className="list-disc list-inside mt-2">
                <li>Legal requirements for public participation</li>
                <li>Stakeholder identification</li>
                <li>Organizing public meetings</li>
              </ul>
            </div>
             <div className="mt-4">
                <h3 className="font-semibold">Introduction Video</h3>
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg mt-2 flex items-center justify-center">
                    <HiPlay className="w-12 h-12 text-gray-400" />
                </div>
            </div>
          </div>
        );
      case 'lessons':
        return (
          <div className="space-y-4">
            {[1, 2, 3].map((lesson) => (
              <div key={lesson} className="border p-4 rounded-lg flex justify-between items-center hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                    <HiPlay className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Lesson {lesson}: Topic Name</h4>
                    <p className="text-sm text-gray-500">Video • 15 mins</p>
                  </div>
                </div>
                <button className="text-sm bg-white border border-gray-300 px-3 py-1 rounded hover:bg-gray-100">
                  Start
                </button>
              </div>
            ))}
          </div>
        );
      case 'resources':
        return (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Public participation toolkit', 'Conflict de-escalation guide', 'Stakeholder communication framework'].map((res, idx) => (
                    <div key={idx} className="border p-4 rounded-lg flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <HiDownload className="w-6 h-6 text-gray-500" />
                            <span>{res}</span>
                         </div>
                         <button className="text-blue-600 font-semibold text-sm">Download</button>
                    </div>
                ))}
             </div>
        );
      case 'assignment':
        return (
             <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-xl font-bold mb-4">Week 4 Assignment: Public Meeting Prep</h3>
                <p className="mb-4">Prepare: Public meeting notice, Attendance sheet, Meeting minutes template.</p>
                
                <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold mb-2">Submit Your Work</h4>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                        <p className="text-gray-500">Drag and drop files here or click to upload</p>
                        <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded">Select File</button>
                    </div>
                </div>
                <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                     <span>Due: Friday, Feb 24th</span>
                     <span className="text-red-500">2 days remaining</span>
                </div>
             </div>
        );
      case 'live':
         return (
             <div className="bg-white p-6 rounded-lg border">
                 <h3 className="text-xl font-bold mb-4">Live Session: Discussion + Q&A</h3>
                 <div className="flex items-center gap-4 mb-6">
                     <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                         <HiVideoCamera className="w-8 h-8" />
                     </div>
                     <div>
                         <p className="font-semibold">Friday, Feb 24th • 2:00 PM EST</p>
                         <p className="text-gray-500">Join us for a deep dive into this week's topics.</p>
                     </div>
                 </div>
                 <a href="#" className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
                     Join Zoom Meeting
                 </a>
                 <div className="mt-6 pt-6 border-t">
                     <h4 className="font-semibold mb-2">Past Recordings</h4>
                     <p className="text-gray-500 text-sm">No recordings available for this week yet.</p>
                 </div>
             </div>
         );
      default:
        return null;
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Sidebar / Week List */}
      <div className="w-full md:w-80 bg-white border-r overflow-y-auto">
        <div className="p-6 border-b">
           <h1 className="text-xl font-bold text-gray-800">My Dashboard</h1>
           <p className="text-sm text-gray-500 mt-1">Welcome back, {currentUser?.username || 'Student'}!</p>
           
           <div className="mt-4">
               <div className="flex justify-between text-xs mb-1">
                   <span>Course Progress</span>
                   <span>30%</span>
               </div>
               <div className="w-full bg-gray-200 rounded-full h-2.5">
                   <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '30%' }}></div>
               </div>
           </div>
        </div>
        
        <div className="p-4">
           <h3 className="font-semibold text-gray-500 text-xs uppercase tracking-wider mb-3">Curriculum</h3>
           <div className="space-y-2">
               {courseData?.weeks.map((week) => (
                   <div 
                     key={week.id} 
                     onClick={() => week.status !== 'locked' && setActiveWeek(week)}
                     className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition-colors
                        ${activeWeek?.id === week.id ? 'bg-blue-50 border-blue-200 border' : 'hover:bg-gray-50 border border-transparent'}
                        ${week.status === 'locked' ? 'opacity-50 cursor-not-allowed' : ''}
                     `}
                   >
                       <div className="flex items-center gap-3">
                           {week.status === 'completed' && <HiCheckCircle className="text-green-500 w-5 h-5" />}
                           {week.status === 'in-progress' && <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center"><div className="w-2 h-2 bg-blue-500 rounded-full"></div></div>}
                           {week.status === 'locked' && <HiLockClosed className="text-gray-400 w-5 h-5" />}
                           <span className="text-sm font-medium">{week.title}</span>
                       </div>
                   </div>
               ))}
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
         {/* Top Header */}
         <div className="bg-white h-16 border-b flex items-center px-8 justify-between">
             <h2 className="font-semibold text-lg">{activeWeek?.title}</h2>
             <div className="flex items-center gap-4">
                 <Link to="/community" className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1">
                     <HiChatAlt className="w-5 h-5" /> Community
                 </Link>
                 <button className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center text-gray-600 font-bold">
                     {currentUser?.username?.[0] || 'S'}
                 </button>
             </div>
         </div>

         {/* Content Tabs */}
         <div className="px-8 mt-6">
             <div className="flex border-b">
                 {['overview', 'lessons', 'resources', 'assignment', 'live'].map((tab) => (
                     <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors capitalize
                            ${activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}
                        `}
                     >
                         {tab}
                     </button>
                 ))}
             </div>
         </div>

         {/* Tab Content */}
         <div className="p-8">
             {renderContent()}
         </div>
      </div>
    </div>
  );
}
