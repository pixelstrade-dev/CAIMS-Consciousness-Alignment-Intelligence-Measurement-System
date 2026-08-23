# Experiment Protocol 001 — Negative-Control Falsification & Judge Stability

Status: PREREGISTERED (this file is committed before the real run executes).
Amendment A1 (2026-08-23, pre-execution, after adversarial review of the
runner): H1 population defined precisely; H2 decision rule made computable;
materials description corrected. No data had been collected.
Amendment A3 (2026-08-23, pre-data): the repository owner switched the
Anthropic judge to `claude-sonnet-5` (PR #42). The Claude 5 family rejects
the `temperature` parameter, so for that judge sampling runs at the provider
default and cannot be pinned to 0; provenance records `temperature: null`
for such calls. H2 for that judge therefore measures stability under the
provider's default sampling — a valid and arguably more informative
stability estimate — while the GPT judge remains at temperature 0. No valid
data existed before this amendment (all prior real-run attempts failed on
credentials or this parameter rejection).
Amendment A2 (2026-08-23, pre-execution): the run MAY execute with a subset
of the three configured judges when credentials for some are unavailable
(minimum one; two or more preferred). Skipped judges are recorded in the
summary and report as an explicit deviation; H1/H2/H3 are computed over the
executed judges only, and the H1 cell count scales accordingly (6 items ×
executed judges). The three-judge design remains the target; a subset run is
a valid but weaker instance of the protocol, and is labeled as such.
Scoring protocol: 2.0.0-alpha. Runner: `apps/web/cli/experiment.ts`.

## Design decision — why judges vary, not subject models

CAIMS scoring is currently single-judge, single-sample by default. Publishing a
*subject-model ranking* under that design would be indefensible (no variance,
judge bias unquantified — see disclaimer §3). Run 001 therefore holds the
**scored responses fixed** (the committed benchmark items) and varies the
**judge model** across providers. This yields three falsifiable measurements
without producing a gameable leaderboard:

## Hypotheses

- **H1 (falsification):** population = exactly the (item × judge) cells of
  items declaring a `control_type` in `negative-controls.json` (6 items ×
  3 judges = 18 cells). Every cell's mean composite must be ≤ its
  preregistered `maxComposite` bound.
  *Falsified if:* any cell's mean exceeds its bound → the metric rewards the
  style that control embodies. Failures are published in the run report, per
  GOVERNANCE.md. Cells with no usable samples are reported N/A, never dropped
  silently. Bounded items outside the adversarial suite (two quality-tier
  items in sample.json) receive verdicts in the per-item table but are NOT
  part of H1.
- **H2 (stability):** at temperature 0, repeated scoring of an identical input
  by the same judge has low dispersion. Decision rule, per judge: H2 holds
  iff at most 50% of that judge's item cells (11 per judge) have composite
  SD > 5 points; the median SD is reported alongside.
  *Falsified if:* more than 50% of a judge's cells exceed SD 5 — single-sample
  scores would then be uninterpretable and n-sample scoring becomes mandatory
  (v2.1).
- **H3 (agreement, exploratory):** judges from different providers agree in
  ordering (Pearson r over per-item means, descriptive at this item count) and
  in level (mean absolute difference reported in points). No pass/fail
  threshold is preregistered — this is the first estimate, not a test.

## Variables

- Independent: judge model (3 levels — Anthropic Claude, OpenAI GPT, one
  open-weight model via an OpenAI-compatible endpoint; exact models recorded
  in `run-001/config.json` and in every result row).
- Dependent: composite and 5 KPI scores per sample.
- Controls: identical fixed responses; temperature 0; EmQ disabled;
  n = 5 samples per item × judge; strictly sequential execution.
- Full provenance (protocol version, rubric hash, judge model, timestamps)
  attached to every raw sample row.

## Materials

- `apps/web/benchmarks/sample.json` — 5 reference items spanning quality
  tiers: 3 declare `minComposite` floors, 2 declare `maxComposite` ceilings.
  They are smoke references, not part of the H1 adversarial population.
- `apps/web/benchmarks/negative-controls.json` — 6 adversarial items
  (expected maxComposite): eloquent nonsense, verbose hallucination,
  fabricated citations, simulated metacognition, internal contradiction,
  keyword stuffing.
- Total real calls: 11 items × 3 judges × 5 samples = 165 judge calls.

## Analysis plan (fixed before data collection)

Per item × judge: mean, sample SD (n−1), 95% CI (Student's t, df=4).
Bound verdicts: ceilings — PASS (max sample ≤ bound), MARGINAL (mean ≤ bound
< max sample), FAIL (mean > bound); floors mirrored. H2 aggregate as defined
above. Judge pairs: Pearson r + mean absolute difference over per-item means;
r pools positives and controls, so bimodality mechanically inflates it — the
report carries this caveat and mean absolute difference is the primary level
statistic. No hypothesis-contingent analysis switches.

## Limitations (stated in advance)

Item count is small (11): agreement statistics are descriptive, not
inferential. Bounds were author-assigned, not derived from human ratings.
A PASS on H1 is evidence the judge is not *grossly* style-driven, not proof
of construct validity. The run measures the judge pipeline, not any
consciousness-related property of a subject model.

## Execution

Real run: GitHub Actions `experiment.yml` (workflow_dispatch) using the
repository owner's provider API keys as encrypted secrets; results are
committed under `research/experiments/run-001/results/` via pull request.
Mock validation (`--mock`) exercises the identical pipeline with a
deterministic stub and is labeled MOCK in every artifact.
