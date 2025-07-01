'use client';

import React, { useState } from 'react';
import { Shield, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { fetchPut } from '@/app/_utils/fetcher';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

const AVAILABLE_PERMISSIONS: Permission[] = [
  {
    id: 'widgets.create',
    name: 'ウィジェット作成',
    description: '新しいウィジェットを作成できます',
    category: 'ウィジェット',
  },
  {
    id: 'widgets.edit',
    name: 'ウィジェット編集',
    description: '既存のウィジェットを編集できます',
    category: 'ウィジェット',
  },
  {
    id: 'widgets.delete',
    name: 'ウィジェット削除',
    description: 'ウィジェットを削除できます',
    category: 'ウィジェット',
  },
  {
    id: 'users.manage',
    name: 'ユーザー管理',
    description: 'ユーザーの追加・編集・削除ができます',
    category: 'ユーザー',
  },
  {
    id: 'billing.manage',
    name: '請求管理',
    description: '請求情報の確認・変更ができます',
    category: '請求',
  },
  {
    id: 'analytics.view',
    name: '分析閲覧',
    description: '詳細な分析データを閲覧できます',
    category: '分析',
  },
];

interface UserPermissionsEditorProps {
  userId: string;
  currentPermissions: string[];
  onUpdate: () => void;
}

export function UserPermissionsEditor({
  userId,
  currentPermissions,
  onUpdate,
}: UserPermissionsEditorProps) {
  const [permissions, setPermissions] = useState<Set<string>>(new Set(currentPermissions));
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const togglePermission = (permissionId: string) => {
    const newPermissions = new Set(permissions);
    if (newPermissions.has(permissionId)) {
      newPermissions.delete(permissionId);
    } else {
      newPermissions.add(permissionId);
    }
    setPermissions(newPermissions);
  };

  const savePermissions = async () => {
    setIsSaving(true);

    try {
      await fetchPut(`/api/bff/users/${userId}`, {
        permissions: Array.from(permissions),
      });

      toast({
        title: '権限を更新しました',
        description: '変更が正常に保存されました',
      });

      onUpdate();
    } catch (error) {
      toast({
        title: 'エラー',
        description: '権限の更新に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // カテゴリ別にグループ化
  const permissionsByCategory = AVAILABLE_PERMISSIONS.reduce(
    (acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    },
    {} as Record<string, Permission[]>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            権限設定
          </div>
          <Button size="sm" onClick={savePermissions} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            保存
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(permissionsByCategory).map(([category, perms]) => (
            <div key={category}>
              <h3 className="font-medium text-sm text-gray-700 mb-3">{category}</h3>
              <div className="space-y-3">
                {perms.map((permission) => (
                  <div key={permission.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={permission.id}
                      checked={permissions.has(permission.id)}
                      onCheckedChange={() => togglePermission(permission.id)}
                    />
                    <div className="flex-1">
                      <label htmlFor={permission.id} className="text-sm font-medium cursor-pointer">
                        {permission.name}
                      </label>
                      <p className="text-sm text-gray-500">{permission.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
