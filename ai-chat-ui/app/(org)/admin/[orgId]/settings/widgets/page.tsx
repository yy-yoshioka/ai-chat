'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Breadcrumb } from '@/app/_components/common/Breadcrumb';
import { PageHeader } from '@/app/_components/common/PageHeader';
import { CompanySelector } from '@/app/_components/feature/widgets/CompanySelector';
import { CreateWidgetForm } from '@/app/_components/feature/widgets/CreateWidgetForm';
import { WidgetsGrid } from '@/app/_components/feature/widgets/WidgetsGrid';
import { WidgetsLoading } from '@/app/_components/feature/widgets/WidgetsLoading';
import { useWidgets } from '@/app/_hooks/widgets/useWidgets';
import { useCompanies } from '@/app/_hooks/widgets/useCompanies';

export default function WidgetsPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || 'default';

  const { companies, selectedCompanyId, setSelectedCompanyId } = useCompanies(orgId);
  const {
    widgets,
    isLoading,
    showCreateForm,
    formData,
    setShowCreateForm,
    fetchWidgets,
    handleCreateWidget,
    handleToggleActive,
    copyEmbedCode,
    copyWidgetId,
    updateFormData,
  } = useWidgets(orgId);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchWidgets(selectedCompanyId);
      updateFormData({ companyId: selectedCompanyId });
    }
  }, [selectedCompanyId, fetchWidgets, updateFormData]);

  const breadcrumbItems = [
    { label: 'ダッシュボード', href: `/admin/${orgId}/dashboard` },
    { label: '設定', href: `/admin/${orgId}/settings` },
    { label: 'ウィジェット管理' },
  ];

  if (isLoading && widgets.length === 0) {
    return <WidgetsLoading />;
  }

  return (
    <div className="p-8">
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader
        title="ウィジェット管理"
        description="チャットウィジェットの作成と管理"
        actions={
          !showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              新規作成
            </button>
          )
        }
      />

      {companies.length > 0 && (
        <CompanySelector
          companies={companies}
          selectedCompanyId={selectedCompanyId}
          onChange={(companyId) => setSelectedCompanyId(companyId)}
        />
      )}

      {showCreateForm && (
        <CreateWidgetForm
          formData={formData}
          onChange={updateFormData}
          onSubmit={handleCreateWidget}
          onCancel={() => {
            setShowCreateForm(false);
            updateFormData({ name: '', logoUrl: '' });
          }}
        />
      )}

      <WidgetsGrid
        widgets={widgets}
        orgId={orgId}
        onToggleActive={handleToggleActive}
        onCopyEmbed={copyEmbedCode}
        onCopyId={copyWidgetId}
        onCreateClick={() => setShowCreateForm(true)}
      />
    </div>
  );
}
