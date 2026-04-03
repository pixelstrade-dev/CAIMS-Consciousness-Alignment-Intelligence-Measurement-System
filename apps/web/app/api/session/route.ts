export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db/client';

// GET - List sessions with latest scores
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  const sessions = await prisma.session.findMany({
    take: limit,
    skip: offset,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { messages: true, scores: true } },
      scores: { orderBy: { createdAt: 'desc' }, take: 1, select: { composite: true } },
    },
  });

  return NextResponse.json({ sessions, limit, offset });
}

const CreateSessionSchema = z.object({
  title: z.string().optional(),
  model: z.string().default('claude-sonnet-4-20250514'),
});

// POST - Create new session
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateSessionSchema.parse(body);

    const session = await prisma.session.create({
      data: {
        title: parsed.title,
        llmModel: parsed.model,
      },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
