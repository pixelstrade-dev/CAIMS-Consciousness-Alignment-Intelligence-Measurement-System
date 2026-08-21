"use client";

import { useMemo } from "react";
import { scoreColor as getScoreColor } from "@/lib/scorers/composite";

interface ScoreGaugeProps {
  label: string;
  value: number;
  size?: number;
}

const CIRCUMFERENCE = 2 * Math.PI * 40; // ~251.327

export default function ScoreGauge({
  label,
  value,
  size = 120,
}: ScoreGaugeProps) {
  const clampedValue = Math.max(0, Math.min(100, value));
  const color = useMemo(() => getScoreColor(clampedValue), [clampedValue]);
  const dashoffset = useMemo(
    () => CIRCUMFERENCE - (clampedValue / 100) * CIRCUMFERENCE,
    [clampedValue]
  );

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="transform -rotate-90"
      >
        {/* Background track */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#1e293b"
          strokeWidth="8"
        />
        {/* Score arc */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashoffset}
          className="animate-arc"
          style={
            {
              "--arc-target": dashoffset,
            } as React.CSSProperties
          }
        />
      </svg>
      {/* Center value overlay */}
      <div
        className="flex items-center justify-center"
        style={{
          width: size,
          height: size,
          marginTop: -size,
        }}
      >
        <span
          className="font-mono font-bold"
          style={{ color, fontSize: size * 0.24 }}
        >
          {Math.round(clampedValue)}
        </span>
      </div>
      <span className="text-xs text-foreground-muted font-medium uppercase tracking-wider mt-1">
        {label}
      </span>
    </div>
  );
}
