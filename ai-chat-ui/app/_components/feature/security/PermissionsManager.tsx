'use client';

import { useState } from 'react';
import { useUserPermissions } from '@/app/_hooks/security/useUserPermissions';
import { Permission } from '@/app/_schemas/security';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/_components/ui/card';
import { Button } from '@/app/_components/ui/button';
import { Badge } from '@/app/_components/ui/badge';
import { Shield, Plus, Minus } from 'lucide-react';

interface PermissionsManagerProps {
  orgId: string;
}

const PERMISSION_GROUPS = {
  Organization: ['ORG_READ', 'ORG_WRITE', 'ORG_DELETE', 'ORG_INVITE_USERS'],
  Widget: ['WIDGET_READ', 'WIDGET_WRITE', 'WIDGET_DELETE', 'WIDGET_CONFIGURE'],
  Chat: ['CHAT_READ', 'CHAT_MODERATE', 'CHAT_EXPORT'],
  KnowledgeBase: ['KB_READ', 'KB_WRITE', 'KB_DELETE', 'KB_TRAIN'],
  Analytics: ['ANALYTICS_READ', 'ANALYTICS_EXPORT'],
  Settings: ['SETTINGS_READ', 'SETTINGS_WRITE'],
  Billing: ['BILLING_READ', 'BILLING_WRITE'],
  System: ['SYSTEM_ADMIN', 'AUDIT_READ'],
};

export function PermissionsManager({ orgId }: PermissionsManagerProps) {
  const { users, isLoading, grantPermission, revokePermission, isGranting, isRevoking } =
    useUserPermissions(orgId);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  const selectedUser = users.find((u) => u.id === selectedUserId);

  const handlePermissionToggle = async (permission: Permission) => {
    if (!selectedUserId || !selectedUser) return;

    const hasPermission = selectedUser.permissions.includes(permission);

    if (hasPermission) {
      await revokePermission({ userId: selectedUserId, permission });
    } else {
      await grantPermission({ userId: selectedUserId, permission });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* User List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>ユーザー一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUserId(user.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedUserId === user.id
                    ? 'bg-blue-50 border-blue-200 border'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.name || user.email}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <div className="flex gap-1">
                    {user.roles.map((role) => (
                      <Badge key={role} variant="secondary" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Permission Editor */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            権限管理
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedUser ? (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">{selectedUser.name || selectedUser.email}</h3>
                <p className="text-sm text-gray-500 mb-4">{selectedUser.email}</p>
              </div>

              {Object.entries(PERMISSION_GROUPS).map(([group, permissions]) => (
                <div key={group}>
                  <h4 className="font-medium text-sm mb-3">{group}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {permissions.map((permission) => {
                      const hasPermission = selectedUser.permissions.includes(
                        permission as Permission
                      );

                      return (
                        <div
                          key={permission}
                          className="flex items-center justify-between p-2 border rounded-lg"
                        >
                          <span className="text-sm">{permission}</span>
                          <Button
                            size="sm"
                            variant={hasPermission ? 'destructive' : 'default'}
                            onClick={() => handlePermissionToggle(permission as Permission)}
                            disabled={isGranting || isRevoking}
                          >
                            {hasPermission ? (
                              <>
                                <Minus className="h-3 w-3 mr-1" />
                                取消
                              </>
                            ) : (
                              <>
                                <Plus className="h-3 w-3 mr-1" />
                                付与
                              </>
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              ユーザーを選択して権限を管理してください
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
