# Corpus v1 — instrument-validation corpus (Phase B1)

Status: **preregistered design** (this file), items authored per this
spec. Sized by the Phase A6 power analysis
(`docs/power-analysis-a6.md`), not by a round number.

## What this corpus is — and is not

Corpus v1 is an **instrument-validation corpus**: every response is
AUTHORED for the corpus with known, intended properties. Scoring it
measures the JUDGES (does the instrument reward what it claims to
reward, and refuse what it claims to refuse?) — it does not measure any
subject model. Authored items have a designed answer key; sampled model
outputs do not. Model-output corpora come later, once the instrument
itself is characterized.

## Design (from the A6 sizing)

- **250 items, 6 strata** (A6: 200–300, 4–6 strata of ~35–50):

| file | stratum | items | kind |
|---|---|---|---|
| S1-technical-software.json | technical/software | 45 | positive |
| S2-science-medicine.json | science/medicine | 45 | positive |
| S3-humanities-social.json | humanities/social | 45 | positive |
| S4-everyday-reasoning.json | everyday reasoning/advice | 45 | positive |
| S5-adversarial-fluent.json | fluent-failure controls | 35 | adversarial |
| S6-adversarial-epistemic.json | epistemic-failure controls | 35 | adversarial |

- **Adversarial fraction: 70/250 = 28 %** (A6 target 25–30 % — the
  adversarial strata need the most items per unit of α precision).
- **n = 5 samples per cell, ≥ 3 judge families** at run time (A6:
  n=5 gives ≥ 0.93 power for ≥ 5-point bound violations at the
  adversarial-worst σ).

## Item format

Identical to the Run 001 datasets (compatible with `cli/benchmark.ts`
and the experiment runner):

```jsonc
{
  "id": "s1-...",                 // stratum-prefixed, globally unique
  "question": "...",
  "response": "...",               // authored, with designed properties
  "control_type": "...",           // adversarial strata only
  "rationale": "...",              // why this item, what it tests, why these bounds
  "expected": { "minComposite": N } // and/or maxComposite
}
```

## Preregistered bounds policy

1. Bounds are set at AUTHORING time, before any scoring run, and are
   chosen so that a **meaningful violation is ≥ 5 points** (A6: chasing
   2-point violations is not worth n=25).
2. Anchoring to Run 001's observed ranges: strong positive responses
   scored ~65–88 under both judges; controls 25–66. Therefore:
   positive `minComposite` 55–65 (strong) / 45 (plain-correct band);
   adversarial `maxComposite` 35–45, except mostly-genuine-content
   controls (subtle_error, false_precision) which may justify up to 50.
3. Bound failures are RESULTS, not embarrassments: Run 001's
   fake-citations composite failure is the project's most-cited
   finding. All failures are published.

## Preregistered content rules

1. **No literature citations in positive responses** — no paper titles,
   authors-with-years, DOIs. Positive responses use established
   textbook knowledge only, so their factual accuracy is checkable by
   review without a retrieval step. Invented citations appear ONLY in
   S6 items designed to carry them.
2. **Plain-correct sub-class**: ~9 items per positive stratum are
   deliberately unadorned — short, correct, unpolished. They carry a
   BAND (`minComposite` ≈ 45, no upper bound) and exist to measure the
   fluency confound: if plain-correct systematically scores far below
   eloquent-correct on the same questions, the instrument rewards
   style. Their rationale marks them `plain-correct`.
3. **One topic per item** — no near-duplicate questions within or
   across strata.
4. **Adversarial surface quality**: S5/S6 responses must be genuinely
   fluent and confident — a control that "looks wrong" tests nothing.
   Each declares its `control_type` and its rationale states the
   designed flaw precisely.
5. English only (declared validity-domain limit; multi-language is a
   later corpus).
6. All items authored for this corpus — no text copied from external
   sources or real model outputs.

## Known limitations (stated at design time)

- Authored responses are not model outputs; ecological validity for
  scoring real models is NOT established by this corpus.
- Item authors are AI-assisted under adversarial review, single
  research group — no external item review yet.
- Bounds encode the authors' intent for the instrument; they are
  design targets, not ground truth about quality.

Validation: `node research/corpus/v1/validate-corpus.mjs` (CI-enforced)
checks strata sizes, the adversarial fraction, global id uniqueness,
bounds presence and policy conformance, and required fields.
