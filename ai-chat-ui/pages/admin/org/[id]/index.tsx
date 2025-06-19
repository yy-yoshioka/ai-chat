import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '../../../../components/AdminLayout';

interface OrganizationDetails {
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
  settings: {
    ssoEnabled: boolean;
    customBrandingEnabled: boolean;
    apiAccessEnabled: boolean;
    advancedAnalyticsEnabled: boolean;
  };
  usage: {
    messages: number;
    messagesLimit: number;
    users: number;
    usersLimit: number;
    storage: number;
    storageLimit: number;
  };
}

interface ManagementMenuItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  category: 'billing' | 'security' | 'integration' | 'analytics' | 'content';
  isPremium?: boolean;
  isEnabled?: boolean;
}

export default function OrganizationDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [organization, setOrganization] = useState<OrganizationDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadOrganization(id as string);
    }
  }, [id]);

  const loadOrganization = async (orgId: string) => {
    try {
      setLoading(true);

      // モック実装（実際の実装では API を呼び出し）
      const mockOrganization: OrganizationDetails = {
        id: orgId,
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
        settings: {
          ssoEnabled: false,
          customBrandingEnabled: true,
          apiAccessEnabled: true,
          advancedAnalyticsEnabled: true,
        },
        usage: {
          messages: 5000,
          messagesLimit: 10000,
          users: 25,
          usersLimit: 100,
          storage: 2.5,
          storageLimit: 10,
        },
      };

      setOrganization(mockOrganization);
    } catch (error) {
      console.error('Failed to load organization:', error);
    } finally {
      setLoading(false);
    }
  };

  const managementMenuItems: ManagementMenuItem[] = [
    // Billing Category
    {
      id: 'billing-plans',
      title: '課金プラン管理',
      description: '料金プラン・使用量追跡・従量課金・分析',
      icon: '💳',
      href: `/admin/org/${id}/billing-plans`,
      category: 'billing',
    },

    // Security Category
    {
      id: 'security',
      title: 'セキュリティ設定',
      description: 'IP制限・アクセス制御・セキュリティポリシー',
      icon: '🔒',
      href: `/admin/org/${id}/security`,
      category: 'security',
    },
    {
      id: 'sso',
      title: 'SSO設定',
      description: 'シングルサインオン・SAML・OAuth設定',
      icon: '🔑',
      href: `/admin/org/${id}/sso`,
      category: 'security',
      isPremium: true,
      isEnabled: organization?.settings.ssoEnabled,
    },
    {
      id: 'encryption',
      title: '暗号化設定',
      description: 'データ暗号化・キー管理・暗号化ポリシー',
      icon: '🔐',
      href: `/admin/org/${id}/encryption`,
      category: 'security',
      isPremium: true,
    },
    {
      id: 'audit-logs',
      title: '監査ログ',
      description: 'アクセスログ・操作履歴・セキュリティ監査',
      icon: '📋',
      href: `/admin/org/${id}/audit-logs`,
      category: 'security',
    },
    {
      id: 'compliance',
      title: 'コンプライアンス',
      description: 'GDPR・CCPA・SOC2・ISO27001対応',
      icon: '⚖️',
      href: `/admin/org/${id}/compliance`,
      category: 'security',
      isPremium: true,
    },

    // Integration Category
    {
      id: 'api-portal',
      title: 'API ポータル',
      description: 'API設定・Webhook・開発者ツール',
      icon: '🔌',
      href: `/admin/org/${id}/api-portal`,
      category: 'integration',
      isEnabled: organization?.settings.apiAccessEnabled,
    },
    {
      id: 'webhooks',
      title: 'Webhook設定',
      description: 'イベント通知・外部システム連携',
      icon: '🔗',
      href: `/admin/org/${id}/webhooks`,
      category: 'integration',
    },
    {
      id: 'integrations',
      title: '外部連携',
      description: 'Slack・Teams・Salesforce・Zendesk',
      icon: '🔄',
      href: `/admin/org/${id}/integrations`,
      category: 'integration',
    },
    {
      id: 'plugins',
      title: 'プラグイン管理',
      description: 'カスタムプラグイン・拡張機能',
      icon: '🧩',
      href: `/admin/org/${id}/plugins`,
      category: 'integration',
    },

    // Analytics Category
    {
      id: 'ai-insights',
      title: 'AI インサイト',
      description: 'AI分析・パフォーマンス・改善提案',
      icon: '🤖',
      href: `/admin/org/${id}/ai-insights`,
      category: 'analytics',
      isEnabled: organization?.settings.advancedAnalyticsEnabled,
    },
    {
      id: 'synthetic-monitoring',
      title: '合成監視',
      description: 'パフォーマンス監視・可用性チェック',
      icon: '📊',
      href: `/admin/org/${id}/synthetic-monitoring`,
      category: 'analytics',
    },

    // Content Category
    {
      id: 'knowledge',
      title: 'ナレッジベース',
      description: 'FAQ・ドキュメント・学習データ管理',
      icon: '📚',
      href: `/admin/org/${id}/knowledge`,
      category: 'content',
    },
    {
      id: 'email-replies',
      title: 'メール返信',
      description: 'メール自動返信・テンプレート管理',
      icon: '📧',
      href: `/admin/org/${id}/email-replies`,
      category: 'content',
    },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'billing':
        return '💰';
      case 'security':
        return '🛡️';
      case 'integration':
        return '🔗';
      case 'analytics':
        return '📈';
      case 'content':
        return '📄';
      default:
        return '⚙️';
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'billing':
        return '課金・プラン';
      case 'security':
        return 'セキュリティ';
      case 'integration':
        return '連携・統合';
      case 'analytics':
        return '分析・監視';
      case 'content':
        return 'コンテンツ';
      default:
        return 'その他';
    }
  };

  const groupedItems = managementMenuItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, ManagementMenuItem[]>
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
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

  if (!organization) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">❌</span>
          <p className="text-lg text-gray-500">組織が見つかりません</p>
          <Link href="/admin/org" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            組織一覧に戻る
          </Link>
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
            <div className="flex items-center space-x-2 mb-2">
              <Link href="/admin/org" className="text-blue-600 hover:text-blue-800">
                組織一覧
              </Link>
              <span className="text-gray-400">→</span>
              <span className="font-medium text-gray-900">{organization.name}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{organization.name}</h1>
            <p className="text-gray-600 mt-1">{organization.description}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  organization.plan === 'enterprise'
                    ? 'bg-green-100 text-green-800'
                    : organization.plan === 'professional'
                      ? 'bg-purple-100 text-purple-800'
                      : organization.plan === 'starter'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                }`}
              >
                {organization.plan}
              </span>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  organization.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : organization.status === 'inactive'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}
              >
                {organization.status}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              最終アクティブ: {formatDate(organization.lastActive)}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ユーザー数</p>
                <p className="text-2xl font-bold text-gray-900">{organization.userCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">💬</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">メッセージ数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {organization.messageCount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">月間収益</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(organization.monthlyRevenue)}
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
                <p className="text-sm font-medium text-gray-600">トライアル</p>
                <p className="text-2xl font-bold text-gray-900">
                  {organization.trialStatus === 'active' && organization.trialDaysRemaining
                    ? `${organization.trialDaysRemaining}日`
                    : organization.trialStatus}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">使用量概要</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">メッセージ</span>
                <span className="text-sm text-gray-600">
                  {organization.usage.messages.toLocaleString()} /{' '}
                  {organization.usage.messagesLimit.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(organization.usage.messages, organization.usage.messagesLimit))}`}
                  style={{
                    width: `${getUsagePercentage(organization.usage.messages, organization.usage.messagesLimit)}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">ユーザー</span>
                <span className="text-sm text-gray-600">
                  {organization.usage.users} / {organization.usage.usersLimit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(organization.usage.users, organization.usage.usersLimit))}`}
                  style={{
                    width: `${getUsagePercentage(organization.usage.users, organization.usage.usersLimit)}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">ストレージ</span>
                <span className="text-sm text-gray-600">
                  {organization.usage.storage} GB / {organization.usage.storageLimit} GB
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(organization.usage.storage, organization.usage.storageLimit))}`}
                  style={{
                    width: `${getUsagePercentage(organization.usage.storage, organization.usage.storageLimit)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="space-y-8">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category}>
              <div className="flex items-center mb-6">
                <span className="text-2xl mr-3">{getCategoryIcon(category)}</span>
                <h2 className="text-xl font-semibold text-gray-900">
                  {getCategoryTitle(category)}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 p-6"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl">{item.icon}</span>
                      <div className="flex space-x-1">
                        {item.isPremium && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            プレミアム
                          </span>
                        )}
                        {item.isEnabled !== undefined && (
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              item.isEnabled
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {item.isEnabled ? '有効' : '無効'}
                          </span>
                        )}
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
