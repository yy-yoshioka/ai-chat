// ============================================================================
// AI Chat 管理者パネル UI コンポーネント集 (Part 3)
// ============================================================================

// ============================================================================
// app/(org)/admin/[orgId]/billing/page.tsx
// ============================================================================

const BillingPage = ({ params }) => {
    const { orgId } = React.use(params);
    const [activeTab, setActiveTab] = useState('plan');
    const [usage, setUsage] = useState(null);
    const [currentPlan, setCurrentPlan] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">読み込み中...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">請求・利用状況</h1>
                <p className="text-gray-600">プランの管理と利用状況の確認</p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { id: 'plan', label: 'プラン', icon: '💳' },
                        { id: 'usage', label: '利用状況', icon: '📊' },
                        { id: 'invoices', label: '請求書', icon: '📄' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'plan' && currentPlan && (
                <div className="space-y-6">
                    {/* Current Plan */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">現在のプラン</h3>
                                <p className="text-gray-600">アクティブなプランと機能</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-gray-900">{formatCurrency(currentPlan.price)}</div>
                                <div className="text-sm text-gray-500">/月</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-lg font-medium text-gray-900 mb-4">{currentPlan.name}プラン</h4>
                                <ul className="space-y-2">
                                    {currentPlan.features.map((feature, index) => (
                                        <li key={index} className="flex items-center text-sm text-gray-700">
                                            <span className="text-green-500 mr-2">✓</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h5 className="text-sm font-medium text-gray-900 mb-2">利用制限</h5>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between text-sm">
                                                <span>APIコール</span>
                                                <span>{currentPlan.limits.apiCalls.toLocaleString()}/月</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm">
                                                <span>ユーザー数</span>
                                                <span>{currentPlan.limits.users}人</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm">
                                                <span>ストレージ</span>
                                                <span>{currentPlan.limits.storage}GB</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                        Stripeポータルで管理
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Plan Upgrade Options */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">プランのアップグレード</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                {
                                    name: 'Starter',
                                    price: 2980,
                                    features: ['月間1,000APIコール', '最大10ユーザー', '1GB ストレージ'],
                                },
                                {
                                    name: 'Pro',
                                    price: 9800,
                                    features: ['月間10,000APIコール', '最大100ユーザー', '10GB ストレージ'],
                                    current: true,
                                },
                                {
                                    name: 'Enterprise',
                                    price: 29800,
                                    features: ['無制限APIコール', '無制限ユーザー', '100GB ストレージ'],
                                },
                            ].map((plan) => (
                                <div
                                    key={plan.name}
                                    className={`relative rounded-lg border p-6 ${plan.current ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                        }`}
                                >
                                    {plan.current && (
                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                                                現在のプラン
                                            </span>
                                        </div>
                                    )}
                                    <div className="text-center">
                                        <h4 className="text-lg font-semibold text-gray-900">{plan.name}</h4>
                                        <div className="mt-2 text-2xl font-bold text-gray-900">{formatCurrency(plan.price)}</div>
                                        <div className="text-sm text-gray-500">/月</div>
                                    </div>
                                    <ul className="mt-4 space-y-2">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="text-sm text-gray-700 flex items-center">
                                                <span className="text-green-500 mr-2">✓</span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        className={`mt-6 w-full px-4 py-2 rounded-lg transition-colors ${plan.current
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                        disabled={plan.current}
                                    >
                                        {plan.current ? '現在のプラン' : 'アップグレード'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'usage' && usage && currentPlan && (
                <div className="space-y-6">
                    {/* Usage Overview */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">利用状況概要</h3>
                        <p className="text-gray-600 mb-6">{usage.period}の利用状況</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <div className="text-sm font-medium text-gray-600 mb-2">APIコール</div>
                                <div className="text-2xl font-bold text-gray-900 mb-2">{usage.apiCalls.toLocaleString()}</div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${getUsagePercentage(usage.apiCalls, currentPlan.limits.apiCalls)}%` }}
                                    />
                                </div>
                                <div className="text-xs text-gray-500 mt-1">{currentPlan.limits.apiCalls.toLocaleString()}まで</div>
                            </div>

                            <div>
                                <div className="text-sm font-medium text-gray-600 mb-2">メッセージ数</div>
                                <div className="text-2xl font-bold text-gray-900 mb-2">{usage.messages.toLocaleString()}</div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-green-600 h-2 rounded-full w-full" />
                                </div>
                                <div className="text-xs text-gray-500 mt-1">無制限</div>
                            </div>

                            <div>
                                <div className="text-sm font-medium text-gray-600 mb-2">アクティブユーザー</div>
                                <div className="text-2xl font-bold text-gray-900 mb-2">{usage.mau}</div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-purple-600 h-2 rounded-full"
                                        style={{ width: `${getUsagePercentage(usage.mau, currentPlan.limits.users)}%` }}
                                    />
                                </div>
                                <div className="text-xs text-gray-500 mt-1">{currentPlan.limits.users}人まで</div>
                            </div>

                            <div>
                                <div className="text-sm font-medium text-gray-600 mb-2">ストレージ</div>
                                <div className="text-2xl font-bold text-gray-900 mb-2">{usage.storage}GB</div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-orange-600 h-2 rounded-full"
                                        style={{ width: `${getUsagePercentage(usage.storage, currentPlan.limits.storage)}%` }}
                                    />
                                </div>
                                <div className="text-xs text-gray-500 mt-1">{currentPlan.limits.storage}GBまで</div>
                            </div>
                        </div>
                    </div>

                    {/* Usage Chart Placeholder */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">利用推移</h3>
                        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                            <div className="text-center text-gray-500">
                                <div className="text-4xl mb-2">📊</div>
                                <p>利用推移グラフ</p>
                                <p className="text-sm">（実装予定）</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'invoices' && (
                <div className="space-y-6">
                    {/* Invoices List */}
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">請求書一覧</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            請求書番号
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            日付
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            金額
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ステータス
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            操作
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {invoices.map((invoice) => (
                                        <tr key={invoice.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {invoice.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {invoice.date.toLocaleDateString('ja-JP')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(invoice.amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${invoice.status === 'paid'
                                                            ? 'bg-green-100 text-green-800'
                                                            : invoice.status === 'pending'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}
                                                >
                                                    {invoice.status === 'paid'
                                                        ? '支払済み'
                                                        : invoice.status === 'pending'
                                                            ? '保留中'
                                                            : '失敗'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {invoice.downloadUrl && (
                                                    <a
                                                        href={invoice.downloadUrl}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        download
                                                    >
                                                        ダウンロード
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================================================
// app/(org)/admin/[orgId]/settings/page.tsx
// ============================================================================

const SettingsPage = () => {
    const params = useParams();
    const orgId = (params?.orgId || 'default');
    const [activeTab, setActiveTab] = useState('branding');

    const tabs = [
        { id: 'branding', label: 'ブランディング', icon: '🎨' },
        { id: 'members', label: 'メンバー', icon: '👥' },
        { id: 'widgets', label: 'ウィジェット', icon: '🧩' },
        { id: 'api', label: 'API/Webhooks', icon: '🔑' },
        { id: 'notifications', label: '通知', icon: '🔔' },
        { id: 'security', label: 'セキュリティ', icon: '🔒' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">設定</h1>
                <p className="text-gray-600">組織の設定とカスタマイズを管理</p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-96">{renderTabContent()}</div>
        </div>
    );
};

// Branding Settings Component
const BrandingSettings = ({ orgId }) => {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">組織ブランディング</h3>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">組織名</label>
                            <input
                                type="text"
                                defaultValue="サンプル組織"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">組織ロゴ</label>
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <span className="text-2xl">🏢</span>
                                </div>
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    アップロード
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">プライマリカラー</label>
                            <div className="flex items-center space-x-3">
                                <input
                                    type="color"
                                    defaultValue="#3B82F6"
                                    className="w-12 h-10 border border-gray-300 rounded"
                                />
                                <input
                                    type="text"
                                    defaultValue="#3B82F6"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">セカンダリカラー</label>
                            <div className="flex items-center space-x-3">
                                <input
                                    type="color"
                                    defaultValue="#64748B"
                                    className="w-12 h-10 border border-gray-300 rounded"
                                />
                                <input
                                    type="text"
                                    defaultValue="#64748B"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            保存
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// app/_components/Navigation.tsx
// ============================================================================

const Navigation = () => {
    const pathname = usePathname();
    const [showOrgDropdown, setShowOrgDropdown] = useState(false);
    const { user, authenticated, isAdmin, hasOrgPermission } = useAuth();

    // Mock organization data
    const userOrganizations = [
        { id: 'org-demo', name: 'Demo Organization', role: 'owner' },
        { id: 'org-test', name: 'Test Company', role: 'org_admin' },
    ];

    const currentOrg = userOrganizations[0];

    return (
        <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h1 className="text-xl font-bold text-gray-900">AI Chat</h1>
                        </Link>

                        {/* Breadcrumbs for admin pages */}
                        {pathname?.startsWith('/admin') && currentOrg && (
                            <div className="ml-4 flex items-center space-x-2 text-sm text-gray-500">
                                <span>/</span>
                                <span>{currentOrg.name}</span>
                                {pathname.includes('/dashboard') && (
                                    <>
                                        <span>/</span>
                                        <span>ダッシュボード</span>
                                    </>
                                )}
                                {pathname.includes('/widgets') && (
                                    <>
                                        <span>/</span>
                                        <span>ウィジェット</span>
                                    </>
                                )}
                                {pathname.includes('/users') && (
                                    <>
                                        <span>/</span>
                                        <span>ユーザー</span>
                                    </>
                                )}
                                {pathname.includes('/settings') && (
                                    <>
                                        <span>/</span>
                                        <span>設定</span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Menu items */}
                        {getMenuItems().map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(item.href) || (item.label === '管理者' && pathname?.startsWith('/admin'))
                                        ? item.label === '管理者'
                                            ? 'bg-red-100 text-red-700 font-semibold'
                                            : 'bg-blue-100 text-blue-700'
                                        : item.label === '管理者'
                                            ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                                            : 'text-gray-700 hover:text-blue-600'
                                    }`}
                            >
                                {item.label === '管理者' ? (
                                    <span className="flex items-center space-x-1">
                                        <span>🔧</span>
                                        <span>{item.label}</span>
                                    </span>
                                ) : (
                                    item.label
                                )}
                            </Link>
                        ))}

                        {/* Organization Switcher */}
                        {authenticated && currentOrg && userOrganizations.length > 1 && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowOrgDropdown(!showOrgDropdown)}
                                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-md transition-colors"
                                >
                                    <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded flex items-center justify-center">
                                        <span className="text-white text-xs font-medium">{currentOrg.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <span className="hidden sm:inline">{currentOrg.name}</span>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {showOrgDropdown && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                        <div className="py-1">
                                            {userOrganizations.map((org) => (
                                                <button
                                                    key={org.id}
                                                    onClick={() => setShowOrgDropdown(false)}
                                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${org.id === currentOrg.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                                        }`}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded flex items-center justify-center">
                                                            <span className="text-white text-xs font-medium">{org.name.charAt(0).toUpperCase()}</span>
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{org.name}</div>
                                                            <div className="text-xs text-gray-500">{org.role}</div>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* User Profile */}
                        {authenticated && (
                            <Link
                                href="/profile"
                                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">{getUserInitials(user?.name)}</span>
                                </div>
                                <span className="hidden sm:inline">{user?.name ? user.name.split(' ')[0] : 'プロフィール'}</span>
                            </Link>
                        )}

                        {/* Non-authenticated user links */}
                        {!authenticated && (
                            <div className="flex items-center space-x-2">
                                <Link
                                    href="/login"
                                    className={`px-4 py-2 text-sm font-medium transition-colors ${isActive('/login')
                                            ? 'bg-blue-100 text-blue-700 rounded-md'
                                            : 'text-gray-700 hover:text-blue-600'
                                        }`}
                                >
                                    ログイン
                                </Link>
                                <Link
                                    href="/signup"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                                >
                                    新規登録
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Close dropdown when clicking outside */}
            {showOrgDropdown && (
                <div className="fixed inset-0 z-40" onClick={() => setShowOrgDropdown(false)} />
            )}
        </nav>
    );
}; 