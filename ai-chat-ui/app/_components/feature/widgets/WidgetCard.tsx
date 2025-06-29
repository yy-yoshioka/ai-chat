'use client';

import React from 'react';
import Link from 'next/link';
import { WIDGET_STATUS_COLORS } from '@/app/_config/widgets/constants';
import type { WidgetSettings } from '@/app/_schemas/widget';

interface WidgetCardProps {
  widget: WidgetSettings;
  orgId: string;
  onToggleActive: (widgetId: string, isActive: boolean) => void;
  onCopyEmbed: (widgetKey: string) => void;
  onCopyId: (widgetId: string) => void;
}

export function WidgetCard({
  widget,
  orgId,
  onToggleActive,
  onCopyEmbed,
  onCopyId,
}: WidgetCardProps) {
  const statusColor = widget.isActive ? WIDGET_STATUS_COLORS.active : WIDGET_STATUS_COLORS.inactive;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{widget.name}</h3>
          <p className="text-sm text-gray-500 mt-1">
            会社: {widget.company?.name} ({widget.company?.plan})
          </p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
          {widget.isActive ? 'アクティブ' : '非アクティブ'}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">ウィジェットキー:</span>
          <code className="text-xs bg-gray-100 px-2 py-1 rounded">{widget.widgetKey}</code>
          <button
            onClick={() => onCopyId(widget.widgetKey)}
            className="text-blue-600 hover:text-blue-800"
            title="ウィジェットキーをコピー"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">チャット数:</span>
          <span className="text-sm font-medium text-gray-900">
            {widget._count?.chatLogs || 0} 件
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">アクセントカラー:</span>
          <div
            className="w-5 h-5 rounded border border-gray-300"
            style={{ backgroundColor: widget.accentColor }}
          />
          <span className="text-sm text-gray-600">{widget.accentColor}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <Link
            href={`/admin/${orgId}/widgets/create?widgetId=${widget.id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            編集
          </Link>
          <button
            onClick={() => onCopyEmbed(widget.widgetKey)}
            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
          >
            埋め込みコード
          </button>
        </div>

        <button
          onClick={() => onToggleActive(widget.id, !widget.isActive)}
          className={`px-3 py-1 text-sm font-medium rounded-md ${
            widget.isActive
              ? 'text-red-600 bg-red-50 hover:bg-red-100'
              : 'text-green-600 bg-green-50 hover:bg-green-100'
          }`}
        >
          {widget.isActive ? '無効化' : '有効化'}
        </button>
      </div>
    </div>
  );
}
