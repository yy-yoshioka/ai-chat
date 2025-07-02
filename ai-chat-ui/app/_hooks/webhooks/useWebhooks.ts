import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import {
  fetcherWithAuth,
  posterWithAuth,
  updaterWithAuth,
  deleterWithAuth,
} from '@/app/_utils/fetcher';
import { getAuthTokenFromCookie } from '@/app/_utils/auth-utils';
import type { Webhook, CreateWebhookInput, UpdateWebhookInput } from '@/app/_schemas/webhooks';

export function useWebhooks() {
  const { toast } = useToast();
  const authToken = getAuthTokenFromCookie();
  const queryClient = useQueryClient();

  const {
    data: webhooks,
    error,
    isLoading,
    refetch,
  } = useQuery<Webhook[]>({
    queryKey: ['webhooks'],
    queryFn: () => fetcherWithAuth('/api/bff/webhooks', authToken!),
    enabled: !!authToken,
  });

  const createWebhookMutation = useMutation({
    mutationFn: (data: CreateWebhookInput) => posterWithAuth('/api/bff/webhooks', data, authToken!),
    onSuccess: (newWebhook) => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast({
        title: 'Webhookを作成しました',
        description: `${newWebhook.name}を作成しました`,
      });
    },
    onError: (error) => {
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : 'Webhookの作成に失敗しました',
        variant: 'destructive',
      });
    },
  });

  const updateWebhookMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWebhookInput }) =>
      updaterWithAuth(`/api/bff/webhooks/${id}`, data, authToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast({
        title: 'Webhookを更新しました',
        description: '変更が保存されました',
      });
    },
    onError: (error) => {
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : 'Webhookの更新に失敗しました',
        variant: 'destructive',
      });
    },
  });

  const deleteWebhookMutation = useMutation({
    mutationFn: (id: string) => deleterWithAuth(`/api/bff/webhooks/${id}`, authToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast({
        title: 'Webhookを削除しました',
        description: 'Webhookが正常に削除されました',
      });
    },
    onError: (error) => {
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : 'Webhookの削除に失敗しました',
        variant: 'destructive',
      });
    },
  });

  const testWebhookMutation = useMutation({
    mutationFn: (id: string) => posterWithAuth(`/api/bff/webhooks/${id}/test`, {}, authToken!),
    onSuccess: (result) => {
      toast({
        title: 'テストWebhookを送信しました',
        description:
          result.status === 'success'
            ? 'Webhookが正常に送信されました'
            : 'Webhookの送信に失敗しました',
        variant: result.status === 'success' ? 'default' : 'destructive',
      });
    },
    onError: (error) => {
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : 'テストWebhookの送信に失敗しました',
        variant: 'destructive',
      });
    },
  });

  return {
    webhooks: webhooks || [],
    isLoading,
    error,
    createWebhook: createWebhookMutation.mutateAsync,
    updateWebhook: (id: string, data: UpdateWebhookInput) =>
      updateWebhookMutation.mutateAsync({ id, data }),
    deleteWebhook: deleteWebhookMutation.mutateAsync,
    testWebhook: testWebhookMutation.mutateAsync,
    refetch,
  };
}
