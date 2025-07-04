import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import {
  requireValidWidget,
  WidgetRequest,
} from '../middleware/requireValidWidget';
import { rateLimiter } from '../utils/rateLimiter';
import type { UserPayload } from '../utils/jwt';

const router = Router();

interface ChatRequest {
  message: string;
  widgetKey?: string;
}

interface AuthRequest extends Request {
  user?: UserPayload;
}

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: { message: { content: string } }[];
  error?: {
    message: string;
    type: string;
  };
}

async function callChatGPT(
  userMessage: string,
  conversationHistory: OpenAIMessage[] = [],
  faqs: { question: string; answer: string }[] = []
): Promise<string> {
  // Check if OpenAI API key is properly configured
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    // Return a mock response for testing purposes
    const responses = [
      `こんにちは！「${userMessage}」についてお答えします。これはテスト用のレスポンスです。実際のOpenAI APIを使用するには、環境変数OPENAI_API_KEYに有効なAPIキーを設定してください。`,
      `ご質問ありがとうございます。「${userMessage}」について考えてみました。現在はテストモードで動作しており、実際のAI応答を得るにはOpenAI APIキーの設定が必要です。`,
      `「${userMessage}」についてのご質問ですね。現在はデモモードで動作しています。より詳細で正確な回答を得るには、有効なOpenAI APIキーを設定してください。`,
    ];
    // Return a random mock response
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // システムプロンプトを改善
  const systemPrompt = `あなたは親切で知識豊富なAIアシスタントです。以下の特徴を持って回答してください：

1. 日本語で自然で親しみやすい回答をする
2. 質問に対して具体的で有用な情報を提供する
3. 分からないことは正直に「分からない」と答える
4. 必要に応じて追加の質問や clarification を求める
5. 回答は適度な長さで、読みやすく構造化する

${
  faqs.length > 0
    ? `
以下のFAQ情報も参考にしてください：
${faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')}
`
    : ''
}

ユーザーの質問に対して、親切で正確な回答を日本語で提供してください。`;

  const messages: OpenAIMessage[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
    ...conversationHistory,
    {
      role: 'user',
      content: userMessage,
    },
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as OpenAIResponse;

    if (data.error) {
      console.error('OpenAI error:', data.error);
      throw new Error(`OpenAI error: ${data.error.message}`);
    }

    return (
      data.choices?.[0]?.message?.content ||
      'すみません、回答を生成できませんでした。'
    );
  } catch (error) {
    console.error('Error calling ChatGPT:', error);
    throw error;
  }
}

// Chat endpoint that handles both authenticated users and widget requests
async function handleChatRequest(
  req: AuthRequest & WidgetRequest,
  res: Response,
  isWidgetRequest: boolean = false
): Promise<void> {
  try {
    const { message } = req.body as ChatRequest;

    if (
      !message ||
      typeof message !== 'string' ||
      message.trim().length === 0
    ) {
      res.status(400).json({
        error: 'メッセージが必要です',
        message: 'Message is required',
      });
      return;
    }

    // メッセージの長さ制限
    if (message.length > 2000) {
      res.status(400).json({
        error: 'メッセージが長すぎます（2000文字以内）',
        message: 'Message too long (max 2000 characters)',
      });
      return;
    }

    // Rate limiting for widget requests
    if (isWidgetRequest && req.widget) {
      const rateLimitResult = await rateLimiter.incrementAndCheck({
        widgetId: req.widget.id,
        limit: 50, // 50 requests per period
        period: 3600, // 1 hour
      });

      if (!rateLimitResult.allowed) {
        res.status(429).json({
          error: 'Rate limit exceeded. Please try again later.',
          resetTime: rateLimitResult.resetTime,
        });
        return;
      }
    }

    // 関連するFAQを検索（キーワードマッチング）
    const faqs = await prisma.fAQ.findMany({
      where: {
        OR: [
          { question: { contains: message } },
          { answer: { contains: message } },
        ],
      },
      take: 3,
    });

    // 過去の会話履歴を取得（最新5件）
    let recentChats;
    if (isWidgetRequest && req.widget) {
      // For widget requests, get recent chats for this widget
      recentChats = await prisma.chatLog.findMany({
        where: {
          widgetId: req.widget.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      });
    } else {
      // For authenticated users, get their personal chat history
      recentChats = await prisma.chatLog.findMany({
        where: {
          userId: req.user?.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      });
    }

    // 会話履歴をOpenAI形式に変換
    const conversationHistory: OpenAIMessage[] = recentChats
      .reverse() // 古い順に並び替え
      .flatMap((chat: { question: string; answer: string }) => [
        { role: 'user' as const, content: chat.question },
        { role: 'assistant' as const, content: chat.answer },
      ]);

    // ChatGPT API呼び出し
    const answer = await callChatGPT(message, conversationHistory, faqs);

    // チャットログを保存
    await prisma.chatLog.create({
      data: {
        question: message,
        answer,
        userId: isWidgetRequest ? null : req.user?.id,
        widgetId: isWidgetRequest ? req.widget?.id : null,
      },
    });

    res.json({
      answer,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat error:', error);

    if (error instanceof Error) {
      if (error.message.includes('OPENAI_API_KEY')) {
        res.status(500).json({
          error: 'OpenAI APIキーが設定されていません',
          message: 'OpenAI API key not configured',
        });
        return;
      }

      if (
        error.message.includes('rate limit') ||
        error.message.includes('quota')
      ) {
        res.status(429).json({
          error:
            'APIの利用制限に達しました。しばらく時間をおいてからお試しください。',
          message: 'Rate limit exceeded',
        });
        return;
      }
    }

    res.status(500).json({
      error: '申し訳ございません。一時的なエラーが発生しました。',
      message: 'Internal server error',
    });
  }
}

// Authenticated user chat endpoint
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  await handleChatRequest(req as AuthRequest & WidgetRequest, res, false);
});

// Widget chat endpoint (no authentication required)
router.post(
  '/widget/:widgetKey',
  requireValidWidget,
  async (req: WidgetRequest, res: Response) => {
    await handleChatRequest(req as AuthRequest & WidgetRequest, res, true);
  }
);

// チャット履歴取得エンドポイント
router.get(
  '/history',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const pageNumber = parseInt(page as string);
      const limitNumber = parseInt(limit as string);

      const chats = await prisma.chatLog.findMany({
        where: {
          userId: req.user?.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
      });

      const total = await prisma.chatLog.count({
        where: {
          userId: req.user?.id,
        },
      });

      res.json({
        chats,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          pages: Math.ceil(total / limitNumber),
        },
      });
    } catch (error) {
      console.error('Error fetching chat history:', error);
      res.status(500).json({
        error: 'チャット履歴の取得に失敗しました',
        message: 'Failed to fetch chat history',
      });
    }
  }
);

export default router;
