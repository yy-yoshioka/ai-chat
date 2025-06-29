import React from 'react';

interface ExportSectionProps {
  onExportCsv: () => void;
  onExportPdf: () => void;
  onExportExcel: () => void;
}

export function ExportSection({ onExportCsv, onExportPdf, onExportExcel }: ExportSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">エクスポート</h3>
      <div className="flex space-x-4">
        <button
          onClick={onExportCsv}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          CSV形式でダウンロード
        </button>
        <button
          onClick={onExportPdf}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          PDF形式でダウンロード
        </button>
        <button
          onClick={onExportExcel}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Excelファイルでダウンロード
        </button>
      </div>
    </div>
  );
}