'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useDataRetention, type RetentionPolicy } from '@/_hooks/settings/useDataRetention';
import { RetentionJobHistory } from './RetentionJobHistory';

interface DataRetentionSettingsProps {
  orgId: string;
}

export function DataRetentionSettings({ orgId }: DataRetentionSettingsProps) {
  const { policy, isLoading, updatePolicy, triggerCleanup } = useDataRetention(orgId);
  const [localPolicy, setLocalPolicy] = useState<Partial<RetentionPolicy>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (policy) {
      setLocalPolicy(policy);
    }
  }, [policy]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePolicy(localPolicy);
      toast({
        title: '設定を保存しました',
      });
    } catch {
      toast({
        title: 'エラー',
        description: '設定の保存に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualCleanup = async (dataType: string) => {
    setIsCleaningUp(dataType);
    try {
      // Map the UI key to the API data type
      const dataTypeMap: Record<string, string> = {
        chatLogs: 'chat_logs',
        webhookLogs: 'webhook_logs',
        messageFeedback: 'message_feedback',
        systemMetrics: 'system_metrics',
        healthChecks: 'health_checks',
      };
      const apiDataType = dataTypeMap[dataType] || dataType;

      await triggerCleanup(apiDataType);
      toast({
        title: 'クリーンアップを開始しました',
        description: 'バックグラウンドで処理が実行されています',
      });
    } catch {
      toast({
        title: 'エラー',
        description: 'クリーンアップの開始に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsCleaningUp(null);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const retentionItems = [
    {
      key: 'chatLogs',
      label: 'チャットログ',
      description: 'ユーザーとの会話履歴',
      defaultDays: 365,
    },
    {
      key: 'messageFeedback',
      label: 'メッセージフィードバック',
      description: 'ユーザーからの評価データ',
      defaultDays: 730,
    },
    { key: 'webhookLogs', label: 'Webhookログ', description: 'Webhook実行履歴', defaultDays: 30 },
    {
      key: 'systemMetrics',
      label: 'システムメトリクス',
      description: 'パフォーマンス指標',
      defaultDays: 90,
    },
    {
      key: 'healthChecks',
      label: 'ヘルスチェック',
      description: 'システム監視データ',
      defaultDays: 7,
    },
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            データ保持ポリシー
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? '保存中...' : '保存'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Global Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <label className="flex items-center gap-2">
              <Switch
                checked={localPolicy.autoDelete || false}
                onCheckedChange={(checked) =>
                  setLocalPolicy((prev) => ({ ...prev, autoDelete: checked }))
                }
              />
              <span>自動削除を有効化</span>
            </label>
            <label className="flex items-center gap-2">
              <Switch
                checked={localPolicy.anonymizeData || false}
                onCheckedChange={(checked) =>
                  setLocalPolicy((prev) => ({ ...prev, anonymizeData: checked }))
                }
              />
              <span>削除の代わりに匿名化</span>
            </label>
          </div>

          {/* Retention Periods */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">保持期間設定</h3>
            {retentionItems.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{item.label}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="9999"
                      className="w-20"
                      value={localPolicy[item.key] || item.defaultDays}
                      onChange={(e) =>
                        setLocalPolicy((prev) => ({
                          ...prev,
                          [item.key]: parseInt(e.target.value) || item.defaultDays,
                        }))
                      }
                    />
                    <span className="text-sm">日</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleManualCleanup(item.key)}
                    disabled={isCleaningUp === item.key}
                  >
                    {isCleaningUp === item.key ? '実行中...' : '今すぐ実行'}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Compliance Info */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">コンプライアンス情報</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• GDPR: 個人データは必要最小限の期間のみ保持</li>
              <li>• 匿名化: 個人を特定できない形でデータを保持</li>
              <li>• 監査ログ: 法的要件により7年間保持</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <RetentionJobHistory orgId={orgId} />
    </div>
  );
}
