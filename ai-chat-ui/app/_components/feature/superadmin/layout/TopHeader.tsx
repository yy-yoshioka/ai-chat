interface TopHeaderProps {
  pathname: string;
}

export default function TopHeader({ pathname }: TopHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{getPageTitle(pathname)}</h2>
          <p className="text-gray-600 mt-1">{getPageDescription(pathname)}</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* System Status Indicator */}
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">システム正常</span>
          </div>

          {/* Global Actions */}
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-5 5-5-5h5v-12z"
              />
            </svg>
          </button>

          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

function getPageTitle(pathname: string): string {
  if (pathname.includes('/tenants')) return 'テナント管理';
  if (pathname.includes('/metrics')) return 'システムメトリクス';
  if (pathname.includes('/incidents')) return 'インシデント管理';
  if (pathname.includes('/users')) return 'ユーザー管理';
  if (pathname.includes('/security')) return 'セキュリティ監視';
  if (pathname.includes('/settings')) return 'システム設定';
  if (pathname.includes('/audit-logs')) return '監査ログ';
  if (pathname.includes('/dashboard')) return 'システム概要';
  return 'SuperAdmin コンソール';
}

function getPageDescription(pathname: string): string {
  if (pathname.includes('/tenants')) return '組織・テナントの作成、編集、削除、設定管理';
  if (pathname.includes('/metrics'))
    return 'システムパフォーマンス、リソース使用量、トラフィック監視';
  if (pathname.includes('/incidents')) return 'システム障害の検知、対応、解決管理';
  if (pathname.includes('/users')) return '全ユーザーアカウントの管理と権限設定';
  if (pathname.includes('/security')) return 'セキュリティイベント監視と脅威検知';
  if (pathname.includes('/settings')) return 'グローバル設定とシステム構成管理';
  if (pathname.includes('/audit-logs')) return 'システム全体の操作ログと監査証跡';
  if (pathname.includes('/dashboard')) return 'システム全体の健康状態と主要メトリクス';
  return 'AI Chatシステムの総合管理';
}
