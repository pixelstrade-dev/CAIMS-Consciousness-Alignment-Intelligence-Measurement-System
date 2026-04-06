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

/**
 * @openapi
 * /api/score:
 *   post:
 *     tags:
 *       - Score
 *     summary: Score an LLM interaction across 5 KPIs
 *     operationId: postScore
 *     description: >
 *       Evaluates a question-response pair using the CAIMS scoring engine.
 *       Returns CQ (35%), AQ (25%), CFI (20%), EQ (12%), SQ (8%) scores and
 *       a weighted composite. Rate-limited to 20 requests per minute.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScoreRequest'
 *           example:
 *             response: Consciousness may emerge from integrated information processing across neural networks.
 *             question: What is consciousness?
 *             history: []
 *     responses:
 *       200:
 *         description: Scoring result with all 5 KPIs, composite score, interpretation, and optional context alert
 *         headers:
 *           X-RateLimit-Remaining:
 *             schema:
 *               type: string
 *             description: Remaining requests in the current window
 *           X-RateLimit-Reset:
 *             schema:
 *               type: string
 *             description: Window reset Unix timestamp (seconds)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ScoreResponse'
 *             example:
 *               success: true
 *               data:
 *                 scores:
 *                   cq:
 *                     score: 72
 *                     details:
 *                       phi_proxy: 68
 *                       gwt_proxy: 75
 *                       hot_proxy: 70
 *                       synthesis: 74
 *                       temporal: 73
 *                   aq:
 *                     score: 68
 *                     details:
 *                       goal_clarity: 71
 *                       constraint_aware: 65
 *                       path_coherence: 69
 *                       scope_drift: 67
 *                       reality_grounding: 68
 *                   cfi:
 *                     score: 81
 *                     details:
 *                       context_retention: 84
 *                       topic_drift: 79
 *                       coherence_loss: 80
 *                   eq:
 *                     score: 75
 *                     details:
 *                       calibration: 76
 *                       uncertainty: 74
 *                       hallucination: 77
 *                       source_integrity: 73
 *                   sq:
 *                     score: 70
 *                     details:
 *                       intra_session: 71
 *                       position_drift: 69
 *                   composite: 73.2
 *                 interpretation:
 *                   label: CONSCIENCE MODÉRÉE
 *                   color: '#f59e0b'
 *                 contextAlert: null
 *                 processingTimeMs: 1240
 *               meta:
 *                 timestamp: '2026-04-06T12:00:00.000Z'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         $ref: '#/components/responses/RateLimited'
 *       503:
 *         description: Scoring engine temporarily unavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
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
