'use client';

import React from 'react';

export function WidgetsLoading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
        <p className="mt-4 text-gray-500">ウィジェットを読み込んでいます...</p>
      </div>
    </div>
  );
}
