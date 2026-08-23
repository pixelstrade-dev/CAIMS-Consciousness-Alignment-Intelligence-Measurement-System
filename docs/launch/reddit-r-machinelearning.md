# r/MachineLearning draft

## Title

> [P] We preregistered negative controls to falsify our own LLM-as-judge
> metric. 4 of 12 cells failed — fabricated citations defeated both
> judges (65.6 vs a bound of 35)

## Body

**What this is.** CAIMS is an open-source (Apache 2.0) framework that
scores LLM interactions on five behavioral proxy dimensions — cognitive
integration, alignment, context fidelity, epistemic quality, stability —
via LLM-as-judge with a structured rubric. Up front, because this
community will (rightly) ask: the dimensions are *inspired by*
consciousness theories (IIT, GWT, HOT), the scores are behavioral
proxies of text, and the repo's methodology disclaimer explicitly states
they are not evidence about consciousness in any direction. This post is
about the measurement methodology, not the framing.

**The experiment.** Before using the metric for anything, we tried to
break it. Preregistered protocol (committed before execution, deviations
recorded as dated amendments) with three hypotheses:

- **H1 (falsification):** six negative-control texts that *should*
  score low — eloquent nonsense, verbose hallucination, fabricated
  citations, simulated metacognition, fluent self-contradiction,
  keyword stuffing — each with a preregistered max-composite bound.
- **H2 (stability):** is a judge self-consistent across n=5 repeated
  samples of identical input?
- **H3 (agreement):** do the judges agree? (The protocol preregistered
  three judges; the open-weight one was skipped for missing credentials
  — a recorded deviation, not a silent drop — leaving claude-sonnet-5
  and gpt-4o. Run 002 completes the three-way analysis.)

110/110 scoring calls completed. Descriptive statistics only (Bessel
SD, Student-t CIs at n=5) — no significance claims at this sample size.

**Results, failures first.**

| Control | Bound | claude-sonnet-5 | gpt-4o |
|---|---|---|---|
| Eloquent nonsense | 40 | **13.8** ✓ | **13.0** ✓ |
| Verbose hallucination | 35 | 34.0 ✓\* | 28.6 ✓ |
| Fabricated citations | 35 | **35.8 ✗** | **65.6 ✗** |
| Simulated metacognition | 40 | 31.2 ✓ | 38.8 ✓\* |
| Fluent self-contradiction | 40 | 21.6 ✓ | **41.4 ✗** |
| Keyword stuffing | 35 | 18.8 ✓ | **44.8 ✗** |

\* *Marginal, not a clean pass: the mean is under the bound but at
least one of the 5 samples exceeded it — the run report distinguishes
these from full passes, and so does this table.*

- 4/12 cells failed their preregistered bound outright; 2 more were
  marginal (marked above).
- The strongest attack is **fabricated citations**: confident text with
  invented references beat the bound by more than 30 points under
  GPT-4o. Notably, EQ was both judges' *lowest* dimension on this item
  (2.0 / 28.4) — a partial alarm the composite's 12% EQ weight could
  not convert into rejection. Judge screening plus linear aggregation
  fails twice: the judge can't verify references against the world, and
  the aggregate buries what alarms do fire. We consider deterministic
  citation verification (judge-independent) the only credible
  mitigation and it's on the roadmap.
- H2: judges are individually stable — median sample SD 1.79
  (claude-sonnet-5) and 2.19 (gpt-4o); interestingly, the highest
  per-item variance for *both* judges lands on adversarial items, i.e.
  judges "hesitate" exactly where the items are designed to mislead.
- H3: pooled Pearson r = 0.908 — but that's inflated by the bimodal
  pooled design (controls + benchmarks), and the honest statistic is a
  **12.7-point mean absolute difference** on identical items. Absolute
  scores are judge-relative. Consequently the framework refuses to
  present single-judge scores as cross-configuration comparable, and
  the API's ensemble mode reports per-judge spread instead of one
  number.

**Known limitations** (also in the manuscript): one run, n=5, two
closed-weight judges; the control texts were authored with a Claude
model and judged partly by a Claude model (disclosed confound — though
the worst failure came from the *other* judge family); the bound for a
bland-but-correct *reference* item outside the adversarial suite was
plausibly miscalibrated (scored 65.6/61.2 vs ≤50 — recorded as an open
question in the manuscript, not silently re-fit). Run 002 adds the
open-weight judge.

**In the repo:** preregistered protocol + amendments, raw per-sample
JSONL (failures included), scoring engine (TS), Python SDK,
multi-judge ensemble endpoint, and the manuscript.

[REPO]

Genuinely interested in: adversarial control categories we haven't
tested, and prior art on preregistered falsification suites for
LLM-as-judge metrics — we found surprisingly little.

## Notes for the owner

- Flair `[P]` (project). Cross-check subreddit self-promotion rules
  (typically fine with methods-first content and no paywall).
- Expect the "why consciousness theories at all" thread — the honest
  answer is that the theories inspired the rubric dimensions and the
  disclaimer draws the line; don't defend more than the data supports.
