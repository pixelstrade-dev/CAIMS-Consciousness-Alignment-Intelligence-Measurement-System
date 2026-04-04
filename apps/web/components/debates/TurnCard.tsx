"use client";

const AGENT_COLORS: Record<string, string> = {
  "agt-architect": "#00f5d4",
  "agt-researcher": "#4cc9f0",
  "agt-builder": "#f8961e",
  "agt-critic": "#f72585",
  "agt-orchestrator": "#7c3aed",
};

const AGENT_TAILWIND_TEXT: Record<string, string> = {
  "agt-architect": "text-accent-cyan",
  "agt-researcher": "text-accent-blue",
  "agt-builder": "text-accent-orange",
  "agt-critic": "text-accent-pink",
  "agt-orchestrator": "text-accent-purple",
};

function scoreColor(score: number): string {
  if (score >= 0.7) return "text-accent-cyan";
  if (score >= 0.4) return "text-accent-blue";
  if (score >= 0.2) return "text-accent-orange";
  return "text-accent-pink";
}

export interface TurnCardProps {
  turn: {
    turnNumber: number;
    content: string;
    agent: {
      name: string;
      role: string;
      agentId: string;
    };
    score?: { composite: number } | null;
  };
}

export default function TurnCard({ turn }: TurnCardProps) {
  const agentColor = AGENT_COLORS[turn.agent.agentId] ?? "#94a3b8";
  const agentTextClass =
    AGENT_TAILWIND_TEXT[turn.agent.agentId] ?? "text-foreground-muted";

  return (
    <div className="bg-background-card border border-border rounded-xl p-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-background shrink-0"
            style={{ backgroundColor: agentColor }}
          >
            {turn.agent.name.charAt(0)}
          </div>
          <div>
            <p className={`text-sm font-semibold ${agentTextClass}`}>
              {turn.agent.name}
            </p>
            <p className="text-xs text-foreground-muted capitalize">
              {turn.agent.role}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {turn.score?.composite != null && (
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full bg-background-secondary ${scoreColor(turn.score.composite)}`}
            >
              {turn.score.composite.toFixed(3)}
            </span>
          )}
          <span className="text-xs text-foreground-muted bg-background-secondary px-2 py-0.5 rounded-full">
            #{turn.turnNumber}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
        {turn.content}
      </div>
    </div>
  );
}
