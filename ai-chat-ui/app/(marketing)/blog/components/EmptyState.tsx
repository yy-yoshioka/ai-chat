interface EmptyStateProps {
  selectedTag: string;
}

export function EmptyState({ selectedTag }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 text-4xl mb-4">📭</div>
      <p className="text-gray-600 text-lg">
        {selectedTag === 'all' ? '記事がありません' : `${selectedTag} の記事が見つかりませんでした`}
      </p>
    </div>
  );
}
