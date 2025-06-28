'use client';

import { useMemo } from 'react';
import { useAuth } from '@/app/_hooks/auth/useAuth';
import { PUBLIC_SIDEBAR, PublicNavItem } from '@/app/_config/navigation/public/sidebar';

/**
 * ナビゲーションの表示フィルタリングを行うカスタム Hook
 */
const usePublicMenu = () => {
  const { authenticated } = useAuth();

  return useMemo<PublicNavItem[]>(() => {
    return PUBLIC_SIDEBAR.filter((item) => (item.requiresAuth ? authenticated : true));
  }, [authenticated]);
};

export default usePublicMenu;
