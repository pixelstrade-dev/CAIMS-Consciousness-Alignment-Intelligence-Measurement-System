#!/usr/bin/env npx tsx
/**
 * POST-HOC inter-rater agreement for a completed experiment run.
 *
 *   npx tsx cli/agreement.ts -s ../../research/experiments/run-001/results/summary.json
 *
 * Reads the committed summary.json (never re-runs anything) and computes
 * Krippendorff alpha (interval) + ICC(2,1) over the per-item, per-judge
 * composite means. Clearly labeled POST-HOC: these coefficients were not
 * preregistered for Run 001; from Run 002 the runner emits them natively
 * (ExperimentSummary.interRater).
 */
import * as fs from 'fs';
import { interRaterAgreement } from '@/lib/statistics/agreement';

const args = process.argv.slice(2);
const sIdx = args.indexOf('-s');
if (sIdx === -1 || !args[sIdx + 1]) {
  console.error('usage: agreement.ts -s <summary.json>');
  process.exit(2);
}
const summary = JSON.parse(fs.readFileSync(args[sIdx + 1], 'utf-8'));
const judges: { id: string }[] = summary.judges;
const meansByItem = new Map<string, number[]>();
for (const it of summary.items) {
  if (it.composite !== null && it.composite !== undefined) {
    const arr = meansByItem.get(it.itemId) ?? [];
    arr.push(it.composite.mean);
    meansByItem.set(it.itemId, arr);
  }
}
const res = interRaterAgreement(Array.from(meansByItem.values()), judges.length);
console.log(`POST-HOC inter-rater agreement — run ${summary.runId} (protocol ${summary.protocolVersion}${summary.mock ? ', MOCK — meaningless' : ''})`);
console.log(`judges: ${judges.map(j => j.id).join(', ')} | items with >=2 ratings: ${res.alphaItems} | complete items (ICC): ${res.iccItems}`);
console.log(`Krippendorff alpha (interval): ${res.krippendorffAlpha === null ? 'undefined' : res.krippendorffAlpha.toFixed(3)}`);
if (res.icc) {
  console.log(`ICC(2,1): ${res.icc.icc2_1.toFixed(3)}  (MSR ${res.icc.msr.toFixed(1)}, MSC ${res.icc.msc.toFixed(1)}, MSE ${res.icc.mse.toFixed(1)}; ${res.icc.subjects} subjects x ${res.icc.raters} raters)`);
} else {
  console.log('ICC(2,1): undefined');
}
console.log(`NOTE: ${res.note}`);

// Pooled-bimodality caveat (same one protocol-001 states for Pearson r):
// controls score low and benchmarks high, which inflates ANY pooled
// agreement coefficient. The per-dataset breakdown is the honest view.
const datasets = Array.from(new Set<string>(summary.items.map((it: { dataset: string }) => it.dataset)));
for (const ds of datasets) {
  const byItem = new Map<string, number[]>();
  for (const it of summary.items) {
    if (it.dataset === ds && it.composite != null) {
      const arr = byItem.get(it.itemId) ?? [];
      arr.push(it.composite.mean);
      byItem.set(it.itemId, arr);
    }
  }
  const sub = interRaterAgreement(Array.from(byItem.values()), judges.length);
  const a = sub.krippendorffAlpha === null ? 'undefined' : sub.krippendorffAlpha.toFixed(3);
  const i = sub.icc ? sub.icc.icc2_1.toFixed(3) : 'undefined';
  // Raw mean absolute pairwise difference — the coefficient-free statistic
  // that survives range-restriction and outlier effects.
  const diffs: number[] = [];
  for (const ratings of Array.from(byItem.values())) {
    for (let x = 0; x < ratings.length; x++) {
      for (let y = x + 1; y < ratings.length; y++) diffs.push(Math.abs(ratings[x] - ratings[y]));
    }
  }
  const meanAbs = diffs.length ? (diffs.reduce((s, d) => s + d, 0) / diffs.length).toFixed(1) : 'n/a';
  console.log(`  ${ds}: alpha ${a}, ICC(2,1) ${i}, mean |judge diff| ${meanAbs} pts (${sub.alphaItems} items) — within-dataset`);
}
console.log('CAVEATS: pooled coefficients are inflated by the bimodal design (as protocol-001 states for Pearson r); WITHIN-dataset coefficients carry their own confounds (range restriction deflates them; at these item counts a single item can swing alpha by ~0.5) — read the raw mean |judge diff| alongside any coefficient.');
