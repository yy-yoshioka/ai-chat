import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { WidgetForm } from '@/app/_schemas/widget';
import {
  DEFAULT_WIDGET_THEME,
  DEFAULT_WIDGET_SETTINGS,
  WIDGET_KEY_PREFIX,
  WIDGET_KEY_LENGTH,
} from '@/app/_config/widgets/create';

export function useCreateWidget(orgId: string) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<WidgetForm>({
    name: '',
    theme: DEFAULT_WIDGET_THEME,
    settings: DEFAULT_WIDGET_SETTINGS,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);

      const widgetData = {
        name: form.name,
        theme: form.theme,
        primaryColor: form.theme.primaryColor,
        secondaryColor: form.theme.secondaryColor,
        backgroundColor: '',
        textColor: '',
        borderRadius: form.theme.borderRadius,
        fontFamily: '',
        welcomeMessage: form.settings.welcomeMessage,
        placeholder: form.settings.placeholder,
        showAvatar: form.settings.showAvatar,
        enableFileUpload: form.settings.enableFileUpload,
      };

      console.log('Creating widget:', widgetData);
      // TODO: Send to API

      alert('ウィジェットが作成されました！');
      router.push(`/admin/${orgId}/widgets`);
    } catch (error: unknown) {
      console.error('Widget creation failed:', error);
      alert('ウィジェット作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field: string, value: unknown) => {
    setForm((prev) => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      } else if (keys.length === 2) {
        const firstKey = keys[0] as keyof WidgetForm;
        const prevValue = prev[firstKey];

        if (typeof prevValue === 'object' && prevValue !== null) {
          return {
            ...prev,
            [firstKey]: {
              ...prevValue,
              [keys[1]]: value,
            },
          };
        }
      }
      return prev;
    });
  };

  const generateEmbedCode = () => {
    const widgetKey = `${WIDGET_KEY_PREFIX}${Math.random().toString(36).substr(2, WIDGET_KEY_LENGTH)}`;
    return `<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget.js" data-key="${widgetKey}"></script>`;
  };

  return {
    form,
    loading,
    handleSubmit,
    updateForm,
    generateEmbedCode,
  };
}
