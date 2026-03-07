import React from 'react';
import { HiOutlineArchive, HiOutlineUpload, HiOutlineDownload } from 'react-icons/hi';

const PLANNED_FEATURES = [
  {
    icon: HiOutlineUpload,
    title: 'File Uploads',
    description: 'Upload templates, worksheets, and reference materials linked to specific course modules.',
  },
  {
    icon: HiOutlineArchive,
    title: 'Resource Library',
    description: 'Organise all uploaded files into a searchable, categorised library for easy management.',
  },
  {
    icon: HiOutlineDownload,
    title: 'Student Downloads',
    description: 'Students access resources from their learning dashboard, gated by enrolment and week unlock status.',
  },
];

export default function DashResources() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <span className="inline-block bg-brand-green/10 text-brand-green text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
          Coming Soon
        </span>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Resource Vault</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Manage downloadable templates, worksheets, and supplementary materials for your courses.
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
