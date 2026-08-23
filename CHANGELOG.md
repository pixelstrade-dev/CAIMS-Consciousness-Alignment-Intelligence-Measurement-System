# Changelog

All notable changes to CAIMS are documented here. The project follows
semantic versioning for the software; the scoring protocol is versioned
independently (see `SCORING_PROTOCOL_VERSION` in
`apps/web/lib/scorers/scoring-engine.ts`) because a protocol change alters
the meaning of scores even when the software API is unchanged.

## [Unreleased] — scoring protocol 3.0.0-alpha

### Added — Deterministic citation verification (Phase A4 of the validity program)
- `verifyCitations: true` on `POST /api/score` (opt-in): citation-like
  strings in the response are extracted (DOI, arXiv id, URL, author-year)
  and their EXISTENCE checked against public registries (doi.org handle
  API, arXiv, HTTP status) — no LLM involved. Results attach as
  `data.verification.citations` with per-citation status
  (`verified` / `not_found` / `unverifiable` / `network_error` — a
  network failure NEVER counts as verified or not_found) and totals.
  On the ensemble path a run lifts the evidence level L2→L3. Honest
  limits stated in the payload itself: existence ≠ the source supports
  the claim; author-year strings without identifiers are unverifiable
  by a deterministic checker (Crossref title matching is future work).
  This is the structural answer to Run 001's headline failure: it
  SURFACES fabricated references deterministically (and puts detected
  fabrications in the Evidence Card's caveats) — it does not veto or
  change any score.

### Added — Evidence Card (Phase A3 of the validity program)
- `POST /api/score` now returns `data.evidenceCard` on every path: a
  per-dimension profile (with sd/n and an explicit spread `basis`), a
  demoted `aggregate` (the composite, marked "never to be presented
  alone"), a COMPUTED evidence level (L1 single judge family, L2 ≥2
  provider families, L3 reserved for deterministic verification — Phase
  A4), standing Run 001 caveats, and the constant
  `phenomenalConsciousness: "NOT_ASSESSED"`. `data.scores` is retained
  for compatibility and deprecated as the primary reading. Ensemble
  judge results additionally expose per-KPI sample SDs (`kpiSd`).

### Changed — BREAKING: scoring protocol 3.0.0-alpha (Phase A2 of the validity program)
- CQ sub-dimensions renamed from theory-implying names to what they
  behaviorally observe: `phi_proxy → integration_depth`,
  `gwt_proxy → knowledge_breadth`, `hot_proxy → metacognitive_display`,
  `temporal → temporal_coherence`. The rubric DESCRIPTIONS were also
  rewritten behaviorally (metacognitive_display now explicitly scores
  the display in text, not meta-cognition) — this is a semantic rubric
  change, not a pure rename. The rubric text changed, so the prompt
  hash changed; **v2 and v3 scores are never comparable**.
  `details.cq` response keys and `CQDetails` types use the new names.
  Run 001 artifacts keep the v2 names (historical record of a
  2.0.0-alpha run); Run 002 will execute under 3.0.0-alpha.

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

### Fixed
- Provider-aware default judge model: with `CAIMS_LLM_PROVIDER=openai` and
  no explicit model, the engine used to pass the Anthropic default model
  name to the OpenAI API (guaranteed 404). `scoreInteraction` and the
  ensemble `defaultJudge()` now default to `gpt-4o` under the OpenAI
  provider. Run 001 was unaffected (the experiment runner always passes
  the judge model explicitly).

### Added
- `caims` CLI in `@caims/core` (2.0.0-alpha.2): `npx @caims/core -q ... -r ...`
  or `-f dataset.json` — 5-KPI table or JSON, expected-bound pass/fail with
  exit code 1, proxy disclaimer in the output. CJS binary with shebang.
- Multi-judge ensemble & n-sample scoring in the production API (v2.1):
  `ensemble` and `samples` (1–5) options on `POST /api/score`. Judges are
  configured server-side via `CAIMS_ENSEMBLE_JUDGES` (fail-loudly when
  invalid; 400 when requested but unset). Responses add per-judge results
  (mean ± Bessel-corrected sample SD), failed judges (reported, never
  hidden), and inter-judge agreement (composite spread, mean absolute
  pairwise difference). `scores.*` keep their shape (ensemble means), so
  existing clients and the Python SDK work unchanged. EmQ is not run in
  ensemble mode. See `docs/ensemble-v2.1.md`. Motivated by Run 001's
  12.7-point inter-judge mean absolute difference.
- Experiment runner raw records now carry the judge sampling
  `temperature` (0, or null where the model rejects the parameter), as
  promised in the preprint's provenance section for Run 002.
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
