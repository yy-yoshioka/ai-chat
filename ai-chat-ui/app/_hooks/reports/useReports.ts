import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ReportData, DateRange } from '@/app/_schemas/reports';
import { REPORT_CONSTANTS } from '@/app/_config/reports/constants';
import { useToast } from '@/app/_hooks/useToast';

const mockReportData: ReportData = {
  totalUsers: 1250,
  totalChats: 3456,
  avgSatisfaction: 4.2,
  responseTime: 1.8,
  dailyStats: [
    { date: '2024-01-14', chats: 120, satisfaction: 4.1 },
    { date: '2024-01-15', chats: 135, satisfaction: 4.3 },
    { date: '2024-01-16', chats: 98, satisfaction: 4.0 },
    { date: '2024-01-17', chats: 156, satisfaction: 4.4 },
    { date: '2024-01-18', chats: 142, satisfaction: 4.2 },
    { date: '2024-01-19', chats: 189, satisfaction: 4.5 },
    { date: '2024-01-20', chats: 167, satisfaction: 4.3 },
  ],
};

export function useReports(orgId: string) {
  const [dateRange, setDateRange] = useState<DateRange>('7days');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['reports', orgId, dateRange],
    queryFn: async () => {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, REPORT_CONSTANTS.LOADING_DELAY_MS));
      return mockReportData;
    },
  });

  const exportReport = async (format: 'csv' | 'pdf', reportTypes: string[]) => {
    setIsExporting(true);

    try {
      const { posterWithAuth } = await import('@/app/_utils/fetcher');
      const response = await posterWithAuth('/api/bff/reports/export', {
        format,
        reportTypes,
        // Calculate date range based on current selection
        startDate: getStartDateFromRange(dateRange),
        endDate: new Date().toISOString(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Export failed');
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `report-export.${format}`;

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'エクスポート成功',
        description: 'レポートのダウンロードが開始されました',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'エクスポートエラー',
        description:
          error instanceof Error ? error.message : 'レポートのエクスポートに失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCsv = () => {
    exportReport('csv', ['usage_summary']);
  };

  const exportToPdf = () => {
    exportReport('pdf', ['usage_summary']);
  };

  const exportToExcel = () => {
    // Excel is essentially CSV for our purposes
    exportReport('csv', ['usage_summary']);
  };

  return {
    reportData,
    isLoading,
    isExporting,
    dateRange,
    setDateRange,
    exportToCsv,
    exportToPdf,
    exportToExcel,
    exportReport,
  };
}

// Helper function to calculate start date from date range
const getStartDateFromRange = (range: DateRange): string => {
  const now = new Date();
  const start = new Date();

  switch (range) {
    case '7days':
      start.setDate(now.getDate() - 7);
      break;
    case '30days':
      start.setDate(now.getDate() - 30);
      break;
    case '90days':
      start.setDate(now.getDate() - 90);
      break;
    case '1year':
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      start.setDate(now.getDate() - 7);
  }

  return start.toISOString();
};
