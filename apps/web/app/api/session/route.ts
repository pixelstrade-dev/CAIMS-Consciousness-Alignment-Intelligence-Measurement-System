export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db/client';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/middleware/rate-limit';
import { apiSuccess, apiError } from '@/lib/middleware/api-response';
import { logger } from '@/lib/logger';

const MAX_PAGE_SIZE = 100;

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
