import { BlogPostData, RelatedPost } from './types';

export const getMockPost = (slug: string): BlogPostData => ({
  slug,
  title: 'AIチャットボットの最新動向',
  description: 'AI技術の進歩により、チャットボットはより自然で有用な対話を実現しています。',
  date: '2024-01-15',
  author: 'AI Chat Team',
  tags: ['AI', 'チャットボット', '技術'],
  featured: true,
  readingTime: '5分',
  content: `
    <h2>AIチャットボットの革命</h2>
    <p>現代のAIチャットボットは、従来のルールベースシステムを大幅に上回る性能を示しています。</p>
    
    <h3>主要な改善点</h3>
    <ul>
      <li>自然言語処理の精度向上</li>
      <li>文脈理解能力の強化</li>
      <li>多言語対応の充実</li>
      <li>学習機能の最適化</li>
    </ul>
    
    <h3>ビジネスへの影響</h3>
    <p>これらの技術進歩により、企業は以下のメリットを享受できます：</p>
    <ol>
      <li>カスタマーサポートの効率化</li>
      <li>24時間対応の実現</li>
      <li>コスト削減</li>
      <li>顧客満足度の向上</li>
    </ol>
    
    <h3>まとめ</h3>
    <p>AIチャットボット技術は急速に発展しており、今後もビジネスに大きな変革をもたらすことでしょう。</p>
  `,
});

export const getMockRelatedPosts = (): RelatedPost[] => [
  {
    slug: 'chatbot-implementation-guide',
    title: 'チャットボット導入ガイド',
    description: '効果的なチャットボット導入のための完全ガイド',
    readingTime: '8分',
  },
  {
    slug: 'ai-trends-2024',
    title: '2024年のAIトレンド',
    description: '今年注目すべきAI技術の動向を解説',
    readingTime: '6分',
  },
];
