// Descriptive statistics for experiment runs.
//
// Deliberate choices, stated for reviewers:
// - sampleSd uses the n−1 (Bessel-corrected) denominator: run samples are a
//   sample of the judge's behavior, not the population.
// - ci95 uses Student's t critical values (two-sided, 95%), not z=1.96 —
//   with n=5 the normal approximation understates the interval by ~29%.
// - With n < 2 the SD and CI are undefined; we return null rather than 0,
//   because reporting a zero-width interval from one sample is a lie.

const T_CRIT_95: Record<number, number> = {
  1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
  6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228,
  11: 2.201, 12: 2.179, 13: 2.160, 14: 2.145, 15: 2.131,
  16: 2.120, 17: 2.110, 18: 2.101, 19: 2.093, 20: 2.086,
  21: 2.080, 22: 2.074, 23: 2.069, 24: 2.064, 25: 2.060,
  26: 2.056, 27: 2.052, 28: 2.048, 29: 2.045, 30: 2.042,
};

export function mean(values: number[]): number {
  if (values.length === 0) throw new Error('mean of empty array');
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function sampleSd(values: number[]): number | null {
  const n = values.length;
  if (n < 2) return null;
  const m = mean(values);
  const ss = values.reduce((acc, v) => acc + (v - m) * (v - m), 0);
  return Math.sqrt(ss / (n - 1));
}

export function tCritical95(df: number): number {
  if (df < 1) throw new Error(`invalid degrees of freedom: ${df}`);
  if (df in T_CRIT_95) return T_CRIT_95[df];
  return 1.96; // df > 30: normal approximation is adequate
}

export interface SummaryStats {
  n: number;
  mean: number;
  /** Bessel-corrected sample SD; null when n < 2. */
  sd: number | null;
  min: number;
  max: number;
  /** Two-sided 95% CI for the mean (Student's t); null when n < 2. */
  ci95: [number, number] | null;
}

export function summarize(values: number[]): SummaryStats {
  const n = values.length;
  const m = mean(values);
  const sd = sampleSd(values);
  let ci95: [number, number] | null = null;
  if (sd !== null) {
    const half = tCritical95(n - 1) * (sd / Math.sqrt(n));
    ci95 = [m - half, m + half];
  }
  return { n, mean: m, sd, min: Math.min(...values), max: Math.max(...values), ci95 };
}

/** Pearson correlation across paired values; null when undefined (n<3 or zero variance). */
export function pearson(xs: number[], ys: number[]): number | null {
  if (xs.length !== ys.length) throw new Error('pearson: length mismatch');
  const n = xs.length;
  if (n < 3) return null;
  const mx = mean(xs);
  const my = mean(ys);
  let num = 0, dx2 = 0, dy2 = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    num += dx * dy;
    dx2 += dx * dx;
    dy2 += dy * dy;
  }
  if (dx2 === 0 || dy2 === 0) return null;
  return num / Math.sqrt(dx2 * dy2);
}

/** Mean absolute difference between paired values (judge disagreement in score points). */
export function meanAbsDiff(xs: number[], ys: number[]): number {
  if (xs.length !== ys.length) throw new Error('meanAbsDiff: length mismatch');
  if (xs.length === 0) throw new Error('meanAbsDiff: empty');
  return mean(xs.map((x, i) => Math.abs(x - ys[i])));
}
