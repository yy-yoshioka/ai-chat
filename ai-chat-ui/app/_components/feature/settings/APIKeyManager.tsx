'use client';

import React, { useState } from 'react';
import { Key, Copy, Eye, EyeOff, Trash2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useAPIKeys } from '@/app/_hooks/settings/useSettings';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface APIKeyManagerProps {
  orgId: string;
}

export function APIKeyManager({ orgId }: APIKeyManagerProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { apiKeys, isLoading, createKey, deleteKey } = useAPIKeys(orgId);
  const [showKeys, setShowKeys] = useState<Set<string>>(new Set());
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const toggleKeyVisibility = (keyId: string) => {
    const newShowKeys = new Set(showKeys);
    if (newShowKeys.has(keyId)) {
      newShowKeys.delete(keyId);
    } else {
      newShowKeys.add(keyId);
    }
    setShowKeys(newShowKeys);
  };

  const copyToClipboard = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      toast({
        title: 'コピーしました',
        description: 'APIキーをクリップボードにコピーしました',
      });
    } catch {
      toast({
        title: 'エラー',
        description: 'コピーに失敗しました',
        variant: 'destructive',
      });
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;

    setIsCreating(true);
    try {
      const newKey = await createKey(newKeyName);

      // 新しいキーを表示
      setShowKeys(new Set([newKey.id]));
      setNewKeyName('');

      toast({
        title: 'APIキーを作成しました',
        description: 'このキーは一度しか表示されません。安全に保管してください。',
      });
    } catch {
      toast({
        title: 'エラー',
        description: 'APIキーの作成に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('このAPIキーを削除してもよろしいですか？')) return;

    try {
      await deleteKey(keyId);
      toast({
        title: 'APIキーを削除しました',
      });
    } catch {
      toast({
        title: 'エラー',
        description: 'APIキーの削除に失敗しました',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          APIキー管理
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 新規作成 */}
          <div className="flex gap-2">
            <Input
              placeholder="APIキー名（例: Production API）"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
            />
            <Button onClick={handleCreateKey} disabled={isCreating || !newKeyName.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              作成
            </Button>
          </div>

          {/* キー一覧 */}
          <div className="space-y-2">
            {apiKeys.map((apiKey) => (
              <div
                key={apiKey.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{apiKey.name}</span>
                    <Badge variant="secondary">{apiKey.lastUsed ? 'Active' : 'Unused'}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="font-mono text-sm">
                      {showKeys.has(apiKey.id)
                        ? apiKey.key
                        : `${apiKey.key.substring(0, 8)}...${apiKey.key.substring(apiKey.key.length - 4)}`}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                      >
                        {showKeys.has(apiKey.id) ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(apiKey.key)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    作成:{' '}
                    {formatDistanceToNow(new Date(apiKey.createdAt), {
                      addSuffix: true,
                      locale: ja,
                    })}
                    {apiKey.lastUsed && (
                      <>
                        {' '}
                        • 最終使用:{' '}
                        {formatDistanceToNow(new Date(apiKey.lastUsed), {
                          addSuffix: true,
                          locale: ja,
                        })}
                      </>
                    )}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteKey(apiKey.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>

          {apiKeys.length === 0 && (
            <p className="text-center text-gray-500 py-4">APIキーがまだありません</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
