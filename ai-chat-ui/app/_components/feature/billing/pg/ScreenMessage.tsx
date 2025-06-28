'use client';

import React from 'react';

export type ScreenState = 'loading' | 'error' | 'empty';

interface Props {
  type: ScreenState;
  /** エラー時のみ表示 */
  message?: string;
}

export default function ScreenMessage({ type, message }: Props) {
  if (type === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-2 text-gray-600">読み込み中...</span>
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">
          <div className="text-4xl mb-2">❌</div>
          <p>データの読み込みに失敗しました</p>
          {message && <p className="text-sm">{message}</p>}
        </div>
      </div>
    );
  }

  /* empty */
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center text-gray-500">
        <div className="text-4xl mb-2">📊</div>
        <p>データがありません</p>
      </div>
    </div>
  );
}
