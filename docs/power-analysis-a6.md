# Corpus sizing by power analysis (Phase A6, amended)

Status: **COMPUTED** from committed Run 001 parameters. Reproduce with:

```bash
cd apps/web && npx tsx cli/power-analysis.ts -s ../../research/experiments/run-001/results/summary.json
```

(Seed 20260823, 20 000 simulations per cell. Reproduction is bit-for-bit
under Node; other runtimes may differ in the last decimals because
Box–Muller uses `Math.log`/`sin`/`cos`, which IEEE 754 does not
bit-specify. All *parameters* below come from
`research/experiments/run-001/results/summary.json` — no parameter is
invented. The *modeling assumptions* — normality, bootstrap
representativeness — are stated at the end.)

**Amendment (external audit, accepted):** the first version of this
document presented P(flag) of the preregistered H1 rule as "power"
without stating that the rule is a plain decision rule, not an
α-controlled test — at the exact boundary it flags ~50 % of cells by
construction, and its false-alarm rates for near-boundary passing cells
were not shown. This version reports BOTH: the H1 rule's full operating
characteristics (detections AND false alarms), and the power of a
proper one-sided α=0.05 test. Under the proper test, the old headline
"n=5 gives ≥ 0.93 power for 5-point violations at the worst σ" does
NOT hold — it becomes 0.43, and ~15 samples are needed for 80 % power.

## Why

The growth plan inherited a "2 000–5 000 items" corpus target chosen by
round number. The roadmap's own rule is that corpus size must come from
a power analysis. This is that analysis — scoped honestly to what Run
001's parameters can support: sizing **corpus v1**, the next validation
run. Full multi-domain/multi-language sizing is re-run after Run 002
provides 3-judge-family data.

## Inputs (real, from Run 001)

- Within-cell composite SDs across 22 cells: median **1.92**
  (interpolated, even count), max **7.60** (the max sits on adversarial
  items — judges "hesitate" there).
- Observed per-item |inter-judge difference| (11 items): 0.8 … 29.8,
  mean 12.7.
- Within-dataset judge-pair matrices for the α bootstrap (5 benchmark
  items, 6 control items).

## A. Operating characteristics of the preregistered H1 rule

The H1 rule (protocol-001): flag a control cell iff the mean of its n
samples exceeds the bound. **This is a decision rule, not an
α-controlled test**: at Δ=0 it flags ~50 % by construction. Δ>0 rows are
detection rates for true violations; **Δ<0 rows are false-alarm rates**
for cells whose true mean sits |Δ| points on the passing side:

| σ | Δ | n=3 | n=5 | n=10 | n=15 | n=25 |
|---|---|---|---|---|---|---|
| 1.92 (median) | −5 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 |
| 1.92 | −2 | 0.036 | 0.010 | 0.001 | 0.000 | 0.000 |
| 1.92 | 2 | 0.965 | 0.990 | 0.999 | 1.000 | 1.000 |
| 1.92 | 5 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 |
| 1.92 | 10 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 |
| 5.00 | −5 | 0.041 | 0.013 | 0.001 | 0.000 | 0.000 |
| 5.00 | −2 | 0.242 | 0.185 | 0.103 | 0.060 | 0.026 |
| 5.00 | 2 | 0.755 | 0.818 | 0.897 | 0.937 | 0.979 |
| 5.00 | 5 | 0.960 | 0.987 | 0.999 | 1.000 | 1.000 |
| 5.00 | 10 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 |
| 7.60 (adversarial max) | −5 | 0.124 | 0.068 | 0.018 | 0.005 | 0.000 |
| 7.60 | −2 | 0.317 | 0.273 | 0.205 | 0.155 | 0.093 |
| 7.60 | 2 | 0.676 | 0.727 | 0.796 | 0.847 | 0.906 |
| 7.60 | 5 | 0.872 | 0.930 | 0.982 | 0.995 | 1.000 |
| 7.60 | 10 | 0.990 | 0.998 | 1.000 | 1.000 | 1.000 |

**Reading, both directions:** at the adversarial-worst σ, the H1 rule
flags 93 % of true 5-point violations at n=5 — but it also FALSELY
flags 27 % of cells sitting only 2 points on the passing side, and 7 %
of cells 5 points clear. H1 flags are therefore **screening signals to
report, not confirmed violations**; a flagged cell's evidence is the
mean, SD and CI published with it, never the flag alone.

## A2. Power of a proper one-sided α=0.05 test (analytic)

power = Φ(Δ·√n/σ − 1.6449); known-σ assumption, therefore OPTIMISTIC
(a t-test with estimated σ at these n is weaker still):

| σ | Δ | n=3 | n=5 | n=10 | n=15 | n=25 |
|---|---|---|---|---|---|---|
| 1.92 | 2 | 0.564 | 0.753 | 0.951 | 0.992 | 1.000 |
| 1.92 | 5 | 0.998 | 1.000 | 1.000 | 1.000 | 1.000 |
| 5.00 | 2 | 0.171 | 0.226 | 0.352 | 0.462 | 0.639 |
| 5.00 | 5 | 0.535 | 0.723 | 0.935 | 0.987 | 1.000 |
| 5.00 | 10 | 0.966 | 0.998 | 1.000 | 1.000 | 1.000 |
| 7.60 | 2 | 0.117 | 0.145 | 0.208 | 0.266 | 0.371 |
| 7.60 | 5 | 0.307 | **0.431** | 0.669 | 0.817 | 0.950 |
| 7.60 | 10 | 0.737 | 0.903 | 0.994 | 1.000 | 1.000 |

Samples for 80 % power at Δ=5: σ=1.92 → **1**; σ=5.00 → **7**;
σ=7.60 → **15**.

**Reading:** for α-controlled claims of the form "this control violates
its bound (p<0.05)", n=5 suffices only on low-variance cells; on
adversarial-worst cells it takes **n≈15**. The preregistered analysis
for Run 002 therefore treats per-cell flags as H1 screening (table A)
and reserves test-level claims for the aggregate analyses, where the
per-stratum cell counts (35–45) carry the power.

## B. Items for the inter-judge difference estimate

Bootstrap 95 % CI half-width on mean |judge diff| (resampling the 11
observed items):

| items | half-width |
|---|---|
| 10 | ±5.56 pts |
| 25 | ±3.45 |
| 50 | ±2.48 |
| 100 | ±1.75 |
| 200 | ±1.24 |

**Reading:** ~**100 items scored by all judges** pins the
judge-difference statistic to about ±1.7 points — tight enough to detect
meaningful judge drift between runs.

## C. Items for within-dataset α precision (2 raters)

Bootstrap resamples of the observed judge-pair matrices (5 benchmark
items, 6 control items). Because so few distinct values are being
resampled, **treat these half-widths as optimistic lower bounds** — a
real 100-item stratum will contain heterogeneity that 5–6 items cannot
express, so real CIs will be at least this wide:

| items | benchmark-like stratum | adversarial-control-like stratum |
|---|---|---|
| 10 | ±0.405 | ±0.510 |
| 25 | ±0.092 | ±0.315 |
| 50 | ±0.049 | ±0.215 |
| 100 | ±0.031 | ±0.151 |

**Reading:** high-agreement strata are cheap (±0.05 by 50 items).
**Adversarial strata dominate the sizing**: even at 100 items, α there
carries at least ±0.15 — low-agreement content is intrinsically
expensive to measure precisely, which quantifies why "more adversarial
items" is the single highest-value collection priority. (The bootstrap
median α on the control stratum, ≈ 0.16, is consistent with the
disaggregated post-hoc analysis in Phase A5 — the two analyses agree on
where the instrument is weakest.)

## Recommendation — corpus v1 (amended)

- **~200–300 items** total, stratified: 4–6 strata of ~35–50 items,
  with **25–30 % adversarial negative controls** (that stratum needs
  the most items per unit of precision). Unchanged.
- **n = 5 samples per cell**, with amended justification: n=5 supports
  the preregistered H1 SCREENING rule and the aggregate per-stratum
  analyses; it does NOT support per-cell α-controlled violation claims
  at adversarial-worst variance (that takes n≈15 — reserved for
  follow-up runs on cells the screen flags). Bounds should be
  preregistered so that meaningful violations are ≥ 5 points AND
  expected passing means sit ≥ 5 points clear of the bound, keeping H1
  false alarms ≤ ~7 % even at worst σ.
- **≥ 3 judge families** (Run 002 prerequisite). Cost envelope at 250
  items × 5 samples × 3 judges ≈ 3 750 scoring calls per full run.
- Re-run this analysis with Run 002's real 3-rater data before
  committing to the full multi-domain corpus (the 2 000–5 000 scale).

## Assumptions, stated

1. Table A/A2 assume normal within-cell sampling (σ from real cells) —
   the run measured the σ values; normality itself is a modeling
   assumption. A2 additionally assumes known σ (optimistic).
2. Tables B/C assume the 11 Run 001 items are representative — the
   binding limitation at this size, and precisely the argument for
   collecting the corpus. Table C's half-widths are optimistic lower
   bounds for the same reason.
3. All agreement sizing is 2-rater; no multiple-comparison correction
   is applied to the per-cell screen (another reason its flags are
   screening, not claims).
