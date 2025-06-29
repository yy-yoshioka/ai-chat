import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ReportData, DateRange } from '@/_schemas/reports';
import { REPORT_CONSTANTS } from '@/_config/reports/constants';

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

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['reports', orgId, dateRange],
    queryFn: async () => {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, REPORT_CONSTANTS.LOADING_DELAY_MS));
      return mockReportData;
    },
  });

  const exportToCsv = () => {
    console.log('Exporting to CSV...');
    // TODO: Implement CSV export
  };

  const exportToPdf = () => {
    console.log('Exporting to PDF...');
    // TODO: Implement PDF export
  };

  const exportToExcel = () => {
    console.log('Exporting to Excel...');
    // TODO: Implement Excel export
  };

  return {
    reportData,
    isLoading,
    dateRange,
    setDateRange,
    exportToCsv,
    exportToPdf,
    exportToExcel,
  };
}