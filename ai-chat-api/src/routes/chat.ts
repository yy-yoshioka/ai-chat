import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import type { UserPayload } from '../utils/jwt';

const router = Router();

interface ChatRequest {
  question: string;
}

interface AuthRequest extends Request {
  user?: UserPayload;
}

async function callOpenAI(
  question: string,
  faqs: { question: string; answer: string }[]
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not set');
  }
  const messages = [
    {
      role: 'system',
      content: 'You are an assistant answering user questions based on FAQs.',
    },
    ...faqs.map((f) => ({
      role: 'system',
      content: `Q: ${f.question}\nA: ${f.answer}`,
    })),
    { role: 'user', content: question },
  ];
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages,
    }),
  });
  interface OpenAIResponse {
    choices: { message: { content: string } }[];
  }
  const data = (await response.json()) as OpenAIResponse;
  return data.choices?.[0]?.message?.content || '';
}

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { question } = req.body as ChatRequest;
  if (!question) {
    return res.status(400).json({ message: 'Question is required' });
  }
  // fetch related FAQs
  const faqs = await prisma.fAQ.findMany({
    where: {
      OR: [
        { question: { contains: question } },
        { answer: { contains: question } },
      ],
    },
    take: 3,
  });

  let answer = '';
  try {
    answer = await callOpenAI(question, faqs);
  } catch (err) {
    console.error('OpenAI error', err);
    return res.status(500).json({ message: 'Failed to get answer' });
  }

  await prisma.chatLog.create({
    data: {
      question,
      answer,
      userId: req.user?.id,
    },
  });

  res.json({ answer });
});

export default router;
