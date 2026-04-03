"use client";

interface KPIScores {
  cqScore: number;
  aqScore: number;
  cfiScore: number;
  eqScore: number;
  sqScore: number;
  composite: number;
}

interface ContextAlert {
  level: "warning" | "critical";
  message: string;
}

interface KPILivePanelProps {
  scores?: KPIScores | null;
  contextAlert?: ContextAlert | null;
}

const KPI_ENTRIES: Array<{ key: keyof Omit<KPIScores, "composite">; label: string; full: string }> = [
  { key: "cqScore", label: "CQ", full: "Consciousness Quotient" },
  { key: "aqScore", label: "AQ", full: "Alignment Quotient" },
  { key: "cfiScore", label: "CFI", full: "Context Fidelity Index" },
  { key: "eqScore", label: "EQ", full: "Epistemic Quotient" },
  { key: "sqScore", label: "SQ", full: "Stability Quotient" },
];

function getBarColor(value: number): string {
  if (value >= 75) return "bg-accent-cyan";
  if (value >= 50) return "bg-accent-blue";
  if (value >= 25) return "bg-accent-orange";
  return "bg-accent-pink";
}

function getTextColor(value: number): string {
  if (value >= 75) return "text-accent-cyan";
  if (value >= 50) return "text-accent-blue";
  if (value >= 25) return "text-accent-orange";
  return "text-accent-pink";
}

function getCompositeLabel(value: number): string {
  if (value >= 75) return "CONSCIENCE ÉLEVÉE";
  if (value >= 50) return "CONSCIENCE MODÉRÉE";
  if (value >= 25) return "CONSCIENCE FAIBLE";
  return "TRAITEMENT MÉCANIQUE";
}

export default function KPILivePanel({ scores, contextAlert }: KPILivePanelProps) {
  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-border bg-background-secondary">
      {/* Header */}
      <div className="flex h-14 items-center border-b border-border px-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
          KPI en direct
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Context alert banner */}
        {contextAlert && (
          <div
            className={`mb-4 rounded-lg px-3 py-2.5 text-xs font-medium ${
              contextAlert.level === "critical"
                ? "bg-accent-pink/15 text-accent-pink"
                : "bg-accent-orange/15 text-accent-orange"
            }`}
          >
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
              <span>{contextAlert.message}</span>
            </div>
          </div>
        )}

        {scores ? (
          <>
            {/* Composite score */}
            <div className="mb-6 rounded-xl bg-background-card p-4 text-center">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-foreground-muted">
                Score composite
              </p>
              <p className={`text-4xl font-bold tabular-nums ${getTextColor(scores.composite)}`}>
                {scores.composite.toFixed(1)}
              </p>
              <p
                className={`mt-1 text-[11px] font-semibold uppercase tracking-wider ${getTextColor(scores.composite)}`}
              >
                {getCompositeLabel(scores.composite)}
              </p>
            </div>

            {/* Individual KPIs */}
            <div className="space-y-4">
              {KPI_ENTRIES.map(({ key, label, full }) => {
                const value = scores[key];
                return (
                  <div key={key}>
                    <div className="mb-1 flex items-baseline justify-between">
                      <span className="text-xs font-medium text-foreground" title={full}>
                        {label}
                      </span>
                      <span className={`text-xs font-semibold tabular-nums ${getTextColor(value)}`}>
                        {value.toFixed(1)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-background">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getBarColor(value)}`}
                        style={{ width: `${Math.min(value, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Placeholder when no scores */
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
            <svg
              className="mb-3 h-10 w-10 text-foreground-muted/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605"
              />
            </svg>
            <p className="text-xs text-foreground-muted">
              En attente d&apos;un message...
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
