# Roadmap

Status legend: 🟢 shipped · 🟡 in progress · ⚪ planned · 🔬 research

## v2.0 — Research Preview (target: September 2026)

- 🟢 Proxy-honest terminology across product, API, docs (protocol 2.0.0-alpha)
- 🟢 Provenance envelope on every score (protocol version, prompt hash, provider, temperature, weights)
- 🟢 Prompt-injection hardening with adversarial test suite
- 🟢 Negative-control benchmark suite (falsification-first)
- 🟢 EmQ emotional-tone proxy (experimental, honestly framed)
- 🟢 CI: lockfile enforcement, npm audit gate, CodeQL, Dependabot
- 🟡 Published negative-control run results (pass/fail per control, with judge/model/protocol metadata)
- ⚪ API-key authentication (blocker for any public deployment)
- ⚪ Initial Prisma migration + provenance columns (queryable protocol version)

## v2.1 — Measurement rigor

- ⚪ N-sample scoring with variance reporting (score ± spread instead of naked point estimates)
- ⚪ Multi-judge ensemble experiment: inter-rater agreement across Anthropic / OpenAI / open-weight judges, provider-bias analysis
- ⚪ Deterministic evaluators where code beats a judge: contradiction detection (SQ), planted-fact recall (CFI)
- ⚪ `packages/core` extraction: scoring engine consumable without Next.js
- 🔬 Discriminant-validity study: can CQ be separated from a plain "answer quality" rating?

## v2.2 — Ecosystem

- ⚪ Python SDK (`pip install caims`) — the research community's entry path
- ⚪ Metric plugin interface: implement a custom KPI without forking the core
- ⚪ Reproducible Jupyter notebooks (first evaluation, model comparison, judge agreement)
- ⚪ Public leaderboard with uncertainty-aware ranking (no ordering when intervals overlap)
- ⚪ Zenodo DOI per release

## Research track (no date — gated by evidence, not calendar)

- 🔬 Construct-validity studies against human ratings
- 🔬 Factor analysis of KPI independence; empirically derived weights
- 🔬 External replication program with independent labs
- 🔬 Methodology paper

Want one of these to exist sooner? Open an issue — items move up when contributors show up.
