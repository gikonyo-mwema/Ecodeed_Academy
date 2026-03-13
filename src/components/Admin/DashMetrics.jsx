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
        <span className="text-green-500 flex items-center">
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
      iconColor: "bg-indigo-600",
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
      iconColor: "bg-blue-600",
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
      iconColor: "bg-green-600",
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