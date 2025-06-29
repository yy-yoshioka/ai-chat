'use client';

import React from 'react';
import { AVATAR_GRADIENT } from '@/app/_config/profile/constants';

interface ProfileAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ProfileAvatar({ name, size = 'md' }: ProfileAvatarProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  };

  return (
    <div
      className={`${sizeClasses[size]} bg-white rounded-xl flex items-center justify-center shadow-lg`}
    >
      <span
        className={`font-bold text-transparent bg-clip-text bg-gradient-to-r ${AVATAR_GRADIENT}`}
      >
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}
