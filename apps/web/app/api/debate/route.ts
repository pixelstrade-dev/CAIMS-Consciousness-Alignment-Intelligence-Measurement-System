export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db/client';
import { CAIMS_DEFAULT_AGENTS } from '@/lib/debate/agents';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/middleware/rate-limit';
import { apiSuccess, apiError } from '@/lib/middleware/api-response';
import { logger } from '@/lib/logger';

const CreateDebateSchema = z.object({
  topic: z.string().min(1).max(5000),
  format: z.enum(['expert_panel', 'devil_advocate', 'socratic', 'red_team', 'consensus_build']),
  agentIds: z.array(z.string().max(50)).min(2).max(10),
  maxTurns: z.number().min(1).max(50).default(6),
  enableOrchestrator: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
  const rateCheck = checkRateLimit(`debate:${ip}`, { windowMs: 60_000, maxRequests: 10 });
  if (!rateCheck.allowed) {
    return apiError('RATE_LIMITED', 'Too many requests', 429, getRateLimitHeaders(rateCheck));
  }

  try {
    const body = await req.json();
    const parsed = CreateDebateSchema.parse(body);

    // Validate agent IDs exist
    const invalidIds = parsed.agentIds.filter(
      id => !CAIMS_DEFAULT_AGENTS.some(a => a.id === id)
    );
    if (invalidIds.length > 0) {
      return apiError('INVALID_AGENTS', `Unknown agent IDs: ${invalidIds.join(', ')}`, 400);
    }

    const selectedAgents = parsed.agentIds.map(id =>
      CAIMS_DEFAULT_AGENTS.find(a => a.id === id)!
    );

    // Add orchestrator if enabled and not already included
    if (parsed.enableOrchestrator && !parsed.agentIds.includes('agt-orchestrator')) {
      const orchestrator = CAIMS_DEFAULT_AGENTS.find(a => a.id === 'agt-orchestrator');
      if (orchestrator) selectedAgents.push(orchestrator);
    }

    const debate = await prisma.debate.create({
      data: {
        topic: parsed.topic,
        format: parsed.format,
        status: 'active',
        agents: {
          create: selectedAgents.map(agent => ({
            agentId: agent.id,
            name: agent.name,
            role: agent.role,
            systemPrompt: agent.systemPrompt,
          })),
        },
      },
      include: { agents: true },
    });

    logger.info('Debate created', { debateId: debate.id, format: parsed.format, agentCount: selectedAgents.length });

    return apiSuccess({
      debateId: debate.id,
      agents: debate.agents,
      status: debate.status,
      maxTurns: parsed.maxTurns,
    }, 201, getRateLimitHeaders(rateCheck));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError('VALIDATION_ERROR', 'Invalid request parameters', 400);
    }
    logger.error('Debate creation failed', { error: error instanceof Error ? error.message : String(error) });
    return apiError('INTERNAL_ERROR', 'An internal error occurred', 500);
  }
}

export async function GET() {
  const debates = await prisma.debate.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      agents: true,
      _count: { select: { turns: true } },
      metrics: true,
    },
  });
  return apiSuccess({ debates });
}
