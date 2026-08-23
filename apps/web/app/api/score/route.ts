export const dynamic = 'force-dynamic';
// Ensemble/n-sample requests run judges in parallel but samples sequentially:
// a worst-case request is still several judge calls long. 60s is accepted on
// every Vercel plan; raise it (Pro) or self-host for heavy configurations —
// see docs/ensemble-v2.1.md#latency.
export const maxDuration = 60;

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { scoreInteraction } from '@/lib/scorers/scoring-engine';
import { scoreEnsemble, getEnsembleConfig, defaultJudge, MAX_SAMPLES_PER_JUDGE } from '@/lib/scorers/ensemble';
import { interpretScore, checkContextAlert } from '@/lib/scorers/composite';
import { checkRateLimit, getRateLimitHeaders, clientIp } from '@/lib/middleware/rate-limit';
import { apiSuccess, apiError } from '@/lib/middleware/api-response';
import { checkApiKey } from '@/lib/middleware/auth';
import { logger } from '@/lib/logger';

const MAX_CONTENT_LENGTH = 50_000;

const ScoreRequestSchema = z.object({
  response: z.string().min(1).max(MAX_CONTENT_LENGTH),
  question: z.string().min(1).max(MAX_CONTENT_LENGTH),
  sessionId: z.string().max(100).optional(),
  history: z.array(z.object({
    // strict enum: the role becomes an XML tag name in the judge prompt —
    // a free string here was a prompt-injection vector (panel finding)
    role: z.enum(['user', 'assistant']),
    content: z.string().max(MAX_CONTENT_LENGTH),
  })).max(50).default([]),
  messageId: z.string().max(100).optional(),
  // v2.1: multi-judge ensemble (judges are configured SERVER-side via
  // CAIMS_ENSEMBLE_JUDGES — the client can only opt in, never pick models).
  ensemble: z.boolean().optional().default(false),
  // v2.1: samples per judge (mean ± sample SD, Run 001 statistics). Each
  // sample is one judge LLM call — capped to bound per-request spend.
  samples: z.number().int().min(1).max(MAX_SAMPLES_PER_JUDGE).optional().default(1),
});

export async function POST(req: NextRequest) {
  const auth = checkApiKey(req.headers);
  if (!auth.ok) {
    if (auth.reason === 'misconfigured') {
      // Fail closed: keys were intended but none parsed — a 5xx tells the
      // operator to fix config; it must never silently open the API.
      return apiError('AUTH_MISCONFIGURED', 'API keys are misconfigured on the server', 503);
    }
    return apiError(
      'UNAUTHORIZED',
      auth.reason === 'missing_key'
        ? 'API key required: send Authorization: Bearer <key> or x-api-key'
        : 'Invalid API key',
      401
    );
  }

  const startTime = Date.now();

  const ip = clientIp(req.headers);
  const rateCheck = checkRateLimit(`score:${ip}`, { windowMs: 60_000, maxRequests: 20 });
  if (!rateCheck.allowed) {
    return apiError('RATE_LIMITED', 'Too many requests', 429, getRateLimitHeaders(rateCheck));
  }

  try {
    const body = await req.json();
    const parsed = ScoreRequestSchema.parse(body);

    const history = parsed.history.map(h => ({ role: h.role, content: h.content }));

    // ── v2.1 ensemble / n-sample path ──────────────────────────────────────
    if (parsed.ensemble || parsed.samples > 1) {
      let judges;
      if (parsed.ensemble) {
        const config = getEnsembleConfig();
        if (config.status === 'unset') {
          return apiError(
            'ENSEMBLE_NOT_CONFIGURED',
            'Ensemble scoring requires CAIMS_ENSEMBLE_JUDGES on the server (e.g. "anthropic:claude-sonnet-5,openai:gpt-4o")',
            400
          );
        }
        if (config.status === 'invalid') {
          // Fail loudly, never silently degrade to a single judge the caller
          // did not ask for.
          logger.error('CAIMS_ENSEMBLE_JUDGES is invalid', { reason: config.reason });
          return apiError('ENSEMBLE_MISCONFIGURED', 'Ensemble judges are misconfigured on the server', 503);
        }
        judges = config.judges;
      } else {
        judges = [defaultJudge()];
      }

      const result = await scoreEnsemble({
        response: parsed.response,
        question: parsed.question,
        history,
        judges,
        samplesPerJudge: parsed.samples,
      });
      if (!result) {
        return apiError('SCORING_UNAVAILABLE', 'Scoring engine temporarily unavailable (all judges failed)', 503);
      }

      const processingTimeMs = Date.now() - startTime;
      logger.info('Ensemble scoring completed', {
        processingTimeMs,
        composite: result.scores.composite,
        judges: result.judges.map(j => j.id),
        samples: parsed.samples,
      });

      return apiSuccess({
        scores: {
          cq: { score: result.scores.cq, details: {} },
          aq: { score: result.scores.aq, details: {} },
          cfi: { score: result.scores.cfi, details: {} },
          eq: { score: result.scores.eq, details: {} },
          sq: { score: result.scores.sq, details: {} },
          composite: result.scores.composite,
        },
        interpretation: interpretScore(result.scores.composite),
        contextAlert: checkContextAlert(result.scores.cfi),
        ensemble: {
          judges: result.judges,
          failedJudges: result.failedJudges,
          agreement: result.agreement,
        },
        metadata: result.metadata,
        processingTimeMs,
      }, 200, getRateLimitHeaders(rateCheck));
    }

    const scores = await scoreInteraction({
      response: parsed.response,
      question: parsed.question,
      history,
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
        ...(scores.emqScore !== undefined && scores.emotionAnalysis
          ? {
              emq: {
                score: scores.emqScore,
                details: scores.emotionAnalysis.details,
                responseEmotion: scores.emotionAnalysis.responseEmotion,
                conversationState: scores.emotionAnalysis.conversationState,
              },
            }
          : {}),
      },
      interpretation: interpretScore(scores.composite),
      contextAlert: checkContextAlert(scores.cfiScore),
      // Provenance envelope — protocol version, rubric hash, judge params.
      // Scores from different protocolVersion values must never be compared.
      metadata: scores.metadata,
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
