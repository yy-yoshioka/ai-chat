'use client';

import React from 'react';

interface ProfileErrorStateProps {
  message?: string;
}

export function ProfileErrorState({
  message = 'Unable to load user profile.',
}: ProfileErrorStateProps) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Profile</h2>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}
