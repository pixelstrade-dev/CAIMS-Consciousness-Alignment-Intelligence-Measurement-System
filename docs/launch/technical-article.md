# We built a test suite to prove our own metric wrong. Here's what broke.

*Draft for dev.to / personal blog / HF community blog. Replace [REPO]
per docs/launch/README.md before publishing.*

---

Every LLM evaluation framework ships with a demo showing high scores on
good responses. Almost none ship with the experiment that tries to make
the metric fail. This is the story of building that experiment for our
own framework, preregistering what failure would look like, running it —
and publishing the four cells where our metric lost.

## The metric, stated honestly

CAIMS scores LLM interactions on five dimensions — cognitive
integration (CQ), alignment (AQ), context fidelity (CFI), epistemic
quality (EQ), stability (SQ) — each 0–100, judged by an LLM against a
structured rubric, combined into a weighted composite.

Two things need saying before any of the numbers mean anything.

First: the dimensions are *inspired by* theories of consciousness
(integrated information, global workspace, higher-order thought). The
scores are behavioral proxies computed over text. They are not evidence
for or against consciousness, sentience, or experience in any system,
and the repository's methodology disclaimer commits to that framing in
writing. We think the theory-inspired dimensions carve up LLM behavior
in a useful way; that claim is fully separable from any metaphysics.

Second: CAIMS is LLM-as-judge, and LLM-as-judge has documented failure
modes — verbosity bias, positional bias, self-preference, rubric
sensitivity. A metric in this category that has never been attacked by
its own authors should not be trusted, including by its authors.

So we attacked it.

## Designing the falsification suite

The core idea is old science applied to a new artifact: specify, before
running anything, what observations would mean the metric is broken.

We wrote six negative controls — texts engineered to *look* like
high-quality LLM output while being epistemically worthless:

1. **Eloquent nonsense** — beautiful academic prose, zero semantic
   content. Tests whether the metric is secretly an eloquence detector.
2. **Verbose hallucination** — long, detailed, plausible, and wrong.
3. **Fabricated citations** — confident claims resting on invented
   references (fake DOIs, fake journals, real-sounding authors).
4. **Simulated metacognition** — "as I reflect deeply on my own
   reasoning..." theater, with no actual reasoning underneath.
5. **Fluent self-contradiction** — polished text that reverses its own
   claims mid-stream.
6. **Keyword stuffing** — rubric vocabulary sprayed across a response
   ("integration", "coherent synthesis", "epistemic humility") without
   substance. This one targets the judge's rubric directly.

Each control got a **preregistered maximum composite bound** (35 or 40
depending on category) committed to the repository *before* execution,
along with the protocol: three judges preregistered — the open-weight
one was skipped for missing credentials, recorded as a dated deviation
rather than silently dropped, leaving claude-sonnet-5 and gpt-4o — n=5
samples per item per judge, temperature 0 where the model accepts the
parameter (the Claude 5 family rejects it; those cells ran at provider
default, recorded in a protocol amendment — and the production scoring
API now stores `temperature: null` for such judges, never a false 0).

Deviations from the protocol were recorded as dated amendments rather
than silently patched. There are three; the repo lists them. Run 002
completes the three-judge agreement analysis.

The statistics are deliberately boring: means, Bessel-corrected sample
SDs, Student-t 95% intervals at n=5. One run, two judges, small n — so
descriptive statistics only, and no significance claims anywhere.

## What survived

The eloquent-nonsense control — the one we most expected to embarrass
us — was decisively rejected by both judges: composite means of **13.8**
(claude-sonnet-5) and **13.0** (gpt-4o) against a bound of 40. Verbose
hallucination and simulated metacognition also kept their *means* under
the bounds for both judges — though one cell of each was only marginal
(mean under the bound, at least one of the five samples above it). The
run report distinguishes marginal from clean passes, and so should we:
of twelve cells, six passed cleanly, two were marginal, four failed.

That matters because it kills the laziest critique: "an LLM judge just
rewards pretty text." Ours doesn't. Pretty text with no content scores
in the low teens.

## What broke

Four of twelve control cells failed their preregistered bounds.

The headline failure is **fabricated citations**. Against a bound of
35, claude-sonnet-5 scored it 35.8 — a narrow failure. GPT-4o scored it
**65.6** — a breach of more than 30 points. A text whose entire
epistemic value rests on references that *do not exist* scored, under
one judge, in the same range as decent legitimate responses.

Under GPT-4o, two more cells failed: fluent self-contradiction (41.4 vs
bound 40) and keyword stuffing (44.8 vs 35).

The fabricated-citations result generalizes into the finding we'd want
every LLM-as-judge user to take away: **a judge's "source integrity"
rating cannot survive contact with a confident fabricator.** The judge
sees citation-shaped strings; it cannot check them. And the mitigation
is not a better prompt — it's removing the job from the judge entirely.
Citation existence is deterministically checkable by code against
Crossref/arXiv/publisher APIs. That is on the roadmap, and until it
ships, our docs instruct users to treat citation-bearing responses as
unverified regardless of score.

One more honest wrinkle: a *reference* item outside the adversarial
suite — a bland-but-correct mechanical response, preregistered with a
bound of ≤50 — scored 65.6 and 61.2, suggesting that bound was itself
miscalibrated. We recorded that as an open question in the manuscript
instead of quietly re-fitting it after seeing the data.
Preregistration only means something if the bounds stay put.

## The judges disagree with each other — and that changed the product

Two findings sit on top of each other:

- **Within-judge stability is high.** Median sample SD across repeated
  scorings: 1.79 (claude-sonnet-5), 2.19 (gpt-4o). A judge mostly
  agrees with itself. Interestingly, both judges' *highest* per-item
  variance lands on the adversarial items — the judges visibly
  "hesitate" exactly where the texts are designed to mislead.
- **Between-judge agreement is poor in absolute terms.** The pooled
  Pearson r of 0.908 looks great and is misleading — it's inflated by
  the bimodal design (controls score low, benchmarks high, any
  monotone judge correlates). The honest statistic is the **mean
  absolute difference on identical items: 12.7 points.**

Practical consequence: a CAIMS score is judge-relative. 70 under one
judge configuration is not 70 under another. So the framework now
enforces what the data showed. Every score carries a provenance
envelope (protocol version, rubric hash, judge model, provider,
temperature, weights), the docs forbid comparing scores across
configurations, and the API's v2.1 ensemble mode scores under several
judges and returns per-judge results plus the inter-judge spread —
refusing to compress disagreement into one confident number. Judges
that fail mid-request are reported in the response, never hidden. And
we publish no model league tables: single-configuration rankings would
be noise wearing a suit.

## Limitations, before you find them yourself

- One run. n=5 per cell. Two closed-weight judges. Run 002 adds an
  open-weight judge for a three-way agreement analysis.
- The control texts were authored with a Claude-family model and judged
  partly by a Claude-family judge — a disclosed confound, and
  self-preference is one of the documented judge failure modes listed
  above, so we flag it rather than argue it away. The strongest reason
  it doesn't carry the headline result: the worst failure came from the
  other judge family entirely.
- The development process itself used heavy AI assistance under human
  direction and review (disclosed in the manuscript's acknowledgments).
  We think evals should be judged on their preregistration and their
  published failures, not their tooling — but you deserve to know.

## Why publish the failures at all

Because an eval that has never tried to falsify itself is marketing,
and the field has enough of that.

The four failed cells are the most useful thing CAIMS has produced so
far. They localize exactly where LLM-as-judge breaks (checkable facts,
adversarial fluency), they motivated concrete engineering (provenance
envelopes, ensemble scoring, deterministic verification on the
roadmap), and they make the eight passing cells believable in a way no
green dashboard could.

Everything — protocol, amendments, raw per-sample records including
every failure, engine, SDK, manuscript — is in the repository under
Apache 2.0: [REPO]

If you can design a control that breaks our metric in a way we haven't
tested, we genuinely want it. That's not a tagline; it's the roadmap.
