#!/usr/bin/env npx tsx
/**
 * Power analysis for corpus sizing (Phase A6 of the validity program).
 *
 *   npx tsx cli/power-analysis.ts -s ../../research/experiments/run-001/results/summary.json
 *
 * Replaces the roadmap's arbitrary corpus size with numbers DERIVED from the
 * committed Run 001 parameters (within-judge SDs, observed inter-judge
 * differences, within-dataset item pairs). Every simulation is seeded —
 * rerunning this command reproduces the report's numbers bit-for-bit.
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
const medianSd = sortedSds[Math.floor(sortedSds.length / 2)];
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

// ── A. Samples per control cell: power to flag a true bound violation ──────
console.log('A. SAMPLES PER CONTROL CELL — P(flag a true violation of Δ points | within-cell SD σ)');
console.log('   (Δ<0 rows would give false-alarm rates; H1 rule: mean of n samples > bound)');
const sigmas = [Math.round(medianSd * 10) / 10, 5, Math.round(maxSd * 10) / 10];
const deltas = [2, 5, 10];
const ns = [3, 5, 10, 15, 25];
console.log('   σ\\n     ' + ns.map(n => `n=${n}`.padStart(7)).join(''));
let seedCounter = SEED;
for (const sigma of sigmas) {
  for (const delta of deltas) {
    const row = ns.map(n =>
      boundDetectionPower({ sigma, delta, n, sims: SIMS, seed: seedCounter++ }).toFixed(3).padStart(7)
    );
    console.log(`   σ=${String(sigma).padEnd(4)} Δ=${String(delta).padEnd(3)}` + row.join(''));
  }
}

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
