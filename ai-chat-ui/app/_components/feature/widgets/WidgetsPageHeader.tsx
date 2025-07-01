import Link from 'next/link';
import { Plus } from 'lucide-react';

interface WidgetsPageHeaderProps {
  orgId: string;
}

export function WidgetsPageHeader({ orgId }: WidgetsPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ウィジェット管理</h1>
        <p className="text-gray-600">チャットウィジェットの作成・管理</p>
      </div>
      <Link
        href={`/admin/${orgId}/widgets/create`}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>新しいウィジェット</span>
      </Link>
    </div>
  );
}
