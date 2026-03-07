import React from 'react';
import { HiOutlineVideoCamera, HiOutlineCalendar, HiOutlineLink } from 'react-icons/hi';

const PLANNED_FEATURES = [
  {
    icon: HiOutlineCalendar,
    title: 'Session Scheduling',
    description: 'Create and schedule live sessions with date, time, and module association.',
  },
  {
    icon: HiOutlineVideoCamera,
    title: 'Zoom Integration',
    description: 'Auto-generate meeting links and manage recording uploads for each session.',
  },
  {
    icon: HiOutlineLink,
    title: 'Student Notifications',
    description: 'Automatically notify enrolled students when a new session is scheduled or a recording is available.',
  },
];

export default function DashLiveSessions() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <span className="inline-block bg-brand-green/10 text-brand-green text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
          Coming Soon
        </span>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Live Session Management</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Schedule live classes, manage Zoom links, and distribute recordings — all from your dashboard.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {PLANNED_FEATURES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-green/10 mb-4">
              <Icon className="h-5 w-5 text-brand-green" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
