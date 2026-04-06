export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db/client';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/middleware/rate-limit';
import { apiSuccess, apiError } from '@/lib/middleware/api-response';
import { logger } from '@/lib/logger';

const MAX_PAGE_SIZE = 100;

/**
 * @openapi
 * /api/session:
 *   get:
 *     tags:
 *       - Session
 *     summary: List recent sessions
 *     operationId: getSessions
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *         description: Number of sessions to return
 *       - name: offset
 *         in: query
 *         schema:
 *           type: integer
 *           default: 0
 *           minimum: 0
 *         description: Offset for pagination
 *     responses:
 *       200:
 *         description: Paginated list of sessions with message counts and latest composite score
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 *             example:
 *               success: true
 *               data:
 *                 sessions:
 *                   - id: clxyz123abc
 *                     title: Consciousness Research
 *                     llmModel: claude-sonnet-4-20250514
 *                     createdAt: '2026-04-06T10:00:00.000Z'
 *                     _count:
 *                       messages: 8
 *                       scores: 4
 *                     scores:
 *                       - composite: 73.2
 *                 limit: 20
 *                 offset: 0
 *               meta:
 *                 timestamp: '2026-04-06T12:00:00.000Z'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const rawLimit = parseInt(searchParams.get('limit') || '20');
    const rawOffset = parseInt(searchParams.get('offset') || '0');

    const limit = Math.min(Math.max(isNaN(rawLimit) ? 20 : rawLimit, 1), MAX_PAGE_SIZE);
    const offset = Math.max(isNaN(rawOffset) ? 0 : rawOffset, 0);

    const sessions = await prisma.session.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { messages: true, scores: true } },
        scores: { orderBy: { createdAt: 'desc' }, take: 1, select: { composite: true } },
      },
    });

    return apiSuccess({ sessions, limit, offset });
  } catch (error) {
    logger.error('Session list failed', { error: error instanceof Error ? error.message : String(error) });
    return apiError('INTERNAL_ERROR', 'Failed to retrieve sessions', 500);
  }
}

const CreateSessionSchema = z.object({
  title: z.string().max(200).optional(),
  model: z.string().max(100).default('claude-sonnet-4-20250514'),
});

/**
 * @openapi
 * /api/session:
 *   post:
 *     tags:
 *       - Session
 *     summary: Create a new session
 *     operationId: createSession
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSessionRequest'
 *           example:
 *             title: Consciousness Research Session
 *             model: claude-sonnet-4-20250514
 *     responses:
 *       201:
 *         description: Session created successfully
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
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 *             example:
 *               success: true
 *               data:
 *                 id: clxyz123abc
 *                 title: Consciousness Research Session
 *                 llmModel: claude-sonnet-4-20250514
 *                 createdAt: '2026-04-06T12:00:00.000Z'
 *                 updatedAt: '2026-04-06T12:00:00.000Z'
 *               meta:
 *                 timestamp: '2026-04-06T12:00:00.000Z'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         $ref: '#/components/responses/RateLimited'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
  const rateCheck = checkRateLimit(`session:${ip}`, { windowMs: 60_000, maxRequests: 10 });
  if (!rateCheck.allowed) {
    return apiError('RATE_LIMITED', 'Too many requests', 429, getRateLimitHeaders(rateCheck));
  }

  try {
    const body = await req.json();
    const parsed = CreateSessionSchema.parse(body);

    const session = await prisma.session.create({
      data: {
        title: parsed.title,
        llmModel: parsed.model,
      },
    });

    return apiSuccess(session, 201, getRateLimitHeaders(rateCheck));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError('VALIDATION_ERROR', 'Invalid request parameters', 400);
    }
    logger.error('Session creation failed', { error: error instanceof Error ? error.message : String(error) });
    return apiError('INTERNAL_ERROR', 'An internal error occurred', 500);
  }
}
