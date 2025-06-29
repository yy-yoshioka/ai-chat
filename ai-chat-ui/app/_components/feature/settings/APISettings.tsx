import React, { useState } from 'react';
import { DEFAULT_API_KEY_PREFIX, API_KEY_LENGTH } from '@/_config/settings/tabs';

interface APISettingsProps {
  orgId: string;
}

export function APISettings({ orgId }: APISettingsProps) {
  const [apiKey, setApiKey] = useState('ak_1234567890abcdef');
  const [webhookUrl, setWebhookUrl] = useState('');

  const regenerateApiKey = () => {
    console.log('Regenerating API key for org:', orgId);
    // TODO: Implement API key regeneration
    if (confirm('APIキーを再生成しますか？既存のキーは無効になります。')) {
      const newKey =
        DEFAULT_API_KEY_PREFIX +
        Math.random()
          .toString(36)
          .substring(2, 2 + API_KEY_LENGTH);
      setApiKey(newKey);
      alert('新しいAPIキーが生成されました');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">API設定</h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">APIキー</label>
            <div className="flex items-center space-x-3">
              <input
                type="password"
                value={apiKey}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                readOnly
              />
              <button
                onClick={regenerateApiKey}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                再生成
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-site.com/webhook"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
