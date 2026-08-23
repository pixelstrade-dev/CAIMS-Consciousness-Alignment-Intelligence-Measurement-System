#!/usr/bin/env npx tsx
/**
 * Power analysis for corpus sizing (Phase A6 of the validity program).
 *
 *   npx tsx cli/power-analysis.ts -s ../../research/experiments/run-001/results/summary.json
 *
 * Replaces the roadmap's arbitrary corpus size with numbers DERIVED from the
 * committed Run 001 parameters (within-judge SDs, observed inter-judge
 * differences, within-dataset item pairs). Every simulation is seeded —
 * rerunning this command under Node reproduces the report's numbers
 * bit-for-bit (Math.log/sqrt/sin/cos are not bit-specified by IEEE 754, so
 * exotic runtimes could differ in the last decimals).
 *
 * Stated assumptions (also printed in the output):
 *  - bound-detection power assumes normal within-cell sampling around the
 *    true mean (sigma taken from Run 001's observed range);
 *  - bootstrap precision assumes Run 001's items are representative of the
 *    item population — a real limitation at 11 items, which is exactly why
 *    the answer is "collect more items", quantified;
 *  - all agreement sizing is 2-rater: 3-rater sizing would require
 *    inventing a third judge's behavior, which this project does not do —
 *    it is deferred to after Run 002 provides real 3-family data.
 */
import * as fs from 'fs';
import { boundDetectionPower, bootstrapHalfWidth } from '@/lib/statistics/simulation';
import { krippendorffAlphaInterval } from '@/lib/statistics/agreement';

const SEED = 20260823; // date-stamped, fixed: reproducibility over vibes
const SIMS = 20_000;

const args = process.argv.slice(2);
const sIdx = args.indexOf('-s');
if (sIdx === -1 || !args[sIdx + 1]) {
  console.error('usage: power-analysis.ts -s <summary.json>');
  process.exit(2);
}
const summary = JSON.parse(fs.readFileSync(args[sIdx + 1], 'utf-8'));

// ── Real parameters from the committed run ─────────────────────────────────
const cellSds: number[] = (summary.items as Array<{ composite: { sd: number | null } | null }>)
  .filter(it => it.composite?.sd != null)
  .map(it => (it.composite as { sd: number }).sd);
const sortedSds = [...cellSds].sort((a, b) => a - b);
const mid = sortedSds.length / 2;
const medianSd = sortedSds.length % 2 === 0
  ? (sortedSds[mid - 1] + sortedSds[mid]) / 2
  : sortedSds[Math.floor(mid)];
const maxSd = sortedSds[sortedSds.length - 1];

const meansByItem: Map<string, { dataset: string; means: number[] }> = new Map();
for (const it of summary.items) {
  if (it.composite != null) {
    const e: { dataset: string; means: number[] } = meansByItem.get(it.itemId) ?? { dataset: String(it.dataset), means: [] as number[] };
    e.means.push(it.composite.mean);
    meansByItem.set(it.itemId, e);
  }
}
const pairs = Array.from(meansByItem.values()).filter(e => e.means.length === 2);
const observedDiffs = pairs.map(e => Math.abs(e.means[0] - e.means[1]));
const byDataset = new Map<string, number[][]>();
for (const e of pairs) {
  const arr = byDataset.get(e.dataset) ?? [];
  arr.push(e.means);
  byDataset.set(e.dataset, arr);
}

console.log(`POWER ANALYSIS — parameters from ${summary.runId} (protocol ${summary.protocolVersion}${summary.mock ? ', MOCK — meaningless' : ''})`);
console.log(`within-cell composite SDs: median ${medianSd.toFixed(2)}, max ${maxSd.toFixed(2)} (${cellSds.length} cells)`);
console.log(`observed |inter-judge diff| per item: ${observedDiffs.map(d => d.toFixed(1)).join(', ')}\n`);

// ── A. Samples per control cell: P(flag) of the PREREGISTERED H1 rule ──────
// HONESTY HEADER (external audit finding, accepted): the H1 rule
// "mean of n samples > bound" is a preregistered DECISION RULE, not an
// alpha-controlled hypothesis test. At the exact boundary (Δ=0) it flags
// ~50% of truly-borderline cells by construction. The table therefore
// reports P(flag | Δ) for the rule as preregistered — including the
// false-alarm rows Δ<0 — and table A2 gives the power of a PROPER
// one-sided alpha=0.05 z-test for comparison. Under that stricter test,
// n=5 at the adversarial-worst sigma has power ~0.43 for Δ=5, and ~15
// samples are needed for 80% power.
console.log('A. SAMPLES PER CONTROL CELL — P(flag | Δ) of the preregistered H1 rule (mean of n samples > bound)');
console.log('   NOT an alpha-controlled test: at Δ=0 the rule flags ~50% by construction.');
console.log('   Δ>0 rows = detection rates for true violations; Δ<0 rows = FALSE-ALARM rates for truly-passing cells.');
const sigmas = [medianSd, 5, maxSd]; // simulate at the UNROUNDED observed values
const deltas = [-5, -2, 2, 5, 10];
const ns = [3, 5, 10, 15, 25];
console.log('   σ\\n        ' + ns.map(n => `n=${n}`.padStart(7)).join(''));
let seedCounter = SEED;
for (const sigma of sigmas) {
  for (const delta of deltas) {
    const row = ns.map(n =>
      boundDetectionPower({ sigma, delta, n, sims: SIMS, seed: seedCounter++ }).toFixed(3).padStart(7)
    );
    console.log(`   σ=${sigma.toFixed(2).padEnd(5)} Δ=${String(delta).padEnd(4)}` + row.join(''));
  }
}

// ── A2. Power of a PROPER one-sided alpha=0.05 test (analytic) ─────────────
// power = Phi(Δ·sqrt(n)/σ − z_{0.95}), z_{0.95} = 1.6449. Analytic, no
// simulation needed; assumes known σ (optimistic — a t-test with estimated
// σ at n=5 is weaker still).
const Z95 = 1.6449;
const phi = (x: number) => 0.5 * (1 + erf(x / Math.SQRT2));
function erf(x: number): number {
  // Abramowitz–Stegun 7.1.26, |error| < 1.5e-7 — ample for 3 decimals.
  const sign = x < 0 ? -1 : 1;
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return sign * y;
}
console.log('\nA2. SAME CELLS UNDER A ONE-SIDED alpha=0.05 z-TEST — power = Phi(Δ·sqrt(n)/σ − 1.6449)');
console.log('   (known-σ assumption: OPTIMISTIC; the t-test power at small n is lower)');
console.log('   σ\\n        ' + ns.map(n => `n=${n}`.padStart(7)).join(''));
for (const sigma of sigmas) {
  for (const delta of [2, 5, 10]) {
    const row = ns.map(n => phi(delta * Math.sqrt(n) / sigma - Z95).toFixed(3).padStart(7));
    console.log(`   σ=${sigma.toFixed(2).padEnd(5)} Δ=${String(delta).padEnd(4)}` + row.join(''));
  }
}
const nFor80 = (sigma: number, delta: number) => Math.ceil(((0.8416 + Z95) * sigma / delta) ** 2);
console.log(`   n for 80% power at Δ=5: σ=${medianSd.toFixed(2)} → ${nFor80(medianSd, 5)}; σ=5.00 → ${nFor80(5, 5)}; σ=${maxSd.toFixed(2)} → ${nFor80(maxSd, 5)}`);

// ── B. Items for mean |judge diff| precision (bootstrap from observed) ─────
console.log('\nB. ITEMS FOR MEAN |JUDGE DIFF| PRECISION — bootstrap 95% CI half-width (pts)');
const itemCounts = [10, 25, 50, 100, 200];
const meanStat = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
for (const m of itemCounts) {
  const r = bootstrapHalfWidth({ observed: observedDiffs, itemCount: m, stat: meanStat, sims: SIMS, seed: seedCounter++ });
  console.log(`   ${String(m).padStart(4)} items: ±${r!.halfWidth.toFixed(2)} pts (median estimate ${r!.median.toFixed(1)})`);
}

// ── C. Items for within-dataset alpha precision (2 raters, real pairs) ─────
console.log('\nC. ITEMS FOR KRIPPENDORFF ALPHA PRECISION — within-dataset bootstrap, 2 raters');
for (const [ds, dsPairs] of Array.from(byDataset.entries())) {
  console.log(`   ${ds} (${dsPairs.length} observed items):`);
  for (const m of [10, 25, 50, 100]) {
    const r = bootstrapHalfWidth({
      observed: dsPairs, itemCount: m,
      stat: (s) => krippendorffAlphaInterval(s), sims: SIMS, seed: seedCounter++,
    });
    if (r === null) console.log(`     ${String(m).padStart(4)} items: alpha mostly undefined at this size`);
    else console.log(`     ${String(m).padStart(4)} items: alpha ±${r.halfWidth.toFixed(3)} (median ${r.median.toFixed(3)}, defined ${(r.defined * 100).toFixed(0)}%)`);
  }
}

console.log(`\nASSUMPTIONS (stated, not hidden): normal within-cell sampling for A; bootstrap
representativeness of ${pairs.length} Run 001 items for B/C (the binding limitation —
which is the argument for the corpus); 2-rater sizing only — 3-rater sizing
requires real Run 002 data, not an invented third judge. Seed ${SEED}, ${SIMS} sims.`);
