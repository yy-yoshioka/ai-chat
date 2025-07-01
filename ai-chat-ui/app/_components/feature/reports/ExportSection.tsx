import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FileSpreadsheet } from 'lucide-react';

interface ExportSectionProps {
  onExportCsv: () => void;
  onExportPdf: () => void;
  onExportExcel: () => void;
}

export function ExportSection({ onExportCsv, onExportPdf, onExportExcel }: ExportSectionProps) {
  const params = useParams();
  const orgId = params?.orgId as string;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">エクスポート</h3>
        <Link
          href={`/admin/${orgId}/reports/export`}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          詳細エクスポート
        </Link>
      </div>
      <div className="flex space-x-4">
        <button
          onClick={onExportCsv}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          CSV形式でダウンロード
        </button>
        <button
          onClick={onExportPdf}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          PDF形式でダウンロード
        </button>
        <button
          onClick={onExportExcel}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Excelファイルでダウンロード
        </button>
      </div>
    </div>
  );
}
