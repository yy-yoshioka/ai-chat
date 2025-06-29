import { useState } from 'react';
import type { SettingsTab } from '@/_schemas/settings';

export function useSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('branding');

  return {
    activeTab,
    setActiveTab,
  };
}
