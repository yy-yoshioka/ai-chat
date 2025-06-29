import React from 'react';
import Link from 'next/link';
import type { FAQ } from '@/_schemas/faq';
import { FAQStatusBadge } from './FAQStatusBadge';

interface FAQItemProps {
  faq: FAQ;
  orgId: string;
  onDelete: (faqId: string) => void;
}

export function FAQItem({ faq, orgId, onDelete }: FAQItemProps) {
  return (
    <div className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              {faq.category}
            </span>
            <FAQStatusBadge isActive={faq.isActive} />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">{faq.question}</h4>
          <p className="text-gray-600 text-sm line-clamp-2">{faq.answer}</p>
          <div className="mt-2 text-xs text-gray-500">
            作成: {new Date(faq.createdAt).toLocaleDateString('ja-JP')} | 更新:{' '}
            {new Date(faq.updatedAt).toLocaleDateString('ja-JP')}
          </div>
        </div>
        <div className="ml-4 flex space-x-2">
          <Link
            href={`/admin/${orgId}/faq/${faq.id}`}
            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
          >
            編集
          </Link>
          <button
            onClick={() => onDelete(faq.id)}
            className="text-red-600 hover:text-red-900 text-sm font-medium"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  );
}