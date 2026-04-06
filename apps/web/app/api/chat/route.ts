export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getAdapter } from '@/lib/adapters';
import { scoreInteraction } from '@/lib/scorers/scoring-engine';
import { checkContextAlert } from '@/lib/scorers/composite';
import prisma from '@/lib/db/client';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/middleware/rate-limit';
import { apiSuccess, apiError } from '@/lib/middleware/api-response';
import { logger } from '@/lib/logger';

const MAX_MESSAGE_LENGTH = 50_000;
const MAX_HISTORY_TURNS = parseInt(process.env.CAIMS_MAX_HISTORY_TURNS || '20');

const ChatRequestSchema = z.object({
  message: z.string().min(1).max(MAX_MESSAGE_LENGTH),
  sessionId: z.string().max(100).optional(),
  model: z.string().max(100).default('claude-sonnet-4-20250514'),
  enableScoring: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  // Rate limit by IP
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
  const rateCheck = checkRateLimit(`chat:${ip}`);
  if (!rateCheck.allowed) {
    return apiError('RATE_LIMITED', 'Too many requests. Please slow down.', 429, getRateLimitHeaders(rateCheck));
  }

  try {
    const body = await req.json();
    const parsed = ChatRequestSchema.parse(body);

    // Get or create session
    let session;
    if (parsed.sessionId) {
      session = await prisma.session.findUnique({
        where: { id: parsed.sessionId },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: MAX_HISTORY_TURNS * 2, // user + assistant pairs
            select: { role: true, content: true },
          },
        },
      });
      if (!session) return apiError('SESSION_NOT_FOUND', 'Session not found', 404);
    } else {
      session = await prisma.session.create({
        data: { llmModel: parsed.model },
      });
    }

    // Build conversation history (truncated to MAX_HISTORY_TURNS)
    const messages = 'messages' in session ? (session as typeof session & { messages: Array<{ role: string; content: string }> }).messages : [];
    const history = messages.reverse().map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // Call LLM
    const adapter = getAdapter();
    const llmResponse = await adapter.chat(
      [...history, { role: 'user', content: parsed.message }],
      { model: parsed.model }
    );

    // Save messages in a transaction (guaranteed)
    const assistantMessage = await (prisma as any).$transaction(async (tx: any) => {
      await tx.message.create({
        data: {
          role: 'user',
          content: parsed.message,
          sessionId: session!.id,
        },
      });

      return tx.message.create({
        data: {
          role: 'assistant',
          content: llmResponse.content,
          tokenCount: llmResponse.outputTokens,
          sessionId: session!.id,
        },
      });
    });

    // Score after messages are safely persisted (non-blocking for chat)
    let scores = null;
    let contextAlert = null;
    if (parsed.enableScoring) {
      try {
        scores = await scoreInteraction({
          response: llmResponse.content,
          question: parsed.message,
          history: [...history, { role: 'user', content: parsed.message }],
        });

        if (scores) {
          await prisma.score.create({
            data: {
              cqScore: scores.cqScore,
              aqScore: scores.aqScore,
              cfiScore: scores.cfiScore,
              eqScore: scores.eqScore,
              sqScore: scores.sqScore,
              composite: scores.composite,
              details: scores.details as object,
              metadata: scores.metadata as object,
              sessionId: session!.id,
              messageId: assistantMessage.id,
            },
          });
          contextAlert = checkContextAlert(scores.cfiScore);
        }
      } catch (scoreError) {
        logger.warn('Scoring failed but chat preserved', {
          sessionId: session!.id,
          error: scoreError instanceof Error ? scoreError.message : String(scoreError),
        });
      }
    }

    const result = { assistantMessage, scores, contextAlert };

    const processingTimeMs = Date.now() - startTime;

    logger.info('Chat completed', {
      sessionId: session.id,
      model: parsed.model,
      scored: !!result.scores,
      processingTimeMs,
    });

    return apiSuccess({
      message: llmResponse.content,
      sessionId: session.id,
      messageId: result.assistantMessage.id,
      scores: result.scores || undefined,
      contextAlert: result.contextAlert || undefined,
      usage: {
        inputTokens: llmResponse.inputTokens,
        outputTokens: llmResponse.outputTokens,
      },
    }, 200, getRateLimitHeaders(rateCheck));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError('VALIDATION_ERROR', 'Invalid request parameters', 400);
    }
    logger.error('Chat endpoint failed', { error: error instanceof Error ? error.message : String(error) });
    return apiError('INTERNAL_ERROR', 'An internal error occurred', 500);
  }
}
