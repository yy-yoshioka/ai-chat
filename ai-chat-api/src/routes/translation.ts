import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  requireOrganizationAccess,
  OrganizationRequest,
} from '../middleware/organizationAccess';
import OpenAI from 'openai';

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface TranslationRequest {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
  context?: string;
}

interface TranslationResponse {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
}

const SUPPORTED_LANGUAGES = {
  en: 'English',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  ar: 'Arabic',
  hi: 'Hindi',
  th: 'Thai',
  vi: 'Vietnamese',
} as const;

/**
 * Translate text using GPT-4o
 */
router.post(
  '/translate',
  authMiddleware,
  requireOrganizationAccess,
  async (req: OrganizationRequest, res: Response) => {
    try {
      const {
        text,
        targetLanguage,
        sourceLanguage,
        context,
      }: TranslationRequest = req.body;

      if (!text || !targetLanguage) {
        return res
          .status(400)
          .json({ error: 'text and targetLanguage are required' });
      }

      if (
        !SUPPORTED_LANGUAGES[targetLanguage as keyof typeof SUPPORTED_LANGUAGES]
      ) {
        return res.status(400).json({ error: 'Unsupported target language' });
      }

      const targetLangName =
        SUPPORTED_LANGUAGES[targetLanguage as keyof typeof SUPPORTED_LANGUAGES];
      const sourceLangName = sourceLanguage
        ? SUPPORTED_LANGUAGES[
            sourceLanguage as keyof typeof SUPPORTED_LANGUAGES
          ]
        : 'auto-detect';

      const systemPrompt = `You are a professional translator. Your task is to translate text accurately while preserving the original meaning, tone, and context.

Rules:
1. Translate the text to ${targetLangName}
2. Maintain the original formatting (HTML tags, markdown, etc.)
3. Preserve technical terms and proper nouns when appropriate
4. Consider the context if provided
5. Return only the translated text, no explanations
6. If the text is already in the target language, return it unchanged

${context ? `Context: ${context}` : ''}`;

      const userPrompt = sourceLanguage
        ? `Translate this ${sourceLangName} text to ${targetLangName}: "${text}"`
        : `Translate this text to ${targetLangName}: "${text}"`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const translatedText = completion.choices[0]?.message?.content?.trim();

      if (!translatedText) {
        return res.status(500).json({ error: 'Translation failed' });
      }

      // Simple confidence calculation based on response quality
      const confidence = calculateTranslationConfidence(
        text,
        translatedText,
        targetLanguage
      );

      const response: TranslationResponse = {
        translatedText,
        sourceLanguage: sourceLanguage || 'auto',
        targetLanguage,
        confidence,
      };

      res.json(response);
    } catch (error) {
      console.error('Translation error:', error);
      res.status(500).json({ error: 'Translation service unavailable' });
    }
  }
);

/**
 * Batch translate multiple texts
 */
router.post(
  '/translate/batch',
  authMiddleware,
  requireOrganizationAccess,
  async (req: OrganizationRequest, res: Response) => {
    try {
      const { texts, targetLanguage, sourceLanguage, context } = req.body;

      if (!texts || !Array.isArray(texts) || texts.length === 0) {
        return res.status(400).json({ error: 'texts array is required' });
      }

      if (texts.length > 50) {
        return res.status(400).json({ error: 'Maximum 50 texts per batch' });
      }

      if (
        !targetLanguage ||
        !SUPPORTED_LANGUAGES[targetLanguage as keyof typeof SUPPORTED_LANGUAGES]
      ) {
        return res
          .status(400)
          .json({ error: 'Valid targetLanguage is required' });
      }

      const targetLangName =
        SUPPORTED_LANGUAGES[targetLanguage as keyof typeof SUPPORTED_LANGUAGES];
      const sourceLangName = sourceLanguage
        ? SUPPORTED_LANGUAGES[
            sourceLanguage as keyof typeof SUPPORTED_LANGUAGES
          ]
        : 'auto-detect';

      const systemPrompt = `You are a professional translator. Translate the following texts to ${targetLangName}. 

Rules:
1. Return translations in the same order as input
2. Maintain original formatting
3. Preserve technical terms and proper nouns
4. Each translation should be on a separate line
5. If a text is already in the target language, return it unchanged

${context ? `Context: ${context}` : ''}`;

      const textsToTranslate = texts
        .map((text: string, index: number) => `${index + 1}. ${text}`)
        .join('\n');

      const userPrompt = sourceLanguage
        ? `Translate these ${sourceLangName} texts to ${targetLangName}:\n\n${textsToTranslate}`
        : `Translate these texts to ${targetLangName}:\n\n${textsToTranslate}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      });

      const translatedContent = completion.choices[0]?.message?.content?.trim();

      if (!translatedContent) {
        return res.status(500).json({ error: 'Batch translation failed' });
      }

      // Parse the numbered translations
      const translatedTexts = translatedContent
        .split('\n')
        .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
        .filter((line: string) => line.length > 0);

      // Ensure we have the same number of translations as inputs
      if (translatedTexts.length !== texts.length) {
        console.warn('Translation count mismatch:', {
          input: texts.length,
          output: translatedTexts.length,
        });
        // Pad with original texts if needed
        while (translatedTexts.length < texts.length) {
          translatedTexts.push(texts[translatedTexts.length]);
        }
      }

      const results = texts.map((originalText: string, index: number) => ({
        originalText,
        translatedText: translatedTexts[index] || originalText,
        sourceLanguage: sourceLanguage || 'auto',
        targetLanguage,
        confidence: calculateTranslationConfidence(
          originalText,
          translatedTexts[index] || originalText,
          targetLanguage
        ),
      }));

      res.json({
        results,
        totalCount: texts.length,
        successCount: translatedTexts.length,
      });
    } catch (error) {
      console.error('Batch translation error:', error);
      res.status(500).json({ error: 'Batch translation service unavailable' });
    }
  }
);

/**
 * Get supported languages
 */
router.get('/languages', (req: Request, res: Response) => {
  res.json({
    languages: Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => ({
      code,
      name,
    })),
  });
});

/**
 * Auto-detect language
 */
router.post(
  '/detect',
  authMiddleware,
  requireOrganizationAccess,
  async (req: OrganizationRequest, res: Response) => {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({ error: 'text is required' });
      }

      const systemPrompt = `You are a language detection expert. Analyze the given text and identify its language.

Rules:
1. Return only the language code (e.g., 'en', 'ja', 'ko', 'zh', 'es', 'fr', 'de')
2. If uncertain, return the most likely language
3. For mixed languages, return the dominant language
4. Return 'unknown' if the language cannot be determined

Supported language codes: ${Object.keys(SUPPORTED_LANGUAGES).join(', ')}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Detect the language of this text: "${text}"`,
          },
        ],
        temperature: 0.1,
        max_tokens: 10,
      });

      const detectedLanguage = completion.choices[0]?.message?.content
        ?.trim()
        .toLowerCase();

      if (
        !detectedLanguage ||
        !SUPPORTED_LANGUAGES[
          detectedLanguage as keyof typeof SUPPORTED_LANGUAGES
        ]
      ) {
        return res.json({
          language: 'unknown',
          confidence: 0,
        });
      }

      res.json({
        language: detectedLanguage,
        languageName:
          SUPPORTED_LANGUAGES[
            detectedLanguage as keyof typeof SUPPORTED_LANGUAGES
          ],
        confidence: 0.9, // GPT-4o is generally quite accurate
      });
    } catch (error) {
      console.error('Language detection error:', error);
      res.status(500).json({ error: 'Language detection service unavailable' });
    }
  }
);

/**
 * Calculate translation confidence score
 */
function calculateTranslationConfidence(
  originalText: string,
  translatedText: string,
  targetLanguage: string
): number {
  // Simple heuristic-based confidence calculation
  let confidence = 0.8; // Base confidence

  // Check if translation is not empty
  if (!translatedText || translatedText.trim().length === 0) {
    return 0.1;
  }

  // Check if translation is the same as original (might indicate no translation needed)
  if (originalText === translatedText) {
    confidence = 0.9;
  }

  // Check length ratio (translations shouldn't be too different in length)
  const lengthRatio = translatedText.length / originalText.length;
  if (lengthRatio < 0.3 || lengthRatio > 3) {
    confidence -= 0.2;
  }

  // Check for common translation artifacts
  if (
    translatedText.includes('```') ||
    translatedText.includes('Translation:')
  ) {
    confidence -= 0.3;
  }

  // Ensure confidence is between 0 and 1
  return Math.max(0.1, Math.min(1.0, confidence));
}

export { router as translationRoutes };
