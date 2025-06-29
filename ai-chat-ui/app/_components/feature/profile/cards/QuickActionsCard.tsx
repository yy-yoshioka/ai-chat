'use client';

import React from 'react';
import Link from 'next/link';
import { QUICK_ACTIONS } from '@/app/_config/profile/constants';
import { ProfileIcons } from '@/app/_config/profile/icons';

const iconMap = {
  widget: ProfileIcons.widget,
  message: ProfileIcons.message,
  chart: ProfileIcons.chart,
  code: ProfileIcons.code,
  billing: ProfileIcons.billing,
  help: ProfileIcons.help,
};

const colorClasses = {
  blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
  green: 'bg-green-50 text-green-700 hover:bg-green-100',
  purple: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
  indigo: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
  yellow: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
  gray: 'bg-gray-50 text-gray-700 hover:bg-gray-100',
};

export function QuickActionsCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">クイックアクション</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {QUICK_ACTIONS.map((action, index) => {
          const icon = iconMap[action.icon as keyof typeof iconMap];
          const colorClass = colorClasses[action.color as keyof typeof colorClasses];

          return (
            <Link
              key={index}
              href={action.href}
              className={`group p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all ${colorClass}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">{icon}</div>
                <div>
                  <h3 className="font-medium text-gray-900 group-hover:text-gray-700">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                </div>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
