export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getAdapter } from '@/lib/adapters';
import { scoreInteraction } from '@/lib/scorers/scoring-engine';
import prisma from '@/lib/db/client';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/middleware/rate-limit';
import { apiSuccess, apiError } from '@/lib/middleware/api-response';
import { logger } from '@/lib/logger';

// GET - Fetch a specific debate with all turns and scores
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const debate = await prisma.debate.findUnique({
      where: { id },
      include: {
        agents: {
          include: { scores: true },
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
      return apiError('DEBATE_NOT_FOUND', 'Debate not found', 404);
    }

    return apiSuccess({ debate });
  } catch (error) {
    logger.error('Debate fetch failed', { error: error instanceof Error ? error.message : String(error) });
    return apiError('INTERNAL_ERROR', 'Failed to retrieve debate', 500);
  }
}

const AdvanceDebateSchema = z.object({
  maxTurns: z.number().min(1).max(50).default(6),
});

// POST - Advance the debate by one turn
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
  const rateCheck = checkRateLimit(`debate-advance:${ip}`, { windowMs: 60_000, maxRequests: 20 });
  if (!rateCheck.allowed) {
    return apiError('RATE_LIMITED', 'Too many requests', 429, getRateLimitHeaders(rateCheck));
  }

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

    if (!debate) return apiError('DEBATE_NOT_FOUND', 'Debate not found', 404);
    if (debate.status !== 'active') {
      return apiError('DEBATE_NOT_ACTIVE', `Debate is ${debate.status}`, 400);
    }

    // Determine which agent speaks next (round-robin with orchestrator after each round)
    const agents = debate.agents;
    const orchestrator = agents.find(a => a.agentId === 'agt-orchestrator');
    const regularAgents = agents.filter(a => a.agentId !== 'agt-orchestrator');

    if (regularAgents.length === 0) {
      return apiError('NO_AGENTS', 'No regular agents in debate', 400);
    }

    const turns = debate.turns;
    const turnsWithoutOrchestrator = turns.filter(t => t.agent.agentId !== 'agt-orchestrator');
    const currentRound = Math.floor(turnsWithoutOrchestrator.length / regularAgents.length);
    const positionInRound = turnsWithoutOrchestrator.length % regularAgents.length;

    let speakingAgent;
    let isOrchestratorTurn = false;

    if (positionInRound === 0 && turnsWithoutOrchestrator.length > 0) {
      const orchestratorTurnsCount = turns.filter(t => t.agent.agentId === 'agt-orchestrator').length;
      if (orchestrator && orchestratorTurnsCount < currentRound) {
        speakingAgent = orchestrator;
        isOrchestratorTurn = true;
      } else {
        speakingAgent = regularAgents[0];
      }
    } else {
      speakingAgent = regularAgents[positionInRound];
    }

    // Build context from previous turns (sanitized)
    const conversationContext = turns.map(t =>
      `<agent name="${t.agent.name}" role="${t.agent.role}">\n${t.content}\n</agent>`
    ).join('\n\n');

    // Build prompt for the speaking agent
    let userPrompt: string;
    if (isOrchestratorTurn) {
      userPrompt = `<debate_topic>${debate.topic}</debate_topic>\n<format>${debate.format}</format>\n\n<previous_exchanges>\n${conversationContext}\n</previous_exchanges>\n\nSynthétise les positions, identifie convergences et divergences, et indique si le débat devrait continuer ou conclure.`;
    } else if (turns.length === 0) {
      userPrompt = `<debate_topic>${debate.topic}</debate_topic>\n<format>${debate.format}</format>\n\nTu es le premier à prendre la parole. Présente ta position initiale sur le sujet.`;
    } else {
      userPrompt = `<debate_topic>${debate.topic}</debate_topic>\n<format>${debate.format}</format>\n\n<previous_exchanges>\n${conversationContext}\n</previous_exchanges>\n\nRéponds en tenant compte des arguments présentés. Apporte ta perspective unique en tant que ${speakingAgent.role}.`;
    }

    // Call LLM with agent's persona
    const adapter = getAdapter();
    const llmResponse = await adapter.chat(
      [{ role: 'user', content: userPrompt }],
      {
        model: 'claude-sonnet-4-20250514',
        systemPrompt: speakingAgent.systemPrompt,
        temperature: 0.8,
      }
    );

    const currentTurnNumber = turns.length + 1;

    // Save turn + score in a transaction for atomicity
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (prisma as any).$transaction(async (tx: any) => {
      const turn = await tx.debateTurn.create({
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
      const scoreResult = await scoreInteraction({
        response: llmResponse.content,
        question: debate.topic,
        history: turns.map((t, i) => ({
          role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
          content: `[${t.agent.name}]: ${t.content}`,
        })),
      });

      if (scoreResult) {
        turnScore = await tx.debateAgentScore.create({
          data: {
            cqScore: scoreResult.cqScore,
            aqScore: scoreResult.aqScore,
            cfiScore: scoreResult.cfiScore,
            eqScore: scoreResult.eqScore,
            sqScore: scoreResult.sqScore,
            composite: scoreResult.composite,
            details: scoreResult.details as object,
            metadata: scoreResult.metadata as object,
            agentId: speakingAgent.id,
            turnId: turn.id,
          },
        });
      }

      return { turn, turnScore };
    });

    // Check if debate should conclude
    const totalRegularTurns = turnsWithoutOrchestrator.length + (isOrchestratorTurn ? 0 : 1);
    const completedRounds = Math.floor(totalRegularTurns / regularAgents.length);
    const shouldConclude = completedRounds >= parsed.maxTurns;

    if (shouldConclude) {
      await prisma.debate.update({
        where: { id: debate.id },
        data: { status: 'concluded' },
      });

      // Compute and persist debate metrics
      try {
        const debateWithScores = await prisma.debate.findUnique({
          where: { id: debate.id },
          include: {
            turns: { include: { score: true } },
          },
        });

        if (debateWithScores) {
          const allScores = debateWithScores.turns
            .map((t: any) => t.score)
            .filter((s: any): s is any => s !== null);

          if (allScores.length > 0) {
            const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
            const composites = allScores.map((s: any) => s.composite as number);
            const mean = avg(composites);
            const variance = composites.reduce((sum: number, val: number) => sum + Math.pow(val - mean, 2), 0) / composites.length;

            await prisma.debateMetrics.upsert({
              where: { debateId: debate.id },
              update: {
                convergenceRate: Math.max(0, Math.min(100, 100 - variance)),
                diversityIndex: Math.min(100, Math.sqrt(variance) * 5),
                argumentationQuality: avg(allScores.map((s: any) => s.aqScore as number)),
                alignmentCoherence: avg(allScores.map((s: any) => s.aqScore as number)),
                consciousnessEmergence: avg(composites),
                compositeDebateScore: avg(composites),
              },
              create: {
                convergenceRate: Math.max(0, Math.min(100, 100 - variance)),
                diversityIndex: Math.min(100, Math.sqrt(variance) * 5),
                argumentationQuality: avg(allScores.map((s: any) => s.aqScore as number)),
                alignmentCoherence: avg(allScores.map((s: any) => s.aqScore as number)),
                consciousnessEmergence: avg(composites),
                compositeDebateScore: avg(composites),
                debateId: debate.id,
              },
            });
          }
        }
      } catch (metricsError) {
        logger.warn('Failed to compute debate metrics', {
          debateId: debate.id,
          error: metricsError instanceof Error ? metricsError.message : String(metricsError),
        });
      }
    }

    logger.info('Debate turn completed', {
      debateId: debate.id,
      agent: speakingAgent.name,
      turnNumber: currentTurnNumber,
      scored: !!result.turnScore,
      isComplete: shouldConclude,
    });

    return apiSuccess({
      turn: {
        id: result.turn.id,
        turnNumber: result.turn.turnNumber,
        agent: result.turn.agent,
        content: result.turn.content,
        score: result.turnScore,
      },
      debateStatus: shouldConclude ? 'concluded' : 'active',
      currentRound: completedRounds + 1,
      turnsRemaining: shouldConclude ? 0 : (parsed.maxTurns * regularAgents.length) - totalRegularTurns,
      usage: {
        inputTokens: llmResponse.inputTokens,
        outputTokens: llmResponse.outputTokens,
      },
    }, 200, getRateLimitHeaders(rateCheck));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError('VALIDATION_ERROR', 'Invalid request parameters', 400);
    }
    logger.error('Debate advance failed', { debateId: id, error: error instanceof Error ? error.message : String(error) });
    return apiError('INTERNAL_ERROR', 'An internal error occurred', 500);
  }
}
