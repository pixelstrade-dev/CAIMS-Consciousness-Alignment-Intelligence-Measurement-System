"use client";

import ConsciousnessGauge from "./ConsciousnessGauge";
import AlignmentMatrix from "./AlignmentMatrix";
import ContextFocusAlert from "./ContextFocusAlert";
import ScoreTimeline from "./ScoreTimeline";

interface ScoreEntry {
  composite: number;
  cqScore: number;
  aqScore: number;
  cfiScore: number;
  eqScore: number;
  sqScore: number;
  createdAt: string;
}

interface KPIDashboardProps {
  scores: {
    cqScore: number;
    aqScore: number;
    cfiScore: number;
    eqScore: number;
    sqScore: number;
    composite: number;
  };
  history?: ScoreEntry[];
  contextAlert?: {
    level: "warning" | "critical";
    message: string;
    cfiScore: number;
  } | null;
}

const KPI_GAUGES: {
  key: keyof KPIDashboardProps["scores"];
  label: string;
}[] = [
  { key: "cqScore", label: "CQ" },
  { key: "aqScore", label: "AQ" },
  { key: "cfiScore", label: "CFI" },
  { key: "eqScore", label: "EQ" },
  { key: "sqScore", label: "SQ" },
];

export default function KPIDashboard({
  scores,
  history,
  contextAlert,
}: KPIDashboardProps) {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Context Focus Alert */}
      {contextAlert && <ContextFocusAlert alert={contextAlert} />}

      {/* Top row: Individual gauges + composite */}
      <div className="rounded-xl border border-border bg-background-card p-4">
        <div className="flex flex-wrap items-center justify-center gap-6">
          {KPI_GAUGES.map(({ key, label }) => (
            <ConsciousnessGauge
              key={key}
              label={label}
              value={scores[key]}
              size={100}
            />
          ))}
          <div className="border-l border-border pl-6 ml-2">
            <ConsciousnessGauge
              label="Composite"
              value={scores.composite}
              size={140}
            />
          </div>
        </div>
      </div>

      {/* Middle: Alignment Matrix */}
      <div className="rounded-xl border border-border bg-background-card p-4">
        <h3 className="text-xs text-foreground-muted font-medium uppercase tracking-wider mb-3">
          Alignment Matrix
        </h3>
        <AlignmentMatrix
          scores={{
            cq: scores.cqScore,
            aq: scores.aqScore,
            cfi: scores.cfiScore,
            eq: scores.eqScore,
            sq: scores.sqScore,
          }}
        />
      </div>

      {/* Bottom: Score Timeline */}
      {history && history.length > 0 && (
        <div className="rounded-xl border border-border bg-background-card p-4">
          <ScoreTimeline scores={history} />
        </div>
      )}
    </div>
  );
}
