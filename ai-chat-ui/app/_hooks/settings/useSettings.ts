import { useState } from 'react';
import type { SettingsTab } from '@/app/_schemas/settings';

export function useSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('branding');

  return {
    activeTab,
    setActiveTab,
  };
}
