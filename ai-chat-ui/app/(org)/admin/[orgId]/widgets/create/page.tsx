'use client';

import React from 'react';
import { useCreateWidget } from '@/app/_hooks/widgets/create/useCreateWidget';
import { CreateWidgetView } from '@/app/_components/feature/widgets/create';

export default function CreateWidgetPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = React.use(params);
  const { form, loading, handleSubmit, updateForm, generateEmbedCode } = useCreateWidget(orgId);

  return (
    <CreateWidgetView
      orgId={orgId}
      form={form}
      loading={loading}
      onSubmit={handleSubmit}
      updateForm={updateForm}
      embedCode={generateEmbedCode()}
    />
  );
}
