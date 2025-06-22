import { useState } from 'react';

const VoiceMultimodalPage = () => {
  const [settings, setSettings] = useState({
    voiceEnabled: true,
    ttsEnabled: true,
    screenShareEnabled: false,
    language: 'ja',
    model: 'whisper-v3',
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Voice & Multimodal Widget</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">音声設定</h2>
          <div className="space-y-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.voiceEnabled}
                onChange={(e) => setSettings({ ...settings, voiceEnabled: e.target.checked })}
              />
              <span>音声入力を有効化</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.ttsEnabled}
                onChange={(e) => setSettings({ ...settings, ttsEnabled: e.target.checked })}
              />
              <span>音声読み上げを有効化</span>
            </label>

            <div>
              <label className="block text-sm font-medium mb-2">音声認識モデル</label>
              <select
                value={settings.model}
                onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="web-speech">Web Speech API</option>
                <option value="whisper-v3">Whisper V3</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">マルチモーダル設定</h2>
          <div className="space-y-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.screenShareEnabled}
                onChange={(e) => setSettings({ ...settings, screenShareEnabled: e.target.checked })}
              />
              <span>画面共有を有効化</span>
            </label>

            <div>
              <label className="block text-sm font-medium mb-2">言語</label>
              <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="ja">日本語</option>
                <option value="en">English</option>
                <option value="auto">自動検出</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">テスト機能</h2>
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            🎤 音声テスト
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            🔊 TTS テスト
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
            📺 画面共有テスト
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceMultimodalPage;
