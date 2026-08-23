# Run 002 — corpus v1 under ≥ 3 judge families

Status: **READY TO RUN — waiting on owner credentials**. Everything
else (corpus, config, runner concurrency, workflow timeout) is in
place.

## What this run is for

1. **H1 at scale**: do the 70 preregistered adversarial bounds hold
   across 3 judge families? (Run 001, n=6 controls: fabricated
   citations defeated the composite under both judges.)
2. **Real 3-rater reliability**: Krippendorff α + ICC(2,1) with three
   judge FAMILIES — the first coefficients on this instrument that are
   not 2-rater and bimodality-confounded.
3. **Fluency confound measurement**: the 36 plain-correct items carry
   minComposite 45; if plain-correct systematically undershoots
   eloquent-correct, the instrument rewards style — that result would
   be published as a finding, not hidden.
4. **3-rater corpus re-sizing** (A6 said: do not size the full corpus
   from 2-rater data).

## Owner runbook (the ONLY missing pieces)

1. GitHub → Settings → Secrets and variables → Actions → **Secrets**
   (never the Variables tab):
   - `OPENWEIGHT_API_KEY` — API key for an OpenAI-compatible endpoint
     (Together, Groq, self-hosted vLLM…).
   - `OPENWEIGHT_BASE_URL` — that endpoint's base URL.
   (`ANTHROPIC_API_KEY` and `OPENAI_API_KEY` are already set.)
2. Edit `config.json` here: set the open-weight judge's `"model"` to
   the EXACT model identifier your endpoint serves (the committed value
   is a placeholder).
3. Actions → **Experiment Run** → Run workflow →
   config = `research/experiments/run-002/config.json`, mock = false.
4. Optional dry run first: same config with **mock = true** (free,
   minutes, validates the pipeline end-to-end; mock output is never a
   measurement).
5. The workflow pushes a results branch and opens (or links) the
   results PR. Review REPORT.md and the raw JSONL, then merge — that
   merge is the publication of the run, including any bound failures.

Scale: 250 items × 5 samples × 3 judges = **3 750 calls**; with the
runner's item concurrency of 4, roughly 20–35 minutes per judge
(sequential across judges), well inside the workflow's 6-hour cap.
Budget rough order: a few tens of dollars depending on providers.

## Preregistered analysis (fixed before the run)

- H1 rule unchanged (protocol-001): per adversarial cell, fail iff mean
  of n samples > maxComposite; all failures published.
- H2 stability rule unchanged: per judge, ≤ 50 % of cells with SD > 5.
- Reliability: pooled α/ICC AND per-stratum disaggregation (the A5
  lesson: pooled coefficients over bimodal data flatter the
  instrument); plus mean |judge diff| per stratum.
- Fluency confound: compare plain-correct vs strong-positive composite
  distributions per stratum; report the gap with CIs.
- Power notes from A6 apply: n=5 detects ≥ 5-point violations with
  ≥ 0.93 power at the adversarial-worst σ observed in Run 001.
