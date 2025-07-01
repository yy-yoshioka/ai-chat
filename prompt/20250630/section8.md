# Section-8: Reports Export
`<todo-key>: reports-export`

## 🎯 目的
レポートのエクスポート機能（CSV/PDF）を実装

## 📋 作業内容

### 1. レポートエクスポートページ
```typescript
// ai-chat-ui/app/(org)/admin/[orgId]/reports/export/page.tsx
'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Download, FileText, Table, Calendar } from 'lucide-react';
import { PageHeader } from '@/_components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { useReportExport } from '@/_hooks/reports/useReports';

const EXPORT_TYPES = [
  { id: 'chat_sessions', name: 'チャットセッション', description: '全チャット履歴' },
  { id: 'user_analytics', name: 'ユーザー分析', description: '利用状況統計' },
  { id: 'satisfaction', name: '満足度レポート', description: 'フィードバック分析' },
  { id: 'unresolved', name: '未解決質問', description: '回答できなかった質問' },
  { id: 'usage_summary', name: '利用サマリー', description: '総合利用統計' }
];

export default function ReportExportPage() {
  const params = useParams();
  const orgId = params.orgId as string;
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set(['usage_summary']));
  const [format, setFormat] = useState<'csv' | 'pdf'>('csv');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  });
  const { exportReport, isExporting } = useReportExport();
  const { toast } = useToast();
  
  const toggleReportType = (typeId: string) => {
    const newTypes = new Set(selectedTypes);
    if (newTypes.has(typeId)) {
      newTypes.delete(typeId);
    } else {
      newTypes.add(typeId);
    }
    setSelectedTypes(newTypes);
  };
  
  const handleExport = async () => {
    if (selectedTypes.size === 0) {
      toast({
        title: 'エラー',
        description: 'エクスポートするレポートを選択してください',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const result = await exportReport({
        organizationId: orgId,
        reportTypes: Array.from(selectedTypes),
        format,
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString()
      });
      
      // ダウンロード処理
      const blob = new Blob([result.data], {
        type: format === 'csv' ? 'text/csv' : 'application/pdf'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'エクスポート完了',
        description: 'レポートのダウンロードが開始されました'
      });
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'レポートのエクスポートに失敗しました',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="レポートエクスポート"
        description="分析データをCSVまたはPDF形式でダウンロード"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 space-y-6">
          {/* レポートタイプ選択 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                エクスポートするレポート
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {EXPORT_TYPES.map((type) => (
                  <div
                    key={type.id}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50"
                  >
                    <Checkbox
                      id={type.id}
                      checked={selectedTypes.has(type.id)}
                      onCheckedChange={() => toggleReportType(type.id)}
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={type.id}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {type.name}
                      </label>
                      <p className="text-sm text-gray-500">
                        {type.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* エクスポート設定 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table className="h-5 w-5" />
                エクスポート設定
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  ファイル形式
                </label>
                <Select value={format} onValueChange={(value: 'csv' | 'pdf') => setFormat(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV (表計算ソフト用)</SelectItem>
                    <SelectItem value="pdf">PDF (印刷・共有用)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  期間
                </label>
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          {/* エクスポートサマリー */}
          <Card>
            <CardHeader>
              <CardTitle>エクスポート内容</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">選択されたレポート</p>
                  <p className="text-2xl font-bold">{selectedTypes.size}件</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">形式</p>
                  <p className="text-sm">{format === 'csv' ? 'CSV形式' : 'PDF形式'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">期間</p>
                  <p className="text-sm">
                    {dateRange.start.toLocaleDateString('ja-JP')} 〜{' '}
                    {dateRange.end.toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </div>
              
              <Button
                className="w-full mt-6"
                onClick={handleExport}
                disabled={isExporting || selectedTypes.size === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'エクスポート中...' : 'エクスポート開始'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

### 2. Reports Export BFFルート
```typescript
// ai-chat-ui/app/api/bff/reports/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE_URL } from '@/app/_config';

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get('token');
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    
    const response = await fetch(`${API_BASE_URL}/reports/export`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }
    
    // バイナリデータの場合
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/pdf') || contentType?.includes('text/csv')) {
      const blob = await response.blob();
      return new NextResponse(blob, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': response.headers.get('content-disposition') || ''
        }
      });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Report export error:', error);
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    );
  }
}
```

### 3. Express側のレポートエクスポート実装
```typescript
// ai-chat/src/routes/reports.ts に追加
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';

// レポートエクスポート
router.post(
  '/reports/export',
  authMiddleware,
  organizationAccessMiddleware,
  async (req, res, next) => {
    try {
      const { reportTypes, format, startDate, endDate } = req.body;
      
      // データ収集
      const reportData: any = {};
      
      for (const reportType of reportTypes) {
        switch (reportType) {
          case 'chat_sessions':
            reportData.chatSessions = await getChatSessions(
              req.organizationId!,
              startDate,
              endDate
            );
            break;
          case 'user_analytics':
            reportData.userAnalytics = await getUserAnalytics(
              req.organizationId!,
              startDate,
              endDate
            );
            break;
          case 'satisfaction':
            reportData.satisfaction = await getSatisfactionReport(
              req.organizationId!,
              startDate,
              endDate
            );
            break;
          case 'unresolved':
            reportData.unresolved = await getUnresolvedQuestions(
              req.organizationId!,
              startDate,
              endDate
            );
            break;
          case 'usage_summary':
            reportData.usageSummary = await getUsageSummary(
              req.organizationId!,
              startDate,
              endDate
            );
            break;
        }
      }
      
      // フォーマットに応じて出力
      if (format === 'csv') {
        const csvData = convertToCSV(reportData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="report_${Date.now()}.csv"`);
        res.send(csvData);
      } else if (format === 'pdf') {
        const pdfBuffer = await generatePDF(reportData);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="report_${Date.now()}.pdf"`);
        res.send(pdfBuffer);
      } else {
        res.status(400).json({ error: 'Invalid format' });
      }
    } catch (error) {
      next(error);
    }
  }
);

// CSV変換関数
function convertToCSV(reportData: any): string {
  const csvSections: string[] = [];
  
  // 各セクションをCSVに変換
  if (reportData.usageSummary) {
    const fields = ['metric', 'value'];
    const data = Object.entries(reportData.usageSummary).map(([key, value]) => ({
      metric: key,
      value: value
    }));
    const parser = new Parser({ fields });
    csvSections.push('=== Usage Summary ===\n' + parser.parse(data));
  }
  
  // 他のセクションも同様に処理
  
  return csvSections.join('\n\n');
}

// PDF生成関数
async function generatePDF(reportData: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];
    
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    
    // タイトル
    doc.fontSize(20).text('Analytics Report', { align: 'center' });
    doc.moveDown();
    
    // 各セクションをPDFに追加
    if (reportData.usageSummary) {
      doc.fontSize(16).text('Usage Summary');
      doc.moveDown();
      
      Object.entries(reportData.usageSummary).forEach(([key, value]) => {
        doc.fontSize(12).text(`${key}: ${value}`);
      });
      doc.moveDown();
    }
    
    // 他のセクションも同様に処理
    
    doc.end();
  });
}
```

### 4. レポートエクスポートHook
```typescript
// ai-chat-ui/app/_hooks/reports/useReports.ts に追加
export function useReportExport() {
  const [isExporting, setIsExporting] = useState(false);
  
  const exportReport = async (params: {
    organizationId: string;
    reportTypes: string[];
    format: 'csv' | 'pdf';
    startDate: string;
    endDate: string;
  }) => {
    setIsExporting(true);
    
    try {
      const response = await fetch('/api/bff/reports/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      return { data: blob };
    } finally {
      setIsExporting(false);
    }
  };
  
  return {
    exportReport,
    isExporting
  };
}
```

### 5. レポートメニューへのリンク追加
```typescript
// ai-chat-ui/app/(org)/admin/[orgId]/reports/page.tsx に追加
import { Download } from 'lucide-react';
import Link from 'next/link';

// ページ内に追加
<div className="flex justify-end mb-4">
  <Link href={`/admin/${orgId}/reports/export`}>
    <Button>
      <Download className="h-4 w-4 mr-2" />
      レポートをエクスポート
    </Button>
  </Link>
</div>
```

## ✅ 完了条件
- [ ] レポートエクスポートページが表示される
- [ ] CSV形式でのエクスポートが動作する
- [ ] PDF形式でのエクスポートが動作する
- [ ] 期間指定が機能する
- [ ] 複数レポートタイプの選択が可能

## 🚨 注意事項
- 大量データのメモリ使用量
- PDFの日本語フォント対応
- CSVのエンコーディング（UTF-8 BOM付き）
- ダウンロードのブラウザ互換性