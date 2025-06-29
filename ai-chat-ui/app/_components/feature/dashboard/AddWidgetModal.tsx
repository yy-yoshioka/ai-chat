import React from 'react';

interface AddWidgetModalProps {
  onAddWidget: (type: string) => void;
  onClose: () => void;
}

export function AddWidgetModal({ onAddWidget, onClose }: AddWidgetModalProps) {
  const widgetOptions = [
    { type: 'stat', label: '統計ウィジェット', icon: '📊' },
    { type: 'chart', label: 'チャートウィジェット', icon: '📈' },
    { type: 'activity', label: 'アクティビティウィジェット', icon: '🔔' },
    { type: 'health', label: 'ヘルスウィジェット', icon: '💚' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ウィジェットを追加</h3>
        <div className="space-y-3">
          {widgetOptions.map((option) => (
            <button
              key={option.type}
              onClick={() => onAddWidget(option.type)}
              className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{option.icon}</span>
                <span className="font-medium">{option.label}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}