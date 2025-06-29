'use client';

import React from 'react';
import { useReports } from '@/_hooks/reports/useReports';
import { ReportsView } from '@/_components/feature/reports/ReportsView';

export default function AdminReportsPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = React.use(params);
  const {
    reportData,
    isLoading,
    dateRange,
    setDateRange,
    exportToCsv,
    exportToPdf,
    exportToExcel,
  } = useReports(orgId);

  return (
    <ReportsView
      reportData={reportData}
      isLoading={isLoading}
      dateRange={dateRange}
      onDateRangeChange={setDateRange}
      onExportCsv={exportToCsv}
      onExportPdf={exportToPdf}
      onExportExcel={exportToExcel}
    />
  );
}
