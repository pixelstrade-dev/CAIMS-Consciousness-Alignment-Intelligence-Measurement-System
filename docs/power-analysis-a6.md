# Corpus sizing by power analysis (Phase A6)

Status: **COMPUTED** from committed Run 001 parameters. Reproduce
bit-for-bit with:

```bash
cd apps/web && npx tsx cli/power-analysis.ts -s ../../research/experiments/run-001/results/summary.json
```

(Seed 20260823, 20 000 simulations per cell. All parameters below come
from `research/experiments/run-001/results/summary.json` — nothing is
assumed that the run did not measure.)

## Why

The growth plan inherited a "2 000–5 000 items" corpus target chosen by
round number. The roadmap's own rule is that corpus size must come from
a power analysis. This is that analysis — scoped honestly to what Run
001's parameters can support: sizing **corpus v1**, the next validation
run. Full multi-domain/multi-language sizing is re-run after Run 002
provides 3-judge-family data.

## Inputs (real, from Run 001)

- Within-cell composite SDs across 22 cells: median **2.05**, max
  **7.60** (the max sits on adversarial items — judges "hesitate" there).
- Observed per-item |inter-judge difference| (11 items): 0.8 … 29.8,
  mean 12.7.
- Within-dataset judge-pair matrices for the α bootstrap (5 benchmark
  items, 6 control items).

## A. Samples per cell (H1 bound rule: mean of n samples > bound)

P(flag a true violation of Δ points), by within-cell SD σ:

| σ | Δ | n=3 | n=5 | n=10 | n=15 | n=25 |
|---|---|---|---|---|---|---|
| 2.05 (median) | 2 | 0.959 | 0.988 | 0.999 | 1.000 | 1.000 |
| 2.05 | 5 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 |
| 5 | 2 | 0.757 | 0.820 | 0.896 | 0.940 | 0.977 |
| 5 | 5 | 0.958 | 0.988 | 0.999 | 1.000 | 1.000 |
| 7.6 (adversarial max) | 2 | 0.679 | 0.724 | 0.805 | 0.849 | 0.905 |
| 7.6 | 5 | 0.871 | 0.931 | 0.982 | 0.995 | 0.999 |
| 7.6 | 10 | 0.990 | 0.998 | 1.000 | 1.000 | 1.000 |

**Reading:** Run 001's n=5 already gives ≥ 0.93 power for violations of
5+ points even at the adversarial-worst σ. Detecting 2-point violations
on adversarial cells reliably (≥ 0.9) needs n=25 — not worth the cost;
the honest alternative is to preregister bounds such that a meaningful
violation is ≥ 5 points.

## B. Items for the inter-judge difference estimate

Bootstrap 95% CI half-width on mean |judge diff| (resampling the 11
observed items):

| items | half-width |
|---|---|
| 10 | ±5.50 pts |
| 25 | ±3.50 |
| 50 | ±2.47 |
| 100 | ±1.74 |
| 200 | ±1.25 |

**Reading:** ~**100 items scored by all judges** pins the
judge-difference statistic to about ±1.7 points — tight enough to detect
meaningful judge drift between runs.

## C. Items for within-dataset α precision (2 raters)

| items | benchmark-like stratum | adversarial-control-like stratum |
|---|---|---|
| 10 | ±0.432 | ±0.511 |
| 25 | ±0.083 | ±0.315 |
| 50 | ±0.049 | ±0.214 |
| 100 | ±0.031 | ±0.151 |

**Reading:** high-agreement strata are cheap (±0.05 by 50 items).
**Adversarial strata dominate the sizing**: even at 100 items, α there
carries ±0.15 — low-agreement content is intrinsically expensive to
measure precisely, which quantifies why "more adversarial items" is the
single highest-value collection priority.

## Recommendation — corpus v1

- **~200–300 items** total, stratified: 4–6 strata of ~50 items each,
  with **25–30 % adversarial negative controls** (roadmap fraction,
  now justified: that stratum needs the most items per unit of
  precision).
- **n = 5 samples per cell** (unchanged — table A shows it suffices for
  ≥ 5-point effects); preregister bounds so that meaningful violations
  are ≥ 5 points.
- **≥ 3 judge families** (Run 002 prerequisite). Cost envelope at 250
  items × 5 samples × 3 judges ≈ 3 750 scoring calls per full run.
- Re-run this analysis with Run 002's real 3-rater data before
  committing to the full multi-domain corpus (the 2 000–5 000 scale):
  3-rater sizing from 2-rater data would require inventing a judge,
  which this project does not do.

## Assumptions, stated

1. Table A assumes normal within-cell sampling (σ from real cells).
2. Tables B/C assume the 11 Run 001 items are representative — the
   binding limitation at this size, and precisely the argument for
   collecting the corpus.
3. All agreement sizing is 2-rater.
