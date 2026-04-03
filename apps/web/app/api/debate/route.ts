export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db/client';
import { CAIMS_DEFAULT_AGENTS } from '@/lib/debate/agents';

const CreateDebateSchema = z.object({
  topic: z.string().min(1),
  format: z.enum(['expert_panel', 'devil_advocate', 'socratic', 'red_team', 'consensus_build']),
  agentIds: z.array(z.string()).min(2),
  maxTurns: z.number().default(6),
  enableOrchestrator: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateDebateSchema.parse(body);

    // Validate agent IDs
    const selectedAgents = parsed.agentIds.map(id => {
      const agent = CAIMS_DEFAULT_AGENTS.find(a => a.id === id);
      if (!agent) throw new Error(`Unknown agent: ${id}`);
      return agent;
    });

    // Add orchestrator if enabled
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

    return NextResponse.json({
      debateId: debate.id,
      agents: debate.agents,
      status: debate.status,
      maxTurns: parsed.maxTurns,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 });
    }
    console.error('[CAIMS] Debate create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - List debates
export async function GET() {
  const debates = await prisma.debate.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      agents: true,
      _count: { select: { turns: true } },
      metrics: true,
    },
  });
  return NextResponse.json({ debates });
}
