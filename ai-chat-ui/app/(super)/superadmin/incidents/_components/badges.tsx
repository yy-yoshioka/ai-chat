export function getSeverityBadge(severity: string) {
  switch (severity) {
    case 'critical':
      return (
        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
          🚨 緊急
        </span>
      );
    case 'high':
      return (
        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
          ⚠️ 高
        </span>
      );
    case 'medium':
      return (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
          📊 中
        </span>
      );
    case 'low':
      return (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
          ℹ️ 低
        </span>
      );
    default:
      return (
        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium">
          {severity}
        </span>
      );
  }
}

export function getStatusBadge(status: string) {
  switch (status) {
    case 'open':
      return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">未対応</span>;
    case 'investigating':
      return (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">調査中</span>
      );
    case 'resolved':
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">解決済み</span>
      );
    case 'closed':
      return (
        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">クローズ</span>
      );
    default:
      return (
        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{status}</span>
      );
  }
}
