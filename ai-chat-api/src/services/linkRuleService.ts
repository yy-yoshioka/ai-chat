import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// リンクカード情報の型定義
export interface LinkCard {
  id: string;
  title: string;
  url: string;
  description?: string;
  newTab: boolean;
  ruleName: string;
  ruleId: string;
}

// リンクルールマッチング結果
export interface LinkRuleMatch {
  matched: boolean;
  links: LinkCard[];
}

// イベントプロパティの型定義
interface LinkClickEventProperties {
  ruleId?: string;
  clickedAt?: string;
}

// メッセージに対してリンクルールをマッチング
export async function matchLinkRules(
  organizationId: string,
  message: string
): Promise<LinkRuleMatch> {
  try {
    const result: LinkRuleMatch = {
      matched: false,
      links: [],
    };

    // 組織のアクティブなリンクルールを取得
    const linkRules = await prisma.linkRule.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    console.log(
      `Checking ${linkRules.length} link rules for message: "${message}"`
    );

    // 各ルールをチェック
    for (const rule of linkRules) {
      try {
        const regex = new RegExp(rule.triggerRegex, 'i');

        if (regex.test(message)) {
          console.log(`Link rule matched: ${rule.name} (${rule.triggerRegex})`);

          // メタデータを生成（URLからタイトルを取得）
          const linkMetadata = await generateLinkMetadata(rule.targetUrl);

          const linkCard: LinkCard = {
            id: `link-${rule.id}`,
            title: linkMetadata.title || rule.name,
            url: rule.targetUrl,
            description: rule.description || linkMetadata.description,
            newTab: rule.newTab,
            ruleName: rule.name,
            ruleId: rule.id,
          };

          result.links.push(linkCard);
          result.matched = true;
        }
      } catch (error) {
        console.error(`Error processing link rule ${rule.id}:`, error);
        // 正規表現エラーがあっても続行
        continue;
      }
    }

    console.log(
      `Link rule matching completed: ${result.links.length} matches found`
    );
    return result;
  } catch (error) {
    console.error('Failed to match link rules:', error);
    return { matched: false, links: [] };
  }
}

// URLからメタデータを生成
async function generateLinkMetadata(
  url: string
): Promise<{ title?: string; description?: string }> {
  try {
    // 内部リンクの場合のタイトルマッピング
    const internalTitles: Record<
      string,
      { title: string; description: string }
    > = {
      '/pricing': {
        title: '料金プラン',
        description: 'AI Chatの料金プランをご確認いただけます',
      },
      '/docs': {
        title: 'ドキュメント',
        description: 'AI Chatの使い方やAPI仕様をご確認いただけます',
      },
      '/contact': {
        title: 'お問い合わせ',
        description: 'サポートチームまでお気軽にお問い合わせください',
      },
      '/support': {
        title: 'サポート',
        description: 'ヘルプ情報とサポートリソースをご利用いただけます',
      },
    };

    // 内部リンクの場合
    if (url.startsWith('/')) {
      return internalTitles[url] || { title: url, description: undefined };
    }

    // 外部リンクの場合（簡単な実装）
    try {
      const domain = new URL(url).hostname;
      return {
        title: `${domain}`,
        description: `${domain}のページをご確認ください`,
      };
    } catch {
      return { title: url, description: undefined };
    }
  } catch (error) {
    console.error('Failed to generate link metadata:', error);
    return { title: url, description: undefined };
  }
}

// リンククリックを記録
export async function recordLinkClick(
  organizationId: string,
  ruleId: string,
  sessionId?: string,
  userId?: string,
  userAgent?: string,
  referer?: string
): Promise<void> {
  try {
    console.log(`Recording link click: rule=${ruleId}, session=${sessionId}`);

    // リンクルールのクリック数を増加
    await prisma.linkRule.update({
      where: { id: ruleId },
      data: {
        clickCount: { increment: 1 },
        lastClickedAt: new Date(),
      },
    });

    // イベントとして記録（分析用）
    await prisma.event.create({
      data: {
        companyId: organizationId, // TODO: 正しい会社IDにマッピング
        eventType: 'link_clicked',
        eventName: 'knowledge_base_link_clicked',
        properties: {
          ruleId,
          clickedAt: new Date().toISOString(),
        },
        sessionId,
        userId,
        userAgent,
        referrer: referer,
        createdAt: new Date(),
      },
    });

    console.log(`Link click recorded successfully for rule: ${ruleId}`);
  } catch (error) {
    console.error('Failed to record link click:', error);
    // エラーが発生してもサービス継続
  }
}

// リンクルールの統計を取得
export async function getLinkRuleStats(
  organizationId: string,
  days: number = 30
): Promise<
  Array<{
    id: string;
    name: string;
    triggerRegex: string;
    clickCount: number;
    lastClickedAt?: Date;
    ctr?: number; // Click Through Rate (表示回数に対するクリック率)
    recentClicks: number;
  }>
> {
  try {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    // リンクルール基本情報を取得
    const linkRules = await prisma.linkRule.findMany({
      where: { organizationId },
      orderBy: { clickCount: 'desc' },
    });

    // 期間内のクリック数を取得
    const recentClicksData = await prisma.event.groupBy({
      by: ['properties'],
      where: {
        companyId: organizationId,
        eventType: 'link_clicked',
        createdAt: { gte: dateFrom },
      },
      _count: true,
    });

    // 結果をマッピング
    const stats = linkRules.map((rule) => {
      const recentClicks = recentClicksData
        .filter((event) => {
          try {
            const props = event.properties as LinkClickEventProperties;
            return props?.ruleId === rule.id;
          } catch {
            return false;
          }
        })
        .reduce((sum, event) => sum + event._count, 0);

      return {
        id: rule.id,
        name: rule.name,
        triggerRegex: rule.triggerRegex,
        clickCount: rule.clickCount,
        lastClickedAt: rule.lastClickedAt || undefined,
        recentClicks,
        // CTRは表示回数のデータが必要なため、今回は省略
        ctr: undefined,
      };
    });

    return stats;
  } catch (error) {
    console.error('Failed to get link rule stats:', error);
    return [];
  }
}

// メッセージにリンクカードを挿入
export function insertLinkCards(
  message: string,
  linkCards: LinkCard[]
): string {
  if (linkCards.length === 0) {
    return message;
  }

  // リンクカードのHTMLを生成
  const linkCardsHtml = linkCards
    .map(
      (card) => `
<div class="link-card" data-rule-id="${card.ruleId}" data-link-id="${card.id}">
  <div class="link-card-header">
    <h4 class="link-card-title">${escapeHtml(card.title)}</h4>
    <a href="${escapeHtml(card.url)}" 
       target="${card.newTab ? '_blank' : '_self'}" 
       rel="${card.newTab ? 'noopener noreferrer' : ''}"
       class="link-card-url"
       onclick="recordLinkClick('${card.ruleId}')">
      ${card.url.length > 50 ? card.url.substring(0, 50) + '...' : card.url}
    </a>
  </div>
  ${card.description ? `<p class="link-card-description">${escapeHtml(card.description)}</p>` : ''}
  <div class="link-card-footer">
    <small class="link-card-source">推奨リンク: ${escapeHtml(card.ruleName)}</small>
  </div>
</div>
  `
    )
    .join('\n');

  // メッセージの末尾にリンクカードを追加
  return `${message}\n\n${linkCardsHtml}`;
}

// HTMLエスケープ
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// リンクルールのテスト（正規表現が正しく動作するかチェック）
export async function testLinkRule(
  ruleId: string,
  testMessages: string[]
): Promise<Array<{ message: string; matched: boolean; error?: string }>> {
  try {
    const rule = await prisma.linkRule.findUnique({
      where: { id: ruleId },
    });

    if (!rule) {
      throw new Error('Link rule not found');
    }

    const results = testMessages.map((message) => {
      try {
        const regex = new RegExp(rule.triggerRegex, 'i');
        return {
          message,
          matched: regex.test(message),
        };
      } catch (error) {
        return {
          message,
          matched: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    return results;
  } catch (error) {
    console.error('Failed to test link rule:', error);
    throw error;
  }
}

// 人気のリンクルールを取得
export async function getPopularLinkRules(
  organizationId: string,
  limit: number = 10
): Promise<
  Array<{
    id: string;
    name: string;
    url: string;
    clickCount: number;
    description?: string;
  }>
> {
  try {
    const popularRules = await prisma.linkRule.findMany({
      where: {
        organizationId,
        isActive: true,
        clickCount: { gt: 0 },
      },
      orderBy: { clickCount: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        targetUrl: true,
        clickCount: true,
        description: true,
      },
    });

    return popularRules.map((rule) => ({
      id: rule.id,
      name: rule.name,
      url: rule.targetUrl,
      clickCount: rule.clickCount,
      description: rule.description || undefined,
    }));
  } catch (error) {
    console.error('Failed to get popular link rules:', error);
    return [];
  }
}

// 未使用のリンクルールを取得
export async function getUnusedLinkRules(
  organizationId: string,
  days: number = 30
): Promise<
  Array<{
    id: string;
    name: string;
    triggerRegex: string;
    createdAt: Date;
    lastClickedAt?: Date;
  }>
> {
  try {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const unusedRules = await prisma.linkRule.findMany({
      where: {
        organizationId,
        isActive: true,
        OR: [
          { clickCount: 0 },
          { lastClickedAt: { lt: dateThreshold } },
          { lastClickedAt: null },
        ],
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        triggerRegex: true,
        createdAt: true,
        lastClickedAt: true,
      },
    });

    return unusedRules.map((rule) => ({
      id: rule.id,
      name: rule.name,
      triggerRegex: rule.triggerRegex,
      createdAt: rule.createdAt,
      lastClickedAt: rule.lastClickedAt || undefined,
    }));
  } catch (error) {
    console.error('Failed to get unused link rules:', error);
    return [];
  }
}

// リンクルールの効果分析
export async function analyzeLinkRuleEffectiveness(
  organizationId: string
): Promise<{
  totalRules: number;
  activeRules: number;
  totalClicks: number;
  averageClicksPerRule: number;
  topPerformingRules: Array<{ name: string; clickCount: number }>;
  underperformingRules: Array<{ name: string; daysSinceLastClick: number }>;
}> {
  try {
    const rules = await prisma.linkRule.findMany({
      where: { organizationId },
    });

    const activeRules = rules.filter((rule) => rule.isActive);
    const totalClicks = rules.reduce((sum, rule) => sum + rule.clickCount, 0);
    const averageClicksPerRule =
      activeRules.length > 0 ? totalClicks / activeRules.length : 0;

    const topPerformingRules = rules
      .filter((rule) => rule.clickCount > 0)
      .sort((a, b) => b.clickCount - a.clickCount)
      .slice(0, 5)
      .map((rule) => ({
        name: rule.name,
        clickCount: rule.clickCount,
      }));

    const now = new Date();
    const underperformingRules = rules
      .filter(
        (rule) => rule.isActive && (rule.clickCount === 0 || rule.lastClickedAt)
      )
      .map((rule) => ({
        name: rule.name,
        daysSinceLastClick: rule.lastClickedAt
          ? Math.floor(
              (now.getTime() - rule.lastClickedAt.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : Infinity,
      }))
      .filter(
        (rule) =>
          rule.daysSinceLastClick > 7 || rule.daysSinceLastClick === Infinity
      )
      .sort((a, b) => b.daysSinceLastClick - a.daysSinceLastClick)
      .slice(0, 5);

    return {
      totalRules: rules.length,
      activeRules: activeRules.length,
      totalClicks,
      averageClicksPerRule: Math.round(averageClicksPerRule * 100) / 100,
      topPerformingRules,
      underperformingRules,
    };
  } catch (error) {
    console.error('Failed to analyze link rule effectiveness:', error);
    return {
      totalRules: 0,
      activeRules: 0,
      totalClicks: 0,
      averageClicksPerRule: 0,
      topPerformingRules: [],
      underperformingRules: [],
    };
  }
}
