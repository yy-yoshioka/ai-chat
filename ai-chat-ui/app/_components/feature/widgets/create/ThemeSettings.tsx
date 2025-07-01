import React from 'react';
import type { WidgetForm } from '@/app/_schemas/widget';
import {
  WIDGET_POSITIONS,
  BORDER_RADIUS_MIN,
  BORDER_RADIUS_MAX,
} from '@/app/_config/widgets/create';

interface ThemeSettingsProps {
  form: WidgetForm;
  updateForm: (field: string, value: unknown) => void;
}

export function ThemeSettings({ form, updateForm }: ThemeSettingsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">テーマ設定</h3>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">プライマリカラー</label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={form.theme.primaryColor}
                onChange={(e) => updateForm('theme.primaryColor', e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded"
              />
              <input
                type="text"
                value={form.theme.primaryColor}
                onChange={(e) => updateForm('theme.primaryColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">セカンダリカラー</label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={form.theme.secondaryColor}
                onChange={(e) => updateForm('theme.secondaryColor', e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded"
              />
              <input
                type="text"
                value={form.theme.secondaryColor}
                onChange={(e) => updateForm('theme.secondaryColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">角丸 (px)</label>
          <input
            type="range"
            min={BORDER_RADIUS_MIN}
            max={BORDER_RADIUS_MAX}
            value={form.theme.borderRadius}
            onChange={(e) => updateForm('theme.borderRadius', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="text-sm text-gray-500 mt-1">{form.theme.borderRadius}px</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">表示位置</label>
          <select
            value={form.theme.position}
            onChange={(e) => updateForm('theme.position', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {WIDGET_POSITIONS.map((pos) => (
              <option key={pos.value} value={pos.value}>
                {pos.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
