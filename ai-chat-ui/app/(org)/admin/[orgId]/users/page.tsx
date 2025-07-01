'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'guest';
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sample users data
    const sampleUsers: User[] = [
      {
        id: '1',
        name: '田中太郎',
        email: 'tanaka@example.com',
        role: 'admin',
        status: 'active',
        lastLogin: '2024-01-20T10:30:00Z',
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        name: '山田花子',
        email: 'yamada@example.com',
        role: 'member',
        status: 'active',
        lastLogin: '2024-01-19T15:45:00Z',
        createdAt: '2024-01-05T00:00:00Z',
      },
      {
        id: '3',
        name: '佐藤次郎',
        email: 'sato@example.com',
        role: 'guest',
        status: 'pending',
        createdAt: '2024-01-18T00:00:00Z',
      },
    ];

    setTimeout(() => {
      setUsers(sampleUsers);
      setLoading(false);
    }, 1000);
  }, []);

  const getRoleBadge = (role: User['role']) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-800',
      member: 'bg-blue-100 text-blue-800',
      guest: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      admin: '管理者',
      member: 'メンバー',
      guest: 'ゲスト',
    };
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${styles[role]}`}>
        {labels[role]}
      </span>
    );
  };

  const getStatusBadge = (status: User['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    const labels = {
      active: 'アクティブ',
      inactive: '非アクティブ',
      pending: '保留中',
    };
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">ユーザー管理</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          新しいユーザーを招待
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ユーザー
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  役割
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最終ログイン
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(user.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleString('ja-JP')
                      : '未ログイン'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">編集</button>
                    <button className="text-red-600 hover:text-red-900">削除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
