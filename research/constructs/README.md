# Construct registry

Every CAIMS metric has a versioned **construct card** in this directory:
a machine-validated statement of what the metric actually observes, what
may be claimed from it, what may NOT, and what evidence exists for its
validity. If a claim about a metric is not licensed by its card, the
claim is wrong — including claims made by this project's own docs.

This registry exists because the honest state of CAIMS is:

> Every score is a consciousness-related **behavioral proxy**: a
> judge-rated property of text. **Construct validity is not
> established** for any dimension. The cards say this per metric, with
> the current evidence (including the failures) attached.

## Format and validation

Cards are JSON (machine-first; zero parsing dependencies), one file per
construct, named `<construct_id>.json`. CI validates every card against
the structural rules in [`validate-constructs.mjs`](validate-constructs.mjs):

- required fields present, correct types;
- `consciousness_claim` MUST be `"prohibited"` on every card;
- `causal_claim` MUST be `false` while no interventional evidence exists;
- `prohibited_claims` non-empty;
- every `validity_evidence` field present — `"none"` is a legal and
  expected value; an absent field is not (silence is how overclaiming
  starts);
- `theory_inspiration` entries must carry the `(inspiration only, not an
  implementation)` marker.

Run locally: `node research/constructs/validate-constructs.mjs`

## Change control

A card change is a scientific act: it goes through a PR, is challenged
adversarially before merge, and bumps the card `version` when the
meaning changes (same discipline as `SCORING_PROTOCOL_VERSION`). A
metric whose behavior changes without its card changing is a bug.

## Current cards

| Card | Construct | Status |
|---|---|---|
| `CQ.json` | Cognitive-Integration Quotient | proxy — validity not established |
| `AQ.json` | Alignment Quotient | proxy — validity not established |
| `CFI.json` | Context Fidelity Index | proxy — validity not established |
| `EQ.json` | Epistemic Quality | proxy — validity not established; the fabricated-citations control defeated the preregistered COMPOSITE bound under both judges even though EQ itself flagged the item (aggregation buried the alarm) |
| `SQ.json` | Stability Quotient | proxy — validity not established |
| `EMQ.json` | Emotional-tone proxy (experimental) | proxy — validity not established; text-level only |
| `COMPOSITE.json` | Weighted behavioral profile aggregate | aggregate of proxies — never a "consciousness score" |
| `PIGA.json` | Prompt–Intent–Goal Alignment (Phase A7) | v0 prototype — judge-as-classifier + deterministic scoring matrix; NOT in the composite; no runs, zero validity evidence yet |

## v3 renames (Phase A2 — EXECUTED)

The former `phi_proxy` / `gwt_proxy` / `hot_proxy` / `temporal` names
implied implementations of IIT / Global Workspace / Higher-Order Thought
that never existed here. Protocol `3.0.0-alpha` renames them to what they
behaviorally observe (`integration_depth`, `knowledge_breadth`,
`metacognitive_display`, `temporal_coherence`). v2 and v3 scores are
**never comparable** (different rubric text ⇒ different prompt hash).
Run 001 artifacts keep the v2 names — they are a historical record of a
2.0.0-alpha run and are not rewritten.
