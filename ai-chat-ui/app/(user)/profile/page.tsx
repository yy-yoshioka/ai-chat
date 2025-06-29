'use client';

import React from 'react';
import { ProfileLoadingState } from '@/app/_components/feature/profile/shared/ProfileLoadingState';
import { ProfileErrorState } from '@/app/_components/feature/profile/shared/ProfileErrorState';
import { ProfileHero } from '@/app/_components/feature/profile/hero/ProfileHero';
import { AccountInfoCard } from '@/app/_components/feature/profile/cards/AccountInfoCard';
import { QuickActionsCard } from '@/app/_components/feature/profile/cards/QuickActionsCard';
import { AccountSettingsCard } from '@/app/_components/feature/profile/cards/AccountSettingsCard';
import { useProfileData } from '@/app/_components/feature/profile/hooks/useProfileData';

export default function ProfilePage() {
  const { userProfile, isLoading, error, handleLogout, daysActive } = useProfileData();

  if (isLoading) {
    return <ProfileLoadingState />;
  }

  if (error || !userProfile) {
    return <ProfileErrorState message={error || 'Unable to load user profile.'} />;
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <ProfileHero profile={userProfile} daysActive={daysActive} />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AccountInfoCard profile={userProfile} daysActive={daysActive} />
          <QuickActionsCard />
        </div>

        <div className="space-y-6">
          <AccountSettingsCard onLogout={handleLogout} />
        </div>
      </div>
    </div>
  );
}
