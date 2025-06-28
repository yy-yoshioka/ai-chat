// app/_config/billing/plans.ts
export type PlanInterval = 'month' | 'year';
export interface PlanOption {
  id: string;
  name: string;
  description: string;
  priceId: string; // Stripe Price
  price: number; // 0 は Free
  currency: 'JPY' | 'USD';
  interval: PlanInterval;
  features: string[];
  popular?: boolean;
}

export const PLANS: PlanOption[] = [
  {
    id: 'free',
    name: 'Free',
    description: '個人利用や小規模チーム向け',
    priceId: '',
    price: 0,
    currency: 'JPY',
    interval: 'month',
    features: ['月間100メッセージ', '1ユーザー', '基本的なAI機能', 'コミュニティサポート'],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: '成長中のビジネス向け',
    priceId: 'price_pro_monthly',
    price: 2980,
    currency: 'JPY',
    interval: 'month',
    popular: true,
    features: [
      '月間10,000メッセージ',
      '最大10ユーザー',
      '高度なAI機能',
      '優先サポート',
      'カスタムブランディング',
      '詳細な分析レポート',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: '大企業・エンタープライズ向け',
    priceId: 'price_enterprise_monthly',
    price: 9800,
    currency: 'JPY',
    interval: 'month',
    features: [
      '無制限メッセージ',
      '無制限ユーザー',
      '専用AI・カスタムモデル',
      '24/7専任サポート',
      'SSO・SAML連携',
      'API制限なし',
      'カスタム統合',
    ],
  },
] as const;
