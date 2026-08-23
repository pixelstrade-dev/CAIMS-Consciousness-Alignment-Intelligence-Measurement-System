# Multi-judge ensemble & n-sample scoring (v2.1)

Run 001 (`research/experiments/run-001/`) measured a **12.7-point mean
absolute difference** between two judges scoring identical items:
single-judge absolute CAIMS scores are judge-relative. v2.1 puts the
answer in the production API — score under several judges and/or several
samples, and report the spread instead of a naked point estimate.

## Configuration (server operator)

```bash
# comma-separated provider:model pairs (max 4, no duplicates)
CAIMS_ENSEMBLE_JUDGES="anthropic:claude-sonnet-5,openai:gpt-4o"
```

Judges are chosen **server-side only** — an API caller can opt into the
ensemble but can never pick models, so a key holder cannot spend your
credits on arbitrary models. Each provider needs its key
(`ANTHROPIC_API_KEY` / `OPENAI_API_KEY`).

Fail-loudly semantics (same philosophy as `CAIMS_API_KEYS`):
- unset → ensemble requests get **400 `ENSEMBLE_NOT_CONFIGURED`**;
  single-judge scoring is unchanged.
- set but unparseable → **503 `ENSEMBLE_MISCONFIGURED`**; the server
  never silently degrades to a single judge the caller did not ask for.

## Request

```bash
curl -X POST $BASE/api/score \
  -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
  -d '{"question": "...", "response": "...",
       "ensemble": true,     # score under every configured judge
       "samples": 3}'        # samples per judge (1–5, default 1)
```

`samples > 1` without `ensemble: true` runs an n-sample of the single
env-configured judge — variance reporting without multi-judge cost.

**Cost**: `judges × samples` judge LLM calls per request (worst case
4 × 5 = 20). EmQ (emotion analysis) is **not** run in ensemble mode —
its ensemble aggregation is future work, stated rather than half-done.

## Response (additions to the single-judge shape)

`scores.{cq,aq,cfi,eq,sq,composite}` hold the **equal-weight ensemble
means**, so existing clients and the Python SDK keep working unchanged.
Added fields:

```jsonc
"ensemble": {
  "judges": [
    { "id": "anthropic:claude-sonnet-5", "provider": "anthropic",
      "model": "claude-sonnet-5", "temperature": null,
      "samplesOk": 3, "samplesFailed": 0,
      "kpiMeans": { "cq": 71.2, "aq": 74.0, "cfi": 68.3, "eq": 66.7, "sq": 70.0 },
      "composite": { "mean": 70.8, "sd": 1.9 } }   // sd: Bessel, null when samples < 2
  ],
  "failedJudges": [],       // judges whose every sample failed — reported, never hidden
  "agreement": {            // null with fewer than 2 successful judges
    "compositeSpread": 9.4, // max − min of per-judge composite means
    "meanAbsDiff": 9.4      // mean absolute pairwise difference
  }
},
"metadata": { "mode": "ensemble", "samplesPerJudge": 3,
              "protocolVersion": "2.0.0-alpha", "promptHash": "…",
              "weightsUsed": { … }, "emotionAnalysis": "skipped" }
```

## Reading the numbers honestly

- **The ensemble mean is not more "true" than the per-judge means** — it
  is one defensible aggregation (equal weight) of judge-relative scales.
  Always read it next to `agreement.compositeSpread`.
- A spread of the same order as Run 001's inter-judge MAD (12.7 points)
  means the judges genuinely disagree on this item; the per-judge rows
  tell you how, and Run 001 found the largest disagreements precisely on
  adversarial content.
- Degraded results (`failedJudges` non-empty) are still returned, with
  the failure visible — check it before trusting a "2-judge ensemble"
  that was actually 1 judge that day.
- Comparisons remain valid only within one protocol version AND one
  judge configuration. The public-comparison gate stays: rankings
  published from CAIMS scores must use a multi-judge configuration and
  disclose per-judge results and spread, not just the ensemble mean.

## Statistics

Mean and Bessel-corrected sample SD (n−1), identical conventions to the
Run 001 protocol (`apps/web/lib/statistics/descriptive.ts` — the same
module the experiment runner uses). SD is `null` when `samples < 2`:
reporting a zero-width spread from one sample would be a lie.
