'use client';

import React from 'react';

interface ProfileInfoFieldProps {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
}

export function ProfileInfoField({ icon, label, value }: ProfileInfoFieldProps) {
  return (
    <div className="flex items-start">
      <div className="flex-shrink-0 text-gray-400">{icon}</div>
      <div className="ml-3">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-gray-900 font-medium">{value}</p>
      </div>
    </div>
  );
}
