import React from 'react';
import { Eye, Trash2, Edit3, Copy } from 'lucide-react';
import Link from 'next/link';
import type { Widget } from '@/app/_hooks/widgets/useWidgetsPage';

interface WidgetCardProps {
  widget: Widget;
  orgId: string;
  onToggleActive: (id: string) => void;
  onDelete: (id: string) => void;
  onCopyEmbedCode: (widget: Widget) => void;
}

export function WidgetCard({ widget, orgId, onToggleActive, onDelete, onCopyEmbedCode }: WidgetCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{widget.name}</h3>
          <p className="text-sm text-gray-500">Key: {widget.embedKey}</p>
        </div>
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            widget.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {widget.isActive ? 'アクティブ' : '非アクティブ'}
        </div>
      </div>

      {/* Widget Preview */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: widget.theme.primaryColor }}
          />
          <span className="text-sm text-gray-600">プライマリカラー</span>
        </div>
        <div className="text-sm text-gray-700">位置: {widget.theme.position}</div>
        <div className="text-sm text-gray-700">角丸: {widget.theme.borderRadius}px</div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Link
            href={`/admin/${orgId}/widgets/${widget.id}`}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="編集"
          >
            <Edit3 className="w-4 h-4" />
          </Link>
          <button
            onClick={() => onCopyEmbedCode(widget)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="埋め込みコードをコピー"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleActive(widget.id)}
            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
            title={widget.isActive ? '無効化' : '有効化'}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(widget.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="削除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Embed Code Preview */}
      <div className="mt-4 p-3 bg-gray-900 rounded text-white text-xs font-mono overflow-x-auto">
        {widget.script}
      </div>
    </div>
  );
}
