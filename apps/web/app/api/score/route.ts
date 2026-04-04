export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { scoreInteraction } from '@/lib/scorers/scoring-engine';
import { interpretScore, checkContextAlert } from '@/lib/scorers/composite';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/middleware/rate-limit';
import { apiSuccess, apiError } from '@/lib/middleware/api-response';
import { logger } from '@/lib/logger';

const MAX_CONTENT_LENGTH = 50_000;

const ScoreRequestSchema = z.object({
  response: z.string().min(1).max(MAX_CONTENT_LENGTH),
  question: z.string().min(1).max(MAX_CONTENT_LENGTH),
  sessionId: z.string().max(100).optional(),
  history: z.array(z.object({
    role: z.string(),
    content: z.string().max(MAX_CONTENT_LENGTH),
  })).max(50).default([]),
  messageId: z.string().max(100).optional(),
});

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
  const rateCheck = checkRateLimit(`score:${ip}`, { windowMs: 60_000, maxRequests: 20 });
  if (!rateCheck.allowed) {
    return apiError('RATE_LIMITED', 'Too many requests', 429, getRateLimitHeaders(rateCheck));
  }

  try {
    const body = await req.json();
    const parsed = ScoreRequestSchema.parse(body);

    const scores = await scoreInteraction({
      response: parsed.response,
      question: parsed.question,
      history: parsed.history.map(h => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
    });

    if (!scores) {
      return apiError('SCORING_UNAVAILABLE', 'Scoring engine temporarily unavailable', 503);
    }

    const processingTimeMs = Date.now() - startTime;

    logger.info('Scoring completed', { processingTimeMs, composite: scores.composite });

    return apiSuccess({
      scores: {
        cq: { score: scores.cqScore, details: scores.details.cq },
        aq: { score: scores.aqScore, details: scores.details.aq },
        cfi: { score: scores.cfiScore, details: scores.details.cfi },
        eq: { score: scores.eqScore, details: scores.details.eq },
        sq: { score: scores.sqScore, details: scores.details.sq },
        composite: scores.composite,
      },
      interpretation: interpretScore(scores.composite),
      contextAlert: checkContextAlert(scores.cfiScore),
      processingTimeMs,
    }, 200, getRateLimitHeaders(rateCheck));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError('VALIDATION_ERROR', 'Invalid request parameters', 400);
    }
    logger.error('Score endpoint failed', { error: error instanceof Error ? error.message : String(error) });
    return apiError('INTERNAL_ERROR', 'An internal error occurred', 500);
  }
}
