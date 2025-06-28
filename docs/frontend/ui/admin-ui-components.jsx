// ============================================================================
// AI Chat 管理者パネル UI コンポーネント集
// ============================================================================

// ============================================================================
// app/_components/OrgAdminGuard.tsx
// ============================================================================

const OrgAdminGuard = ({ children, orgId, requiredRole = 'viewer' }) => {
    const router = useRouter();
    const { loading, hasOrgPermission } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">認証情報を確認しています...</p>
                </div>
            </div>
        );
    }

    if (!hasOrgPermission(orgId, requiredRole)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">アクセス権限がありません</h3>
                    <p className="text-gray-600 mb-6">この組織にアクセスするには適切な権限が必要です。</p>
                    <button onClick={() => router.replace('/')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                        メインページに戻る
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

// ============================================================================
// app/(org)/admin/[orgId]/layout.tsx
// ============================================================================

const AdminLayout = ({ children, params }) => {
    const pathname = usePathname();
    const { user } = useAuth();
    const { orgId } = React.use(params);

    const sidebarItems = [
        { title: 'ダッシュボード', path: `/admin/${orgId}/dashboard`, icon: '📊' },
        { title: 'ウィジェット', path: `/admin/${orgId}/widgets`, icon: '🧩' },
        { title: 'チャット', path: `/admin/${orgId}/chats`, icon: '💬' },
        { title: 'FAQ管理', path: `/admin/${orgId}/faq`, icon: '❓' },
        { title: 'ユーザー管理', path: `/admin/${orgId}/users`, icon: '👥' },
        { title: 'レポート', path: `/admin/${orgId}/reports`, icon: '📈' },
        { title: '請求・利用状況', path: `/admin/${orgId}/billing`, icon: '💳' },
        { title: 'ログ監視', path: `/admin/${orgId}/logs`, icon: '📋' },
        { title: '設定', path: `/admin/${orgId}/settings`, icon: '⚙️' },
    ];

    return (
        <OrgAdminGuard orgId={orgId} requiredRole="viewer">
            <div className="min-h-screen bg-gray-50 flex">
                {/* Sidebar */}
                <div className="w-64 bg-white shadow-lg">
                    <div className="p-6 border-b">
                        <Link href={`/admin/${orgId}/dashboard`} className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">🔧</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">管理者パネル</h1>
                                <p className="text-sm text-gray-500">AI Chat Admin</p>
                            </div>
                        </Link>
                    </div>

                    <nav className="p-4">
                        <ul className="space-y-2">
                            {sidebarItems.map((item) => (
                                <li key={item.path}>
                                    <Link href={item.path} className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${pathname?.startsWith(item.path) ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
                                        <span className="text-lg">{item.icon}</span>
                                        <span>{item.title}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="absolute bottom-0 w-64 p-4 border-t bg-white">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">{user?.name ? user.name.charAt(0).toUpperCase() : 'A'}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{user?.name || '管理者'}</p>
                                <p className="text-xs text-gray-500 truncate">管理者権限</p>
                            </div>
                        </div>
                        <Link href="/" className="mt-3 w-full text-center px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                            メインサイトに戻る
                        </Link>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    {/* Top Header */}
                    <header className="bg-white shadow-sm border-b px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{getPageTitle(pathname || '')}</h2>
                                <p className="text-gray-600 mt-1">{getPageDescription(pathname || '')}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <TrialBadge orgId={orgId} />
                                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 p-6 overflow-auto">{children}</main>
                </div>
            </div>
        </OrgAdminGuard>
    );
};

const TrialBadge = ({ orgId }) => {
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);
    const today = new Date();
    const timeDiff = trialEndDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysLeft <= 0) return null;

    return (
        <Link href={`/admin/${orgId}/billing`} className="flex items-center px-3 py-1.5 bg-orange-100 hover:bg-orange-200 border border-orange-300 rounded-full text-orange-800 text-sm font-medium transition-colors">
            <span className="mr-1">⏰</span>
            Trial <span className="font-bold mx-1">{daysLeft}</span> days left
            <span className="ml-1">▸ Upgrade</span>
        </Link>
    );
};

// ============================================================================
// app/(org)/admin/[orgId]/dashboard/page.tsx
// ============================================================================

const AdminDashboard = ({ params }) => {
    const { orgId } = React.use(params);
    const [widgets, setWidgets] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
                    <p className="text-gray-600">システム全体の状況を監視</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    ウィジェット追加
                </button>
            </div>

            {/* Widget Grid */}
            <div className="grid grid-cols-12 gap-4 auto-rows-min">
                {widgets.map((widget) => (
                    <div key={widget.id} className={`col-span-${widget.position.w} row-span-${widget.position.h}`} style={{ gridColumn: `span ${widget.position.w}`, minHeight: `${widget.position.h * 100}px` }}>
                        {renderWidget(widget)}
                    </div>
                ))}
            </div>

            {/* Add Widget Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">ウィジェットを追加</h3>
                        <div className="space-y-3">
                            {[
                                { type: 'stat', label: '統計ウィジェット', icon: '📊' },
                                { type: 'chart', label: 'チャートウィジェット', icon: '📈' },
                                { type: 'activity', label: 'アクティビティウィジェット', icon: '🔔' },
                                { type: 'health', label: 'ヘルスウィジェット', icon: '💚' },
                            ].map((option) => (
                                <button key={option.type} onClick={() => addWidget(option.type)} className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">{option.icon}</span>
                                        <span className="font-medium">{option.label}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                キャンセル
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Widget Components
const StatWidget = ({ widget, onRemove }) => {
    const { data } = widget;
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        purple: 'bg-purple-100 text-purple-600',
        red: 'bg-red-100 text-red-600',
    };

    return (
        <div className="bg-white rounded-lg shadow p-6 relative group">
            <button onClick={() => onRemove(widget.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all">
                ✕
            </button>
            <div className="flex items-center">
                <div className={`p-2 rounded-lg ${colorClasses[data.color] || colorClasses.blue}`}>
                    <span className="text-2xl">{data.icon}</span>
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{widget.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{typeof data.value === 'number' ? data.value.toLocaleString() : data.value}</p>
                </div>
            </div>
        </div>
    );
};

const HealthWidget = ({ widget, onRemove }) => {
    const { data } = widget;

    return (
        <div className="bg-white rounded-lg shadow p-6 relative group">
            <button onClick={() => onRemove(widget.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all">
                ✕
            </button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{widget.title}</h3>
            <div className="space-y-4">
                {data.items?.map((item, index) => (
                    <div key={index}>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{item.name}</span>
                            <span className={`text-sm font-medium ${item.status === 'good' ? 'text-green-600' : item.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                                {item.status === 'good' ? '良好' : item.status === 'warning' ? '注意' : 'エラー'}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div className={`h-2 rounded-full ${item.status === 'good' ? 'bg-green-500' : item.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${item.percentage}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ActivityWidget = ({ widget, onRemove }) => {
    const { data } = widget;

    return (
        <div className="bg-white rounded-lg shadow p-6 relative group">
            <button onClick={() => onRemove(widget.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all">
                ✕
            </button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{widget.title}</h3>
            <div className="space-y-4">
                {data.activities?.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-900">
                                <span className="font-medium">{activity.action}</span> - {activity.user}
                            </p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ChartWidget = ({ widget, onRemove }) => {
    return (
        <div className="bg-white rounded-lg shadow p-6 relative group">
            <button onClick={() => onRemove(widget.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all">
                ✕
            </button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{widget.title}</h3>
            <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                    <div className="text-3xl mb-2">📈</div>
                    <p>チャートデータ</p>
                    <p className="text-sm">（実装予定）</p>
                </div>
            </div>
        </div>
    );
}; 