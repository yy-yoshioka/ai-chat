'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit3, Copy, Trash2, Eye, Settings } from 'lucide-react';

interface Widget {
  id: string;
  name: string;
  organizationId: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    borderRadius: number;
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  };
  settings: {
    welcomeMessage: string;
    placeholder: string;
    showAvatar: boolean;
    enableFileUpload: boolean;
  };
  script: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  embedKey: string;
}

export default function WidgetsPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = React.use(params);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWidgets();
  }, [orgId]);

  const fetchWidgets = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockWidgets: Widget[] = [
        {
          id: 'widget-1',
          name: 'メインサイト用チャット',
          organizationId: orgId,
          theme: {
            primaryColor: '#3B82F6',
            secondaryColor: '#64748B',
            borderRadius: 12,
            position: 'bottom-right',
          },
          settings: {
            welcomeMessage: 'こんにちは！何かお手伝いできることはありますか？',
            placeholder: 'メッセージを入力...',
            showAvatar: true,
            enableFileUpload: false,
          },
          script: `<script src="/widget.js" data-key="widget-1"></script>`,
          isActive: true,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-03-01'),
          embedKey: 'wgt_1234567890abcdef',
        },
        {
          id: 'widget-2',
          name: 'サポートページ用',
          organizationId: orgId,
          theme: {
            primaryColor: '#10B981',
            secondaryColor: '#6B7280',
            borderRadius: 8,
            position: 'bottom-left',
          },
          settings: {
            welcomeMessage: 'サポートが必要ですか？',
            placeholder: 'お困りの内容を教えてください',
            showAvatar: false,
            enableFileUpload: true,
          },
          script: `<script src="/widget.js" data-key="widget-2"></script>`,
          isActive: false,
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-02-15'),
          embedKey: 'wgt_abcdef1234567890',
        },
      ];
      setWidgets(mockWidgets);
    } catch (error) {
      console.error('Failed to fetch widgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWidget = async (widgetId: string) => {
    if (!confirm('このウィジェットを削除してもよろしいですか？')) return;

    try {
      // API call to delete widget
      setWidgets(widgets.filter((w) => w.id !== widgetId));
    } catch (error) {
      console.error('Failed to delete widget:', error);
    }
  };

  const handleToggleActive = async (widgetId: string) => {
    try {
      // API call to toggle active status
      setWidgets(widgets.map((w) => (w.id === widgetId ? { ...w, isActive: !w.isActive } : w)));
    } catch (error) {
      console.error('Failed to toggle widget status:', error);
    }
  };

  const copyEmbedCode = (widget: Widget) => {
    navigator.clipboard.writeText(widget.script);
    // Show toast notification
    alert('埋め込みコードをコピーしました！');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ウィジェット管理</h1>
          <p className="text-gray-600">チャットウィジェットの作成・管理</p>
        </div>
        <Link
          href={`/admin/${orgId}/widgets/create`}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>新しいウィジェット</span>
        </Link>
      </div>

      {/* Widgets Grid */}
      {widgets.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Settings className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">ウィジェットがありません</h3>
          <p className="text-gray-600 mb-6">最初のチャットウィジェットを作成しましょう</p>
          <Link
            href={`/admin/${orgId}/widgets/create`}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>ウィジェットを作成</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {widgets.map((widget) => (
            <div key={widget.id} className="bg-white rounded-lg shadow-sm border p-6">
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
                    onClick={() => copyEmbedCode(widget)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="埋め込みコードをコピー"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(widget.id)}
                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                    title={widget.isActive ? '無効化' : '有効化'}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteWidget(widget.id)}
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
          ))}
        </div>
      )}
    </div>
  );
}
