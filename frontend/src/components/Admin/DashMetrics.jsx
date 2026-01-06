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