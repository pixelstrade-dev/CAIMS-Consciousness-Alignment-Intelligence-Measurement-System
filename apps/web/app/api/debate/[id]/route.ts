export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAnthropicAdapter } from '@/lib/adapters/anthropic';
import { scoreInteraction } from '@/lib/scorers/scoring-engine';
import prisma from '@/lib/db/client';

// GET - Fetch a specific debate with all turns and scores
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const debate = await prisma.debate.findUnique({
    where: { id },
    include: {
      agents: {
        include: {
          scores: true,
        },
      },
      turns: {
        orderBy: { turnNumber: 'asc' },
        include: {
          agent: { select: { name: true, role: true, agentId: true } },
          score: true,
        },
      },
      metrics: true,
    },
  });

  if (!debate) {
    return NextResponse.json({ error: 'Debate not found' }, { status: 404 });
  }

  return NextResponse.json({ debate });
}

const AdvanceDebateSchema = z.object({
  maxTurns: z.number().default(6),
});

// POST - Advance the debate by one turn
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = AdvanceDebateSchema.parse(body);

    // Load debate with agents and existing turns
    const debate = await prisma.debate.findUnique({
      where: { id },
      include: {
        agents: true,
        turns: {
          orderBy: { turnNumber: 'asc' },
          include: {
            agent: { select: { name: true, role: true, agentId: true } },
          },
        },
      },
    });

    if (!debate) {
      return NextResponse.json({ error: 'Debate not found' }, { status: 404 });
    }

    if (debate.status !== 'active') {
      return NextResponse.json({ error: 'Debate is not active', status: debate.status }, { status: 400 });
    }

    // Determine current turn number
    const currentTurnNumber = (debate.turns as any[]).length + 1;

    // Separate orchestrator from regular agents
    const agents = debate.agents as Array<{ id: string; agentId: string; name: string; role: string; systemPrompt: string; debateId: string }>;
    const orchestrator = agents.find(a => a.role === 'orchestrator');
    const regularAgents = agents.filter(a => a.role !== 'orchestrator');

    if (regularAgents.length === 0) {
      return NextResponse.json({ error: 'No regular agents in debate' }, { status: 400 });
    }

    // Determine which agent speaks next:
    // Round-robin through regular agents, orchestrator speaks after all regular agents complete a round
    type TurnWithAgent = { id: string; turnNumber: number; content: string; tokenCount: number | null; debateId: string; agentId: string; agent: { name: string; role: string; agentId: string } };
    const turns = debate.turns as TurnWithAgent[];
    const turnsWithoutOrchestrator = turns.filter(
      t => t.agent.role !== 'orchestrator'
    );
    const currentRound = Math.floor(turnsWithoutOrchestrator.length / regularAgents.length);
    const positionInRound = turnsWithoutOrchestrator.length % regularAgents.length;

    let speakingAgent;
    let isOrchestratorTurn = false;

    // Check if all regular agents have spoken this round
    if (positionInRound === 0 && turnsWithoutOrchestrator.length > 0) {
      // Check if orchestrator already spoke for the previous round
      const orchestratorTurnsCount = turns.filter(
        t => t.agent.role === 'orchestrator'
      ).length;

      if (orchestrator && orchestratorTurnsCount < currentRound) {
        // Orchestrator's turn to synthesize the round
        speakingAgent = orchestrator;
        isOrchestratorTurn = true;
      } else {
        // Start next round with first regular agent
        speakingAgent = regularAgents[0];
      }
    } else {
      // Next regular agent in round-robin
      speakingAgent = regularAgents[positionInRound];
    }

    // Build context from all previous turns
    const conversationContext = turns.map(t =>
      `[${t.agent.name} (${t.agent.role})]:\n${t.content}`
    ).join('\n\n---\n\n');

    // Build the prompt for the speaking agent
    let userPrompt: string;
    if (isOrchestratorTurn) {
      userPrompt = `Sujet du debat: ${debate.topic}\nFormat: ${debate.format}\n\nVoici les echanges du round ${currentRound}:\n\n${conversationContext}\n\nSynthetise les positions, identifie les points de convergence et de divergence, et indique si le debat devrait continuer ou conclure.`;
    } else if (turns.length === 0) {
      // First turn - introduce the topic
      userPrompt = `Sujet du debat: ${debate.topic}\nFormat: ${debate.format}\n\nTu es le premier a prendre la parole. Presente ta position initiale sur le sujet.`;
    } else {
      userPrompt = `Sujet du debat: ${debate.topic}\nFormat: ${debate.format}\n\nVoici les echanges precedents:\n\n${conversationContext}\n\nReponds en tenant compte des arguments presentes. Apporte ta perspective unique en tant que ${speakingAgent.role}.`;
    }

    // Call LLM with agent's system prompt
    const adapter = getAnthropicAdapter();
    const llmResponse = await adapter.chat(
      [{ role: 'user', content: userPrompt }],
      {
        model: 'claude-sonnet-4-20250514',
        systemPrompt: speakingAgent.systemPrompt,
        temperature: 0.8,
      }
    );

    // Save the turn
    const turn = await prisma.debateTurn.create({
      data: {
        turnNumber: currentTurnNumber,
        content: llmResponse.content,
        tokenCount: llmResponse.outputTokens,
        debateId: debate.id,
        agentId: speakingAgent.id,
      },
      include: {
        agent: { select: { name: true, role: true, agentId: true } },
      },
    });

    // Score the turn
    let turnScore = null;
    try {
      const scores = await scoreInteraction({
        response: llmResponse.content,
        question: userPrompt,
        history: turns.map(t => ({
          role: 'assistant' as const,
          content: `[${t.agent.name}]: ${t.content}`,
        })),
      });

      if (scores) {
        turnScore = await prisma.debateAgentScore.create({
          data: {
            cqScore: scores.cqScore,
            aqScore: scores.aqScore,
            cfiScore: scores.cfiScore,
            eqScore: scores.eqScore,
            sqScore: scores.sqScore,
            composite: scores.composite,
            details: scores.details as any,
            metadata: scores.metadata as any,
            agentId: speakingAgent.id,
            turnId: turn.id,
          },
        });
      }
    } catch (scoreError) {
      console.error('[CAIMS] Debate turn scoring error:', scoreError);
    }

    // Check if debate should conclude
    const totalRegularTurns = turnsWithoutOrchestrator.length + (isOrchestratorTurn ? 0 : 1);
    const completedRounds = Math.floor(totalRegularTurns / regularAgents.length);
    const shouldConclude = completedRounds >= parsed.maxTurns;

    if (shouldConclude) {
      await prisma.debate.update({
        where: { id: debate.id },
        data: { status: 'completed' },
      });
    }

    return NextResponse.json({
      turn: {
        id: turn.id,
        turnNumber: turn.turnNumber,
        agent: turn.agent,
        content: turn.content,
        score: turnScore,
      },
      debateStatus: shouldConclude ? 'completed' : 'active',
      currentRound: completedRounds + 1,
      turnsRemaining: shouldConclude
        ? 0
        : (parsed.maxTurns * regularAgents.length) - totalRegularTurns,
      usage: {
        inputTokens: llmResponse.inputTokens,
        outputTokens: llmResponse.outputTokens,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 });
    }
    console.error('[CAIMS] Debate advance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
