export const features = [
  {
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    color: 'blue',
    title: '業界最速0.3秒レスポンス',
    description: '最新のGPT-4o技術により、業界最速クラスの応答速度を実現。 顧客を待たせません。',
    comparison: '競合他社: 2-5秒',
  },
  {
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    color: 'green',
    title: '97.8% 回答精度',
    description: 'あなたの業界・企業に特化したAIモデルで、 的確な回答を提供します。',
    comparison: '競合他社: 82-90%',
  },
  {
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
    color: 'purple',
    title: 'エンタープライズ級セキュリティ',
    description:
      'SOC2 Type II準拠、GDPR対応、ISO27001認証。 大企業でも安心してご利用いただけます。',
    comparison: '金融・医療業界でも導入実績',
  },
];

export const comparisonData = [
  {
    feature: '月額料金 (スタート)',
    ai: '$199',
    intercom: '$2,000',
    zendesk: '$1,500',
    other: '$1,200',
  },
  {
    feature: '設置時間',
    ai: '5分',
    intercom: '2-4週間',
    zendesk: '1-3週間',
    other: '1-2週間',
  },
  {
    feature: '応答速度',
    ai: '0.3秒',
    intercom: '3-5秒',
    zendesk: '2-4秒',
    other: '4-8秒',
  },
  {
    feature: '多言語対応',
    ai: '100言語',
    intercom: '45言語',
    zendesk: '30言語',
    other: '20言語',
  },
  {
    feature: '24/7サポート',
    ai: '✅',
    intercom: '💰 有料',
    zendesk: '💰 有料',
    other: '❌',
  },
];
