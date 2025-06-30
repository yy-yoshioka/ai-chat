import React from 'react';
import type { ChatSession } from '@/app/_schemas/chat';
import { StatusBadge } from './StatusBadge';
import { SatisfactionStars } from './SatisfactionStars';
import { formatDuration } from '@/app/_utils/chat/format';

interface ChatSessionsTableProps {
  sessions: ChatSession[];
}

export function ChatSessionsTable({ sessions }: ChatSessionsTableProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          チャットセッション ({sessions.length}件)
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ユーザー
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                トピック
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                メッセージ数
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                時間
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                満足度
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sessions.map((chat) => (
              <tr key={chat.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{chat.userName}</div>
                    <div className="text-sm text-gray-500">{chat.userEmail}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{chat.topic}</div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">{chat.lastMessage}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={chat.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {chat.messageCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>{new Date(chat.startTime).toLocaleTimeString('ja-JP')}</div>
                  <div className="text-xs">{formatDuration(chat.startTime, chat.endTime)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <SatisfactionStars rating={chat.satisfaction} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">詳細</button>
                  {chat.status === 'active' && (
                    <button className="text-green-600 hover:text-green-900">参加</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
