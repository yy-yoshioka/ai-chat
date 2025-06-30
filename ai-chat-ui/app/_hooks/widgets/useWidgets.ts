'use client';

import { useState, useCallback } from 'react';
import { DEFAULT_WIDGET_FORM } from '@/app/_config/widgets/constants';
import { useWidgetActions } from './useWidgetActions';
import type { WidgetSettings, CreateWidgetForm } from '@/app/_schemas/widget';

export function useWidgets(orgId: string) {
  const [widgets, setWidgets] = useState<WidgetSettings[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateWidgetForm>(DEFAULT_WIDGET_FORM);

  const { handleToggleActive, copyEmbedCode, copyWidgetId } = useWidgetActions(orgId, setWidgets);

  const fetchWidgets = useCallback(
    async (companyId: string) => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/organizations/${orgId}/widgets?companyId=${companyId}`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setWidgets(data);
        } else {
          console.error('Failed to fetch widgets');
        }
      } catch (error) {
        console.error('Error fetching widgets:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [orgId]
  );

  const handleCreateWidget = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.companyId) return;

      try {
        const response = await fetch(`/api/organizations/${orgId}/widgets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          setShowCreateForm(false);
          setFormData(DEFAULT_WIDGET_FORM);
          await fetchWidgets(formData.companyId);
          alert('ウィジェットが作成されました');
        } else {
          const error = await response.json();
          alert(`エラー: ${error.message || 'ウィジェットの作成に失敗しました'}`);
        }
      } catch (error) {
        console.error('Error creating widget:', error);
        alert('ウィジェットの作成中にエラーが発生しました');
      }
    },
    [formData, orgId, fetchWidgets]
  );

  const updateFormData = useCallback((updates: Partial<CreateWidgetForm>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  return {
    widgets,
    isLoading,
    showCreateForm,
    formData,
    setShowCreateForm,
    fetchWidgets,
    handleCreateWidget,
    handleToggleActive,
    copyEmbedCode,
    copyWidgetId,
    updateFormData,
  };
}
