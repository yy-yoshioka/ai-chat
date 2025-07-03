import { Parser } from 'json2csv';

interface CSVExportOptions {
  fields?: string[];
  delimiter?: string;
  includeHeaders?: boolean;
  withBOM?: boolean;
}

export const exportToCSV = (
  data: Record<string, unknown>[],
  options: CSVExportOptions = {}
): string => {
  const {
    fields,
    delimiter = ',',
    includeHeaders = true,
    withBOM = true,
  } = options;

  // If no data, return empty string
  if (!data || data.length === 0) {
    return '';
  }

  // Configure parser options
  const parserOptions: {
    delimiter: string;
    header: boolean;
    fields?: string[];
  } = {
    delimiter,
    header: includeHeaders,
  };

  // If fields are specified, use them
  if (fields && fields.length > 0) {
    parserOptions.fields = fields;
  }

  // Create parser and convert data
  const parser = new Parser(parserOptions);
  let csv = parser.parse(data);

  // Add UTF-8 BOM for Excel compatibility
  if (withBOM) {
    csv = '\ufeff' + csv;
  }

  return csv;
};

// Helper function to format dates for CSV
export const formatDateForCSV = (date: Date | string | null): string => {
  if (!date) return '';

  const d = typeof date === 'string' ? new Date(date) : date;

  // Format as YYYY-MM-DD HH:mm:ss
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// Helper function to sanitize data for CSV
export const sanitizeForCSV = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }

  // Convert boolean to readable string
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  // Convert arrays and objects to JSON string
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  // Convert to string and remove problematic characters
  let str = String(value);

  // Remove line breaks and tabs
  str = str.replace(/[\r\n\t]/g, ' ');

  return str;
};

// Report-specific field mappings with Japanese headers
export const REPORT_FIELD_MAPPINGS = {
  chat_sessions: [
    { label: 'セッションID', value: 'id' },
    { label: 'ウィジェットID', value: 'widgetId' },
    { label: 'ウィジェット名', value: 'widgetName' },
    { label: '会社名', value: 'companyName' },
    { label: 'ユーザーエージェント', value: 'userAgent' },
    { label: '質問', value: 'question' },
    { label: '回答', value: 'answer' },
    { label: '満足度', value: 'satisfaction' },
    { label: '作成日時', value: 'createdAt' },
  ],
  user_analytics: [
    { label: 'ユーザーID', value: 'userId' },
    { label: 'メールアドレス', value: 'email' },
    { label: '名前', value: 'name' },
    { label: '組織名', value: 'organizationName' },
    { label: 'ロール', value: 'roles' },
    { label: 'チャット数', value: 'chatCount' },
    { label: '満足度平均', value: 'avgSatisfaction' },
    { label: '最終アクセス', value: 'lastActive' },
  ],
  satisfaction: [
    { label: '期間', value: 'period' },
    { label: 'ウィジェット名', value: 'widgetName' },
    { label: '総チャット数', value: 'totalChats' },
    { label: '評価済み数', value: 'ratedChats' },
    { label: '満足数', value: 'satisfiedCount' },
    { label: '不満足数', value: 'unsatisfiedCount' },
    { label: '満足率', value: 'satisfactionRate' },
  ],
  unresolved: [
    { label: '質問', value: 'question' },
    { label: '頻度', value: 'frequency' },
    { label: 'ウィジェット名', value: 'widgetName' },
    { label: '最終発生日', value: 'lastOccurred' },
    { label: '解決状況', value: 'status' },
  ],
  usage_summary: [
    { label: '日付', value: 'date' },
    { label: '組織名', value: 'organizationName' },
    { label: 'アクティブユーザー数', value: 'activeUsers' },
    { label: 'チャット数', value: 'chatCount' },
    { label: 'FAQ閲覧数', value: 'faqViews' },
    { label: 'API呼び出し数', value: 'apiCalls' },
    { label: 'ストレージ使用量(MB)', value: 'storageUsed' },
  ],
};
