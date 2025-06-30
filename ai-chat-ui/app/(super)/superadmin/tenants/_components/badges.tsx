export function getStatusBadge(status: string, trialEndDate?: string) {
  switch (status) {
    case 'active':
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
          アクティブ
        </span>
      );
    case 'trial':
      return (
        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
          トライアル {trialEndDate && `(${new Date(trialEndDate).toLocaleDateString('ja-JP')}まで)`}
        </span>
      );
    case 'suspended':
      return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">停止中</span>;
    case 'inactive':
      return (
        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
          非アクティブ
        </span>
      );
    default:
      return (
        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{status}</span>
      );
  }
}

export function getPlanBadge(plan: string) {
  const colors = {
    Free: 'bg-gray-100 text-gray-800',
    Pro: 'bg-blue-100 text-blue-800',
    Enterprise: 'bg-purple-100 text-purple-800',
  };

  return (
    <span
      className={`px-2 py-1 text-xs rounded-full ${colors[plan as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}
    >
      {plan}
    </span>
  );
}
