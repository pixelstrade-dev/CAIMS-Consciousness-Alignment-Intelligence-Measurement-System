"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDebates, useCreateDebate } from "@/hooks/use-debates";
import type { DebateFormat } from "@/lib/scorers/types";
import DebateCard from "@/components/debates/DebateCard";

const FORMATS: { value: DebateFormat; label: string }[] = [
  { value: "expert_panel", label: "Panel d'Experts" },
  { value: "devil_advocate", label: "Avocat du Diable" },
  { value: "socratic", label: "Socratique" },
  { value: "red_team", label: "Red Team" },
  { value: "consensus_build", label: "Construction de Consensus" },
];

const AGENTS = [
  { id: "agt-architect", name: "ARCHITECT" },
  { id: "agt-researcher", name: "RESEARCHER" },
  { id: "agt-builder", name: "BUILDER" },
  { id: "agt-critic", name: "CRITIC" },
  { id: "agt-orchestrator", name: "ORCHESTRATOR" },
  { id: "agt-ethicist", name: "ETHICIST" },
];

function DebateCardSkeleton() {
  return (
    <div className="bg-background-card border border-border rounded-xl p-5 animate-pulse">
      <div className="h-4 w-3/4 rounded bg-background-secondary mb-3" />
      <div className="flex gap-2 mb-4">
        <div className="h-5 w-24 rounded-full bg-background-secondary" />
        <div className="h-5 w-16 rounded-full bg-background-secondary" />
      </div>
      <div className="flex justify-between items-center">
        <div className="flex -space-x-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full bg-background-secondary border-2 border-background-card"
            />
          ))}
        </div>
        <div className="h-3 w-12 rounded bg-background-secondary" />
      </div>
    </div>
  );
}

export default function DebatesPage() {
  const router = useRouter();
  const { debates, isLoading, error: listError } = useDebates();
  const {
    createDebate,
    isLoading: isCreating,
    error: createError,
  } = useCreateDebate();

  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState<DebateFormat>("expert_panel");
  const [selectedAgents, setSelectedAgents] = useState<string[]>(
    AGENTS.map((a) => a.id)
  );

  function toggleAgent(agentId: string) {
    setSelectedAgents((prev) =>
      prev.includes(agentId)
        ? prev.filter((id) => id !== agentId)
        : [...prev, agentId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim() || selectedAgents.length === 0) return;

    const result = await createDebate({
      topic: topic.trim(),
      format,
      agentIds: selectedAgents,
    });

    if (result) {
      router.push(`/debates/${result.debateId}`);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          Arène de Débats
        </h1>
        <p className="text-foreground-muted text-sm mt-1">
          Lancez des débats multi-agents et explorez les perspectives
        </p>
      </div>

      {/* New Debate Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-background-card border border-border rounded-xl p-6 space-y-5"
      >
        <h2 className="text-lg font-semibold text-foreground">
          Nouveau Débat
        </h2>

        {/* Topic */}
        <div>
          <label
            htmlFor="topic"
            className="block text-xs font-medium text-foreground-muted uppercase tracking-wider mb-2"
          >
            Sujet
          </label>
          <textarea
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Décrivez le sujet du débat..."
            rows={3}
            className="w-full bg-background-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/30 resize-none"
          />
        </div>

        {/* Format */}
        <div>
          <label
            htmlFor="format"
            className="block text-xs font-medium text-foreground-muted uppercase tracking-wider mb-2"
          >
            Format
          </label>
          <select
            id="format"
            value={format}
            onChange={(e) => setFormat(e.target.value as DebateFormat)}
            className="w-full sm:w-72 bg-background-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/30 appearance-none cursor-pointer"
          >
            {FORMATS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {/* Agent Selection */}
        <div>
          <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider mb-3">
            Agents
          </p>
          <div className="flex flex-wrap gap-3">
            {AGENTS.map((agent) => {
              const isSelected = selectedAgents.includes(agent.id);
              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => toggleAgent(agent.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    isSelected
                      ? "border-accent-cyan/50 bg-accent-cyan/10 text-accent-cyan"
                      : "border-border bg-background-secondary text-foreground-muted hover:border-foreground-muted/30"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full transition-colors ${
                      isSelected ? "bg-accent-cyan" : "bg-foreground-muted/30"
                    }`}
                  />
                  {agent.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Error */}
        {createError && (
          <div className="bg-accent-pink/10 border border-accent-pink/30 rounded-lg p-3 text-accent-pink text-sm">
            {createError}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isCreating || !topic.trim() || selectedAgents.length === 0}
          className="px-6 py-2.5 rounded-lg bg-accent-cyan text-background font-semibold text-sm hover:bg-accent-cyan/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isCreating ? "Création en cours..." : "Lancer le débat"}
        </button>
      </form>

      {/* Recent Debates */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Débats Récents
        </h2>

        {listError && (
          <div className="bg-accent-pink/10 border border-accent-pink/30 rounded-lg p-4 text-accent-pink text-sm mb-4">
            Erreur lors du chargement: {listError}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <DebateCardSkeleton key={i} />
            ))}
          </div>
        ) : debates.length === 0 ? (
          <div className="bg-background-card border border-border rounded-xl p-8 text-center">
            <p className="text-foreground-muted">
              Aucun débat trouvé. Lancez votre premier débat ci-dessus.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {debates.map((debate) => (
              <DebateCard key={debate.id} debate={debate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
