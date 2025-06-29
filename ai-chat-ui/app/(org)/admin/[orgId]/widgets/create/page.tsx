'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface WidgetForm {
  name: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    borderRadius: number;
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  };
  settings: {
    welcomeMessage: string;
    placeholder: string;
    showAvatar: boolean;
    enableFileUpload: boolean;
  };
}

export default function CreateWidgetPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = React.use(params);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<WidgetForm>({
    name: '',
    theme: {
      primaryColor: '#3B82F6',
      secondaryColor: '#64748B',
      borderRadius: 12,
      position: 'bottom-right',
    },
    settings: {
      welcomeMessage: 'こんにちは！何かお手伝いできることはありますか？',
      placeholder: 'メッセージを入力...',
      showAvatar: true,
      enableFileUpload: false,
    },
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
        borderRadius: parseInt(form.theme.borderRadius.toString()),
        fontFamily: '',
        welcomeMessage: form.settings.welcomeMessage,
        placeholder: form.settings.placeholder,
        showAvatar: form.settings.showAvatar,
        enableFileUpload: form.settings.enableFileUpload,
      };

      console.log('Creating widget:', widgetData);
      // TODO: Send to API

      alert('ウィジェットが作成されました！');
      // router.push(`/admin/${orgId}/widgets`);
    } catch (error: unknown) {
      console.error('Widget creation failed:', error);
      alert('ウィジェット作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field: string, value: any) => {
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
    const widgetKey = `wgt_${Math.random().toString(36).substr(2, 16)}`;
    return `<script src="${window.location.origin}/widget.js" data-key="${widgetKey}"></script>`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
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
        {/* Form */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Settings */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">基本設定</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ウィジェット名
                  </label>
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

            {/* Theme Settings */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">テーマ設定</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      プライマリカラー
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      セカンダリカラー
                    </label>
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
                    min="0"
                    max="24"
                    value={form.theme.borderRadius.toString()}
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
                    <option value="bottom-right">右下</option>
                    <option value="bottom-left">左下</option>
                    <option value="top-right">右上</option>
                    <option value="top-left">左上</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">詳細設定</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">アバター表示</h4>
                    <p className="text-sm text-gray-500">チャットボットのアバターを表示</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.settings.showAvatar}
                      onChange={(e) => updateForm('settings.showAvatar', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">ファイルアップロード</h4>
                    <p className="text-sm text-gray-500">ユーザーがファイルを送信可能</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.settings.enableFileUpload}
                      onChange={(e) => updateForm('settings.enableFileUpload', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
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

        {/* Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">プレビュー</h3>

            {/* Widget Preview */}
            <div className="relative bg-gray-100 rounded-lg p-4 h-96 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100"></div>

              {/* Mock widget */}
              <div
                className={`absolute ${
                  form.theme.position === 'bottom-right'
                    ? 'bottom-4 right-4'
                    : form.theme.position === 'bottom-left'
                      ? 'bottom-4 left-4'
                      : form.theme.position === 'top-right'
                        ? 'top-4 right-4'
                        : 'top-4 left-4'
                } w-80 bg-white shadow-lg`}
                style={{
                  borderRadius: `${form.theme.borderRadius}px`,
                  border: `2px solid ${form.theme.primaryColor}`,
                }}
              >
                {/* Widget Header */}
                <div
                  className="p-4 text-white"
                  style={{ backgroundColor: form.theme.primaryColor }}
                >
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

                {/* Widget Body */}
                <div className="p-4 h-48 overflow-y-auto">
                  <div className="mb-4">
                    <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                      <p className="text-sm">{form.settings.welcomeMessage}</p>
                    </div>
                  </div>
                </div>

                {/* Widget Input */}
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

          {/* Embed Code */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">埋め込みコード</h3>
            <div className="bg-gray-900 rounded-lg p-4 text-white text-sm font-mono overflow-x-auto">
              {generateEmbedCode()}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              このコードをサイトのHTMLに貼り付けてください
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
