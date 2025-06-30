export function RecentUpdates() {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">最近の更新</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
            <span className="text-red-600 mt-1">🚨</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                INC-001: データベース接続エラーの調査を開始
              </p>
              <p className="text-xs text-gray-500">10:30 - システム管理者</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
            <span className="text-green-600 mt-1">✅</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                INC-003: メール配信の問題が解決されました
              </p>
              <p className="text-xs text-gray-500">昨日 18:30 - インフラチーム</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
            <span className="text-blue-600 mt-1">📊</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                INC-002: API パフォーマンス改善作業を開始
              </p>
              <p className="text-xs text-gray-500">08:15 - DevOpsチーム</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
