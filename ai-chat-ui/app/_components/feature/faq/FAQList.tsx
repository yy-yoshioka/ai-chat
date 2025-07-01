import React from 'react';
import type { FAQ } from '@/app/_schemas/faq';
import { FAQItem } from './FAQItem';

interface FAQListProps {
  faqs: FAQ[];
  orgId: string;
  onDeleteFAQ: (faqId: string) => void;
}

export function FAQList({ faqs, orgId, onDeleteFAQ }: FAQListProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">FAQ一覧 ({faqs.length}件)</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {faqs.map((faq) => (
          <FAQItem key={faq.id} faq={faq} orgId={orgId} onDelete={onDeleteFAQ} />
        ))}
      </div>
    </div>
  );
}
