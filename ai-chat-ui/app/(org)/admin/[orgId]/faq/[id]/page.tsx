'use client';

import Link from 'next/link';
import React from 'react';
import FaqForm from '@/app/_components/feature/faq/edit/FaqForm';
import { useEditFaq } from '@/app/_hooks/admin/faq/useEditFaq';

interface EditFAQProps {
  params: Promise<{ orgId: string; id: string }>;
}

export default function EditFAQ({ params }: EditFAQProps) {
  // Use React.use() to unwrap the params Promise
  const { orgId, id } = React.use(params);
  const { formData, loading, saving, handleSubmit, handleChange } = useEditFaq(orgId, id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">FAQ編集</h1>
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
          saving={saving}
          onSubmit={handleSubmit}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
