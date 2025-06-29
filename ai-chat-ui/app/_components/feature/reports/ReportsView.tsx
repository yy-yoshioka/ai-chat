import React from 'react';
import type { ReportData, DateRange } from '@/_schemas/reports';
import { ReportSummaryCard } from './ReportSummaryCard';
import { DailyChatsChart } from './DailyChatsChart';
import { SatisfactionChart } from './SatisfactionChart';
import { ExportSection } from './ExportSection';
import { REPORT_CONSTANTS, REPORT_ICONS, REPORT_COLORS } from '@/_config/reports/constants';

interface ReportsViewProps {
  reportData: ReportData | undefined;
  isLoading: boolean;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  onExportCsv: () => void;
  onExportPdf: () => void;
  onExportExcel: () => void;
}

export function ReportsView({
  reportData,
  isLoading,
  dateRange,
  onDateRangeChange,
  onExportCsv,
  onExportPdf,
  onExportExcel,
}: ReportsViewProps) {
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
        <h1 className="text-2xl font-bold text-gray-900">レポート</h1>
        <select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value as DateRange)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {REPORT_CONSTANTS.DATE_RANGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {reportData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <ReportSummaryCard
              title="総ユーザー数"
              value={reportData.totalUsers}
              icon={REPORT_ICONS.totalUsers}
              color={REPORT_COLORS.totalUsers}
            />
            <ReportSummaryCard
              title="総チャット数"
              value={reportData.totalChats}
              icon={REPORT_ICONS.totalChats}
              color={REPORT_COLORS.totalChats}
            />
            <ReportSummaryCard
              title="平均満足度"
              value={reportData.avgSatisfaction}
              icon={REPORT_ICONS.avgSatisfaction}
              color={REPORT_COLORS.avgSatisfaction}
            />
            <ReportSummaryCard
              title="平均応答時間"
              value={`${reportData.responseTime}秒`}
              icon={REPORT_ICONS.responseTime}
              color={REPORT_COLORS.responseTime}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DailyChatsChart dailyStats={reportData.dailyStats} />
            <SatisfactionChart dailyStats={reportData.dailyStats} />
          </div>

          <ExportSection
            onExportCsv={onExportCsv}
            onExportPdf={onExportPdf}
            onExportExcel={onExportExcel}
          />
        </>
      )}
    </div>
  );
}
