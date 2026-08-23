# Validity program — Phase A closure report

Date: 2026-08-23. Trigger: an external audit scored "scientific validity
of the measurements" at 2/10. Phase A is the part of the response that
can be built in code and protocol; it is now complete and merged
(PRs #57–#63). Phase B — the part that requires new empirical data and
human work — is specified but not started, and **the validity score
cannot approach its target without it**. This report says exactly what
changed, what it is honest to claim now, and what still caps the score.

## What the audit attacked, and what Phase A did about it

| Audit criticism | Phase A answer | Where |
|---|---|---|
| Construct names implied theories (Φ/IIT, GWT, HOT) that were never implemented | v3 renames to behavioral names (`integration_depth`, `knowledge_breadth`, `metacognitive_display`, `temporal_coherence`); protocol 3.0.0-alpha; v2/v3 declared never comparable | A2, #58 |
| No definition of what each score measures or may claim | Construct registry: one card per metric with measurement target, allowed/prohibited claims, known confounds, validity-evidence fields where "none" is legal but absence is not; CI validator locks `consciousness_claim: "prohibited"` and `causal_claim: false` | A1, #57 (7 cards; the 8th, PIGA, added by #63) |
| Single opaque number invites over-reading | Evidence Card is the API's primary output: profile-first, computed evidence levels L1/L2/L3, `phenomenalConsciousness: "NOT_ASSESSED"`, spread basis, standing caveats | A3, #59 |
| Judges cannot verify facts; fake citations defeated the composite (Run 001's headline failure) | Deterministic citation verification against public registries (DOI handle API, arXiv API); registry-only fetching (generic URLs never fetched); honest `unverifiable` class; verification-effectiveness gates the L3 evidence lift; it surfaces fabricated references in caveats — it does not veto scores, and that limit is stated | A4, #60 |
| No reliability analysis | Krippendorff α (interval) + ICC(2,1), validated against a published anchor (Shrout–Fleiss 1979 → 0.29) plus hand-computed anchors; post-hoc disaggregated analysis of Run 001: pooled α 0.835 is bimodality-inflated; the honest headline is mean \|judge diff\| 14.9 pts on adversarial controls vs 10.1 on benchmarks (~1.5×); wired into the experiment runner for future runs | A5, #61 |
| Corpus size picked by round number | Seeded power analysis from Run 001's measured parameters: corpus v1 ≈ 200–300 items, 25–30 % adversarial, ~100 all-judge items pin judge drift to ±1.7 pts; 3-rater sizing explicitly deferred to real Run 002 data. AMENDED post-audit: the per-cell H1 rule is a screening rule, not an α-controlled test — n=5 screens ≥5-pt violations (0.93 detection at worst σ, false alarms published), while α=0.05 per-cell claims at worst σ need n≈15 (see the amended `power-analysis-a6.md`) | A6, #62 |
| Method offers nothing new over "LLM-as-judge with a rubric" | CAIMS-PIGA: judge-as-classifier + deterministic scoring matrix — the judge produces no numbers, only a 5-class classification with no answer key; scores are process-scored (a lucky silent guess earns zero behavior credit — the guess outcome is recorded, never scored) and reproducible bit-for-bit given a classification; anti-gaming lives in the arithmetic (always-ask = 20/5 on controls) and is asserted exactly by tests | A7, #63 |

Everything above was adversarially reviewed before merge (independent
recomputation of the math against reference implementations and
anchors; overclaim hunts). The reviews themselves are session history,
not repo artifacts; what the repo carries is their surviving outcomes —
the committed correction notes. Two of those corrections were turned
against this project's own drafts: the A5
"reliability collapses on adversarial content" claim was itself
confounded (leave-one-out and range-restriction effects) and was
replaced by the weaker honest statistic; the A7 v0.1 composite
arithmetic contradicted its own preregistered claims and was fixed in
the formula, with the correction history kept in the spec.

## What it is honest to claim now

- Every metric has a declared, CI-enforced claim boundary; consciousness
  and causal claims are prohibited by construction, not by promise.
- The instrument's failure modes are measured, published, and scoped
  correctly (the fake-citations failure is a composite-level aggregation
  failure — EQ partially flagged it and 12 % weight could not veto).
- The statistics in the repo recompute against anchors — one published
  (Shrout–Fleiss 1979) and the rest hand-computed — and every
  simulation is seeded and reproducible.
- The methodological contribution (PIGA's classifier/deterministic
  split, Evidence Cards, registry-only deterministic verification,
  aggregation-buries-the-alarm analysis) is genuinely novel as a
  package, and is preregistered before any validation run.

## What still caps the score — Phase B, and who can do what

No amount of further code moves the validity score much from here. The
remaining gaps require new data:

1. **Run 002 with ≥ 3 judge families** (owner: add BOTH
   `OPENWEIGHT_API_KEY` and `OPENWEIGHT_BASE_URL` as repository
   **Secrets**, set the third judge's `model` in
   `research/experiments/run-001/config.json`'s successor to the
   endpoint's exact identifier, then run the Experiment workflow —
   Run 001 recorded exactly this judge as skipped for a missing env
   var). Unlocks: real 3-rater α/ICC, PIGA classification agreement
   (both channels), 3-rater corpus re-sizing.
2. **Corpus v1** (~200–300 items per the A6 sizing) — item authoring can
   be assisted, but adversarial-control quality control needs human
   review.
3. **Human annotation** of PIGA intent spaces and expectation labels
   (≥ 3 annotators) — the single-author confound is the instrument's
   weakest point and only humans can remove it.
4. **External replication** — publishing the preprint (owner: Overleaf
   compile + arXiv submission) so other labs can run the frozen
   protocol.

## Honest self-assessment

Measured against "is this a validated scientific instrument?", the
answer is still **no — and the repo now says so precisely, everywhere,
with the evidence structure to become one**. What changed in Phase A is
that the project stopped being unable to support the question: it now
has locked constructs, versioned protocols, reliability machinery with
anchors, power-based sizing, deterministic verification, and a novel
scoring architecture whose claims are enforced by tests. A re-audit
should find the 2/10 criticisms individually answered; it should still
find — because the repo itself states it — that criterion validity
evidence does not exist yet and arrives only with Phase B data.
