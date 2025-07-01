'use client';

import { useParams } from 'next/navigation';
import { useSettings } from '@/app/_hooks/settings/useSettings';
import { SettingsView } from '@/app/_components/feature/settings';

export default function SettingsPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || 'default';
  const { activeTab, setActiveTab } = useSettings();

  return <SettingsView orgId={orgId} activeTab={activeTab} onTabChange={setActiveTab} />;
}
