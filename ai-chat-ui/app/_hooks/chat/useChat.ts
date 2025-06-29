import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { fetchPost } from '@/app/_utils/fetcher';

// Response schema
const ChatResponseSchema = z.object({
  answer: z.string(),
  timestamp: z.string().optional(),
});

type ChatResponse = z.infer<typeof ChatResponseSchema>;

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
