# Use case 2 — candidate-model comparison for an internal purchase decision

**Who**: an enterprise team choosing between candidate assistant
models/vendors for an internal deployment (here: an IT-helpdesk
assistant).
**Question**: *which candidate's behavior best fits our use case* —
keeping context, handling emotional situations, admitting uncertainty —
before signing a contract?
**How CAIMS helps**: collect each candidate's responses to one fixed,
domain-specific prompt set, score everything under ONE fixed judge
configuration, and compare the per-candidate proxy profiles (CQ, AQ,
CFI, EQ, SQ) — with the failure modes Run 001 exposed handled
deterministically instead of trusted to the judge.

## What Run 001 permits here — and what it forbids

- **Within-configuration comparison is the only valid kind.** H3 found a
  12.7-point mean absolute difference between two judges scoring
  identical items. The script *aborts the ranking* (exit 2) if the
  provenance envelope (protocol version, judge model, provider) varies
  inside the batch.
- **No public league tables.** These are single-judge scores; public
  model comparisons are gated on the multi-judge ensemble roadmap
  (v2.1). The report embeds an INTERNAL USE ONLY notice unconditionally.
- **A confident, citation-heavy candidate can outscore a careful one.**
  Run 001's fabricated-citations control scored 65.6 against a
  preregistered bound of 35 — judges reward fluent authority. The script
  counts citation-like strings and unsourced precise statistics per
  candidate and lists every one as mandatory pre-decision verification
  work. Treat unverifiable citations as a *risk finding the score cannot
  see*.
- `--samples N` reproduces the Run 001 statistics (mean ± Bessel-corrected
  sample SD per item; the protocol used n=5).

## Run it

```bash
# prerequisites: see ../README.md (running API + pip install -e sdks/python)
cd examples/model-comparison
python compare.py --data data/candidate-responses.jsonl --out comparison.md
# tighter spread estimates (3x the cost):
python compare.py --samples 3
```

Cost: one judge call per (candidate, prompt, sample). The bundled
dataset is 3 candidates × 6 prompts = **18 calls** at the default
`--samples 1`, 54 at `--samples 3`.

## The bundled dataset (synthetic, authored — marked as such per record)

`data/candidate-responses.jsonl` holds responses from three **fictional**
candidates to 6 IT-helpdesk prompts. They are deliberately not named
after real vendors' models: attributing authored text to a real model
would fabricate that model's behavior, which this project does not do.
To compare real candidates, replace the file with responses you actually
collected from each vendor under identical prompts.

The three candidates are constructed to pull the metric in different
directions:

- **candidate-a** — careful and grounded: keeps context, states limits,
  admits what it cannot know, separates fact from recommendation.
- **candidate-b** — fluent authority: confident, procedural, and dense
  with *invented* internal standards ("CIS-2022 §3.4", "IPS-5 §4.4",
  "Form DR-17") and unsourced precise statistics ("63%", "94.7%",
  "MTTR of 0.78 hours"). This is the profile Run 001 showed judges can
  reward — the citation flagger exists for exactly this candidate.
- **candidate-c** — terse and mechanical: correct, minimal, no
  engagement with the human side of the prompts.

**No pre-computed scores ship with this example** and we make no claim
about which candidate "wins" on your machine — that depends on the judge
configuration you run, which is the point of the provenance guard. What
is deterministic by construction: the citation flagger will list
candidate-b's invented references regardless of scores.

## Reading the report

1. The ranking table orders candidates by mean composite — read it
   *together with* the citation-flags column, never alone.
2. Per-prompt detail shows where candidates diverge (SD column is
   meaningful from `--samples 2` upward).
3. The "Citations to verify" section is a work list, not an appendix:
   for a real purchase decision, every listed reference gets checked
   against real documents, and failures go into the decision memo.
4. Provenance section: the exact configuration your numbers are relative
   to. Re-running after a judge-model upgrade starts a new, incomparable
   batch.
