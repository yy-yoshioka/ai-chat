import { useEffect, useState } from 'react';
import FAQItem, { FAQItemProps } from './FAQItem';
import { useFAQs } from '@/app/_hooks/faq/useFAQ';

// Static FAQ data for AI Chat platform
const staticFaqs: FAQItemProps[] = [
  {
    id: '1',
    question: 'AIチャットプラットフォームとは何ですか？',
    answer:
      'AIチャットプラットフォームは、最新の人工知能技術を活用して、自然な会話体験を提供するサービスです。質問に対して即座に回答を提供し、24時間365日利用可能です。',
  },
  {
    id: '2',
    question: 'どのような質問に答えることができますか？',
    answer:
      '一般的な知識、技術的な質問、創作サポート、学習支援、ビジネス相談など、幅広いトピックについて回答できます。ただし、最新の情報や個人的な情報については制限があります。',
  },
  {
    id: '3',
    question: 'AIチャットの利用料金はどのくらいですか？',
    answer:
      '基本プランは無料でご利用いただけます。月間使用回数に制限がございますが、有料プランにアップグレードすることで無制限利用が可能です。詳細は料金ページをご確認ください。',
  },
  {
    id: '4',
    question: 'プライバシーとセキュリティは大丈夫ですか？',
    answer:
      'お客様のプライバシーとデータセキュリティを最優先に考えています。会話内容は暗号化され、必要以上に保存されることはありません。詳細はプライバシーポリシーをご覧ください。',
  },
  {
    id: '5',
    question: 'モバイルデバイスでも利用できますか？',
    answer:
      'はい、スマートフォンやタブレットからも快適にご利用いただけます。レスポンシブデザインにより、どのデバイスからでも最適な表示でお使いいただけます。',
  },
  {
    id: '6',
    question: 'AIの回答が間違っている場合はどうすればよいですか？',
    answer:
      'AIは完璧ではなく、時として不正確な情報を提供する可能性があります。重要な決定には複数の情報源を確認することをお勧めします。フィードバック機能を使って改善にご協力ください。',
  },
  {
    id: '7',
    question: 'チャット履歴は保存されますか？',
    answer:
      'ログインユーザーの場合、チャット履歴は30日間保存されます。必要に応じて手動で削除することも可能です。ゲストユーザーの場合、セッション終了と共に履歴は削除されます。',
  },
  {
    id: '8',
    question: 'APIとして利用することはできますか？',
    answer:
      'はい、開発者向けのAPI提供を予定しています。RESTful APIとWebSocket接続の両方をサポートし、あなたのアプリケーションに簡単に統合できます。詳細は開発者ドキュメントをご確認ください。',
  },
];

export default function FAQList() {
  const { data, isLoading, error } = useFAQs();

  // Use API data if available, otherwise fallback to static FAQs
  const faqs = data?.faqs && data.faqs.length > 0 ? data.faqs : staticFaqs;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Log error but still show static FAQs
  if (error) {
    console.log('Using static FAQ data as fallback');
  }

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div
          key={faq.id}
          className="transform transition-all duration-200 hover:scale-[1.02]"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <FAQItem {...faq} />
        </div>
      ))}
      {faqs.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">FAQは現在準備中です。</p>
        </div>
      )}
    </div>
  );
}
