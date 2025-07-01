import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt'; // 追加

const prisma = new PrismaClient();

const adminEmail = 'admin@example.com';
const adminPassword = 'password123';

async function main() {
  console.log('🌱 Starting seed...');

  // ✅ 1. Organization を先に作成
  const org = await prisma.organization.upsert({
    where: { slug: 'demo-org' },
    update: {},
    create: {
      name: 'Demo Organization',
      slug: 'demo-org',
    },
  });
  console.log('✅ Created organization:', org.name);

  // ✅ 2. Organization ID を使って Company を作成
  const company = await prisma.company.upsert({
    where: { email: 'demo-company@example.com' },
    update: {},
    create: {
      name: 'Demo Company',
      email: 'demo-company@example.com',
      plan: 'free',
      organizationId: org.id,
    },
  });
  console.log('✅ Created company:', company.name);

  // ✅ 3. Company ID を使って Admin User を作成
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Demo Admin',
      isAdmin: true,
      companyId: company.id,
    },
  });
  console.log('✅ Created admin user:', adminUser.email);

  // Create sample knowledge base
  const kb = await prisma.knowledgeBase.upsert({
    where: { id: 'kb-demo-1' },
    update: {},
    create: {
      id: 'kb-demo-1',
      organizationId: org.id,
      title: 'AI Chat サポートガイド',
      description:
        'AI Chatプラットフォームの基本的な使い方やよくある質問をまとめたガイドです。',
      isActive: true,
    },
  });

  console.log('✅ Created knowledge base:', kb.title);

  // Create sample documents
  const documents = [
    {
      id: 'doc-1',
      title: 'AI Chat 基本ガイド',
      content: `
# AI Chat 基本ガイド

## 概要
AI Chatは、最新のGPT-4技術を使用した革新的なカスタマーサポートソリューションです。

## 主な機能
- リアルタイムチャット対応
- 多言語サポート（100言語以上）
- カスタムブランディング
- 詳細な分析レポート

## セットアップ方法
1. アカウントの作成
2. ウィジェットのカスタマイズ
3. ウェブサイトへのコード埋め込み
4. テストと調整

## よくある問題
- レスポンスが遅い場合の対処法
- カスタマイズが反映されない場合
- 統計データが表示されない場合
      `,
      sourceType: 'manual' as const,
    },
    {
      id: 'doc-2',
      title: '料金プランと請求',
      content: `
# 料金プランと請求について

## プラン種類
### 無料プラン
- 月間メッセージ数: 100通まで
- 基本的なカスタマイズ
- コミュニティサポート

### プロプラン (月額$199)
- 月間メッセージ数: 10,000通まで
- 高度なカスタマイズ
- 優先サポート
- 詳細な分析機能

### エンタープライズプラン
- 無制限メッセージ
- カスタム統合
- 専任サポート
- SLA保証

## 請求について
- 毎月1日に自動請求
- クレジットカード、PayPal対応
- 領収書はメールで自動送信
      `,
      sourceType: 'manual' as const,
    },
  ];

  for (const doc of documents) {
    await prisma.document.upsert({
      where: { id: doc.id },
      update: {},
      create: {
        ...doc,
        knowledgeBaseId: kb.id,
        status: 'completed',
        wordCount: doc.content.split(' ').length,
      },
    });
  }

  console.log('✅ Created sample documents');

  // Create sample FAQs
  const faqs = [
    {
      id: 'faq-1',
      question: 'AI Chatの設置にはどのくらい時間がかかりますか？',
      answer:
        'AI Chatの設置は非常簡単で、通常5分以内で完了します。管理画面でウィジェットをカスタマイズし、生成されたJavaScriptコードを1行追加するだけです。技術的な知識は一切必要ありません。',
      weight: 100,
    },
    {
      id: 'faq-2',
      question: '月額料金はいくらですか？',
      answer:
        'AI Chatは月額$199からご利用いただけます。無料プランもご用意しており、月間100メッセージまで無料でお試しいただけます。エンタープライズプランについては個別にお見積もりいたします。',
      weight: 90,
    },
    {
      id: 'faq-3',
      question: 'どの言語に対応していますか？',
      answer:
        'AI Chatは100以上の言語に対応しています。日本語、英語、中国語、韓国語、スペイン語、フランス語、ドイツ語など、主要な言語はすべてサポートしています。',
      weight: 85,
    },
    {
      id: 'faq-4',
      question: 'セキュリティは大丈夫ですか？',
      answer:
        'AI ChatはSOC2 Type II準拠、GDPR対応で、エンタープライズレベルのセキュリティを確保しています。すべての通信は暗号化され、お客様のデータは安全に保護されます。',
      weight: 80,
    },
    {
      id: 'faq-5',
      question: 'カスタマイズはどこまで可能ですか？',
      answer:
        'ウィジェットの色、位置、フォント、サイズなど、幅広いカスタマイズが可能です。ブランドロゴの追加、カスタムCSSの適用、多言語での挨拶メッセージ設定なども行えます。',
      weight: 75,
    },
  ];

  for (const faq of faqs) {
    await prisma.fAQ.upsert({
      where: { id: faq.id },
      update: {},
      create: {
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        weight: faq.weight,
        organizationId: org.id,
        isActive: true,
        timesUsed: Math.floor(Math.random() * 50), // Random usage count for demo
      },
    });
  }

  console.log('✅ Created sample FAQs');

  // Create sample link rules
  const linkRules = [
    {
      id: 'link-1',
      name: '料金ページリンク',
      triggerRegex: '(料金|価格|プラン|費用)',
      targetUrl: '/pricing',
      newTab: false,
      description: '料金に関する質問があった場合、料金ページへのリンクを表示',
    },
    {
      id: 'link-2',
      name: 'ドキュメンテーション',
      triggerRegex: '(使い方|設定|セットアップ|導入)',
      targetUrl: '/docs',
      newTab: true,
      description: '使い方や設定に関する質問でドキュメントへのリンクを表示',
    },
    {
      id: 'link-3',
      name: 'お問い合わせフォーム',
      triggerRegex: '(連絡|問い合わせ|サポート|ヘルプ)',
      targetUrl: '/contact',
      newTab: false,
      description: 'サポートが必要な場合のお問い合わせフォームリンク',
    },
  ];

  for (const rule of linkRules) {
    await prisma.linkRule.upsert({
      where: { id: rule.id },
      update: {},
      create: {
        ...rule,
        organizationId: org.id,
        isActive: true,
        clickCount: Math.floor(Math.random() * 20), // Random click count for demo
      },
    });
  }

  console.log('✅ Created sample link rules');

  // Create sample unanswered messages
  const unansweredMessages = [
    {
      message: 'APIの制限はありますか？',
      count: 15,
      confidence: 0.3,
    },
    {
      message: 'Slackとの連携は可能ですか？',
      count: 12,
      confidence: 0.4,
    },
    {
      message: 'データのエクスポート機能はありますか？',
      count: 8,
      confidence: 0.2,
    },
    {
      message: 'チャットログの保存期間はどのくらいですか？',
      count: 6,
      confidence: 0.5,
    },
    {
      message: 'モバイルアプリはありますか？',
      count: 4,
      confidence: 0.3,
    },
  ];

  for (const msg of unansweredMessages) {
    await prisma.unansweredMessage.create({
      data: {
        ...msg,
        organizationId: org.id,
        firstAskedAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ), // Random date within last 30 days
        lastAskedAt: new Date(),
        isProcessed: false,
      },
    });
  }

  console.log('✅ Created sample unanswered messages');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
