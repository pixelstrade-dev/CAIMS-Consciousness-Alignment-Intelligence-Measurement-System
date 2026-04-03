"use client";

import { useMemo, useState } from "react";

interface ScoreEntry {
  composite: number;
  cqScore: number;
  aqScore: number;
  cfiScore: number;
  eqScore: number;
  sqScore: number;
  createdAt: string;
}

interface ScoreTimelineProps {
  scores: ScoreEntry[];
}

const KPI_LINES = [
  { key: "cqScore" as const, label: "CQ", color: "#00f5d4" },
  { key: "aqScore" as const, label: "AQ", color: "#4cc9f0" },
  { key: "cfiScore" as const, label: "CFI", color: "#f8961e" },
  { key: "eqScore" as const, label: "EQ", color: "#f72585" },
  { key: "sqScore" as const, label: "SQ", color: "#7c3aed" },
];

const PADDING = { top: 16, right: 16, bottom: 28, left: 36 };
const HEIGHT = 200;

export default function ScoreTimeline({ scores }: ScoreTimelineProps) {
  const [showIndividual, setShowIndividual] = useState(false);

  const { points } = useMemo(() => {
    if (scores.length === 0) return { points: [] };

    // We compute in a viewBox of 600 x HEIGHT
    const vbWidth = 600;
    const cw = vbWidth - PADDING.left - PADDING.right;
    const step = scores.length > 1 ? cw / (scores.length - 1) : 0;

    const pts = scores.map((s, i) => ({
      x: PADDING.left + i * step,
      composite: s.composite,
      cqScore: s.cqScore,
      aqScore: s.aqScore,
      cfiScore: s.cfiScore,
      eqScore: s.eqScore,
      sqScore: s.sqScore,
    }));

    return { points: pts };
  }, [scores]);

  const chartHeight = HEIGHT - PADDING.top - PADDING.bottom;

  function yPos(value: number): number {
    const clamped = Math.max(0, Math.min(100, value));
    return PADDING.top + chartHeight - (clamped / 100) * chartHeight;
  }

  function buildPath(
    data: typeof points,
    accessor: (p: (typeof points)[0]) => number
  ): string {
    if (data.length === 0) return "";
    return data
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${yPos(accessor(p))}`)
      .join(" ");
  }

  if (scores.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-foreground-muted text-sm">
        No score history available
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-foreground-muted font-medium uppercase tracking-wider">
          Score Timeline
        </span>
        <button
          type="button"
          onClick={() => setShowIndividual((prev) => !prev)}
          className="text-xs text-foreground-muted hover:text-foreground transition-colors px-2 py-1 rounded border border-border hover:border-accent-cyan/40"
        >
          {showIndividual ? "Hide" : "Show"} Individual KPIs
        </button>
      </div>
      <svg
        viewBox={`0 0 600 ${HEIGHT}`}
        className="w-full"
        style={{ height: HEIGHT }}
        preserveAspectRatio="none"
      >
        {/* Grid lines at 25, 50, 75 */}
        {[25, 50, 75].map((level) => (
          <g key={level}>
            <line
              x1={PADDING.left}
              y1={yPos(level)}
              x2={600 - PADDING.right}
              y2={yPos(level)}
              stroke="#1e293b"
              strokeWidth="1"
            />
            <text
              x={PADDING.left - 6}
              y={yPos(level)}
              textAnchor="end"
              dominantBaseline="central"
              fill="#94a3b8"
              fontSize="10"
            >
              {level}
            </text>
          </g>
        ))}

        {/* Baseline */}
        <line
          x1={PADDING.left}
          y1={yPos(0)}
          x2={600 - PADDING.right}
          y2={yPos(0)}
          stroke="#1e293b"
          strokeWidth="1"
        />

        {/* Individual KPI lines */}
        {showIndividual &&
          KPI_LINES.map(({ key, color }) => (
            <g key={key}>
              <path
                d={buildPath(points, (p) => p[key])}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeOpacity="0.5"
              />
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={yPos(p[key])}
                  r="2"
                  fill={color}
                  fillOpacity="0.5"
                />
              ))}
            </g>
          ))}

        {/* Composite line (main) */}
        <path
          d={buildPath(points, (p) => p.composite)}
          fill="none"
          stroke="#00f5d4"
          strokeWidth="2.5"
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={yPos(p.composite)}
            r="3.5"
            fill="#00f5d4"
            stroke="#0a0b14"
            strokeWidth="1.5"
          />
        ))}

        {/* X-axis labels (message numbers) */}
        {points.map((p, i) => {
          // Show every label if few points, otherwise show a subset
          const showLabel =
            scores.length <= 12 ||
            i === 0 ||
            i === scores.length - 1 ||
            i % Math.ceil(scores.length / 10) === 0;
          if (!showLabel) return null;
          return (
            <text
              key={i}
              x={p.x}
              y={HEIGHT - 6}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="9"
            >
              {i + 1}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      {showIndividual && (
        <div className="flex flex-wrap gap-3 mt-2 justify-center">
          {KPI_LINES.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-foreground-muted">{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: "#00f5d4" }}
            />
            <span className="text-xs text-foreground">Composite</span>
          </div>
        </div>
      )}
    </div>
  );
}
