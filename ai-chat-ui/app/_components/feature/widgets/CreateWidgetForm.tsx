'use client';

import React from 'react';
import type { CreateWidgetForm as FormData } from '@/app/_schemas/widget';

interface CreateWidgetFormProps {
  formData: FormData;
  onChange: (data: Partial<FormData>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CreateWidgetForm({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: CreateWidgetFormProps) {
  return (
    <div className="mb-8 bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold text-gray-900 mb-4">新規ウィジェット作成</h2>
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="widget-name" className="block text-sm font-medium text-gray-700 mb-1">
              ウィジェット名
            </label>
            <input
              id="widget-name"
              type="text"
              value={formData.name}
              onChange={(e) => onChange({ name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: カスタマーサポート"
            />
          </div>

          <div>
            <label htmlFor="accent-color" className="block text-sm font-medium text-gray-700 mb-1">
              アクセントカラー
            </label>
            <div className="flex items-center space-x-2">
              <input
                id="accent-color"
                type="color"
                value={formData.accentColor}
                onChange={(e) => onChange({ accentColor: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={formData.accentColor}
                onChange={(e) => onChange({ accentColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#3b82f6"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="logo-url" className="block text-sm font-medium text-gray-700 mb-1">
              ロゴURL（オプション）
            </label>
            <input
              id="logo-url"
              type="url"
              value={formData.logoUrl}
              onChange={(e) => onChange({ logoUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/logo.png"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? '作成中...' : '作成'}
          </button>
        </div>
      </form>
    </div>
  );
}
