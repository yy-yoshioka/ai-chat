import React from 'react';

interface ChatFiltersProps {
  selectedDate: string;
  statusFilter: string;
  onDateChange: (date: string) => void;
  onStatusChange: (status: string) => void;
}

export function ChatFilters({
  selectedDate,
  statusFilter,
  onDateChange,
  onStatusChange,
}: ChatFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">フィルター</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">日付</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ステータス</label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">すべて</option>
            <option value="active">進行中</option>
            <option value="completed">完了</option>
            <option value="error">エラー</option>
          </select>
        </div>
      </div>
    </div>
  );
}