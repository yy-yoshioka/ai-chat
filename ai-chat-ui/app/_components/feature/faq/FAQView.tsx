import React from 'react';
import Link from 'next/link';
import type { FAQ } from '@/_schemas/faq';
import { FAQFilter } from './FAQFilter';
import { FAQList } from './FAQList';

interface FAQViewProps {
  faqs: FAQ[];
  isLoading: boolean;
  categories: string[];
  categoryFilter: string;
  orgId: string;
  onCategoryFilterChange: (value: string) => void;
  onDeleteFAQ: (faqId: string) => void;
}

export function FAQView({
  faqs,
  isLoading,
  categories,
  categoryFilter,
  orgId,
  onCategoryFilterChange,
  onDeleteFAQ,
}: FAQViewProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">FAQ管理</h1>
        <Link
          href={`/admin/${orgId}/faq/create`}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          新しいFAQを作成
        </Link>
      </div>

      <FAQFilter
        categories={categories}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={onCategoryFilterChange}
      />

      <FAQList faqs={faqs} orgId={orgId} onDeleteFAQ={onDeleteFAQ} />
    </div>
  );
}
