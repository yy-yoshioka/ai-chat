'use client';

import React from 'react';

interface RoleBadgeProps {
  isAdmin: boolean;
}

export function RoleBadge({ isAdmin }: RoleBadgeProps) {
  if (isAdmin) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-400 text-amber-900">
        <svg
          className="mr-1.5 h-3 w-3"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z"
            clipRule="evenodd"
          />
        </svg>
        Admin
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white">
      User
    </span>
  );
}