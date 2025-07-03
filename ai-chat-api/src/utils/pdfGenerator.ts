import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

interface PDFOptions {
  title?: string;
  subject?: string;
  author?: string;
  keywords?: string[];
  fontSize?: number;
  margin?: number;
}

interface TableColumn {
  key: string;
  label: string;
  width?: number;
}

export class PDFGenerator {
  private doc: typeof PDFDocument.prototype;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;
  private fontSize: number;

  constructor(options: PDFOptions = {}) {
    this.doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: options.margin || 50,
        bottom: options.margin || 50,
        left: options.margin || 50,
        right: options.margin || 50,
      },
      info: {
        Title: options.title || 'Report',
        Subject: options.subject || 'Exported Report',
        Author: options.author || 'AI Chat System',
        Keywords: options.keywords?.join(', ') || '',
      },
    });

    this.pageWidth = 595.28; // A4 width in points
    this.pageHeight = 841.89; // A4 height in points
    this.margin = options.margin || 50;
    this.currentY = this.margin;
    this.fontSize = options.fontSize || 10;

    // Register a font that supports Japanese
    // Note: In production, you'd need to provide a Japanese font file
    // For now, we'll use the default font and handle Japanese text as best as possible
  }

  addTitle(title: string): void {
    this.doc.fontSize(20).text(title, this.margin, this.currentY, {
      align: 'center',
      width: this.pageWidth - 2 * this.margin,
    });
    this.currentY += 40;
  }

  addSubtitle(subtitle: string): void {
    this.doc.fontSize(14).text(subtitle, this.margin, this.currentY, {
      align: 'center',
      width: this.pageWidth - 2 * this.margin,
    });
    this.currentY += 30;
  }

  addParagraph(text: string): void {
    this.doc.fontSize(this.fontSize).text(text, this.margin, this.currentY, {
      width: this.pageWidth - 2 * this.margin,
      align: 'justify',
    });
    this.currentY +=
      this.doc.heightOfString(text, {
        width: this.pageWidth - 2 * this.margin,
      }) + 10;
  }

  addTable(columns: TableColumn[], data: Record<string, unknown>[]): void {
    if (!data || data.length === 0) {
      this.addParagraph('No data available');
      return;
    }

    const tableWidth = this.pageWidth - 2 * this.margin;
    const columnCount = columns.length;
    const defaultColumnWidth = tableWidth / columnCount;

    // Calculate column widths
    const columnWidths = columns.map((col) => col.width || defaultColumnWidth);

    // Draw header
    this.doc.fontSize(this.fontSize).fillColor('#000000');
    let currentX = this.margin;

    // Header background
    this.doc
      .rect(this.margin, this.currentY, tableWidth, 20)
      .fillAndStroke('#f0f0f0', '#cccccc');

    // Header text
    this.currentY += 5;
    columns.forEach((col, index) => {
      this.doc
        .fillColor('#000000')
        .text(col.label, currentX + 5, this.currentY, {
          width: columnWidths[index] - 10,
          ellipsis: true,
        });
      currentX += columnWidths[index];
    });
    this.currentY += 20;

    // Draw data rows
    data.forEach((row, rowIndex) => {
      // Check if we need a new page
      if (this.currentY > this.pageHeight - this.margin - 30) {
        this.doc.addPage();
        this.currentY = this.margin;
      }

      currentX = this.margin;
      const rowHeight = 20;

      // Alternate row background
      if (rowIndex % 2 === 0) {
        this.doc
          .rect(this.margin, this.currentY, tableWidth, rowHeight)
          .fill('#f9f9f9');
      }

      // Row border
      this.doc
        .rect(this.margin, this.currentY, tableWidth, rowHeight)
        .stroke('#cccccc');

      // Row data
      this.currentY += 5;
      columns.forEach((col, index) => {
        const value = this.formatValue(row[col.key]);
        this.doc
          .fillColor('#000000')
          .fontSize(this.fontSize - 1)
          .text(value, currentX + 5, this.currentY, {
            width: columnWidths[index] - 10,
            ellipsis: true,
          });
        currentX += columnWidths[index];
      });
      this.currentY += 15;
    });

    this.currentY += 20;
  }

  addPageBreak(): void {
    this.doc.addPage();
    this.currentY = this.margin;
  }

  private formatValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (value instanceof Date) {
      return value.toLocaleString('ja-JP');
    }

    if (typeof value === 'boolean') {
      return value ? 'はい' : 'いいえ';
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }

  async getBuffer(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      this.doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      this.doc.on('end', () => resolve(Buffer.concat(chunks)));
      this.doc.on('error', reject);

      this.doc.end();
    });
  }

  getStream(): Readable {
    return this.doc;
  }
}

// Report-specific PDF layouts
export const generateReportPDF = async (
  reportType: string,
  data: Record<string, unknown>[],
  options: PDFOptions = {}
): Promise<Buffer> => {
  const pdf = new PDFGenerator({
    ...options,
    title: getReportTitle(reportType),
  });

  // Add title
  pdf.addTitle(getReportTitle(reportType));
  pdf.addSubtitle(`生成日: ${new Date().toLocaleString('ja-JP')}`);
  pdf.addParagraph(`レコード数: ${data.length}`);

  // Add table based on report type
  const columns = getReportColumns(reportType);
  if (columns) {
    pdf.addTable(columns, data);
  }

  // Add footer
  pdf.addParagraph('\n\n--- End of Report ---');

  return pdf.getBuffer();
};

const getReportTitle = (reportType: string): string => {
  const titles: Record<string, string> = {
    chat_sessions: 'チャットセッション履歴レポート',
    user_analytics: 'ユーザー分析レポート',
    satisfaction: '満足度レポート',
    unresolved: '未解決質問レポート',
    usage_summary: '利用サマリーレポート',
  };
  return titles[reportType] || 'レポート';
};

const getReportColumns = (reportType: string): TableColumn[] | null => {
  const columnSets: Record<string, TableColumn[]> = {
    chat_sessions: [
      { key: 'id', label: 'ID', width: 80 },
      { key: 'widgetName', label: 'ウィジェット', width: 100 },
      { key: 'question', label: '質問', width: 150 },
      { key: 'satisfaction', label: '満足度', width: 60 },
      { key: 'createdAt', label: '日時', width: 100 },
    ],
    user_analytics: [
      { key: 'email', label: 'メール', width: 120 },
      { key: 'name', label: '名前', width: 100 },
      { key: 'chatCount', label: 'チャット数', width: 70 },
      { key: 'avgSatisfaction', label: '満足度', width: 70 },
      { key: 'lastActive', label: '最終アクセス', width: 100 },
    ],
    satisfaction: [
      { key: 'widgetName', label: 'ウィジェット', width: 120 },
      { key: 'totalChats', label: '総数', width: 60 },
      { key: 'ratedChats', label: '評価数', width: 60 },
      { key: 'satisfactionRate', label: '満足率', width: 70 },
    ],
    unresolved: [
      { key: 'question', label: '質問', width: 200 },
      { key: 'frequency', label: '頻度', width: 60 },
      { key: 'widgetName', label: 'ウィジェット', width: 120 },
      { key: 'status', label: '状況', width: 80 },
    ],
    usage_summary: [
      { key: 'date', label: '日付', width: 80 },
      { key: 'activeUsers', label: 'ユーザー', width: 70 },
      { key: 'chatCount', label: 'チャット', width: 70 },
      { key: 'apiCalls', label: 'API', width: 70 },
      { key: 'storageUsed', label: 'ストレージ', width: 80 },
    ],
  };

  return columnSets[reportType] || null;
};
