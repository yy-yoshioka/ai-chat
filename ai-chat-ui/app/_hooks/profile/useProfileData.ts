'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/_hooks/auth/useAuth';
import type { UserProfile } from '@/app/_schemas/profile';
import { fetchGet } from '@/app/_utils/fetcher';

export function useProfileData() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchUserProfile();
    }
  }, [user, authLoading, router]);

  const fetchUserProfile = async () => {
    try {
      setError(null);
      const data = await fetchGet<{ user: UserProfile }>('/api/me', {
        credentials: 'include',
      });
      setUserProfile(data.user);
    } catch (error) {
      setError('Error fetching user profile');
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const calculateDaysActive = (): number => {
    if (!userProfile?.createdAt) return 0;
    const joinDate = new Date(userProfile.createdAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - joinDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return {
    userProfile,
    isLoading: authLoading || isLoading,
    error,
    handleLogout,
    daysActive: calculateDaysActive(),
  };
}
