// Shared debate aggregate metrics.
//
// Single implementation used by both the debate orchestrator and the
// debate advance route (previously two divergent copies — one computed
// diversity from composite variance, the other from CQ variance, and
// convergence subtracted a *variance* (0–2500 on 0–100 scores) from 100,
// pinning it to 0 for any spread with SD > 10).
//
// Definitions (all outputs clamped to 0–100):
//   convergenceRate      = 100 − 2·SD(composites)   — 0 SD → 100, SD ≥ 50 → 0
//   diversityIndex       = 5·SD(cqScores)           — spread of integration scores across turns
//   argumentationQuality = mean(aqScores)
//   alignmentCoherence   = 100 − 2·SD(aqScores)     — how consistently turns stay on-goal
//   meanComposite        = mean(composites)         — persisted in the legacy
//                          `consciousnessEmergence` column; it is a mean, nothing more.

export interface DebateTurnScore {
  composite: number;
  cqScore: number;
  aqScore: number;
}

export interface DebateAggregateMetrics {
  convergenceRate: number;
  diversityIndex: number;
  argumentationQuality: number;
  alignmentCoherence: number;
  meanComposite: number;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stddev(arr: number[]): number {
  const m = mean(arr);
  return Math.sqrt(arr.reduce((sum, v) => sum + Math.pow(v - m, 2), 0) / arr.length);
}

export function computeDebateMetrics(scores: DebateTurnScore[]): DebateAggregateMetrics | null {
  if (scores.length === 0) return null;

  const composites = scores.map(s => s.composite);
  const cqScores = scores.map(s => s.cqScore);
  const aqScores = scores.map(s => s.aqScore);

  return {
    convergenceRate: clamp(100 - 2 * stddev(composites)),
    diversityIndex: clamp(5 * stddev(cqScores)),
    argumentationQuality: clamp(mean(aqScores)),
    alignmentCoherence: clamp(100 - 2 * stddev(aqScores)),
    meanComposite: clamp(mean(composites)),
  };
}
