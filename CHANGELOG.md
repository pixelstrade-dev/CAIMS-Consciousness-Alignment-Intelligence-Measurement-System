# Changelog

All notable changes to CAIMS are documented here. The project follows
semantic versioning for the software; the scoring protocol is versioned
independently (see `SCORING_PROTOCOL_VERSION` in
`apps/web/lib/scorers/scoring-engine.ts`) because a protocol change alters
the meaning of scores even when the software API is unchanged.

## [Unreleased] — scoring protocol 2.0.0-alpha

### Changed — BREAKING for score consumers
- Interpretation labels renamed from consciousness language
  (`CONSCIENCE ÉLEVÉE` … `TRAITEMENT MÉCANIQUE`) to proxy language
  (`SCORE PROXY ÉLEVÉ` … `SCORE PROXY MINIMAL`), including the OpenAPI
  enum. Rationale: the previous labels contradicted the project's own
  scientific disclaimer.
- CQ retitled Cognitive-Integration Quotient (behavioral proxy); judge
  prompts no longer describe themselves as consciousness evaluation.
- Debate aggregate metrics corrected: convergence no longer subtracts a
  variance from 100 (unit error that pinned it to 0), alignmentCoherence
  is now AQ spread instead of duplicating the AQ mean, and both the
  orchestrator and the debate route share one implementation.

### Added
- EmQ (Emotional Quotient, experimental): emotional-tone proxy with 10
  clusters and valence/arousal dimensions, informed by Anthropic's
  functional-emotions research but text-level only.
- Provenance envelope on every score: protocol version, rubric prompt
  hash, provider, temperature, applied composite weights.
- Prompt-injection hardening: scored content is angle-bracket-escaped;
  judge prompts carry a treat-content-as-data guard; adversarial tests.
- CI: lockfile enforcement (npm ci), npm audit gate, CodeQL, Dependabot.
- Rate limiting on `GET /api/session`; x-forwarded-for parsing takes the
  first hop only.
- CITATION.cff, this changelog.

### Fixed
- README factual errors: 19 sub-scores (not 18), 6 debate agents (not 5),
  190+ tests (badge said 20), CFI described per the implemented rubric.
- Theory→KPI mapping in the scientific disclaimer now matches the
  implementation (IIT/GWT/HOT proxies all live inside CQ).
- `alignmentCoherence` previously stored CFI values (pre-2.0 fix) and then
  duplicated AQ; see debate metrics above.

## [1.0.0] — 2026-08

Initial public version: 5-KPI scoring engine, multi-agent debate arena,
Next.js dashboard, Anthropic + OpenAI adapters, CLI benchmark, OpenAPI
documentation.
