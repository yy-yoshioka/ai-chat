'use client';

import React from 'react';
import { useFAQ } from '@/app/_hooks/faq/useFAQ';
import { FAQView } from '@/app/_components/feature/faq/FAQView';

interface AdminFAQProps {
  params: Promise<{ orgId: string }>;
}

export default function AdminFAQ({ params }: AdminFAQProps) {
  const { orgId } = React.use(params);
  const { faqs, isLoading, categories, categoryFilter, setCategoryFilter, deleteFAQ } =
    useFAQ(orgId);

  return (
    <FAQView
      faqs={faqs}
      isLoading={isLoading}
      categories={categories}
      categoryFilter={categoryFilter}
      orgId={orgId}
      onCategoryFilterChange={setCategoryFilter}
      onDeleteFAQ={deleteFAQ}
    />
  );
}
