import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// RAG設定
const RAG_CONFIG = {
  SIMILARITY_THRESHOLD: 0.82, // スコア閾値
  MAX_RESULTS: 5, // 最大検索結果数
  MAX_CONTEXT_LENGTH: 4000, // コンテキストの最大文字数
};

// 検索結果の型定義
interface SearchResult {
  id: string;
  content: string;
  similarity: number;
  type: 'document' | 'faq';
  title?: string;
  question?: string;
  answer?: string;
}

// RAG応答の型定義
interface RAGResponse {
  answer: string;
  sources: SearchResult[];
  usedFAQ: boolean;
  confidence: number;
}

// ベクトル検索のためのエンベディング生成
async function generateQueryEmbedding(query: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
      encoding_format: 'float',
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Failed to generate query embedding:', error);
    throw error;
  }
}

// ドキュメントのベクトル検索
async function searchDocuments(
  organizationId: string,
  queryEmbedding: number[],
  limit: number = RAG_CONFIG.MAX_RESULTS
): Promise<SearchResult[]> {
  try {
    // PostgreSQLのpgvectorを使用したベクトル検索
    const embeddingVector = `[${queryEmbedding.join(',')}]`;

    const documents = (await prisma.$queryRaw`
      SELECT 
        d.id,
        d.title,
        d.content,
        1 - (d.embedding <=> ${embeddingVector}::vector) as similarity
      FROM documents d
      INNER JOIN knowledge_bases kb ON d.knowledge_base_id = kb.id
      WHERE kb.organization_id = ${organizationId}
        AND d.status = 'completed'
        AND d.embedding IS NOT NULL
      ORDER BY d.embedding <=> ${embeddingVector}::vector
      LIMIT ${limit}
    `) as any[];

    return documents
      .filter((doc) => doc.similarity >= RAG_CONFIG.SIMILARITY_THRESHOLD)
      .map((doc) => ({
        id: doc.id,
        content: doc.content,
        similarity: doc.similarity,
        type: 'document' as const,
        title: doc.title,
      }));
  } catch (error) {
    console.error('Failed to search documents:', error);
    return [];
  }
}

// FAQのベクトル検索
async function searchFAQs(
  organizationId: string,
  queryEmbedding: number[],
  limit: number = RAG_CONFIG.MAX_RESULTS
): Promise<SearchResult[]> {
  try {
    const embeddingVector = `[${queryEmbedding.join(',')}]`;

    const faqs = (await prisma.$queryRaw`
      SELECT 
        f.id,
        f.question,
        f.answer,
        f.weight,
        1 - (f.embedding <=> ${embeddingVector}::vector) as similarity
      FROM faqs f
      WHERE f.organization_id = ${organizationId}
        AND f.is_active = true
        AND f.embedding IS NOT NULL
      ORDER BY f.embedding <=> ${embeddingVector}::vector
      LIMIT ${limit}
    `) as any[];

    return faqs
      .filter((faq) => faq.similarity >= RAG_CONFIG.SIMILARITY_THRESHOLD)
      .map((faq) => ({
        id: faq.id,
        content: `質問: ${faq.question}\n回答: ${faq.answer}`,
        similarity: faq.similarity,
        type: 'faq' as const,
        question: faq.question,
        answer: faq.answer,
      }));
  } catch (error) {
    console.error('Failed to search FAQs:', error);
    return [];
  }
}

// FAQフォールバック検索（キーワードベース）
async function searchFAQsFallback(
  organizationId: string,
  query: string,
  limit: number = 3
): Promise<SearchResult[]> {
  try {
    // 簡単なキーワード検索
    const faqs = await prisma.fAQ.findMany({
      where: {
        organizationId,
        isActive: true,
        OR: [
          { question: { contains: query, mode: 'insensitive' } },
          { answer: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: {
        weight: 'desc',
      },
      take: limit,
    });

    return faqs.map((faq) => ({
      id: faq.id,
      content: `質問: ${faq.question}\n回答: ${faq.answer}`,
      similarity: 0.5, // フォールバックスコア
      type: 'faq' as const,
      question: faq.question,
      answer: faq.answer,
    }));
  } catch (error) {
    console.error('Failed to search FAQs fallback:', error);
    return [];
  }
}

// コンテキスト構築
function buildContext(searchResults: SearchResult[]): string {
  let context = '';
  let currentLength = 0;

  for (const result of searchResults) {
    const resultText =
      result.type === 'faq'
        ? `FAQ: ${result.question}\n回答: ${result.answer}\n\n`
        : `ドキュメント: ${result.title}\n内容: ${result.content}\n\n`;

    if (currentLength + resultText.length > RAG_CONFIG.MAX_CONTEXT_LENGTH) {
      break;
    }

    context += resultText;
    currentLength += resultText.length;
  }

  return context;
}

// GPT-4oでの回答生成
async function generateAnswer(
  query: string,
  context: string,
  organizationName: string
): Promise<{ answer: string; confidence: number }> {
  try {
    const systemPrompt = `あなたは${organizationName}のAIアシスタントです。

以下のガイドラインに従って回答してください：
1. 提供されたコンテキスト情報のみを使用して回答する
2. 日本語で自然で親しみやすい口調で回答する
3. 情報が不足している場合は素直に「わからない」と答える
4. 具体的で実用的な回答を心がける
5. 必要に応じて箇条書きや番号付きリストを使用する

コンテキスト情報:
${context}

ユーザーの質問に対して、上記のコンテキスト情報を基に回答してください。`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const answer =
      response.choices[0]?.message?.content ||
      '申し訳ありませんが、回答を生成できませんでした。';

    // 信頼度スコアを推定（簡単な実装）
    const confidence = context.length > 100 ? 0.8 : 0.5;

    return { answer, confidence };
  } catch (error) {
    console.error('Failed to generate answer:', error);
    throw error;
  }
}

// FAQの使用統計を更新
async function updateFAQUsage(faqIds: string[]): Promise<void> {
  try {
    await prisma.fAQ.updateMany({
      where: {
        id: { in: faqIds },
      },
      data: {
        timesUsed: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Failed to update FAQ usage:', error);
  }
}

// 未回答メッセージを記録
async function recordUnansweredMessage(
  organizationId: string,
  message: string,
  confidence: number
): Promise<void> {
  try {
    // 既存の未回答メッセージを検索
    const existing = await prisma.unansweredMessage.findFirst({
      where: {
        organizationId,
        message: { equals: message, mode: 'insensitive' },
      },
    });

    if (existing) {
      // 既存メッセージのカウントを増加
      await prisma.unansweredMessage.update({
        where: { id: existing.id },
        data: {
          count: { increment: 1 },
          lastAskedAt: new Date(),
          confidence: Math.min(existing.confidence || 0, confidence),
        },
      });
    } else {
      // 新しい未回答メッセージを作成
      await prisma.unansweredMessage.create({
        data: {
          organizationId,
          message,
          confidence,
          count: 1,
          firstAskedAt: new Date(),
          lastAskedAt: new Date(),
        },
      });
    }
  } catch (error) {
    console.error('Failed to record unanswered message:', error);
  }
}

// メインRAG関数
export async function generateRAGResponse(
  organizationId: string,
  query: string
): Promise<RAGResponse> {
  try {
    console.log(`RAG query for organization ${organizationId}: ${query}`);

    // 組織情報を取得
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new Error(`Organization not found: ${organizationId}`);
    }

    // クエリのエンベディングを生成
    const queryEmbedding = await generateQueryEmbedding(query);

    // ベクトル検索を実行
    const [documentResults, faqResults] = await Promise.all([
      searchDocuments(organizationId, queryEmbedding),
      searchFAQs(organizationId, queryEmbedding),
    ]);

    // 結果をスコア順に結合
    let searchResults = [...documentResults, ...faqResults]
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, RAG_CONFIG.MAX_RESULTS);

    let usedFAQ = false;
    let confidence = 0;

    // 高品質な結果が見つからない場合はFAQフォールバックを試行
    if (
      searchResults.length === 0 ||
      searchResults[0].similarity < RAG_CONFIG.SIMILARITY_THRESHOLD
    ) {
      console.log('Using FAQ fallback search');
      const fallbackResults = await searchFAQsFallback(organizationId, query);
      searchResults = fallbackResults;
      usedFAQ = true;
    }

    // 結果が見つからない場合
    if (searchResults.length === 0) {
      await recordUnansweredMessage(organizationId, query, 0.1);

      return {
        answer:
          '申し訳ありませんが、お問い合わせの内容について適切な情報が見つかりませんでした。詳細については、サポートチームまでお気軽にお問い合わせください。',
        sources: [],
        usedFAQ: false,
        confidence: 0.1,
      };
    }

    // コンテキストを構築
    const context = buildContext(searchResults);

    // GPT-4oで回答を生成
    const { answer, confidence: generatedConfidence } = await generateAnswer(
      query,
      context,
      organization.name
    );

    confidence = generatedConfidence;

    // FAQ使用統計を更新
    const faqIds = searchResults
      .filter((result) => result.type === 'faq')
      .map((result) => result.id);

    if (faqIds.length > 0) {
      await updateFAQUsage(faqIds);
      usedFAQ = true;
    }

    // 低信頼度の場合は未回答として記録
    if (confidence < 0.5) {
      await recordUnansweredMessage(organizationId, query, confidence);
    }

    console.log(`RAG response generated with confidence: ${confidence}`);

    return {
      answer,
      sources: searchResults,
      usedFAQ,
      confidence,
    };
  } catch (error) {
    console.error('Failed to generate RAG response:', error);

    // エラー時は未回答として記録
    await recordUnansweredMessage(organizationId, query, 0);

    return {
      answer:
        '申し訳ありませんが、一時的な問題により回答を生成できませんでした。しばらく後にもう一度お試しください。',
      sources: [],
      usedFAQ: false,
      confidence: 0,
    };
  }
}

// RAGシステムの統計情報を取得
export async function getRAGStats(organizationId: string) {
  try {
    const [documentsCount, faqsCount, unansweredCount] = await Promise.all([
      prisma.document.count({
        where: {
          knowledgeBase: { organizationId },
          status: 'completed',
          embedding: { not: null },
        },
      }),
      prisma.fAQ.count({
        where: {
          organizationId,
          isActive: true,
          embedding: { not: null },
        },
      }),
      prisma.unansweredMessage.count({
        where: {
          organizationId,
          isProcessed: false,
        },
      }),
    ]);

    return {
      documentsWithEmbeddings: documentsCount,
      faqsWithEmbeddings: faqsCount,
      unansweredQuestions: unansweredCount,
    };
  } catch (error) {
    console.error('Failed to get RAG stats:', error);
    return {
      documentsWithEmbeddings: 0,
      faqsWithEmbeddings: 0,
      unansweredQuestions: 0,
    };
  }
}
