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
(These responses also carry `metadata.mode: "ensemble"`: the label marks
the aggregated response shape — judges array, SD, agreement — not the
judge count.)

**Cost**: `judges × samples` judge LLM calls per request (worst case
4 × 5 = 20). The per-IP rate limit (20 requests/min) was designed for
single-judge requests — with an ensemble configured, one keyed caller
can drive up to 20× more judge calls per minute, so set provider spend
limits accordingly. EmQ (emotion analysis) is **not** run in ensemble
mode — its ensemble aggregation is future work, stated rather than
half-done.

## Latency

Judges run in **parallel**; samples within one judge run sequentially
(no per-provider burst). Wall-clock is therefore roughly
`samples × single-call latency` — e.g. 3 samples × ~5–15 s. The route
sets `maxDuration = 60` (accepted on every Vercel plan); on serverless,
keep `samples ≤ 3` or raise the limit (Pro) / self-host for heavier
configurations. `samples: 5` with a slow judge can exceed 60 s and
return a 504 from the platform, not from CAIMS.

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
              "protocolVersion": "3.0.0-alpha", "promptHash": "…",
              "weightsUsed": { … }, "emotionAnalysis": "skipped" }
```

## Reading the numbers honestly

- **The ensemble mean is not more "true" than the per-judge means** — it
  is one defensible aggregation (equal weight) of judge-relative scales.
  Always read it next to `agreement.compositeSpread`.
- **Aggregation order**: `scores.composite` is recomputed from the
  (rounded) ensemble KPI means, not averaged from
  `ensemble.judges[].composite.mean`; integer clamping means the two can
  differ by up to ~1 point. Neither is more correct — they are the same
  linear combination up to rounding.
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
