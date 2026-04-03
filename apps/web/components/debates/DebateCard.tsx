"use client";

import Link from "next/link";

const FORMAT_LABELS: Record<string, string> = {
  expert_panel: "Panel d'Experts",
  devil_advocate: "Avocat du Diable",
  socratic: "Socratique",
  red_team: "Red Team",
  consensus_build: "Construction de Consensus",
};

const AGENT_COLORS: Record<string, string> = {
  "agt-architect": "#00f5d4",
  "agt-researcher": "#4cc9f0",
  "agt-builder": "#f8961e",
  "agt-critic": "#f72585",
  "agt-orchestrator": "#7c3aed",
};

export interface DebateCardProps {
  debate: {
    id: string;
    topic: string;
    format: string;
    status: string;
    createdAt: string;
    agents: { agentId: string; name: string }[];
    _count: { turns: number };
  };
}

export default function DebateCard({ debate }: DebateCardProps) {
  const isActive = debate.status === "active";

  return (
    <Link
      href={`/debates/${debate.id}`}
      className="bg-background-card border border-border rounded-xl p-5 hover:border-accent-cyan/40 transition-colors group block"
    >
      {/* Topic */}
      <h3 className="text-sm font-semibold text-foreground group-hover:text-accent-cyan transition-colors line-clamp-2 mb-3">
        {debate.topic}
      </h3>

      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-accent-blue/10 text-accent-blue">
          {FORMAT_LABELS[debate.format] ?? debate.format}
        </span>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            isActive
              ? "bg-accent-cyan/10 text-accent-cyan"
              : "bg-background-secondary text-foreground-muted"
          }`}
        >
          {isActive ? "Actif" : "Terminé"}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Agent Avatars */}
        <div className="flex -space-x-2">
          {debate.agents.slice(0, 5).map((agent) => (
            <div
              key={agent.agentId}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-background border-2 border-background-card"
              style={{
                backgroundColor: AGENT_COLORS[agent.agentId] ?? "#94a3b8",
              }}
              title={agent.name}
            >
              {agent.name.charAt(0)}
            </div>
          ))}
        </div>

        {/* Turn Count */}
        <span className="text-xs text-foreground-muted">
          {debate._count.turns} tour{debate._count.turns !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Date */}
      <p className="text-xs text-foreground-muted mt-3">
        {new Date(debate.createdAt).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </p>
    </Link>
  );
}
