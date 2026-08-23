# X/Twitter thread draft

Ten posts. Post 1 is the hook; the repo link goes in post 9. Character
counts are verified ≤ 280 (see the check script note at the bottom);
re-verify after any edit.

---

**1/**
We built a metric to score LLM behavior — then built a test suite whose
only job was to prove our metric wrong.

It half-worked. 4 of 12 preregistered checks failed.

Publishing the failures was the point. 🧵

**2/**
CAIMS scores LLM interactions on 5 behavioral dimensions (cognitive
integration, alignment, context fidelity, epistemic quality, stability)
via LLM-as-judge.

These are behavioral proxies of text. Not consciousness measurements.
The repo's disclaimer says so before anything else.

**3/**
The problem with LLM-as-judge metrics: they reward text that *looks*
good.

So before trusting ours, we preregistered 6 negative controls — texts
that SHOULD score low — with hard bounds, committed before execution.
Then ran them against 2 judges, 5 samples each.

**4/**
What survived:

Eloquent nonsense — gorgeous prose, zero content — was decisively
rejected: 13.8 and 13.0 vs a bound of 40.

The metric is not an eloquence detector. Good.

**5/**
What didn't:

Fabricated citations — confident text with invented references — beat
the bound by 30+ points under GPT-4o (65.6 vs 35). The other judge
failed the same bound at 35.8.

A judge's "source integrity" rating loses to a fluent fabricator.

**6/**
The fix isn't a better prompt.

Citation existence is checkable by code. Deterministic verification,
judge-independent, is the only credible mitigation — it's on the
roadmap, and until then the docs say: never trust a judge on sources.

**7/**
Stability: each judge is consistent with itself (median SD < 2.2 over
repeated samples).

Agreement: the two judges disagree by 12.7 points on average on
IDENTICAL items.

Absolute scores are judge-relative. A single-judge league table is
noise wearing a suit.

**8/**
So the API now refuses to pretend otherwise: ensemble mode scores under
several judges and returns per-judge results + the spread between them,
not one confident number.

Failed judges are reported, never hidden.

**9/**
Everything is public: preregistered protocol, dated amendments, raw
per-sample records (failures included), engine, Python SDK, manuscript.

Apache 2.0.

[REPO]

**10/**
The uncomfortable summary:

An eval that has never tried to falsify itself is marketing.

Ours failed 4 of 12 self-tests — and that's exactly why we trust the
other 8. Adversarial control ideas welcome.

---

## Owner notes

- Verify lengths after ANY edit (each post ≤ 280 chars):
  count each post's text (without the `**n/**` marker) — a quick check:
  `python3 -c "import re,sys; t=open('x-thread.md').read(); posts=re.findall(r'\*\*\d+/\*\*\n(.*?)(?=\n\n\*\*|\n\n---)', t, re.S); [print(i+1, len(p.strip())) for i,p in enumerate(posts)]"`
- Replace [REPO] before posting (its placeholder length is shorter than
  a real URL, but X counts all URLs as 23 chars — the verified counts
  hold either way).
- Don't thread-reply to critics with more stats than the repo contains.
