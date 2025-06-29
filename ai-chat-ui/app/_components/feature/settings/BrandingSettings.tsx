import React, { useState } from 'react';
import { DEFAULT_COLORS } from '@/_config/settings/tabs';

interface BrandingSettingsProps {
  orgId: string;
}

export function BrandingSettings({ orgId }: BrandingSettingsProps) {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [organizationName, setOrganizationName] = useState('');
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_COLORS.primary);
  const [secondaryColor, setSecondaryColor] = useState(DEFAULT_COLORS.secondary);

  const handleLogoUpload = async () => {
    if (!logoFile) return;

    console.log('Uploading logo for org:', orgId);
    // TODO: Implement S3 upload
    alert('Logo upload functionality will be implemented');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">組織ブランディング</h3>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">組織名</label>
              <input
                type="text"
                defaultValue="サンプル組織"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">組織ロゴ</label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🏢</span>
                </div>
                <button 
                  onClick={handleLogoUpload}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  アップロード
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                プライマリカラー
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
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
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
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