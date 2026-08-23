# Validity program — Phase B (empirical validation)

Phase A (PRs #57–#63, closure report `validity-program-phase-a.md`)
ended with the statement that no further code moves the validity score:
the remaining gaps need new data. Phase B is that data campaign. This
document is its plan and its status board.

## B1 — Corpus v1 (this repo, DONE when merged)

Built to the preregistered design in `research/corpus/v1/README.md`
(sized by the Phase A6 power analysis): **250 authored items, 6 strata,
28 % adversarial**, bounds fixed at authoring time, no-citation rule
for positives, 36 plain-correct items instrumenting the fluency
confound, CI-enforced by `validate-corpus.mjs`. Corpus v1 is an
**instrument-validation** corpus: it measures the judges, not any
subject model — that scoping is stated in its README and carries into
every downstream claim.

## B2 — PIGA human annotation (protocol ready, needs ≥ 3 humans)

`research/annotation/piga-annotation-protocol.md` +
`piga-annotation-sheet.json`: three tasks (independent intent-space
audit, expectation labels, behavior classification of 12 pre-written
responses against the same decision procedure the LLM judge uses), with
a preregistered analysis (nominal α on labels and classes; majority
flips are applied to the dataset with a protocol bump and published).
**Owner action: recruit ≥ 3 annotators** (fluent English, not involved
in authoring). ~60–90 min each.

## B3 — Run 002 (ready to run, needs owner credentials)

`research/experiments/run-002/` — corpus v1 × 3 judge families ×
n=5 = 3 750 calls. Runner gained bounded item-level concurrency
(config `concurrency`, default sequential; call set and aggregates
proven identical by test) and the workflow timeout was raised, so the
full run fits CI. **Owner actions in the run-002 README**: two
`OPENWEIGHT_*` Secrets + exact model id, then one workflow click.
Preregistered analysis is in that README (H1/H2 unchanged, per-stratum
disaggregation, fluency-confound gap, 3-rater α/ICC).

## B4 — External replication (needs the preprint out)

Overleaf compile + arXiv submission (owner). The frozen protocol,
corpus, and runner make an external lab's replication a config-file
exercise.

## What Phase B can and cannot deliver

Delivered if the pieces above run: criterion evidence on 70
preregistered adversarial bounds under 3 judge families; the first
non-confounded reliability coefficients; a measured (not assumed)
fluency confound; human-audited PIGA constructs; and a public artifact
other labs can rerun. NOT delivered: ecological validity for scoring
real model outputs (corpus v1 is authored), population-level ground
truth from 3 annotators, and any consciousness-related claim — the
registry locks stay.

## Execution discipline

Same loop as Phase A: every artifact adversarially reviewed before
merge, all failures published, protocol versions bumped on any
semantic change, and no number cited that a committed artifact cannot
reproduce.
