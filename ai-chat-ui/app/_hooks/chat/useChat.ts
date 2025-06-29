import { useMutation } from '@tanstack/react-query';
import { fetchPost } from '@/app/_utils/fetcher';
import { ChatResponseSchema, ChatResponse } from '@/app/_schemas/chat';

/**
 * Hook to send chat messages
 */
export function useSendMessage() {
  return useMutation({
    mutationFn: (message: string) => fetchPost('/api/bff/chat', ChatResponseSchema, { message }),
  });
}

// Export types for components
export type { ChatResponse };
