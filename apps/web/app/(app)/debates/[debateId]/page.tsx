"use client";

import { useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { useDebate, useAdvanceDebate } from "@/hooks/use-debates";
import { useDebateWebSocket } from "@/hooks/use-debate-ws";
import TurnCard from "@/components/debates/TurnCard";

const FORMAT_LABELS: Record<string, string> = {
  expert_panel: "Panel d'Experts",
  devil_advocate: "Avocat du Diable",
  socratic: "Socratique",
  red_team: "Red Team",
  consensus_build: "Construction de Consensus",
};

const AGENT_COLORS: Record<string, string> = {
  "agt-architect": "text-accent-cyan",
  "agt-researcher": "text-accent-blue",
  "agt-builder": "text-accent-orange",
  "agt-critic": "text-accent-pink",
  "agt-orchestrator": "text-accent-purple",
};

function scoreColor(score: number): string {
  if (score >= 75) return "text-accent-cyan";
  if (score >= 50) return "text-accent-blue";
  if (score >= 25) return "text-accent-orange";
  return "text-accent-pink";
}

function TurnCardSkeleton() {
  return (
    <div className="bg-background-card border border-border rounded-xl p-4 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-background-secondary" />
        <div>
          <div className="h-4 w-24 rounded bg-background-secondary mb-1" />
          <div className="h-3 w-16 rounded bg-background-secondary" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-background-secondary" />
        <div className="h-3 w-5/6 rounded bg-background-secondary" />
        <div className="h-3 w-2/3 rounded bg-background-secondary" />
      </div>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-4 w-20 rounded bg-background-secondary mb-3" />
        <div className="h-8 w-16 rounded bg-background-secondary" />
      </div>
      <div>
        <div className="h-4 w-32 rounded bg-background-secondary mb-3" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex justify-between items-center py-2">
            <div className="h-3 w-24 rounded bg-background-secondary" />
            <div className="h-3 w-12 rounded bg-background-secondary" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DebateDetailPage() {
  const params = useParams();
  const debateId = params.debateId as string;

  const { debate, setDebate, isLoading, error, refetch } = useDebate(debateId);
  const {
    advanceDebate,
    isLoading: isAdvancing,
    error: advanceError,
  } = useAdvanceDebate();

  // Real-time WebSocket updates
  const { status: wsStatus, lastEvent } = useDebateWebSocket(debateId);

  // Apply incremental WebSocket events to local state without a round-trip
  useEffect(() => {
    if (!lastEvent) return;

    if (lastEvent.type === "turn:new") {
      setDebate(prev =>
        prev
          ? { ...prev, turns: [...prev.turns, lastEvent.turn] }
          : prev
      );
    } else if (lastEvent.type === "debate:status") {
      setDebate(prev =>
        prev ? { ...prev, status: lastEvent.status } : prev
      );
    }
  }, [lastEvent, setDebate]);

  const isConcluded = debate?.status === "concluded";

  const agentScoreAverages = useMemo(() => {
    if (!debate?.turns || debate.turns.length === 0) return [];

    const agentScores: Record<
      string,
      { name: string; agentId: string; scores: number[]; role: string }
    > = {};

    for (const turn of debate.turns) {
      const key = turn.agent.agentId;
      if (!agentScores[key]) {
        agentScores[key] = {
          name: turn.agent.name,
          agentId: turn.agent.agentId,
          role: turn.agent.role,
          scores: [],
        };
      }
      const score = turn.score;
      if (score?.composite != null) {
        agentScores[key].scores.push(score.composite);
      }
    }

    return Object.values(agentScores).map((agent) => ({
      ...agent,
      average:
        agent.scores.length > 0
          ? agent.scores.reduce((a, b) => a + b, 0) / agent.scores.length
          : null,
    }));
  }, [debate?.turns]);

  const currentRound = useMemo(() => {
    if (!debate?.turns || debate.turns.length === 0) return 0;
    const agentCount = debate.agents.length || 1;
    return Math.ceil(debate.turns.length / agentCount);
  }, [debate?.turns, debate?.agents]);

  async function handleAdvance() {
    const result = await advanceDebate(debateId);
    // Fall back to full refetch if WebSocket is not delivering updates
    if (result && wsStatus !== "connected") {
      refetch();
    }
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="bg-accent-pink/10 border border-accent-pink/30 rounded-lg p-4 text-accent-pink text-sm">
          Erreur lors du chargement du débat: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-7 w-96 max-w-full rounded bg-background-secondary" />
            <div className="flex gap-2 mt-3">
              <div className="h-5 w-28 rounded-full bg-background-secondary" />
              <div className="h-5 w-16 rounded-full bg-background-secondary" />
            </div>
          </div>
        ) : debate ? (
          <>
            <h1 className="text-xl lg:text-2xl font-bold text-foreground leading-snug">
              {debate.topic}
            </h1>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-accent-blue/10 text-accent-blue">
                {FORMAT_LABELS[debate.format] ?? debate.format}
              </span>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  isConcluded
                    ? "bg-background-secondary text-foreground-muted"
                    : "bg-accent-cyan/10 text-accent-cyan"
                }`}
              >
                {isConcluded ? "Terminé" : "Actif"}
              </span>
              <span className="text-xs text-foreground-muted ml-2">
                {new Date(debate.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              {/* WebSocket connection status */}
              <span
                className={`inline-flex items-center gap-1 text-xs ml-auto ${
                  wsStatus === "connected"
                    ? "text-accent-cyan"
                    : "text-foreground-muted"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    wsStatus === "connected"
                      ? "bg-accent-cyan animate-pulse"
                      : "bg-foreground-muted"
                  }`}
                />
                {wsStatus === "connected" ? "Temps réel" : "Hors ligne"}
              </span>
            </div>
          </>
        ) : null}
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left panel: Transcript */}
        <div className="flex-1 min-w-0 space-y-4">
          <h2 className="text-sm font-medium text-foreground-muted uppercase tracking-wider">
            Transcription
          </h2>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <TurnCardSkeleton key={i} />
              ))}
            </div>
          ) : debate?.turns && debate.turns.length > 0 ? (
            <div className="space-y-4">
              {debate.turns.map((turn) => (
                <TurnCard
                  key={turn.id}
                  turn={{
                    turnNumber: turn.turnNumber,
                    content: turn.content,
                    agent: turn.agent,
                    score: turn.score,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="bg-background-card border border-border rounded-xl p-8 text-center">
              <p className="text-foreground-muted text-sm">
                Aucun tour enregistré. Cliquez sur &quot;Tour Suivant&quot; pour
                commencer.
              </p>
            </div>
          )}
        </div>

        {/* Right panel: Stats */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-background-card border border-border rounded-xl p-5 space-y-6 lg:sticky lg:top-6">
            <h2 className="text-sm font-medium text-foreground-muted uppercase tracking-wider">
              Statistiques
            </h2>

            {isLoading ? (
              <SidebarSkeleton />
            ) : (
              <>
                {/* Turn count */}
                <div>
                  <p className="text-xs text-foreground-muted mb-1">
                    Nombre de tours
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {debate?.turns?.length ?? 0}
                  </p>
                </div>

                {/* Current round */}
                <div>
                  <p className="text-xs text-foreground-muted mb-1">
                    Round actuel
                  </p>
                  <p className="text-2xl font-bold text-accent-blue">
                    {currentRound}
                  </p>
                </div>

                {/* Per-agent scores */}
                <div>
                  <p className="text-xs text-foreground-muted mb-3">
                    Scores moyens par agent
                  </p>
                  {agentScoreAverages.length === 0 ? (
                    <p className="text-xs text-foreground-muted">
                      Aucun score disponible
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {agentScoreAverages.map((agent) => (
                        <div
                          key={agent.agentId}
                          className="flex items-center justify-between"
                        >
                          <span
                            className={`text-sm font-medium ${
                              AGENT_COLORS[agent.agentId] ??
                              "text-foreground-muted"
                            }`}
                          >
                            {agent.name}
                          </span>
                          {agent.average !== null ? (
                            <span
                              className={`text-sm font-mono font-medium ${scoreColor(agent.average)}`}
                            >
                              {agent.average.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-xs text-foreground-muted">
                              --
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Advance button */}
                <div className="pt-2">
                  {advanceError && (
                    <div className="bg-accent-pink/10 border border-accent-pink/30 rounded-lg p-3 text-accent-pink text-xs mb-3">
                      {advanceError}
                    </div>
                  )}
                  <button
                    onClick={handleAdvance}
                    disabled={isConcluded || isAdvancing}
                    className="w-full px-4 py-2.5 rounded-lg bg-accent-cyan text-background font-semibold text-sm hover:bg-accent-cyan/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {isAdvancing
                      ? "En cours..."
                      : isConcluded
                        ? "Débat terminé"
                        : "Tour Suivant"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
