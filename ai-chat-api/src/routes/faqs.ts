import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';

const router = Router();

// GET /faqs - list FAQs with optional pagination
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const faqs = await prisma.fAQ.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
  res.json(faqs);
});

// GET /faqs/search?keyword=xxx - search FAQs
router.get('/search', async (req, res) => {
  const keyword = req.query.keyword as string;
  if (!keyword) return res.json([]);
  const faqs = await prisma.fAQ.findMany({
    where: {
      OR: [
        { question: { contains: keyword } },
        { answer: { contains: keyword } },
      ],
    },
  });
  res.json(faqs);
});

// GET /faqs/:id - get specific FAQ
router.get('/:id', async (req, res) => {
  const faq = await prisma.fAQ.findUnique({ where: { id: req.params.id } });
  if (!faq) return res.status(404).json({ message: 'FAQ not found' });
  res.json(faq);
});

// POST /faqs - create FAQ (admin)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { question, answer } = req.body;
  if (!question || !answer) {
    return res
      .status(400)
      .json({ message: 'Question and answer are required' });
  }
  const faq = await prisma.fAQ.create({ data: { question, answer } });
  res.status(201).json(faq);
});

// PUT /faqs/:id - update FAQ (admin)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { question, answer } = req.body;
  const faq = await prisma.fAQ.update({
    where: { id: req.params.id },
    data: { question, answer },
  });
  res.json(faq);
});

// DELETE /faqs/:id - delete FAQ (admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  await prisma.fAQ.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

export default router;
