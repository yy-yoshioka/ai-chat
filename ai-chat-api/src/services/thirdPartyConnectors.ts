import { PrismaClient } from '@prisma/client';
import { queueDocumentEmbedding } from './embeddingWorker';

const prisma = new PrismaClient();

// 外部コネクタの設定型定義
export interface ZendeskConfig {
  subdomain: string;
  email: string;
  token: string;
  accessToken?: string;
}

export interface IntercomConfig {
  accessToken: string;
  workspaceId: string;
}

export interface ConnectorSyncResult {
  success: boolean;
  imported: number;
  updated: number;
  errors: string[];
}

// ZendeskのSection型定義
interface ZendeskSection {
  id: string;
  name: string;
  category?: {
    id: string;
    name: string;
  };
}

// Zendesk Guide記事の取得
export async function syncZendeskArticles(
  organizationId: string,
  config: ZendeskConfig,
  knowledgeBaseId: string
): Promise<ConnectorSyncResult> {
  const result: ConnectorSyncResult = {
    success: false,
    imported: 0,
    updated: 0,
    errors: [],
  };

  try {
    console.log(`Starting Zendesk sync for organization: ${organizationId}`);

    // Zendesk APIヘッダー設定
    const authHeader = config.accessToken
      ? `Bearer ${config.accessToken}`
      : `Basic ${Buffer.from(`${config.email}/token:${config.token}`).toString('base64')}`;

    // カテゴリ一覧を取得
    const categoriesResponse = await fetch(
      `https://${config.subdomain}.zendesk.com/api/v2/help_center/categories.json`,
      {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!categoriesResponse.ok) {
      throw new Error(`Zendesk API error: ${categoriesResponse.status}`);
    }

    const categoriesData = await categoriesResponse.json();

    // 各カテゴリのセクションと記事を取得
    for (const category of categoriesData.categories) {
      try {
        // セクション一覧を取得
        const sectionsResponse = await fetch(
          `https://${config.subdomain}.zendesk.com/api/v2/help_center/categories/${category.id}/sections.json`,
          {
            headers: {
              Authorization: authHeader,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!sectionsResponse.ok) {
          result.errors.push(
            `Failed to fetch sections for category ${category.id}`
          );
          continue;
        }

        const sectionsData = await sectionsResponse.json();

        // 各セクションの記事を取得
        for (const section of sectionsData.sections) {
          await syncZendeskSection(
            organizationId,
            config,
            knowledgeBaseId,
            section,
            authHeader,
            result
          );
        }
      } catch (error) {
        result.errors.push(
          `Error processing category ${category.id}: ${error}`
        );
      }
    }

    result.success = true;
    console.log(
      `Zendesk sync completed: ${result.imported} imported, ${result.updated} updated`
    );
  } catch (error) {
    console.error('Zendesk sync failed:', error);
    result.errors.push(`Sync failed: ${error}`);
  }

  return result;
}

// Zendeskセクションの記事を同期
async function syncZendeskSection(
  organizationId: string,
  config: ZendeskConfig,
  knowledgeBaseId: string,
  section: ZendeskSection,
  authHeader: string,
  result: ConnectorSyncResult
): Promise<void> {
  try {
    const articlesResponse = await fetch(
      `https://${config.subdomain}.zendesk.com/api/v2/help_center/sections/${section.id}/articles.json`,
      {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!articlesResponse.ok) {
      result.errors.push(`Failed to fetch articles for section ${section.id}`);
      return;
    }

    const articlesData = await articlesResponse.json();

    for (const article of articlesData.articles) {
      try {
        // HTMLタグを除去してプレーンテキストに変換
        const cleanContent = article.body
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .replace(/<[^>]*>/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        const content = `# ${article.title}\n\n${cleanContent}`;

        // 既存の記事をチェック
        const existingDoc = await prisma.knowledgeBase.findFirst({
          where: {
            knowledgeBaseId,
            url: article.html_url,
            sourceType: 'zendesk',
          },
        });

        if (existingDoc) {
          // 更新が必要かチェック
          if (new Date(article.updated_at) > existingDoc.updatedAt) {
            await prisma.knowledgeBase.update({
              where: { id: existingDoc.id },
              data: {
                title: article.title,
                content,
                wordCount: content.length,
                lastCrawledAt: new Date(),
                status: 'pending', // 再エンベディング待ち
              },
            });

            // エンベディング再生成をキュー
            await queueDocumentEmbedding(existingDoc.id, organizationId);
            result.updated++;
          }
        } else {
          // 新規作成
          const newDoc = await prisma.knowledgeBase.create({
            data: {
              knowledgeBaseId,
              sourceType: 'zendesk',
              url: article.html_url,
              title: article.title,
              content,
              wordCount: content.length,
              status: 'pending',
              sourceMetadata: {
                zendeskId: article.id,
                sectionId: section.id,
                categoryName: section.category?.name,
                sectionName: section.name,
                author: article.author_id,
                createdAt: article.created_at,
                updatedAt: article.updated_at,
              },
              lastCrawledAt: new Date(),
            },
          });

          // エンベディング生成をキュー
          await queueDocumentEmbedding(newDoc.id, organizationId);
          result.imported++;
        }
      } catch (error) {
        result.errors.push(`Error processing article ${article.id}: ${error}`);
      }
    }
  } catch (error) {
    result.errors.push(`Error processing section ${section.id}: ${error}`);
  }
}

// Intercom記事の同期
export async function syncIntercomArticles(
  organizationId: string,
  config: IntercomConfig,
  knowledgeBaseId: string
): Promise<ConnectorSyncResult> {
  const result: ConnectorSyncResult = {
    success: false,
    imported: 0,
    updated: 0,
    errors: [],
  };

  try {
    console.log(`Starting Intercom sync for organization: ${organizationId}`);

    // Intercom API記事一覧を取得
    const articlesResponse = await fetch('https://api.intercom.io/articles', {
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        Accept: 'application/json',
        'Intercom-Version': '2.10',
      },
    });

    if (!articlesResponse.ok) {
      throw new Error(`Intercom API error: ${articlesResponse.status}`);
    }

    const articlesData = await articlesResponse.json();

    for (const article of articlesData.data) {
      try {
        // HTMLタグを除去
        const cleanContent = article.body
          .replace(/<[^>]*>/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        const content = `# ${article.title}\n\n${cleanContent}`;

        // 既存の記事をチェック
        const existingDoc = await prisma.knowledgeBase.findFirst({
          where: {
            knowledgeBaseId,
            sourceMetadata: {
              path: ['intercomId'],
              equals: article.id,
            },
          },
        });

        if (existingDoc) {
          // 更新が必要かチェック
          if (new Date(article.updated_at) > existingDoc.updatedAt) {
            await prisma.knowledgeBase.update({
              where: { id: existingDoc.id },
              data: {
                title: article.title,
                content,
                wordCount: content.length,
                lastCrawledAt: new Date(),
                status: 'pending',
              },
            });

            await queueDocumentEmbedding(existingDoc.id, organizationId);
            result.updated++;
          }
        } else {
          // 新規作成
          const newDoc = await prisma.knowledgeBase.create({
            data: {
              knowledgeBaseId,
              sourceType: 'intercom',
              title: article.title,
              content,
              wordCount: content.length,
              status: 'pending',
              sourceMetadata: {
                intercomId: article.id,
                url: article.url,
                state: article.state,
                author: article.author,
                createdAt: article.created_at,
                updatedAt: article.updated_at,
              },
              lastCrawledAt: new Date(),
            },
          });

          await queueDocumentEmbedding(newDoc.id, organizationId);
          result.imported++;
        }
      } catch (error) {
        result.errors.push(
          `Error processing Intercom article ${article.id}: ${error}`
        );
      }
    }

    result.success = true;
    console.log(
      `Intercom sync completed: ${result.imported} imported, ${result.updated} updated`
    );
  } catch (error) {
    console.error('Intercom sync failed:', error);
    result.errors.push(`Sync failed: ${error}`);
  }

  return result;
}

// CSV一括アップロード
export async function importCSVData(
  organizationId: string,
  knowledgeBaseId: string,
  csvData: string,
  filename: string
): Promise<ConnectorSyncResult> {
  const result: ConnectorSyncResult = {
    success: false,
    imported: 0,
    updated: 0,
    errors: [],
  };

  try {
    console.log(`Processing CSV import: ${filename}`);

    // CSVを解析（簡単な実装）
    const lines = csvData.split('\n').filter((line) => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header and one data row');
    }

    const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
    const titleIndex = headers.findIndex(
      (h) =>
        h.toLowerCase().includes('title') ||
        h.toLowerCase().includes('タイトル')
    );
    const contentIndex = headers.findIndex(
      (h) =>
        h.toLowerCase().includes('content') || h.toLowerCase().includes('内容')
    );

    if (titleIndex === -1 || contentIndex === -1) {
      throw new Error('CSV must contain title and content columns');
    }

    // データ行を処理
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i]
          .split(',')
          .map((v) => v.trim().replace(/"/g, ''));
        const title = values[titleIndex];
        const content = values[contentIndex];

        if (!title || !content) {
          result.errors.push(`Row ${i + 1}: Missing title or content`);
          continue;
        }

        // ドキュメントを作成
        const newDoc = await prisma.knowledgeBase.create({
          data: {
            knowledgeBaseId,
            sourceType: 'csv',
            title,
            content,
            wordCount: content.length,
            status: 'pending',
            sourceMetadata: {
              filename,
              rowNumber: i + 1,
              importedAt: new Date().toISOString(),
            },
          },
        });

        await queueDocumentEmbedding(newDoc.id, organizationId);
        result.imported++;
      } catch (error) {
        result.errors.push(`Row ${i + 1}: ${error}`);
      }
    }

    result.success = true;
    console.log(`CSV import completed: ${result.imported} documents created`);
  } catch (error) {
    console.error('CSV import failed:', error);
    result.errors.push(`Import failed: ${error}`);
  }

  return result;
}

// Markdown一括アップロード
export async function importMarkdownFiles(
  organizationId: string,
  knowledgeBaseId: string,
  files: Array<{ name: string; content: string }>
): Promise<ConnectorSyncResult> {
  const result: ConnectorSyncResult = {
    success: false,
    imported: 0,
    updated: 0,
    errors: [],
  };

  try {
    console.log(`Processing ${files.length} Markdown files`);

    for (const file of files) {
      try {
        // ファイル名からタイトルを抽出
        const title = file.name.replace(/\.md$/, '').replace(/[-_]/g, ' ');

        // ドキュメントを作成
        const newDoc = await prisma.knowledgeBase.create({
          data: {
            knowledgeBaseId,
            sourceType: 'markdown',
            title,
            content: file.content,
            wordCount: file.content.length,
            status: 'pending',
            sourceMetadata: {
              filename: file.name,
              importedAt: new Date().toISOString(),
            },
          },
        });

        await queueDocumentEmbedding(newDoc.id, organizationId);
        result.imported++;
      } catch (error) {
        result.errors.push(`File ${file.name}: ${error}`);
      }
    }

    result.success = true;
    console.log(
      `Markdown import completed: ${result.imported} documents created`
    );
  } catch (error) {
    console.error('Markdown import failed:', error);
    result.errors.push(`Import failed: ${error}`);
  }

  return result;
}

// 組織のコネクタ設定を保存
export async function saveConnectorConfig(
  organizationId: string,
  type: 'zendesk' | 'intercom',
  config: ZendeskConfig | IntercomConfig
): Promise<void> {
  try {
    // Import the service dynamically to avoid circular dependency
    const { createApiCredentials } = await import('./apiCredentialsService');

    // Get the first admin user for the organization (for audit logging)
    const adminUser = await prisma.user.findFirst({
      where: {
        organizationId,
        roles: {
          has: 'owner',
        },
      },
    });

    if (!adminUser) {
      throw new Error('No admin user found for organization');
    }

    await createApiCredentials(
      {
        organizationId,
        service: type,
        name: 'Default',
        credentials: config as unknown as CredentialData,
      },
      adminUser.id
    );

    console.log(`Saved ${type} config for organization: ${organizationId}`);
  } catch (error) {
    console.error(`Failed to save ${type} config:`, error);
    throw error;
  }
}

// 組織のコネクタ設定を取得
export async function getConnectorConfig(
  organizationId: string,
  type: 'zendesk' | 'intercom'
): Promise<ZendeskConfig | IntercomConfig | null> {
  try {
    // Import the service dynamically to avoid circular dependency
    const { getApiCredentials } = await import('./apiCredentialsService');

    const credentials = await getApiCredentials(organizationId, type);
    if (!credentials) {
      return null;
    }

    // Validate the structure based on type
    if (type === 'zendesk') {
      if (credentials.subdomain && credentials.email && credentials.token) {
        return credentials as ZendeskConfig;
      }
    } else if (type === 'intercom') {
      if (credentials.accessToken && credentials.workspaceId) {
        return credentials as IntercomConfig;
      }
    }

    return null;
  } catch (error) {
    console.error(`Failed to get ${type} config:`, error);
    return null;
  }
}

// 増分同期（変更のある記事のみ同期）
export async function runIncrementalSync(
  organizationId: string,
  type: 'zendesk' | 'intercom'
): Promise<ConnectorSyncResult> {
  try {
    const config = await getConnectorConfig(organizationId, type);
    if (!config) {
      throw new Error(`No ${type} configuration found`);
    }

    // デフォルトのナレッジベースを取得
    const knowledgeBase = await prisma.knowledgeBase.findFirst({
      where: { organizationId },
    });

    if (!knowledgeBase) {
      throw new Error('No knowledge base found');
    }

    // 最後の同期時刻を取得
    const lastSyncDoc = await prisma.knowledgeBase.findFirst({
      where: {
        knowledgeBase: { organizationId },
        sourceType: type,
      },
      orderBy: { lastCrawledAt: 'desc' },
    });

    const lastSyncTime = lastSyncDoc?.lastCrawledAt || new Date(0);
    console.log(`Running incremental ${type} sync since: ${lastSyncTime}`);

    if (type === 'zendesk') {
      return await syncZendeskArticles(
        organizationId,
        config as ZendeskConfig,
        knowledgeBase.id
      );
    } else {
      return await syncIntercomArticles(
        organizationId,
        config as IntercomConfig,
        knowledgeBase.id
      );
    }
  } catch (error) {
    console.error(`Incremental ${type} sync failed:`, error);
    return {
      success: false,
      imported: 0,
      updated: 0,
      errors: [`Sync failed: ${error}`],
    };
  }
}

// 同期統計を取得
export async function getSyncStats(organizationId: string) {
  try {
    const stats = await prisma.knowledgeBase.groupBy({
      by: ['sourceType'],
      where: {
        knowledgeBase: { organizationId },
      },
      _count: true,
    });

    const result: Record<string, number> = {};
    for (const stat of stats) {
      result[stat.sourceType] = stat._count;
    }

    return result;
  } catch (error) {
    console.error('Failed to get sync stats:', error);
    return {};
  }
}
