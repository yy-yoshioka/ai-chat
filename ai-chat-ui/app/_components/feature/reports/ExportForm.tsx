'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card';
import { Button } from '@/app/_components/ui/button';
import { Checkbox } from '@/app/_components/ui/checkbox';
import { Label } from '@/app/_components/ui/label';
import { Calendar } from '@/app/_components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/_components/ui/popover';
import { CalendarIcon, Download, FileText, Table } from 'lucide-react';
import { format as formatDate } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/app/_hooks/useToast';
import { Skeleton } from '@/app/_components/ui/skeleton';

interface ExportFormProps {
  onExport: (options: ExportOptions) => Promise<void>;
  isExporting?: boolean;
}

export interface ExportOptions {
  format: 'csv' | 'pdf';
  reportTypes: string[];
  startDate?: Date;
  endDate?: Date;
}

const REPORT_TYPES = [
  {
    id: 'chat_sessions',
    label: 'チャットセッション履歴',
    description: 'すべてのチャット会話の詳細記録',
  },
  {
    id: 'user_analytics',
    label: 'ユーザー分析',
    description: 'ユーザー利用状況と満足度統計',
  },
  {
    id: 'satisfaction',
    label: '満足度レポート',
    description: 'ウィジェット別の満足度評価',
  },
  {
    id: 'unresolved',
    label: '未解決質問',
    description: '回答できなかった質問の一覧',
  },
  {
    id: 'usage_summary',
    label: '利用サマリー',
    description: '日別の利用状況サマリー',
  },
];

export const ExportForm = ({ onExport, isExporting = false }: ExportFormProps) => {
  const [format, setFormat] = useState<'csv' | 'pdf'>('csv');
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const { toast } = useToast();

  const handleReportToggle = (reportId: string) => {
    setSelectedReports((prev) =>
      prev.includes(reportId) ? prev.filter((id) => id !== reportId) : [...prev, reportId]
    );
  };

  const handleExport = async () => {
    if (selectedReports.length === 0) {
      toast({
        title: 'エラー',
        description: '少なくとも1つのレポートタイプを選択してください',
        variant: 'destructive',
      });
      return;
    }

    try {
      await onExport({
        format,
        reportTypes: selectedReports,
        startDate,
        endDate,
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const selectedCount = selectedReports.length;
  const estimatedSize = selectedCount * (format === 'pdf' ? 500 : 100); // KB

  return (
    <div className="space-y-6">
      {/* Format Selection */}
      <Card>
        <CardHeader>
          <CardTitle>エクスポート形式</CardTitle>
          <CardDescription>ダウンロードするファイル形式を選択してください</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setFormat('csv')}
              className={cn(
                'flex flex-col items-center p-4 rounded-lg border-2 transition-colors',
                format === 'csv'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <Table className="h-8 w-8 mb-2" />
              <span className="font-medium">CSV</span>
              <span className="text-sm text-gray-500">Excel対応</span>
            </button>
            <button
              onClick={() => setFormat('pdf')}
              className={cn(
                'flex flex-col items-center p-4 rounded-lg border-2 transition-colors',
                format === 'pdf'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <FileText className="h-8 w-8 mb-2" />
              <span className="font-medium">PDF</span>
              <span className="text-sm text-gray-500">印刷対応</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Report Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>レポートタイプ</CardTitle>
          <CardDescription>
            エクスポートするレポートを選択してください（複数選択可）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {REPORT_TYPES.map((report) => (
              <div key={report.id} className="flex items-start space-x-3">
                <Checkbox
                  id={report.id}
                  checked={selectedReports.includes(report.id)}
                  onCheckedChange={() => handleReportToggle(report.id)}
                  disabled={isExporting}
                />
                <div className="space-y-1">
                  <Label
                    htmlFor={report.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {report.label}
                  </Label>
                  <p className="text-sm text-gray-500">{report.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Date Range Selection */}
      <Card>
        <CardHeader>
          <CardTitle>期間指定</CardTitle>
          <CardDescription>データの対象期間を指定してください（任意）</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>開始日</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !startDate && 'text-muted-foreground'
                    )}
                    disabled={isExporting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? formatDate(startDate, 'yyyy/MM/dd') : '選択してください'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>終了日</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !endDate && 'text-muted-foreground'
                    )}
                    disabled={isExporting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? formatDate(endDate, 'yyyy/MM/dd') : '選択してください'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Summary */}
      <Card>
        <CardHeader>
          <CardTitle>エクスポート内容</CardTitle>
        </CardHeader>
        <CardContent>
          {isExporting ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">形式:</span>
                <span className="font-medium">{format.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">レポート数:</span>
                <span className="font-medium">{selectedCount}個</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">期間:</span>
                <span className="font-medium">
                  {startDate && endDate
                    ? `${formatDate(startDate, 'yyyy/MM/dd')} - ${formatDate(endDate, 'yyyy/MM/dd')}`
                    : startDate
                      ? `${formatDate(startDate, 'yyyy/MM/dd')}以降`
                      : endDate
                        ? `${formatDate(endDate, 'yyyy/MM/dd')}まで`
                        : '全期間'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">推定サイズ:</span>
                <span className="font-medium">約{estimatedSize} KB</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Button */}
      <Button
        onClick={handleExport}
        disabled={isExporting || selectedReports.length === 0}
        className="w-full"
        size="lg"
      >
        {isExporting ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            エクスポート中...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            エクスポート実行
          </>
        )}
      </Button>
    </div>
  );
};
