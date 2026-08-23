# CAIMS examples — real, runnable use cases

Two documented use cases, each grounded in what the Run 001 experiment
(`research/experiments/run-001/`) actually showed CAIMS can and cannot
support:

| Example | Question it answers | Run 001 grounding |
|---|---|---|
| [`support-drift-monitor/`](support-drift-monitor/) | "Is my support assistant's behavior drifting week over week?" | H2: per-judge score stability (median SD 1.79 / 2.19 over n=5) supports **within-configuration trend monitoring** |
| [`model-comparison/`](model-comparison/) | "Which candidate model fits our internal use case best?" | H3: 12.7-point mean absolute difference between judges means absolute scores are **judge-relative** — comparisons are valid only inside one fixed configuration |

## Ground rules (read before trusting any number)

1. **Scores are behavioral proxy indicators, not consciousness
   measurements.** See `research/methodology/disclaimer.md`.
2. **Never compare scores across different judge configurations or
   protocol versions.** Both scripts enforce this with a provenance
   guard against `protocolVersion`/`modelUsed`/`provider` varying inside
   one batch: the drift monitor stamps its report INVALID FOR
   COMPARISON; the comparison script refuses to produce a ranking at
   all (exit 2).
3. **Judged scoring is defeatable on citations.** Run 001's
   preregistered fabricated-citations control defeated both judges'
   composite verdicts (GPT-4o composite 65.6 against a bound of 35) —
   even though the epistemic dimension flagged the item, the weighted
   aggregate buried the alarm. Both scripts therefore flag
   citation-like strings for deterministic/human verification instead
   of trusting scores on them.
4. **No public rankings from these scripts.** Single-judge comparisons
   are internal decision support. Public model comparisons are gated on
   the multi-judge ensemble work (see `ROADMAP.md`, v2.1).
5. **The bundled datasets are authored, synthetic inputs** (clearly
   marked in each data file). They exist so the scripts run end-to-end
   out of the box; the outputs they produce on your machine are real API
   responses. No pre-computed score outputs ship in this directory —
   run the scripts to get yours.

## Prerequisites (both examples)

```bash
# 1. A running CAIMS API (from the repo root):
cd apps/web && npm install && npx prisma generate && npm run dev
# requires ANTHROPIC_API_KEY (or OPENAI_API_KEY + CAIMS_LLM_PROVIDER=openai)

# 2. The Python SDK (not yet on PyPI — install from the repo):
pip install -e sdks/python

# 3. Point the scripts at the API:
export CAIMS_BASE_URL=http://localhost:3000
export CAIMS_API_KEY=...   # only if the server sets CAIMS_API_KEYS
```

Each scoring request spends **two provider LLM calls** — the KPI judge
plus the emotion analyzer, which the server runs by default — so budget
2× the request count. The per-example READMEs state exactly how many
requests a default run makes before you spend anything.
