import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // SWRのデフォルト動作に近い設定
      refetchOnWindowFocus: false,
      staleTime: 0,
      gcTime: 5 * 60 * 1000, // 5分（旧cacheTime）
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 0,
    },
  },
});
