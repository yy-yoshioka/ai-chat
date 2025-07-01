interface KpiHeaderProps {
  lastUpdated: Date;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function KpiHeader({ lastUpdated, onRefresh, isLoading }: KpiHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">課金KPI ダッシュボード</h2>
        <p className="text-sm text-gray-500 mt-1">
          最終更新: {lastUpdated.toLocaleString('ja-JP')}
        </p>
      </div>

      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            更新中...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            更新
          </>
        )}
      </button>
    </div>
  );
}
