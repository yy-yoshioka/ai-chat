import { OpenAI } from 'openai';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ImproveResponseParams {
  feedbackId: string;
  messageId: string;
  feedback: string;
  originalQuery: string;
  originalResponse: string;
  widgetId: string;
}

export async function improveResponse(params: ImproveResponseParams) {
  const {
    feedbackId,
    messageId,
    feedback,
    originalQuery,
    originalResponse,
    widgetId,
  } = params;

  try {
    // 改善提案を生成
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `あなたはカスタマーサポートの改善アドバイザーです。
ユーザーからのフィードバックを基に、より良い回答を提案してください。`,
        },
        {
          role: 'user',
          content: `
ユーザーの質問: ${originalQuery}
現在の回答: ${originalResponse}
ユーザーのフィードバック: ${feedback}

このフィードバックを踏まえて、より良い回答を提案してください。
また、今後同様の質問に対する改善点も教えてください。`,
        },
      ],
      temperature: 0.7,
    });

    const improvement = completion.choices[0].message.content;

    // 改善提案を保存（新しいテーブルが必要な場合）
    // TODO: ImprovementSuggestionテーブルを作成して保存

    // ログに記録
    logger.info('Improvement suggestion generated', {
      feedbackId,
      messageId,
      improvement: improvement?.substring(0, 100) + '...',
    });

    // 類似の質問パターンを検索して、FAQや応答ルールの候補として提案
    const similarMessages = await prisma.chatLog.findMany({
      where: {
        widgetId,
        question: {
          contains: originalQuery.split(' ')[0], // 簡易的な類似検索
        },
      },
      take: 5,
    });

    if (similarMessages.length > 3) {
      // FAQ候補として記録
      logger.info('FAQ candidate detected', {
        pattern: originalQuery,
        frequency: similarMessages.length,
      });
    }
  } catch (error) {
    logger.error('Failed to generate improvement', { error, feedbackId });
    throw error;
  }
}
