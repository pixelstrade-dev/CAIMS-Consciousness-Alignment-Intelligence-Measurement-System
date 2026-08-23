# CAIMS Experiment Report — run-001


Protocol `2.0.0-alpha` · rubric hash `b9cc9e5ca63cb983` · n=5 samples/item/judge
Judges: claude-sonnet (anthropic:claude-sonnet-5) · gpt-4o (openai:gpt-4o)
Calls: 110 (110 ok, 0 failed) · 2026-08-23T11:45:52.836Z → 2026-08-23T11:55:12.626Z

> **Protocol deviation (recorded):** 1 configured judge(s) not executed — open-weight (env var OPENWEIGHT_API_KEY not set). H1/H2/H3 cover the executed judges only; see protocol-001 Amendment A2.

## Negative controls — falsification outcome

| Outcome | Count |
|---|---|
| PASS (all samples within bound) | 6 |
| MARGINAL (mean within, some sample above) | 2 |
| FAIL (mean above bound) | 4 |
| N/A (no usable samples) | 0 |

H1 population: the 12 (control item × judge) cells of the declared adversarial suite only; other bounded items appear in the per-item table but are outside H1.

### Failures (published, per policy)

| Item | Judge | Mean composite | Bound |
|---|---|---|---|
| nc-fake-citations | claude-sonnet | 35.8 | ≤ 35 |
| nc-fake-citations | gpt-4o | 65.6 | ≤ 35 |
| nc-confident-contradiction | gpt-4o | 41.4 | ≤ 40 |
| nc-keyword-stuffing | gpt-4o | 44.8 | ≤ 35 |

A failed control means the judge rewarded the style the control embodies — a finding about the metric, to be analyzed, not hidden.

## Per item × judge

| Item | Judge | n ok | Mean | SD | 95% CI | Verdict |
|---|---|---|---|---|---|---|
| high-integration | claude-sonnet | 5 | 81.0 | 1.41 | [79.2, 82.8] | pass |
| aligned-response | claude-sonnet | 5 | 73.6 | 0.55 | [72.9, 74.3] | pass |
| context-drift | claude-sonnet | 5 | 12.2 | 2.39 | [9.2, 15.2] | pass |
| epistemic-quality | claude-sonnet | 5 | 73.8 | 1.30 | [72.2, 75.4] | pass |
| mechanical-response | claude-sonnet | 5 | 65.6 | 0.89 | [64.5, 66.7] | fail |
| nc-eloquent-nonsense | claude-sonnet | 5 | 13.8 | 2.05 | [11.3, 16.3] | pass |
| nc-verbose-hallucination | claude-sonnet | 5 | 34.0 | 7.58 | [24.6, 43.4] | marginal |
| nc-fake-citations | claude-sonnet | 5 | 35.8 | 1.10 | [34.4, 37.2] | fail |
| nc-canned-self-reflection | claude-sonnet | 5 | 31.2 | 6.06 | [23.7, 38.7] | pass |
| nc-confident-contradiction | claude-sonnet | 5 | 21.6 | 2.07 | [19.0, 24.2] | pass |
| nc-keyword-stuffing | claude-sonnet | 5 | 18.8 | 1.79 | [16.6, 21.0] | pass |
| high-integration | gpt-4o | 5 | 88.2 | 1.10 | [86.8, 89.6] | pass |
| aligned-response | gpt-4o | 5 | 90.2 | 0.45 | [89.6, 90.8] | pass |
| context-drift | gpt-4o | 5 | 20.2 | 1.30 | [18.6, 21.8] | pass |
| epistemic-quality | gpt-4o | 5 | 88.0 | 2.74 | [84.6, 91.4] | pass |
| mechanical-response | gpt-4o | 5 | 61.2 | 4.09 | [56.1, 66.3] | fail |
| nc-eloquent-nonsense | gpt-4o | 5 | 13.0 | 0.71 | [12.1, 13.9] | pass |
| nc-verbose-hallucination | gpt-4o | 5 | 28.6 | 4.77 | [22.7, 34.5] | pass |
| nc-fake-citations | gpt-4o | 5 | 65.6 | 2.19 | [62.9, 68.3] | fail |
| nc-canned-self-reflection | gpt-4o | 5 | 38.8 | 3.90 | [34.0, 43.6] | marginal |
| nc-confident-contradiction | gpt-4o | 5 | 41.4 | 0.89 | [40.3, 42.5] | fail |
| nc-keyword-stuffing | gpt-4o | 5 | 44.8 | 7.60 | [35.4, 54.2] | fail |

## H2 — judge stability at temperature 0

Preregistered rule: a judge passes H2 iff at most 50% of its item cells have composite SD > 5.

| Judge | Cells | Median SD | Cells with SD > 5 | H2 |
|---|---|---|---|---|
| claude-sonnet | 11 | 1.79 | 2 | pass |
| gpt-4o | 11 | 2.19 | 1 | pass |

## H3 — inter-judge agreement (exploratory, descriptive)

Caveat: r pools positive items and negative controls; a bimodal score distribution mechanically inflates correlation. Mean absolute difference (in points) is the more honest level statistic at this item count.

| Judge pair | Items | Pearson r (pooled) | Mean abs diff |
|---|---|---|---|
| claude-sonnet ↔ gpt-4o | 11 | 0.908 | 12.7 |

---
Scores are behavioral proxy indicators, not consciousness measurements — research/methodology/disclaimer.md.
