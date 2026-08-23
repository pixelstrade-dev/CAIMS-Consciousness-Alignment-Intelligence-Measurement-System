# Show HN draft

## Title (69 chars)

> Show HN: We built a suite to prove our own AI metric wrong. It half-worked

Alternative (77 chars), if the first reads too clever:

> Show HN: CAIMS – scoring LLM behavior proxies, with published negative controls

## Text post

CAIMS scores LLM interactions on five behavioral dimensions (cognitive
integration, alignment, context fidelity, epistemic quality, stability)
using LLM-as-judge. To be blunt about the category: these are
theory-inspired behavioral proxies, not consciousness measurements, and
the repo says so in a written disclaimer before it says anything else.

The part I'd actually like feedback on is the falsification suite.
Before trusting the metric, we preregistered six negative controls —
texts that *should* score low — with hard composite bounds, and ran them
against two judges (Claude Sonnet 5, GPT-4o), n=5 samples per cell:

- Eloquent nonsense (beautiful prose, zero content): decisively
  rejected, 13.8 and 13.0 against a bound of 40. The metric is not an
  eloquence detector.
- Fabricated citations (confident text, invented references): **defeated
  both judges** — GPT-4o scored it 65.6 against a preregistered bound of
  35. Judge-rated "source integrity" is worthless against a confident
  fabricator.
- Overall: 4 of 12 preregistered control cells failed. The failures are
  in the README of the run, not buried: judges are stable (median SD
  under 2.2 across repeated samples) but their absolute scales disagree
  by 12.7 points on identical items, which is why the API now refuses to
  present single-judge numbers as comparable across configurations.

Everything is in the repo: preregistered protocol with dated amendments,
raw per-sample records (including the failures), the scoring engine
(TypeScript), a Python SDK, and a multi-judge ensemble endpoint that
reports per-judge spread instead of a single number.

Run it locally: clone, `npm install`, add an Anthropic or OpenAI key,
and the negative-control suite runs from the CLI. Apache 2.0.

[REPO]

What I'd genuinely like from HN: more adversarial control ideas —
categories of text you'd expect to fool an LLM judge that we haven't
tested yet.

## Notes for the owner

- Post as a text Show HN (link + text). First person, present in the
  comments for the first 2–3 hours.
- The fabricated-citations failure WILL be quoted against the project;
  that is fine and intended — answer that it's published in the
  abstract and drives the deterministic-citation-check roadmap item.
- Do not mention consciousness in the title. The word attracts heat the
  data doesn't back; the body's proxy framing handles it.
