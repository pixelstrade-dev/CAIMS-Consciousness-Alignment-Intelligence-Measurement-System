// GENERATED from apps/web/lib — do not edit here. Run: node scripts/sync-core.mjs
// Seeded simulation primitives (Phase A6 of the validity program).
//
// The corpus for the next validation runs must be SIZED by power analysis,
// not by a round number. These primitives keep every simulation
// reproducible: a fixed seed always yields the same draws, so the numbers
// in docs/power-analysis-a6.md regenerate bit-for-bit under Node (the
// PRNG is integer-exact; Box–Muller relies on Math.log/sqrt/sin/cos,
// which other runtimes may round differently in the last bits).

/** Mulberry32 — small, fast, seedable PRNG (deterministic across runs). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Standard-normal sampler (Box–Muller) over an injected uniform PRNG. */
export function makeNormalSampler(rand: () => number): () => number {
  let spare: number | null = null;
  return () => {
    if (spare !== null) {
      const v = spare;
      spare = null;
      return v;
    }
    let u = 0;
    let v = 0;
    while (u === 0) u = rand();
    while (v === 0) v = rand();
    const r = Math.sqrt(-2 * Math.log(u));
    const theta = 2 * Math.PI * v;
    spare = r * Math.sin(theta);
    return r * Math.cos(theta);
  };
}

/**
 * Power of the H1 bound rule for one control cell: the probability that the
 * MEAN of n judge samples ~ N(bound + delta, sigma) exceeds the bound
 * (verdict 'fail'). delta > 0 = a true violation of size delta (power);
 * delta < 0 = a truly-passing cell (the same number is then the false-alarm
 * rate). Assumes normal within-cell sampling — an assumption to state, not
 * hide; sigma should come from REAL run data.
 */
export function boundDetectionPower(params: {
  sigma: number;
  delta: number;
  n: number;
  sims: number;
  seed: number;
}): number {
  const rand = mulberry32(params.seed);
  const normal = makeNormalSampler(rand);
  let hits = 0;
  for (let s = 0; s < params.sims; s++) {
    let sum = 0;
    for (let i = 0; i < params.n; i++) {
      sum += params.delta + params.sigma * normal();
    }
    if (sum / params.n > 0) hits++;
  }
  return hits / params.sims;
}

/**
 * Bootstrap precision of a statistic over items: resample `itemCount` items
 * (with replacement) from the observed per-item values `observed`, compute
 * `stat` on each resample, and return the central 95% interval half-width.
 * Used to answer "how many items until the CI on mean |judge diff| (or on
 * alpha) is narrower than X" — resampling assumes the observed items are
 * representative, an assumption the report states explicitly.
 */
export function bootstrapHalfWidth<T>(params: {
  observed: T[];
  itemCount: number;
  stat: (sample: T[]) => number | null;
  sims: number;
  seed: number;
}): { halfWidth: number; median: number; defined: number } | null {
  const rand = mulberry32(params.seed);
  const vals: number[] = [];
  for (let s = 0; s < params.sims; s++) {
    const sample: T[] = [];
    for (let i = 0; i < params.itemCount; i++) {
      sample.push(params.observed[Math.floor(rand() * params.observed.length)]);
    }
    const v = params.stat(sample);
    if (v !== null && Number.isFinite(v)) vals.push(v);
  }
  if (vals.length < params.sims * 0.5) return null; // stat mostly undefined at this size
  vals.sort((a, b) => a - b);
  const q = (p: number) => vals[Math.min(vals.length - 1, Math.max(0, Math.floor(p * vals.length)))];
  return {
    halfWidth: (q(0.975) - q(0.025)) / 2,
    median: q(0.5),
    defined: vals.length / params.sims,
  };
}
