<<<<<<< HEAD:src/components/Admin/DashMetrics.jsx
/**
 * Dashboard Metrics Component
 * 
 * Displays key performance indicators and metrics for the admin dashboard.
 * Shows statistics about users, posts, comments, courses, and services with
 * month-over-month comparisons and quick navigation to detailed sections.
 * 
 * Features:
 * - Real-time metric cards with current and previous month values
 * - Visual indicators for metric trends
 * - Quick navigation to dashboard sections via links
 * - Responsive grid layout for different screen sizes
 * - Color-coded icons for different metric types
 * - Interactive hover effects and transitions
 * 
 * Metrics Displayed:
 * - Total Users: Platform user count with growth indicator
 * - Total Posts: Blog posts and content count
 * - Total Comments: User engagement through comments
 * - Total Courses: Educational content count
 * - Total Services: Consulting services count
 * - Total Payments: Revenue tracking
 * 
 * Props:
 * - totals: Object containing current values for all metrics
 * - lastMonth: Object containing previous month values for comparison
 * 
 * @component
 * @version 1.0.0
 * @author Gikonyo Mwema
 * 
 * @example
 * ```jsx
 * <DashboardMetrics 
 *   totals={{ users: 150, posts: 45, comments: 200 }}
 *   lastMonth={{ users: 140, posts: 40, comments: 190 }}
 * />
 * ```
 */

import React from "react";
import { Link } from "react-router-dom";
import {
  HiAnnotation,
  HiArrowNarrowUp,
  HiDocumentText,
  HiOutlineUserGroup,
  HiOutlineClipboardCheck,
  HiAcademicCap,
  HiCurrencyDollar
} from "react-icons/hi";

/**
 * MetricCard Component
 * 
 * A single metric card that displays a KPI with trend information and navigation.
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - The metric title/label
 * @param {number} props.value - Current metric value
 * @param {number} props.lastMonthValue - Previous month value for comparison
 * @param {React.Component} props.icon - Icon component to display
 * @param {string} props.iconColor - Tailwind color class for icon background
 * @param {string} props.link - Dashboard tab to navigate to when clicked
 * @returns {JSX.Element} Metric card with link to dashboard section
 */
const MetricCard = ({ title, value, lastMonthValue, icon: Icon, iconColor, link }) => (
=======
/**\n * Dashboard Metrics Component — KPI cards with growth indicators.\n *\n * Displays key performance indicator (KPI) cards for the admin dashboard.\n * Shows platform-wide metrics: users, posts, comments, courses, enrollments, revenue.\n * Each metric card is clickable to navigate to detailed management sections.\n *\n * Features:\n * - KPI Cards: Colorized metric cards with icon, title, and current value\n * - Growth Indicators: \"Last month\" comparison with green up-arrow styling\n * - Interactive Navigation: Click any card to navigate to management tab\n * - Dark Mode Support: Tailwind dark: classes for theme integration\n * - Responsive Grid: Cards arrange in responsive columns (md:w-72 fallback)\n * - Hover Effects: Shadow elevation on hover with smooth transitions\n * - Icon Badges: Colored circular icons (teal, blue, lime, purple, etc.)\n *\n * Props:\n * - totals (object): Current counts { users, posts, comments, courses, revenue }\n * - lastMonth (object): Last month's counts for growth comparison\n *\n * @component\n * @version 1.0.0\n * @author Gikonyo Mwema\n */\n\nimport React from "react";\nimport { Link } from "react-router-dom";\nimport {\n  HiAnnotation,\n  HiArrowNarrowUp,\n  HiDocumentText,\n  HiOutlineUserGroup,\n  HiOutlineClipboardCheck,\n  HiAcademicCap,\n  HiCurrencyDollar\n} from "react-icons/hi";\n\nconst MetricCard = ({ title, value, lastMonthValue, icon: Icon, iconColor, link }) => (
>>>>>>> origin/develop:frontend/src/components/Admin/DashMetrics.jsx
  <Link to={`/dashboard?tab=${link}`}>
    <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex justify-between">
        <div>
          <h3 className="text-gray-500 text-md uppercase">{title}</h3>
          <p className="text-2xl">{value}</p>
        </div>
        <Icon className={`${iconColor} text-white rounded-full text-5xl p-3 shadow-lg`} />
      </div>
      <div className="flex gap-2 text-sm">
        <span className="text-brand-green flex items-center">
          <HiArrowNarrowUp />
          {lastMonthValue}
        </span>
        <div className="text-gray-500">Last month</div>
      </div>
    </div>
  </Link>
);

/**
 * DashboardMetrics
 * 
 * Main metrics display component for admin dashboard
 * 
 * @param {Object} props - Component props
 * @param {Object} props.totals - Current values for all metrics
 * @param {Object} props.lastMonth - Previous month values for comparison
 * @returns {JSX.Element} Dashboard metrics cards grid
 */
export default function DashboardMetrics({ totals, lastMonth }) {
  const metrics = [
    {
      title: "Total Users",
      value: totals.users,
      lastMonthValue: lastMonth.users,
      icon: HiOutlineUserGroup,
      iconColor: "bg-teal-600",
      link: "users"
    },
    {
      title: "Total Comments",
      value: totals.comments,
      lastMonthValue: lastMonth.comments,
      icon: HiAnnotation,
      iconColor: "bg-brand-blue",
      link: "comments"
    },
    {
      title: "Total Posts",
      value: totals.posts,
      lastMonthValue: lastMonth.posts,
      icon: HiDocumentText,
      iconColor: "bg-lime-600",
      link: "posts"
    },
    {
      title: "Total Services",
      value: totals.services,
      lastMonthValue: lastMonth.services,
      icon: HiOutlineClipboardCheck,
      iconColor: "bg-brand-green",
      link: "services"
    },
    {
      title: "Total Courses",
      value: totals.courses,
      lastMonthValue: lastMonth.courses,
      icon: HiAcademicCap,
      iconColor: "bg-orange-600",
      link: "courses"
    },
    {
      title: "Total Revenue",
      value: `$${totals.revenue.toFixed(2)}`,
      lastMonthValue: `$${lastMonth.revenue.toFixed(2)}`,
      icon: HiCurrencyDollar,
      iconColor: "bg-brand-green",
      link: "payments"
    }
  ];

  return (
    <div className="flex-wrap flex gap-4 justify-center">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
}