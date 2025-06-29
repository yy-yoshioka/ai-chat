import React from 'react';
import type { WidgetForm } from '@/_schemas/widget';

interface WidgetPreviewProps {
  form: WidgetForm;
}

export function WidgetPreview({ form }: WidgetPreviewProps) {
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">プレビュー</h3>

      <div className="relative bg-gray-100 rounded-lg p-4 h-96 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100"></div>

        <div
          className={`absolute ${positionClasses[form.theme.position]} w-80 bg-white shadow-lg`}
          style={{
            borderRadius: `${form.theme.borderRadius}px`,
            border: `2px solid ${form.theme.primaryColor}`,
          }}
        >
          <div className="p-4 text-white" style={{ backgroundColor: form.theme.primaryColor }}>
            <div className="flex items-center space-x-2">
              {form.settings.showAvatar && (
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-sm">🤖</span>
                </div>
              )}
              <div>
                <h4 className="font-medium">AI Assistant</h4>
                <p className="text-xs opacity-90">オンライン</p>
              </div>
            </div>
          </div>

          <div className="p-4 h-48 overflow-y-auto">
            <div className="mb-4">
              <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                <p className="text-sm">{form.settings.welcomeMessage}</p>
              </div>
            </div>
          </div>

          <div className="p-4 border-t">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder={form.settings.placeholder}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                disabled
              />
              <button
                className="px-4 py-2 text-white rounded-lg text-sm"
                style={{ backgroundColor: form.theme.primaryColor }}
                disabled
              >
                送信
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
