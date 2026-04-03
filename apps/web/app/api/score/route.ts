export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { scoreInteraction } from '@/lib/scorers/scoring-engine';
import { interpretScore, checkContextAlert } from '@/lib/scorers/composite';

const ScoreRequestSchema = z.object({
  response: z.string().min(1),
  question: z.string().min(1),
  sessionId: z.string().optional(),
  history: z.array(z.object({
    role: z.string(),
    content: z.string(),
  })).default([]),
  messageId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ScoreRequestSchema.parse(body);

    const startTime = Date.now();
    const scores = await scoreInteraction({
      response: parsed.response,
      question: parsed.question,
      history: parsed.history.map(h => ({ role: h.role as "user" | "assistant", content: h.content })),
    });

    if (!scores) {
      return NextResponse.json({ error: 'Scoring failed - LLM judge unavailable' }, { status: 503 });
    }

    const processingTimeMs = Date.now() - startTime;

    return NextResponse.json({
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
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 });
    }
    console.error('[CAIMS] Score error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
