# Use case 1 — support-assistant drift monitoring

**Who**: a team operating an LLM support assistant that logs
(question, response, history) triples.
**Question**: *is the assistant's behavior degrading over time* —
contradicting what it told the same customer earlier, turning dismissive,
inventing policy citations?
**How CAIMS helps**: score each day's interactions with one fixed judge
configuration and watch the day-over-day deltas of the composite and CFI
(context-fidelity) proxies, plus two deterministic tripwires the judge
cannot be trusted with (see below).

## Why this use is licensed by Run 001 — and where its limits are

- **Trends within one configuration are signal.** Run 001's H2 measured
  per-judge stability at n=5 samples per item: median SD 1.79
  (claude-sonnet-5) and 2.19 (gpt-4o). A day-over-day drop of 10+
  composite points is far outside that noise floor.
- **Absolute numbers are judge-relative.** H3 found a 12.7-point mean
  absolute difference between two judges on identical items. The script
  therefore refuses to interpret a batch whose provenance (protocol
  version, judge model, provider) is not constant — if you upgrade the
  judge model, your baseline resets, period.
- **Do not let the judge vouch for citations.** Run 001's preregistered
  fabricated-citations control *defeated* judge scoring (GPT-4o rated
  eloquent text with invented references 65.6 against a preregistered
  bound of 35). The script flags citation-like strings (policy sections,
  named standards, legal clauses) for human/deterministic verification
  — a support bot inventing "Billing Policy §4.2" is exactly the failure
  mode judges scored *well*.

## Run it

```bash
# prerequisites: see ../README.md (running API + pip install -e sdks/python)
cd examples/support-drift-monitor
python monitor.py --data data/support-logs.jsonl --out report.md
```

Cost: one scoring request per logged interaction — the bundled dataset
makes **12 requests ≈ 24 provider LLM calls** (each request runs the KPI
judge plus the emotion analyzer). Exit code 1 when drift is flagged, so
a nightly cron can alert on it.

## The bundled dataset (synthetic, authored — marked as such per record)

`data/support-logs.jsonl` contains 12 support interactions over three
days for a fictional SaaS product:

- **2026-08-18 and 2026-08-19 (baseline + healthy)**: the assistant keeps
  context, admits uncertainty, states limits honestly.
- **2026-08-20 (degraded)**: the assistant contradicts its own earlier
  answers to the same customers (14-day refunds vs the 3–5 days it
  promised; a $25,000 invoicing floor vs the $1,000 it stated the day
  before; denying an escalation it committed to), turns dismissive, and
  backs the contradictions with **invented policy citations**
  ("Billing Policy §4.2", "DHS-2019 section 7", "ToS clause 11(b)").

The degradation is *in the inputs by construction* so you can watch the
monitor's tripwires react end-to-end. What the judge does with it is a
real API response produced on your machine — **no pre-computed scores
ship with this example**, and we make no claim here about which exact
numbers you will see (that would be pretending to know a judge run we
did not execute; Run 001 shows judge-rated citation integrity in
particular can be fooled — which is precisely why the deterministic
citation flagger exists and will fire on day 3 regardless of scores).

## Reading the report

- `⚠ DRIFT` on a day row: composite mean fell ≥ threshold (default 10
  points) below the baseline day.
- **Context alerts**: server-side CFI alerts (level `warning`/`critical`).
- **Citations to verify by hand**: every citation-like string, with the
  Run 001 rationale restated. Treat these as action items against your
  actual policy documents.
- **Provenance**: the judge configuration; if it varied inside the
  batch the whole report is stamped INVALID FOR COMPARISON.

Descriptive monitoring only: with a handful of interactions per day no
significance testing is honest, and none is claimed. Tune `--threshold`
to your traffic and false-alarm tolerance.

## Adapting to your logs

Convert your logs to JSONL rows `{"id", "day", "question", "response",
"history": [{"role": "user"|"assistant", "content": ...}, ...]}` — the
`history` field is what lets CFI see contradictions with earlier turns,
so include the prior conversation whenever you have it.
