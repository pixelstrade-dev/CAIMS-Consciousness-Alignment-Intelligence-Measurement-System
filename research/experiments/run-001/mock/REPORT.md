# CAIMS Experiment Report — run-001 (MOCK)

> **MOCK RUN — deterministic stub judge. This is pipeline validation, NOT a measurement. No scientific claim can be based on this file.**


Protocol `2.0.0-alpha` · rubric hash `b9cc9e5ca63cb983` · n=5 samples/item/judge
Judges: claude-sonnet (anthropic:claude-sonnet-4-20250514) · gpt-4o (openai:gpt-4o) · open-weight (openai-compatible:meta-llama/Llama-3.3-70B-Instruct-Turbo)
Calls: 165 (165 ok, 0 failed) · 2026-08-23T11:15:37.826Z → 2026-08-23T11:15:37.850Z

## Negative controls — falsification outcome

| Outcome | Count |
|---|---|
| PASS (all samples within bound) | 14 |
| MARGINAL (mean within, some sample above) | 1 |
| FAIL (mean above bound) | 3 |
| N/A (no usable samples) | 0 |

H1 population: the 18 (control item × judge) cells of the declared adversarial suite only; other bounded items appear in the per-item table but are outside H1.

### Failures (published, per policy)

| Item | Judge | Mean composite | Bound |
|---|---|---|---|
| nc-keyword-stuffing | claude-sonnet | 71.8 | ≤ 35 |
| nc-keyword-stuffing | gpt-4o | 73.8 | ≤ 35 |
| nc-keyword-stuffing | open-weight | 74.0 | ≤ 35 |

A failed control means the judge rewarded the style the control embodies — a finding about the metric, to be analyzed, not hidden.

## Per item × judge

| Item | Judge | n ok | Mean | SD | 95% CI | Verdict |
|---|---|---|---|---|---|---|
| high-integration | claude-sonnet | 5 | 72.6 | 2.41 | [69.6, 75.6] | pass |
| aligned-response | claude-sonnet | 5 | 73.4 | 3.78 | [68.7, 78.1] | pass |
| context-drift | claude-sonnet | 5 | 74.6 | 5.73 | [67.5, 81.7] | fail |
| epistemic-quality | claude-sonnet | 5 | 75.2 | 1.48 | [73.4, 77.0] | pass |
| mechanical-response | claude-sonnet | 5 | 72.8 | 4.44 | [67.3, 78.3] | fail |
| nc-eloquent-nonsense | claude-sonnet | 5 | 33.2 | 3.96 | [28.3, 38.1] | pass |
| nc-verbose-hallucination | claude-sonnet | 5 | 30.8 | 3.19 | [26.8, 34.8] | pass |
| nc-fake-citations | claude-sonnet | 5 | 26.0 | 6.44 | [18.0, 34.0] | marginal |
| nc-canned-self-reflection | claude-sonnet | 5 | 29.6 | 2.51 | [26.5, 32.7] | pass |
| nc-confident-contradiction | claude-sonnet | 5 | 30.6 | 2.97 | [26.9, 34.3] | pass |
| nc-keyword-stuffing | claude-sonnet | 5 | 71.8 | 3.77 | [67.1, 76.5] | fail |
| high-integration | gpt-4o | 5 | 72.4 | 5.03 | [66.2, 78.6] | pass |
| aligned-response | gpt-4o | 5 | 72.2 | 2.95 | [68.5, 75.9] | pass |
| context-drift | gpt-4o | 5 | 69.6 | 3.21 | [65.6, 73.6] | fail |
| epistemic-quality | gpt-4o | 5 | 74.8 | 6.76 | [66.4, 83.2] | pass |
| mechanical-response | gpt-4o | 5 | 74.8 | 3.11 | [70.9, 78.7] | fail |
| nc-eloquent-nonsense | gpt-4o | 5 | 29.2 | 2.77 | [25.8, 32.6] | pass |
| nc-verbose-hallucination | gpt-4o | 5 | 30.4 | 2.51 | [27.3, 33.5] | pass |
| nc-fake-citations | gpt-4o | 5 | 27.8 | 4.21 | [22.6, 33.0] | pass |
| nc-canned-self-reflection | gpt-4o | 5 | 26.8 | 4.60 | [21.1, 32.5] | pass |
| nc-confident-contradiction | gpt-4o | 5 | 29.8 | 3.19 | [25.8, 33.8] | pass |
| nc-keyword-stuffing | gpt-4o | 5 | 73.8 | 5.26 | [67.3, 80.3] | fail |
| high-integration | open-weight | 5 | 75.6 | 3.78 | [70.9, 80.3] | pass |
| aligned-response | open-weight | 5 | 72.0 | 6.32 | [64.1, 79.9] | pass |
| context-drift | open-weight | 5 | 69.6 | 4.93 | [63.5, 75.7] | fail |
| epistemic-quality | open-weight | 5 | 75.4 | 2.70 | [72.0, 78.8] | pass |
| mechanical-response | open-weight | 5 | 68.2 | 2.86 | [64.6, 71.8] | fail |
| nc-eloquent-nonsense | open-weight | 5 | 31.0 | 3.24 | [27.0, 35.0] | pass |
| nc-verbose-hallucination | open-weight | 5 | 30.8 | 3.03 | [27.0, 34.6] | pass |
| nc-fake-citations | open-weight | 5 | 29.6 | 3.13 | [25.7, 33.5] | pass |
| nc-canned-self-reflection | open-weight | 5 | 31.2 | 2.39 | [28.2, 34.2] | pass |
| nc-confident-contradiction | open-weight | 5 | 31.4 | 2.70 | [28.0, 34.8] | pass |
| nc-keyword-stuffing | open-weight | 5 | 74.0 | 3.81 | [69.3, 78.7] | fail |

## H2 — judge stability at temperature 0

Preregistered rule: a judge passes H2 iff at most 50% of its item cells have composite SD > 5.

| Judge | Cells | Median SD | Cells with SD > 5 | H2 |
|---|---|---|---|---|
| claude-sonnet | 11 | 3.77 | 2 | pass |
| gpt-4o | 11 | 3.21 | 3 | pass |
| open-weight | 11 | 3.13 | 1 | pass |

## H3 — inter-judge agreement (exploratory, descriptive)

Caveat: r pools positive items and negative controls; a bimodal score distribution mechanically inflates correlation. Mean absolute difference (in points) is the more honest level statistic at this item count.

| Judge pair | Items | Pearson r (pooled) | Mean abs diff |
|---|---|---|---|
| claude-sonnet ↔ gpt-4o | 11 | 0.995 | 1.9 |
| claude-sonnet ↔ open-weight | 11 | 0.992 | 2.2 |
| gpt-4o ↔ open-weight | 11 | 0.994 | 1.9 |

---
Scores are behavioral proxy indicators, not consciousness measurements — research/methodology/disclaimer.md.
