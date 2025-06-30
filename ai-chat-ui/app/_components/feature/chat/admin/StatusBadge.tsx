import React from 'react';
import type { ChatSession } from '@/app/_schemas/chat';

interface StatusBadgeProps {
  status: ChatSession['status'];
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    error: 'bg-red-100 text-red-800',
  };
  const labels = {
    active: '進行中',
    completed: '完了',
    error: 'エラー',
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
