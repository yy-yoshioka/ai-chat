'use client';

import React from 'react';
import { FileText, CheckCircle, XCircle, Loader } from 'lucide-react';

interface KnowledgeBaseStatusProps {
  stats: {
    pending?: number;
    processing?: number;
    completed?: number;
    failed?: number;
  };
}

export function KnowledgeBaseStatus({ stats }: KnowledgeBaseStatusProps) {
  const total = Object.values(stats).reduce((sum, count) => sum + (count || 0), 0);
  const completedPercentage = total > 0 ? ((stats.completed || 0) / total) * 100 : 0;
  
  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">処理状況</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">全体の進捗</span>
              <span className="font-medium text-gray-900">{Math.round(completedPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completedPercentage}%` }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <Loader className="h-5 w-5 text-yellow-500 animate-spin flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">処理中</p>
                <p className="text-2xl font-bold text-gray-900">{stats.processing || 0}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">完了</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed || 0}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">待機中</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending || 0}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
              <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">エラー</p>
                <p className="text-2xl font-bold text-gray-900">{stats.failed || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}