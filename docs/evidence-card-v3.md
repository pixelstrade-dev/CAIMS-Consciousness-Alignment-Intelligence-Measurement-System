# Evidence Card — v3 design (Phase A of the validity program)

Status: **DESIGN — approved direction, not yet implemented.** Implementation
is Phase A3; the sub-dimension renames it depends on are Phase A2.

## Why the single composite has to step down

The external audit (2026-08-23) rated the scientific validity of the
measures 2/10, and the core reason is structural, not cosmetic: a single
"score" invites exactly the reading our own disclaimer prohibits, and it
hides dimension-level failures — Run 001's headline finding (fabricated
citations defeat judge-rated source integrity) is invisible in a
composite. The registry (`research/constructs/`) now states per metric
what may be claimed; the API's primary output must match that honesty.

## Target output (v3, `POST /api/score`)

```jsonc
{
  "evidenceCard": {
    "profile": {                     // the PRIMARY result: a profile, not a number
      "cq":  { "score": 71.2, "sd": 1.9, "n": 3 },   // sd/n when samples > 1
      "aq":  { "score": 74.0, "sd": 2.1, "n": 3 },
      "cfi": { "score": 68.3, "sd": 1.4, "n": 3 },
      "eq":  { "score": 66.7, "sd": 3.0, "n": 3 },
      "sq":  { "score": 70.0, "sd": 0.8, "n": 3 }
    },
    "aggregate": {                   // demoted, never presented alone
      "composite": 70.4,
      "weights": { "cq": 0.35, "aq": 0.25, "cfi": 0.2, "eq": 0.12, "sq": 0.08 },
      "note": "weighted convenience aggregate; weights are unvalidated hypotheses"
    },
    "evidenceLevel": "L2",
    "evidenceLevelLabel": "multi-judge behavioral",
    "phenomenalConsciousness": "NOT_ASSESSED",   // constant, by construction
    "constructRegistry": "research/constructs/ @ <git sha>",
    "caveats": [
      "judge-rated source integrity is defeatable (Run 001)",
      "absolute values are judge-relative (12.7-pt inter-judge MAD)"
    ]
  },
  "ensemble": { "...": "unchanged from v2.1 when applicable" },
  "metadata": { "...": "provenance envelope, protocolVersion 3.0.0-alpha" }
}
```

## Evidence levels (what the number is allowed to mean)

| Level | Label | Requirements |
|---|---|---|
| L0 | pipeline validation | mock/stub judge — never a measurement |
| L1 | single-judge behavioral | one judge, n ≥ 1; trend use within configuration only |
| L2 | multi-judge behavioral | ≥ 2 judge families, agreement reported; comparisons within batch |
| L3 | behavioral + deterministic | L2 plus deterministic verifications (citation existence, contradiction checks) on the facets that have them |
| L4 | mechanistic | RESERVED — requires interventional evidence on model internals; out of scope for this codebase today, listed so nobody claims it by accident |

The level is computed, not declared: L2 requires the ensemble path with
≥ 2 successful judge families; L3 additionally requires the deterministic
verifier suite to have run on the response.

## Breaking changes bundle (one bump, not a trickle)

v3 = `SCORING_PROTOCOL_VERSION 3.0.0-alpha`, shipping together:

1. Sub-dimension renames per the registry's `planned_renames` (CQ:
   `phi_proxy → integration_depth`, `gwt_proxy → knowledge_breadth`,
   `hot_proxy → metacognitive_display`, `temporal → temporal_coherence`)
   — rubric text, zod schema, weights code, OpenAPI, UI.
2. `evidenceCard` becomes the primary response object; `scores` retained
   one minor version for compatibility with a deprecation note.
3. `phenomenalConsciousness: "NOT_ASSESSED"` constant in every card.
4. v2 ↔ v3 scores are **never comparable** (different rubric text ⇒
   different prompt hash ⇒ different protocol version — the provenance
   machinery already enforces the framing).

## Explicitly out of scope for this card

- Mechanistic (L4) and embodied instruments — separate programs
  (CAIMS-M / CAIMS-E in the audit's terms) requiring GPU/simulator
  infrastructure and external collaborators.
- Any claim upgrade: the card changes what is REPORTED, not what is
  established. Construct validity remains not established until the
  Phase B corpus + human-annotation studies exist.
