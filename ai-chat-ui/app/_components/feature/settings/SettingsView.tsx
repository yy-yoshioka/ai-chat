import React from 'react';
import type { SettingsTab } from '@/app/_schemas/settings';
import { SETTINGS_TABS } from '@/app/_config/settings/tabs';
import { BrandingSettings } from './BrandingSettings';
import { MembersSettings } from './MembersSettings';
import { WidgetsSettings } from './WidgetsSettings';
import { APISettings } from './APISettings';
import { NotificationSettings } from './NotificationSettings';
import { SecuritySettings } from './SecuritySettings';

interface SettingsViewProps {
  orgId: string;
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

export function SettingsView({ orgId, activeTab, onTabChange }: SettingsViewProps) {
  const renderTabContent = () => {
    switch (activeTab) {
      case 'branding':
        return <BrandingSettings orgId={orgId} />;
      case 'members':
        return <MembersSettings orgId={orgId} />;
      case 'widgets':
        return <WidgetsSettings orgId={orgId} />;
      case 'api':
        return <APISettings orgId={orgId} />;
      case 'notifications':
        return <NotificationSettings orgId={orgId} />;
      case 'security':
        return <SecuritySettings orgId={orgId} />;
      default:
        return <BrandingSettings orgId={orgId} />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">設定</h1>
        <p className="text-gray-600">組織の設定とカスタマイズを管理</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {SETTINGS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as SettingsTab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="min-h-96">{renderTabContent()}</div>
    </div>
  );
}
