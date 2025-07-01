'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/app/_components/common/PageHeader';
import { ExportForm, ExportOptions } from '@/app/_components/feature/reports/ExportForm';
import { useToast } from '@/app/_hooks/useToast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ReportExportPageProps {
  params: {
    orgId: string;
  };
}

export default function ReportExportPage({ params }: ReportExportPageProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleExport = async (options: ExportOptions) => {
    setIsExporting(true);

    try {
      const { posterWithAuth } = await import('@/app/_utils/fetcher');
      const response = await posterWithAuth('/api/bff/reports/export', options);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Export failed');
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `report-export.${options.format}`;

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

      // Redirect back to reports page after a short delay
      setTimeout(() => {
        router.push(`/admin/${params.orgId}/reports`);
      }, 2000);
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

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href={`/admin/${params.orgId}/reports`}
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        レポートに戻る
      </Link>

      <PageHeader
        title="レポートエクスポート"
        description="分析データをCSVまたはPDF形式でダウンロード"
      />

      <ExportForm onExport={handleExport} isExporting={isExporting} />
    </div>
  );
}
