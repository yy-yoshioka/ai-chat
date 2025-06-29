import React from 'react';
import Link from 'next/link';
import type { WidgetForm } from '@/_schemas/widget';
import { BasicSettings } from './BasicSettings';
import { ThemeSettings } from './ThemeSettings';
import { AdvancedSettings } from './AdvancedSettings';
import { WidgetPreview } from './WidgetPreview';
import { EmbedCode } from './EmbedCode';

interface CreateWidgetViewProps {
  orgId: string;
  form: WidgetForm;
  loading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  updateForm: (field: string, value: any) => void;
  embedCode: string;
}

export function CreateWidgetView({
  orgId,
  form,
  loading,
  onSubmit,
  updateForm,
  embedCode,
}: CreateWidgetViewProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">新しいウィジェット作成</h1>
          <p className="text-gray-600">チャットウィジェットを設定してサイトに埋め込みましょう</p>
        </div>
        <Link
          href={`/admin/${orgId}/widgets`}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <form onSubmit={onSubmit} className="space-y-6">
            <BasicSettings form={form} updateForm={updateForm} />
            <ThemeSettings form={form} updateForm={updateForm} />
            <AdvancedSettings form={form} updateForm={updateForm} />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !form.name}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '作成中...' : 'ウィジェットを作成'}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <WidgetPreview form={form} />
          <EmbedCode embedCode={embedCode} />
        </div>
      </div>
    </div>
  );
}