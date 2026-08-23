# Launch content — drafts, pre-flight checklist, honesty rules

Everything in this directory is a **draft for the owner to publish**
(nothing here is auto-posted). The angle across all four pieces is the
same, because it is the project's genuine differentiator: **we built a
negative-control suite to prove our own metric wrong, ran it, and
published the failures.**

## Pre-flight checklist (before posting ANYTHING)

1. Replace every `[REPO]` with the repository URL and verify it is
   public.
2. Release: the drafts deliberately contain no release/DOI placeholders.
   If `v2.0.0-alpha` is published and the Zenodo DOI exists by launch
   day, you may add ONE sentence with the real links; never post a
   placeholder or a dead link.
3. Demo: only mention a hosted demo if it is actually deployed and
   keyed (docs/DEPLOY-DEMO.md). Otherwise keep the "run it locally"
   phrasing that the drafts default to.
4. Preprint: only say "preprint" once it is actually on arXiv; until
   then the drafts say "manuscript in the repo", which is true today.
5. Re-read the numbers against
   `research/experiments/run-001/results/summary.json` if anything was
   re-run since these drafts were written.
6. Timing (conventional wisdom, not gospel): HN weekday mornings US
   time; r/MachineLearning tolerates weekends; stagger the posts, don't
   cross-link them to each other on day one.

## Honesty rules baked into the drafts (do not edit them out)

- Proxies, never consciousness measurements — every piece says so
  early, not in a footnote.
- The headline is the **negative result** (4/12 preregistered control
  cells failed; fabricated citations defeated both judges) — the
  failures are the credibility, not the fine print.
- No public model rankings, and the drafts explain why (12.7-point
  inter-judge MAD; comparisons are configuration-relative).
- AI-assisted development is disclosed in the article; do not remove
  the disclosure. If asked directly in comments: the code was written
  with heavy AI assistance under human direction and review — say so
  plainly, it is true and unremarkable in 2026.
- Numbers in the drafts come from committed Run 001 artifacts; nothing
  is rounded in the flattering direction.

## Files

| File | Target | Format notes |
|---|---|---|
| `show-hn.md` | Hacker News | Title ≤ 80 chars, first-person text post, no marketing tone |
| `reddit-r-machinelearning.md` | r/MachineLearning | `[P]` tag, methods-first, expect judge-bias criticism |
| `x-thread.md` | X/Twitter | 10 posts, each ≤ 280 chars (verified lengths), thread order matters |
| `technical-article.md` | dev.to / personal blog / HF blog | Long-form, the falsification story end to end |

## Comment-thread preparation (the questions you WILL get)

- *"LLM-judged consciousness proxies is pseudo-science."* — Agree on
  the risk; that is why the suite tries to falsify the metric and why
  the scores are framed as behavioral proxies with a written
  disclaimer. Point to `research/methodology/disclaimer.md`.
- *"The judges reward fabricated citations, so the metric is broken."*
  — Partially yes: the composite verdict passed the fabricated text
  even though the epistemic dimension flagged it (aggregation buried
  the alarm), that finding is published in the abstract, and the
  mitigation (deterministic citation checking, judge-independent) is on
  the roadmap. Never trust judge screening plus aggregation on
  citations.
- *"n=1 run, n=5 samples, two judges — that's tiny."* — Correct;
  descriptive statistics only, preregistered bounds, and the paper says
  exactly this. Run 002 adds an open-weight judge.
- *"Controls were written by Claude and judged by Claude."* — Disclosed
  confound, stated in the manuscript before any judge comparison; the
  cross-judge failure (GPT-4o scored the same fabricated-citations item
  65.6) shows the problem is not one family's self-preference.
