import * as cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { reprocessAllEmbeddings } from '../services/embeddingWorker';

const prisma = new PrismaClient();

// Type definitions for config objects
interface ZendeskConfig {
  subdomain: string;
  accessToken: string;
}

interface IntercomConfig {
  accessToken: string;
}

// 毎日04:00 UTCに実行（日本時間13:00）
const DAILY_REPROCESS_SCHEDULE = '0 4 * * *';

// 特定の組織の再処理
export async function scheduleEmbeddingReprocess(
  organizationId: string
): Promise<void> {
  try {
    console.log(
      `Starting scheduled embedding reprocess for organization: ${organizationId}`
    );

    // 組織が存在するかチェック
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      console.error(`Organization not found: ${organizationId}`);
      return;
    }

    // 外部ソース（url, zendesk, intercom）のドキュメントを再クロール
    const externalDocuments = await prisma.knowledgeBase.findMany({
      where: {
        organizationId,
        type: {
          in: ['url', 'zendesk', 'intercom'],
        },
        status: 'completed',
      },
      include: {
        widget: true,
        organization: true,
      },
    });

    console.log(
      `Found ${externalDocuments.length} external documents to reprocess`
    );

    // 各外部ドキュメントのコンテンツを更新
    for (const doc of externalDocuments) {
      try {
        let newContent = '';

        switch (doc.type) {
          case 'url':
            newContent = await fetchUrlContent(doc.source || '');
            break;
          case 'zendesk':
            newContent = await fetchZendeskContent(
              doc.source || '',
              organizationId
            );
            break;
          case 'intercom':
            newContent = await fetchIntercomContent(
              doc.source || '',
              organizationId
            );
            break;
        }

        if (newContent && newContent !== doc.content) {
          // コンテンツが変更された場合のみ更新
          await prisma.knowledgeBase.update({
            where: { id: doc.id },
            data: {
              content: newContent,
              status: 'pending', // 再処理待ちに設定
            },
          });

          console.log(`Updated content for document: ${doc.name}`);
        } else {
          // 変更がない場合は何もしない
        }
      } catch (error) {
        console.error(`Failed to update document ${doc.id}:`, error);

        // エラーを記録
        await prisma.knowledgeBase.update({
          where: { id: doc.id },
          data: {
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    }

    // 全エンベディングを再処理
    await reprocessAllEmbeddings(organizationId);

    console.log(
      `Completed scheduled embedding reprocess for organization: ${organizationId}`
    );
  } catch (error) {
    console.error(
      `Failed to reprocess embeddings for organization ${organizationId}:`,
      error
    );
  }
}

// 全組織の再処理
async function reprocessAllOrganizations(): Promise<void> {
  try {
    console.log('🔄 Starting daily embedding reprocess for all organizations');

    const organizations = await prisma.organization.findMany({
      select: { id: true, name: true },
    });

    console.log(`Found ${organizations.length} organizations to reprocess`);

    for (const org of organizations) {
      await scheduleEmbeddingReprocess(org.id);
    }

    console.log('✅ Completed daily embedding reprocess for all organizations');
  } catch (error) {
    console.error(
      '❌ Failed to reprocess embeddings for all organizations:',
      error
    );
  }
}

// URLからコンテンツを取得
async function fetchUrlContent(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const content = await response.text();

    // HTMLの場合は簡単なテキスト抽出
    if (content.includes('<html') || content.includes('<HTML')) {
      // 簡単なHTMLタグ除去（実際の実装ではより詳細な処理が必要）
      return content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    return content;
  } catch (error) {
    console.error(`Failed to fetch URL content: ${url}`, error);
    throw error;
  }
}

// Zendeskコンテンツを取得
async function fetchZendeskContent(
  articleId: string,
  organizationId: string
): Promise<string> {
  try {
    // TODO: Zendeskの認証情報を組織から取得
    const zendeskConfig = await getZendeskConfig(organizationId);

    if (!zendeskConfig) {
      throw new Error('Zendesk configuration not found');
    }

    const response = await fetch(
      `https://${zendeskConfig.subdomain}.zendesk.com/api/v2/help_center/articles/${articleId}.json`,
      {
        headers: {
          Authorization: `Bearer ${zendeskConfig.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Zendesk API error: ${response.status}`);
    }

    const data = await response.json();
    return `${data.article.title}\n\n${data.article.body}`;
  } catch (error) {
    console.error(`Failed to fetch Zendesk content: ${articleId}`, error);
    throw error;
  }
}

// Intercomコンテンツを取得
async function fetchIntercomContent(
  articleId: string,
  organizationId: string
): Promise<string> {
  try {
    // TODO: Intercomの認証情報を組織から取得
    const intercomConfig = await getIntercomConfig(organizationId);

    if (!intercomConfig) {
      throw new Error('Intercom configuration not found');
    }

    const response = await fetch(
      `https://api.intercom.io/articles/${articleId}`,
      {
        headers: {
          Authorization: `Bearer ${intercomConfig.accessToken}`,
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Intercom API error: ${response.status}`);
    }

    const data = await response.json();
    return `${data.title}\n\n${data.body}`;
  } catch (error) {
    console.error(`Failed to fetch Intercom content: ${articleId}`, error);
    throw error;
  }
}

// Zendesk設定を取得（実装はF-7で詳細化）
async function getZendeskConfig(
  _organizationId: string
): Promise<ZendeskConfig | null> {
  // TODO: 組織のZendesk認証情報を取得
  return null;
}

// Intercom設定を取得（実装はF-7で詳細化）
async function getIntercomConfig(
  _organizationId: string
): Promise<IntercomConfig | null> {
  // TODO: 組織のIntercom認証情報を取得
  return null;
}

// Cronジョブの開始
export function startEmbeddingCronJobs(): void {
  console.log('🚀 Starting embedding cron jobs...');

  // 毎日04:00 UTC (日本時間13:00) に実行
  cron.schedule(DAILY_REPROCESS_SCHEDULE, reprocessAllOrganizations);

  console.log(
    `✅ Embedding cron job scheduled: ${DAILY_REPROCESS_SCHEDULE} UTC`
  );
}

// Cronジョブの停止
export function stopEmbeddingCronJobs(): void {
  console.log('🛑 Stopping embedding cron jobs...');
  cron.getTasks().forEach((task) => {
    task.stop();
  });
}

// 手動実行用のエンドポイント関数
export async function triggerManualReprocess(
  organizationId?: string
): Promise<void> {
  if (organizationId) {
    await scheduleEmbeddingReprocess(organizationId);
  } else {
    await reprocessAllOrganizations();
  }
}
