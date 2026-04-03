export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAnthropicAdapter } from '@/lib/adapters/anthropic';
import { scoreInteraction } from '@/lib/scorers/scoring-engine';
import { checkContextAlert } from '@/lib/scorers/composite';
import prisma from '@/lib/db/client';

const ChatRequestSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string().optional(),
  model: z.string().default('claude-sonnet-4-20250514'),
  enableScoring: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ChatRequestSchema.parse(body);

    // Get or create session
    let session;
    if (parsed.sessionId) {
      session = await prisma.session.findUnique({
        where: { id: parsed.sessionId },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
      if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    } else {
      session = await prisma.session.create({
        data: { llmModel: parsed.model },
      });
      // Initialize with empty messages for the include shape
      (session as any).messages = [];
    }

    // Build conversation history
    const history = (session as any).messages.map((m: any) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // Save user message
    await prisma.message.create({
      data: {
        role: 'user',
        content: parsed.message,
        sessionId: session.id,
      },
    });

    // Call LLM
    const adapter = getAnthropicAdapter();
    const llmResponse = await adapter.chat(
      [...history, { role: 'user', content: parsed.message }],
      { model: parsed.model }
    );

    // Save assistant message
    const assistantMessage = await prisma.message.create({
      data: {
        role: 'assistant',
        content: llmResponse.content,
        tokenCount: llmResponse.outputTokens,
        sessionId: session.id,
      },
    });

    // Score if enabled
    let scores = null;
    let contextAlert = null;
    if (parsed.enableScoring) {
      scores = await scoreInteraction({
        response: llmResponse.content,
        question: parsed.message,
        history: [...history, { role: 'user', content: parsed.message }],
      });

      if (scores) {
        // Save score to DB
        await prisma.score.create({
          data: {
            cqScore: scores.cqScore,
            aqScore: scores.aqScore,
            cfiScore: scores.cfiScore,
            eqScore: scores.eqScore,
            sqScore: scores.sqScore,
            composite: scores.composite,
            details: scores.details as any,
            metadata: scores.metadata as any,
            sessionId: session.id,
            messageId: assistantMessage.id,
          },
        });

        contextAlert = checkContextAlert(scores.cfiScore);
      }
    }

    return NextResponse.json({
      message: llmResponse.content,
      sessionId: session.id,
      messageId: assistantMessage.id,
      scores: scores || undefined,
      contextAlert: contextAlert || undefined,
      usage: {
        inputTokens: llmResponse.inputTokens,
        outputTokens: llmResponse.outputTokens,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 });
    }
    console.error('[CAIMS] Chat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
