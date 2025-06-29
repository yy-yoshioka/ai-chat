import React from 'react';
import type { WidgetForm } from '@/_schemas/widget';

interface BasicSettingsProps {
  form: WidgetForm;
  updateForm: (field: string, value: any) => void;
}

export function BasicSettings({ form, updateForm }: BasicSettingsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">基本設定</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ウィジェット名</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateForm('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="例: メインサイト用チャット"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ウェルカムメッセージ
          </label>
          <textarea
            value={form.settings.welcomeMessage}
            onChange={(e) => updateForm('settings.welcomeMessage', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="ユーザーに最初に表示されるメッセージ"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            入力プレースホルダー
          </label>
          <input
            type="text"
            value={form.settings.placeholder}
            onChange={(e) => updateForm('settings.placeholder', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="メッセージ入力欄のプレースホルダー"
          />
        </div>
      </div>
    </div>
  );
}
