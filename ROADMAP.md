# Roadmap

Status legend: 🟢 shipped · 🟡 in progress · ⚪ planned · 🔬 research

## v2.0 — Research Preview (target: September 2026)

- 🟢 Proxy-honest terminology across product, API, docs (protocol 2.0.0-alpha)
- 🟢 Provenance envelope on every score (protocol version, prompt hash, provider, temperature, weights)
- 🟢 Prompt-injection hardening with adversarial test suite
- 🟢 Negative-control benchmark suite (falsification-first)
- 🟢 EmQ emotional-tone proxy (experimental, honestly framed)
- 🟢 CI: lockfile enforcement, npm audit gate, CodeQL, Dependabot
- 🟢 Published negative-control run results (Run 001: 12 cells, 6 pass / 2 marginal / 4 fail — failures published in `research/experiments/run-001/`)
- 🟢 API-key authentication (opt-in via `CAIMS_API_KEYS`; fail-closed on misconfiguration)
- ⚪ Initial Prisma migration + provenance columns (queryable protocol version)

## v2.1 — Measurement rigor

- 🟢 N-sample scoring with variance reporting in the production API (`samples` on `/api/score`: mean ± Bessel-corrected sample SD — see `docs/ensemble-v2.1.md`)
- 🟡 Multi-judge ensemble: production endpoint shipped (`ensemble` on `/api/score`, server-side `CAIMS_ENSEMBLE_JUDGES`, per-judge results + inter-judge spread); the open-weight-judge agreement *experiment* (Run 002, provider-bias analysis) still pending
- 🟡 Deterministic evaluators where code beats a judge: citation-EXISTENCE verification SHIPPED (Phase A4 — doi.org/arXiv/URL registries via `verifyCitations` on `/api/score`; lifts evidence level L2→L3; author-year strings without identifiers reported unverifiable; motivated by Run 001's fabricated-citations failure where aggregation buried the EQ alarm). Still open: Crossref title-search matching, contradiction detection (SQ), planted-fact recall (CFI)
- 🟡 `packages/core` extraction: published npm package generated from the app
  sources with a CI anti-drift + orphan gate (step 1 — shipped); workspace
  inversion incl. porting the OpenAI adapter HTTP tests into the package
  (step 2)
- 🟢 Chance-corrected inter-rater reliability (Phase A5): Krippendorff alpha (interval) + ICC(2,1) in `lib/statistics/agreement.ts` (Shrout–Fleiss anchor test), emitted natively by the experiment runner (`interRater`) and post-hoc via `cli/agreement.ts`. Run 001 post-hoc: pooled 0.835/0.846 (bimodality-inflated); disaggregated coefficients carry their own range-restriction/outlier confounds — the honest raw statistic is mean |inter-judge difference| 14.9 pts on controls vs 10.1 on benchmarks (judges disagree more on adversarial content; ~1.5x)
- 🔬 Discriminant-validity study: can CQ be separated from a plain "answer quality" rating?

## v2.2 — Ecosystem

- 🟢 Python SDK — published: `pip install caims` (2.0.0a1, pre-release) — https://pypi.org/project/caims/
- ⚪ Metric plugin interface: implement a custom KPI without forking the core
- ⚪ Reproducible Jupyter notebooks (first evaluation, model comparison, judge agreement)
- ⚪ Public leaderboard with uncertainty-aware ranking (no ordering when intervals overlap)
- 🟢 Zenodo DOI per release — concept DOI 10.5281/zenodo.22069134 (all versions), v2.0.0-alpha version DOI 10.5281/zenodo.22069135

## Research track (no date — gated by evidence, not calendar)

- 🔬 Construct-validity studies against human ratings
- 🔬 Factor analysis of KPI independence; empirically derived weights
- 🔬 External replication program with independent labs
- 🔬 Methodology paper

Want one of these to exist sooner? Open an issue — items move up when contributors show up.
