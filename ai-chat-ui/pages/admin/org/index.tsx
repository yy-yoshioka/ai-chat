import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '../../../components/AdminLayout';

interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  domain?: string;
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended';
  trialStatus: 'active' | 'expired' | 'none';
  trialDaysRemaining?: number;
  userCount: number;
  messageCount: number;
  createdAt: string;
  lastActive: string;
  billingEmail?: string;
  monthlyRevenue: number;
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setLoading(true);

      // モック実装（実際の実装では API を呼び出し）
      const mockOrganizations: Organization[] = [
        {
          id: 'org-1',
          name: 'Acme Corporation',
          slug: 'acme-corp',
          description: 'Leading technology solutions provider',
          domain: 'acme.com',
          plan: 'enterprise',
          status: 'active',
          trialStatus: 'none',
          userCount: 150,
          messageCount: 25000,
          createdAt: '2024-01-15T09:00:00Z',
          lastActive: '2024-12-20T14:30:00Z',
          billingEmail: 'billing@acme.com',
          monthlyRevenue: 29800,
        },
        {
          id: 'org-2',
          name: 'StartupX',
          slug: 'startupx',
          description: 'Innovative startup disrupting the market',
          domain: 'startupx.io',
          plan: 'professional',
          status: 'active',
          trialStatus: 'active',
          trialDaysRemaining: 7,
          userCount: 25,
          messageCount: 5000,
          createdAt: '2024-12-01T10:00:00Z',
          lastActive: '2024-12-20T16:45:00Z',
          billingEmail: 'admin@startupx.io',
          monthlyRevenue: 9800,
        },
        {
          id: 'org-3',
          name: 'Local Business Co',
          slug: 'local-business',
          description: 'Family-owned local business',
          plan: 'starter',
          status: 'active',
          trialStatus: 'expired',
          userCount: 5,
          messageCount: 1200,
          createdAt: '2024-11-20T11:00:00Z',
          lastActive: '2024-12-19T09:15:00Z',
          billingEmail: 'owner@localbusiness.com',
          monthlyRevenue: 2980,
        },
        {
          id: 'org-4',
          name: 'Enterprise Demo',
          slug: 'enterprise-demo',
          description: 'Demo organization for enterprise features',
          plan: 'free',
          status: 'inactive',
          trialStatus: 'expired',
          userCount: 2,
          messageCount: 50,
          createdAt: '2024-10-01T08:00:00Z',
          lastActive: '2024-11-15T12:00:00Z',
          monthlyRevenue: 0,
        },
      ];

      setOrganizations(mockOrganizations);
    } catch (error) {
      console.error('Failed to load organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrganizations = organizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (org.domain && org.domain.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPlan = filterPlan === 'all' || org.plan === filterPlan;
    const matchesStatus = filterStatus === 'all' || org.status === filterStatus;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free':
        return 'bg-gray-100 text-gray-800';
      case 'starter':
        return 'bg-blue-100 text-blue-800';
      case 'professional':
        return 'bg-purple-100 text-purple-800';
      case 'enterprise':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrialStatusColor = (trialStatus: string) => {
    switch (trialStatus) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'none':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">組織管理</h1>
            <p className="text-gray-600 mt-1">登録組織の管理・課金プラン・使用状況の監視</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            + 新規組織作成
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">🏢</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総組織数</p>
                <p className="text-2xl font-bold text-gray-900">{organizations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">月間収益</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(organizations.reduce((sum, org) => sum + org.monthlyRevenue, 0))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総ユーザー</p>
                <p className="text-2xl font-bold text-gray-900">
                  {organizations.reduce((sum, org) => sum + org.userCount, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">⏰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">トライアル中</p>
                <p className="text-2xl font-bold text-gray-900">
                  {organizations.filter((org) => org.trialStatus === 'active').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">検索</label>
              <input
                type="text"
                placeholder="組織名、スラッグ、ドメインで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">プラン</label>
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">すべてのプラン</option>
                <option value="free">無料</option>
                <option value="starter">スターター</option>
                <option value="professional">プロフェッショナル</option>
                <option value="enterprise">エンタープライズ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ステータス</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">すべてのステータス</option>
                <option value="active">アクティブ</option>
                <option value="inactive">非アクティブ</option>
                <option value="suspended">停止中</option>
              </select>
            </div>
          </div>
        </div>

        {/* Organizations Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    組織
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    プラン・ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    トライアル
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    使用量
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    収益
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    最終アクティブ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrganizations.map((org) => (
                  <tr key={org.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{org.name}</div>
                        <div className="text-sm text-gray-500">{org.slug}</div>
                        {org.domain && <div className="text-xs text-gray-400">{org.domain}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(org.plan)}`}
                        >
                          {org.plan}
                        </span>
                        <br />
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(org.status)}`}
                        >
                          {org.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTrialStatusColor(org.trialStatus)}`}
                      >
                        {org.trialStatus === 'active' && org.trialDaysRemaining
                          ? `${org.trialDaysRemaining}日残り`
                          : org.trialStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>{org.userCount} ユーザー</div>
                        <div className="text-xs text-gray-500">
                          {org.messageCount.toLocaleString()} メッセージ
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(org.monthlyRevenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(org.lastActive)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/admin/org/${org.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        管理
                      </Link>
                      <Link
                        href={`/admin/org/${org.id}/billing-plans`}
                        className="text-green-600 hover:text-green-900"
                      >
                        課金
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrganizations.length === 0 && (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🏢</span>
              <p className="text-lg text-gray-500">
                {searchTerm || filterPlan !== 'all' || filterStatus !== 'all'
                  ? '条件に一致する組織が見つかりません'
                  : '組織が登録されていません'}
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
