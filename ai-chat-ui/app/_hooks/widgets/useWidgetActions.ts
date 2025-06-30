'use client';

import { useCallback } from 'react';
import { WIDGET_EMBED_BASE_URL } from '@/app/_config/widgets/constants';
import type { WidgetSettings } from '@/app/_schemas/widget';

export function useWidgetActions(
  orgId: string,
  setWidgets: React.Dispatch<React.SetStateAction<WidgetSettings[]>>
) {
  const handleToggleActive = useCallback(
    async (widgetId: string, isActive: boolean) => {
      try {
        const response = await fetch(`/api/organizations/${orgId}/widgets/${widgetId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ isActive }),
        });

        if (response.ok) {
          setWidgets((prev) => prev.map((w) => (w.id === widgetId ? { ...w, isActive } : w)));
        } else {
          alert('ウィジェットの更新に失敗しました');
        }
      } catch (error) {
        console.error('Error updating widget:', error);
        alert('ウィジェットの更新中にエラーが発生しました');
      }
    },
    [orgId, setWidgets]
  );

  const copyEmbedCode = useCallback((widgetKey: string) => {
    const embedCode = `<script src="${WIDGET_EMBED_BASE_URL}/api/widgets/${widgetKey}" async></script>`;
    navigator.clipboard.writeText(embedCode);
    alert('埋め込みコードをコピーしました');
  }, []);

  const copyWidgetId = useCallback((widgetId: string) => {
    navigator.clipboard.writeText(widgetId);
    alert('ウィジェットIDをコピーしました');
  }, []);

  return {
    handleToggleActive,
    copyEmbedCode,
    copyWidgetId,
  };
}
