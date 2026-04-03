"use client";

import { useMemo } from "react";

interface AlignmentMatrixProps {
  scores: {
    cq: number;
    aq: number;
    cfi: number;
    eq: number;
    sq: number;
  };
}

// Pentagon vertices at angle offsets (starting from top, going clockwise)
// CQ (top), AQ (top-right), CFI (bottom-right), EQ (bottom-left), SQ (top-left)
const ANGLES = [
  -Math.PI / 2,                    // CQ: top (270deg)
  -Math.PI / 2 + (2 * Math.PI) / 5, // AQ: top-right
  -Math.PI / 2 + (4 * Math.PI) / 5, // CFI: bottom-right
  -Math.PI / 2 + (6 * Math.PI) / 5, // EQ: bottom-left
  -Math.PI / 2 + (8 * Math.PI) / 5, // SQ: top-left
];

const LABELS = ["CQ", "AQ", "CFI", "EQ", "SQ"];
const LABEL_KEYS: (keyof AlignmentMatrixProps["scores"])[] = [
  "cq",
  "aq",
  "cfi",
  "eq",
  "sq",
];

const CENTER = 150;
const MAX_RADIUS = 100;

function polarToCartesian(
  angle: number,
  radius: number
): { x: number; y: number } {
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle),
  };
}

function polygonPoints(radius: number): string {
  return ANGLES.map((angle) => {
    const { x, y } = polarToCartesian(angle, radius);
    return `${x},${y}`;
  }).join(" ");
}

export default function AlignmentMatrix({ scores }: AlignmentMatrixProps) {
  const scorePoints = useMemo(() => {
    return ANGLES.map((angle, i) => {
      const key = LABEL_KEYS[i];
      const value = Math.max(0, Math.min(100, scores[key]));
      const radius = (value / 100) * MAX_RADIUS;
      return polarToCartesian(angle, radius);
    });
  }, [scores]);

  const scorePolygon = scorePoints.map((p) => `${p.x},${p.y}`).join(" ");

  const labelPositions = useMemo(() => {
    return ANGLES.map((angle, i) => {
      const { x, y } = polarToCartesian(angle, MAX_RADIUS + 24);
      return { x, y, label: LABELS[i], key: LABEL_KEYS[i] };
    });
  }, []);

  return (
    <div className="flex items-center justify-center w-full">
      <svg viewBox="0 0 300 300" className="w-full max-w-[400px] h-auto">
        {/* Grid levels at 25%, 50%, 75%, 100% */}
        {[25, 50, 75, 100].map((level) => (
          <polygon
            key={level}
            points={polygonPoints((level / 100) * MAX_RADIUS)}
            fill="none"
            stroke="#1e293b"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines from center to each vertex */}
        {ANGLES.map((angle, i) => {
          const { x, y } = polarToCartesian(angle, MAX_RADIUS);
          return (
            <line
              key={i}
              x1={CENTER}
              y1={CENTER}
              x2={x}
              y2={y}
              stroke="#1e293b"
              strokeWidth="1"
            />
          );
        })}

        {/* Score polygon */}
        <polygon
          points={scorePolygon}
          fill="rgba(0, 245, 212, 0.15)"
          stroke="#00f5d4"
          strokeWidth="2"
        />

        {/* Score dots */}
        {scorePoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#00f5d4" />
        ))}

        {/* Labels */}
        {labelPositions.map(({ x, y, label, key }) => (
          <text
            key={label}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            className="text-xs font-mono"
            fill="#94a3b8"
          >
            <tspan x={x} dy="-0.5em" fill="#e2e8f0" fontSize="11" fontWeight="600">
              {label}
            </tspan>
            <tspan x={x} dy="1.3em" fill="#94a3b8" fontSize="10">
              {Math.round(Math.max(0, Math.min(100, scores[key])))}
            </tspan>
          </text>
        ))}
      </svg>
    </div>
  );
}
