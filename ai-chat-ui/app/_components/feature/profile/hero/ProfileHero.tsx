'use client';

import React from 'react';
import { ProfileAvatar } from './ProfileAvatar';
import { RoleBadge } from './RoleBadge';
import { HERO_GRADIENT } from '@/app/_config/profile/constants';
import type { UserProfile } from '@/app/_schemas/profile';

interface ProfileHeroProps {
  profile: UserProfile;
  daysActive: number;
}

export function ProfileHero({ profile, daysActive }: ProfileHeroProps) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${HERO_GRADIENT} rounded-2xl mb-6`}>
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="relative max-w-6xl mx-auto py-8 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <ProfileAvatar name={profile.name} size="md" />
            
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">{profile.name}</h1>
              <p className="text-blue-100 mb-2">{profile.email}</p>
              <RoleBadge isAdmin={profile.isAdmin} />
            </div>
          </div>

          <div className="text-right">
            <p className="text-blue-100 text-sm">利用期間</p>
            <p className="text-2xl font-bold text-white">{daysActive}日</p>
          </div>
        </div>
      </div>
    </div>
  );
}