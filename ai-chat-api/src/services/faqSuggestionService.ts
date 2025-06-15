import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import { queueFAQEmbedding } from './embeddingWorker';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// FAQ提案の型定義
export interface FAQSuggestion {
  id: string;
  originalMessage: string;
  suggestedQuestion: string;
  suggestedAnswer: string;
  confidence: number;
  count: number;
  lastAskedAt: string;
  priority: 'high' | 'medium' | 'low';
}

// 未回答メッセージからFAQを生成
async function generateFAQFromMessage(
  message: string,
  organizationName: string,
  relatedContext?: string
): Promise<{ question: string; answer: string; confidence: number }> {
  try {
    const systemPrompt = `あなたは${organizationName}のカスタマーサポート専門家です。

以下のガイドラインに従って、ユーザーからの質問を適切なFAQに変換してください：

1. ユーザーの意図を明確に理解し、一般的な質問として再構成する
2. 回答は具体的で実用的な内容にする
3. 日本語で自然な表現を使用する
4. 情報が不足している場合は一般的な回答パターンを提供する
5. 質問は他のユーザーにも役立つように汎用化する

${relatedContext ? `関連情報:\n${relatedContext}\n` : ''}

ユーザーからの質問: "${message}"

以下のJSONフォーマットで応答してください：
{
  "question": "整理された質問",
  "answer": "詳細な回答",
  "confidence": 0.0-1.0の信頼度スコア
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'system', content: systemPrompt }],
      temperature: 0.3,
      max_tokens: 800,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    try {
      const parsed = JSON.parse(content);
      return {
        question: parsed.question || message,
        answer:
          parsed.answer ||
          '詳細については、サポートチームまでお問い合わせください。',
        confidence: Math.min(Math.max(parsed.confidence || 0.5, 0), 1),
      };
    } catch (parseError) {
      // JSON解析に失敗した場合のフォールバック
      return {
        question: message,
        answer: '詳細については、サポートチームまでお問い合わせください。',
        confidence: 0.3,
      };
    }
  } catch (error) {
    console.error('Failed to generate FAQ from message:', error);
    throw error;
  }
}

// 類似の質問をクラスタリング
function clusterSimilarMessages(messages: any[]): any[][] {
  const clusters: any[][] = [];
  const used = new Set<string>();

  for (const message of messages) {
    if (used.has(message.id)) continue;

    const cluster = [message];
    used.add(message.id);

    // 簡単な類似度判定（実際にはより高度なアルゴリズムを使用）
    for (const otherMessage of messages) {
      if (used.has(otherMessage.id)) continue;

      const similarity = calculateSimpleSimilarity(
        message.message,
        otherMessage.message
      );
      if (similarity > 0.7) {
        cluster.push(otherMessage);
        used.add(otherMessage.id);
      }
    }

    clusters.push(cluster);
  }

  return clusters;
}

// 簡単な文字列類似度計算
function calculateSimpleSimilarity(str1: string, str2: string): number {
  const words1 = str1.toLowerCase().split(/\s+/);
  const words2 = str2.toLowerCase().split(/\s+/);

  const intersection = words1.filter((word) => words2.includes(word));
  const union = [...new Set([...words1, ...words2])];

  return intersection.length / union.length;
}

// 優先度を計算
function calculatePriority(
  count: number,
  confidence: number,
  recency: number
): 'high' | 'medium' | 'low' {
  const score = count * 0.4 + confidence * 0.3 + recency * 0.3;

  if (score > 0.7) return 'high';
  if (score > 0.4) return 'medium';
  return 'low';
}

// FAQ提案を生成
export async function generateFAQSuggestions(
  organizationId: string,
  limit: number = 50
): Promise<FAQSuggestion[]> {
  try {
    console.log(
      `Generating FAQ suggestions for organization: ${organizationId}`
    );

    // 組織情報を取得
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new Error(`Organization not found: ${organizationId}`);
    }

    // 未処理の未回答メッセージを取得
    const unansweredMessages = await prisma.unansweredMessage.findMany({
      where: {
        organizationId,
        isProcessed: false,
        count: { gte: 2 }, // 2回以上質問されたものを対象
      },
      orderBy: [{ count: 'desc' }, { lastAskedAt: 'desc' }],
      take: limit * 2, // 多めに取得してクラスタリング後に絞り込み
    });

    console.log(`Found ${unansweredMessages.length} unanswered messages`);

    if (unansweredMessages.length === 0) {
      return [];
    }

    // 類似質問をクラスタリング
    const clusters = clusterSimilarMessages(unansweredMessages);

    // 各クラスターから代表的な質問を選択
    const suggestions: FAQSuggestion[] = [];

    for (const cluster of clusters.slice(0, limit)) {
      try {
        // クラスターの中で最も頻度が高いメッセージを代表として選択
        const representative = cluster.reduce((prev, current) =>
          current.count > prev.count ? current : prev
        );

        // クラスター全体の統計
        const totalCount = cluster.reduce((sum, msg) => sum + msg.count, 0);
        const avgConfidence =
          cluster.reduce((sum, msg) => sum + (msg.confidence || 0), 0) /
          cluster.length;

        // 最新の日付
        const latestDate = cluster.reduce((latest, msg) =>
          new Date(msg.lastAskedAt) > new Date(latest.lastAskedAt)
            ? msg
            : latest
        ).lastAskedAt;

        // 関連コンテキストを構築（クラスター内の他のメッセージ）
        const relatedMessages = cluster
          .filter((msg) => msg.id !== representative.id)
          .map((msg) => msg.message)
          .slice(0, 3)
          .join(', ');

        // AIを使ってFAQを生成
        const { question, answer, confidence } = await generateFAQFromMessage(
          representative.message,
          organization.name,
          relatedMessages
        );

        // 優先度を計算（頻度、信頼度、最新性を考慮）
        const recency = Math.max(
          0,
          1 -
            (Date.now() - new Date(latestDate).getTime()) /
              (30 * 24 * 60 * 60 * 1000)
        );
        const priority = calculatePriority(
          Math.min(totalCount / 10, 1),
          avgConfidence,
          recency
        );

        suggestions.push({
          id: representative.id,
          originalMessage: representative.message,
          suggestedQuestion: question,
          suggestedAnswer: answer,
          confidence,
          count: totalCount,
          lastAskedAt: latestDate,
          priority,
        });

        // API制限を考慮して少し待機
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to generate suggestion for cluster:`, error);
        continue;
      }
    }

    // 優先度でソート
    suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return (
        priorityOrder[b.priority] - priorityOrder[a.priority] ||
        b.count - a.count
      );
    });

    console.log(`Generated ${suggestions.length} FAQ suggestions`);
    return suggestions.slice(0, limit);
  } catch (error) {
    console.error('Failed to generate FAQ suggestions:', error);
    throw error;
  }
}

// FAQ提案を承認してFAQに変換
export async function approveFAQSuggestion(
  suggestionId: string,
  organizationId: string,
  overrides?: { question?: string; answer?: string; weight?: number }
): Promise<string> {
  try {
    // 未回答メッセージを取得
    const unansweredMessage = await prisma.unansweredMessage.findFirst({
      where: {
        id: suggestionId,
        organizationId,
      },
    });

    if (!unansweredMessage) {
      throw new Error(`Unanswered message not found: ${suggestionId}`);
    }

    // FAQを生成（オーバーライドがあれば適用）
    let question = overrides?.question;
    let answer = overrides?.answer;

    if (!question || !answer) {
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
      });

      const generated = await generateFAQFromMessage(
        unansweredMessage.message,
        organization?.name || 'AI Chat'
      );

      question = question || generated.question;
      answer = answer || generated.answer;
    }

    // FAQを作成
    const faq = await prisma.fAQ.create({
      data: {
        organizationId,
        question,
        answer,
        weight:
          overrides?.weight || Math.max(100 - unansweredMessage.count, 10),
        isActive: true,
        timesUsed: 0,
      },
    });

    // 未回答メッセージを処理済みにマーク
    await prisma.unansweredMessage.update({
      where: { id: suggestionId },
      data: {
        isProcessed: true,
        suggestedQuestion: question,
        suggestedAnswer: answer,
      },
    });

    // エンベディング生成をキューに追加
    await queueFAQEmbedding(faq.id, organizationId);

    // 類似の未回答メッセージも処理済みにマーク
    const similarMessages = await prisma.unansweredMessage.findMany({
      where: {
        organizationId,
        isProcessed: false,
        message: {
          contains: unansweredMessage.message.split(' ')[0], // 最初の単語で簡単な類似判定
          mode: 'insensitive',
        },
      },
      take: 5,
    });

    if (similarMessages.length > 0) {
      await prisma.unansweredMessage.updateMany({
        where: {
          id: { in: similarMessages.map((msg) => msg.id) },
        },
        data: {
          isProcessed: true,
        },
      });
    }

    console.log(`Approved FAQ suggestion: ${question}`);
    return faq.id;
  } catch (error) {
    console.error('Failed to approve FAQ suggestion:', error);
    throw error;
  }
}

// FAQ提案を却下
export async function rejectFAQSuggestion(
  suggestionId: string,
  organizationId: string,
  reason?: string
): Promise<void> {
  try {
    await prisma.unansweredMessage.update({
      where: { id: suggestionId },
      data: {
        isProcessed: true,
        // 却下理由をメモとして保存（必要に応じてスキーマ拡張）
      },
    });

    console.log(`Rejected FAQ suggestion: ${suggestionId}, reason: ${reason}`);
  } catch (error) {
    console.error('Failed to reject FAQ suggestion:', error);
    throw error;
  }
}

// 週次バッチでFAQ提案を生成
export async function runWeeklyFAQSuggestionBatch(): Promise<void> {
  try {
    console.log('🔄 Running weekly FAQ suggestion batch...');

    // 全組織を取得
    const organizations = await prisma.organization.findMany({
      select: { id: true, name: true },
    });

    for (const org of organizations) {
      try {
        const suggestions = await generateFAQSuggestions(org.id);
        console.log(
          `Generated ${suggestions.length} suggestions for ${org.name}`
        );
      } catch (error) {
        console.error(`Failed to generate suggestions for ${org.name}:`, error);
      }
    }

    console.log('✅ Weekly FAQ suggestion batch completed');
  } catch (error) {
    console.error('❌ Weekly FAQ suggestion batch failed:', error);
  }
}

// FAQ提案の統計を取得
export async function getFAQSuggestionStats(organizationId: string) {
  try {
    const [totalUnanswered, processed, highPriority] = await Promise.all([
      prisma.unansweredMessage.count({
        where: { organizationId, isProcessed: false },
      }),
      prisma.unansweredMessage.count({
        where: { organizationId, isProcessed: true },
      }),
      prisma.unansweredMessage.count({
        where: {
          organizationId,
          isProcessed: false,
          count: { gte: 5 }, // 5回以上質問された高優先度項目
        },
      }),
    ]);

    return {
      totalUnanswered,
      processed,
      highPriority,
      processingRate:
        totalUnanswered > 0 ? processed / (processed + totalUnanswered) : 0,
    };
  } catch (error) {
    console.error('Failed to get FAQ suggestion stats:', error);
    return {
      totalUnanswered: 0,
      processed: 0,
      highPriority: 0,
      processingRate: 0,
    };
  }
}
