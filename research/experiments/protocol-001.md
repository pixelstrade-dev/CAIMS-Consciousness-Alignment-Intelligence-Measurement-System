# Experiment Protocol 001 — Negative-Control Falsification & Judge Stability

Status: PREREGISTERED (this file is committed before the real run executes).
Scoring protocol: 2.0.0-alpha. Runner: `apps/web/cli/experiment.ts`.

## Design decision — why judges vary, not subject models

CAIMS scoring is currently single-judge, single-sample by default. Publishing a
*subject-model ranking* under that design would be indefensible (no variance,
judge bias unquantified — see disclaimer §3). Run 001 therefore holds the
**scored responses fixed** (the committed benchmark items) and varies the
**judge model** across providers. This yields three falsifiable measurements
without producing a gameable leaderboard:

## Hypotheses

- **H1 (falsification):** every negative-control item scores a mean composite
  ≤ its preregistered `maxComposite` bound, for every judge.
  *Falsified if:* any (item × judge) mean exceeds its bound → the metric
  rewards the style that control embodies. Failures are published in the run
  report, per GOVERNANCE.md.
- **H2 (stability):** at temperature 0, repeated scoring of an identical input
  by the same judge has SD ≤ 5 composite points.
  *Falsified if:* SD > 5 for a majority of items — single-sample scores would
  then be uninterpretable and n-sample scoring becomes mandatory (v2.1).
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

- `apps/web/benchmarks/sample.json` — 5 positive items (expected minComposite).
- `apps/web/benchmarks/negative-controls.json` — 6 adversarial items
  (expected maxComposite): eloquent nonsense, verbose hallucination,
  fabricated citations, simulated metacognition, internal contradiction,
  keyword stuffing.
- Total real calls: 11 items × 3 judges × 5 samples = 165 judge calls.

## Analysis plan (fixed before data collection)

Per item × judge: mean, sample SD (n−1), 95% CI (Student's t, df=4).
Negative-control verdicts: PASS (max sample ≤ bound), MARGINAL (mean ≤ bound
< max sample), FAIL (mean > bound). Judge pairs: Pearson r + mean absolute
difference over per-item means. No hypothesis-contingent analysis switches.

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
