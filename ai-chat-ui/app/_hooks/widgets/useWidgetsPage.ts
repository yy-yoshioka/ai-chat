import { useState, useEffect, useCallback } from 'react';

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

export function useWidgetsPage(orgId: string) {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWidgets = useCallback(async () => {
    setLoading(true);
    try {
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
  }, [orgId]);

  useEffect(() => {
    fetchWidgets();
  }, [fetchWidgets]);

  const handleDeleteWidget = async (widgetId: string) => {
    if (!confirm('このウィジェットを削除してもよろしいですか？')) return;

    try {
      setWidgets(widgets.filter((w) => w.id !== widgetId));
    } catch (error) {
      console.error('Failed to delete widget:', error);
    }
  };

  const handleToggleActive = async (widgetId: string) => {
    try {
      setWidgets(widgets.map((w) => (w.id === widgetId ? { ...w, isActive: !w.isActive } : w)));
    } catch (error) {
      console.error('Failed to toggle widget status:', error);
    }
  };

  const copyEmbedCode = (widget: Widget) => {
    navigator.clipboard.writeText(widget.script);
    alert('埋め込みコードをコピーしました！');
  };

  return {
    widgets,
    loading,
    handleDeleteWidget,
    handleToggleActive,
    copyEmbedCode,
  };
}

export type { Widget };
