'use client';

import { useCallback } from 'react';
import { WIDGET_EMBED_BASE_URL } from '@/app/_config/widgets/constants';
import type { WidgetSettings } from '@/app/_schemas/widget';
import { fetchJson } from '@/app/_utils/fetcher';

export function useWidgetActions(
  orgId: string,
  setWidgets: React.Dispatch<React.SetStateAction<WidgetSettings[]>>
) {
  const handleToggleActive = useCallback(
    async (widgetId: string, isActive: boolean) => {
      try {
        await fetchJson(`/api/organizations/${orgId}/widgets/${widgetId}`, {
          method: 'PATCH',
          credentials: 'include',
          body: JSON.stringify({ isActive }),
        });

        setWidgets((prev) => prev.map((w) => (w.id === widgetId ? { ...w, isActive } : w)));
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
