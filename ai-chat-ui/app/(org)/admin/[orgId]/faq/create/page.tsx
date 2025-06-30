'use client';

import Link from 'next/link';
import React from 'react';
import FaqForm from '@/app/_components/feature/faq/edit/FaqForm';
import { useCreateFaq } from '@/app/_hooks/admin/faq/useCreateFaq';

interface CreateFAQProps {
  params: Promise<{ orgId: string }>;
}

export default function CreateFAQ({ params }: CreateFAQProps) {
  // Use React.use() to unwrap the params Promise
  const { orgId } = React.use(params);
  const { formData, loading, handleSubmit, handleChange } = useCreateFaq(orgId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">FAQ作成</h1>
        <Link
          href={`/admin/${orgId}/faq`}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          戻る
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <FaqForm
          formData={formData}
          orgId={orgId}
          saving={loading}
          onSubmit={handleSubmit}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
