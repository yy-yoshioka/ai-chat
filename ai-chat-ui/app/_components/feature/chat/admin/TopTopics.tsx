import React from 'react';
import type { ChatMetrics } from '@/_schemas/chat';

interface TopTopicsProps {
  metrics: ChatMetrics;
}

export function TopTopics({ metrics }: TopTopicsProps) {
  return (
    <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">人気のトピック</h3>
      <div className="space-y-3">
        {metrics.topTopics.map((item, index) => (
          <div key={item.topic} className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-600 w-6">{index + 1}.</span>
              <span className="text-sm text-gray-900 ml-2">{item.topic}</span>
            </div>
            <div className="flex items-center">
              <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${(item.count / metrics.topTopics[0].count) * 100}%`,
                  }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900">{item.count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}