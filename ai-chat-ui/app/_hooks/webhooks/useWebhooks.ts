import useSWR from 'swr';
import { useCallback } from 'react';
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

  const {
    data: webhooks,
    error,
    isLoading,
    mutate,
  } = useSWR<Webhook[]>(authToken ? '/api/bff/webhooks' : null, (url) =>
    fetcherWithAuth(url, authToken!)
  );

  const createWebhook = useCallback(
    async (data: CreateWebhookInput) => {
      try {
        const newWebhook = await posterWithAuth('/api/bff/webhooks', data, authToken!);

        await mutate();

        toast({
          title: 'Webhookを作成しました',
          description: `${newWebhook.name}を作成しました`,
        });

        return newWebhook;
      } catch (error: any) {
        toast({
          title: 'エラー',
          description: error.message || 'Webhookの作成に失敗しました',
          variant: 'destructive',
        });
        throw error;
      }
    },
    [authToken, mutate, toast]
  );

  const updateWebhook = useCallback(
    async (id: string, data: UpdateWebhookInput) => {
      try {
        const updatedWebhook = await updaterWithAuth(`/api/bff/webhooks/${id}`, data, authToken!);

        await mutate();

        toast({
          title: 'Webhookを更新しました',
          description: '変更が保存されました',
        });

        return updatedWebhook;
      } catch (error: any) {
        toast({
          title: 'エラー',
          description: error.message || 'Webhookの更新に失敗しました',
          variant: 'destructive',
        });
        throw error;
      }
    },
    [authToken, mutate, toast]
  );

  const deleteWebhook = useCallback(
    async (id: string) => {
      try {
        await deleterWithAuth(`/api/bff/webhooks/${id}`, authToken!);

        await mutate();

        toast({
          title: 'Webhookを削除しました',
          description: 'Webhookが正常に削除されました',
        });
      } catch (error: any) {
        toast({
          title: 'エラー',
          description: error.message || 'Webhookの削除に失敗しました',
          variant: 'destructive',
        });
        throw error;
      }
    },
    [authToken, mutate, toast]
  );

  const testWebhook = useCallback(
    async (id: string) => {
      try {
        const result = await posterWithAuth(`/api/bff/webhooks/${id}/test`, {}, authToken!);

        toast({
          title: 'テストWebhookを送信しました',
          description:
            result.status === 'success'
              ? 'Webhookが正常に送信されました'
              : 'Webhookの送信に失敗しました',
          variant: result.status === 'success' ? 'default' : 'destructive',
        });

        return result;
      } catch (error: any) {
        toast({
          title: 'エラー',
          description: error.message || 'テストWebhookの送信に失敗しました',
          variant: 'destructive',
        });
        throw error;
      }
    },
    [authToken, toast]
  );

  return {
    webhooks: webhooks || [],
    isLoading,
    error,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook,
    refetch: mutate,
  };
}
