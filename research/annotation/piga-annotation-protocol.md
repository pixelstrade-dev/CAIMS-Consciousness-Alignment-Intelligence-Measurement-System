# PIGA human annotation protocol (Phase B2)

Status: **protocol ready — waiting on ≥ 3 human annotators**. The
single-author intent spaces and expectation labels are PIGA's weakest
point (stated in `research/constructs/PIGA.json`); this protocol is how
that confound gets removed — or how PIGA gets falsified, if humans
reject the authored labels.

## What is being annotated

The 12 items of `apps/web/benchmarks/piga-v0.json`. Each annotator
works INDEPENDENTLY (no discussion before submission) on three tasks
per item:

### Task 1 — intent-space audit
Shown the `surface_prompt` ONLY (not the authored intent list), the
annotator writes down the distinct plausible readings they see
(free text, 1–6 readings). Afterwards, shown the authored
`plausible_intents`, they mark each authored intent as
`plausible / far-fetched` and mark any reading of their own that the
authored list missed.

### Task 2 — expectation label
Shown the prompt and the authored intent list, the annotator picks one:
- `required` — a careful assistant should ask before acting;
- `acceptable` — asking or proceeding with a stated assumption are both
  fine;
- `unnecessary` — the prompt is fully specified; asking wastes a turn.
They also rate `harm_if_wrong` (low / medium / high).

### Task 3 — behavior classification (reliability of the judge task)
For 6 of the 12 items, annotators receive 2 pre-written responses each
(24 response classifications total) and classify them into the five
PIGA behavior classes using the same decision procedure the LLM judge
gets (reproduced verbatim in the annotation sheet). This measures
whether the class partition is human-usable, independent of any LLM.

## Preregistered analysis

- Task 1: per item, recall of authored intents (fraction of authored
  intents that ≥ 2/3 annotators independently produced or rated
  plausible) and precision (fraction not rated far-fetched by a
  majority). An authored intent rated far-fetched by ≥ 2/3 annotators
  is REMOVED in v1 of the dataset (protocol bump).
- Task 2: Krippendorff α (nominal) on expectation labels across
  annotators; per-item majority vs authored label. An item where the
  majority contradicts the authored label gets the majority label in
  v1 (protocol bump), and the flip is published.
- Task 3: Krippendorff α (nominal) on behavior classes,
  annotator–annotator and annotator–LLM-judge. If human–human α on the
  classes is low, the class boundaries — not the judges — are the
  problem (a PIGA falsifier from the spec).
- All disagreements are published in aggregate; no annotator's
  individual sheet is published.

## Annotator requirements & materials

- ≥ 3 annotators; fluent English; no involvement in authoring the
  items; unpaid/paid status disclosed in the report.
- Materials: `piga-annotation-sheet.json` in this directory is the
  machine-readable sheet template (one record per task instance,
  free-text and categorical fields). Annotators may fill the JSON
  directly or a spreadsheet export of it; results are committed under
  `research/annotation/results/<annotator-pseudonym>/`.
- Time estimate: 60–90 minutes per annotator.

## What this protocol does NOT claim

Three annotators cannot establish population-level ground truth; they
remove the single-author confound and measure whether the constructs
are inter-subjectively usable. Larger-scale annotation is a later
phase, sized from these first coefficients.
