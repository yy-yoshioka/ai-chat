import Link from 'next/link';
import { Settings, Plus } from 'lucide-react';

interface WidgetsEmptyStateProps {
  orgId: string;
}

export function WidgetsEmptyState({ orgId }: WidgetsEmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <Settings className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">ウィジェットがありません</h3>
      <p className="text-gray-600 mb-6">最初のチャットウィジェットを作成しましょう</p>
      <Link
        href={`/admin/${orgId}/widgets/create`}
        className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>ウィジェットを作成</span>
      </Link>
    </div>
  );
}
