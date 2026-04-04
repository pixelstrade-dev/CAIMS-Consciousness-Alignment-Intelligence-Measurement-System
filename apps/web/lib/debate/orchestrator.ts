import { getAnthropicAdapter } from '@/lib/adapters/anthropic';
import { scoreInteraction } from '@/lib/scorers/scoring-engine';
import prisma from '@/lib/db/client';

interface DebateConfig {
  debateId: string;
  maxTurns: number;  // total turns across all agents
}

export class DebateOrchestrator {
  private config: DebateConfig;

  constructor(config: DebateConfig) {
    this.config = config;
  }

  // Determine which agent speaks next
  async getNextAgent(): Promise<{ agentId: string; agentName: string } | null> {
    const debate = await prisma.debate.findUnique({
      where: { id: this.config.debateId },
      include: {
        agents: true,
        turns: { orderBy: { turnNumber: 'desc' }, take: 1 },
      },
    });

    if (!debate || debate.status !== 'active') return null;

    const totalTurns = await prisma.debateTurn.count({
      where: { debateId: this.config.debateId },
    });

    if (totalTurns >= this.config.maxTurns) return null;

    // Separate orchestrator from regular agents
    const regularAgents = debate.agents.filter((a: { agentId: string }) => a.agentId !== 'agt-orchestrator');
    const orchestrator = debate.agents.find((a: { agentId: string }) => a.agentId === 'agt-orchestrator');

    // Round-robin for regular agents, orchestrator speaks after each full round
    const agentsPerRound = regularAgents.length + (orchestrator ? 1 : 0);
    const positionInRound = totalTurns % agentsPerRound;

    if (positionInRound < regularAgents.length) {
      const agent = regularAgents[positionInRound];
      return { agentId: agent.id, agentName: agent.name };
    } else if (orchestrator) {
      return { agentId: orchestrator.id, agentName: orchestrator.name };
    }

    return null;
  }

  // Execute one turn of the debate
  async executeTurn(): Promise<{
    turn: { id: string; content: string; agentName: string; turnNumber: number };
    scores: any | null;
    isComplete: boolean;
  } | null> {
    const nextAgent = await this.getNextAgent();
    if (!nextAgent) {
      // Mark debate as concluded
      await prisma.debate.update({
        where: { id: this.config.debateId },
        data: { status: 'concluded' },
      });
      return null;
    }

    // Get debate context
    const debate = await prisma.debate.findUnique({
      where: { id: this.config.debateId },
      include: {
        agents: true,
        turns: {
          orderBy: { turnNumber: 'asc' },
          include: { agent: true },
        },
      },
    });

    if (!debate) return null;

    const agent = debate.agents.find((a: { id: string }) => a.id === nextAgent.agentId);
    if (!agent) return null;

    // Build conversation context for this agent
    const previousTurns = debate.turns.map((t: { agent: { name: string }; content: string }) =>
      `[${t.agent.name}]: ${t.content}`
    ).join('\n\n');

    const prompt = previousTurns
      ? `Sujet du débat: ${debate.topic}\n\nÉchanges précédents:\n${previousTurns}\n\nC'est ton tour de parler. Réponds en tenant compte des arguments précédents. Sois direct et constructif.`
      : `Sujet du débat: ${debate.topic}\n\nTu es le premier à parler. Présente ta position initiale de manière claire et argumentée.`;

    // Call LLM with agent's persona
    const adapter = getAnthropicAdapter();
    const response = await adapter.chat(
      [{ role: 'user', content: prompt }],
      {
        model: 'claude-sonnet-4-20250514',
        systemPrompt: agent.systemPrompt,
      }
    );

    const turnNumber = debate.turns.length + 1;

    // Save turn
    const turn = await prisma.debateTurn.create({
      data: {
        turnNumber,
        content: response.content,
        tokenCount: response.outputTokens,
        debateId: this.config.debateId,
        agentId: agent.id,
      },
    });

    // Score this turn
    let scores = null;
    const scoreResult = await scoreInteraction({
      response: response.content,
      question: debate.topic,
      history: debate.turns.map((t: { agent: { name: string }; content: string }, i: number) => ({
        role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
        content: `[${t.agent.name}]: ${t.content}`,
      })),
    });

    if (scoreResult) {
      scores = await prisma.debateAgentScore.create({
        data: {
          cqScore: scoreResult.cqScore,
          aqScore: scoreResult.aqScore,
          cfiScore: scoreResult.cfiScore,
          eqScore: scoreResult.eqScore,
          sqScore: scoreResult.sqScore,
          composite: scoreResult.composite,
          details: scoreResult.details as any,
          metadata: scoreResult.metadata as any,
          agentId: agent.id,
          turnId: turn.id,
        },
      });
    }

    // Check if debate is complete
    const totalTurns = turnNumber;
    const isComplete = totalTurns >= this.config.maxTurns;

    if (isComplete) {
      await prisma.debate.update({
        where: { id: this.config.debateId },
        data: { status: 'concluded' },
      });
      await this.computeDebateMetrics();
    }

    return {
      turn: {
        id: turn.id,
        content: response.content,
        agentName: agent.name,
        turnNumber,
      },
      scores,
      isComplete,
    };
  }

  // Compute final debate metrics after conclusion
  async computeDebateMetrics(): Promise<void> {
    const debate = await prisma.debate.findUnique({
      where: { id: this.config.debateId },
      include: {
        turns: { include: { score: true, agent: true } },
        agents: { include: { scores: true } },
      },
    });

    if (!debate) return;

    interface TurnScore {
      composite: number;
      cqScore: number;
      aqScore: number;
      cfiScore: number;
    }

    // Calculate aggregate metrics
    const allScores: TurnScore[] = debate.turns
      .map((t: { score: TurnScore | null }) => t.score)
      .filter((s: TurnScore | null): s is TurnScore => s !== null);

    if (allScores.length === 0) return;

    const avg = (arr: number[]) => arr.reduce((a: number, b: number) => a + b, 0) / arr.length;

    // Convergence: how much do composite scores converge over time?
    const composites = allScores.map((s: TurnScore) => s.composite);
    const mean = avg(composites);
    const variance = composites.reduce((sum: number, val: number) => {
      return sum + Math.pow(val - mean, 2);
    }, 0) / composites.length;
    const convergenceRate = Math.max(0, Math.min(100, 100 - variance));

    // Diversity: variance in CQ scores across agents
    const cqScores = allScores.map((s: TurnScore) => s.cqScore);
    const cqMean = avg(cqScores);
    const diversityIndex = Math.min(100, Math.sqrt(
      cqScores.reduce((sum: number, val: number) => sum + Math.pow(val - cqMean, 2), 0) / cqScores.length
    ) * 5);

    const argumentationQuality = avg(allScores.map((s: TurnScore) => s.aqScore));
    const alignmentCoherence = avg(allScores.map((s: TurnScore) => s.cfiScore));
    const consciousnessEmergence = avg(composites);

    await prisma.debateMetrics.upsert({
      where: { debateId: this.config.debateId },
      update: {
        convergenceRate,
        diversityIndex,
        argumentationQuality,
        alignmentCoherence,
        consciousnessEmergence,
        compositeDebateScore: avg(composites),
      },
      create: {
        convergenceRate,
        diversityIndex,
        argumentationQuality,
        alignmentCoherence,
        consciousnessEmergence,
        compositeDebateScore: avg(composites),
        debateId: this.config.debateId,
      },
    });
  }
}
