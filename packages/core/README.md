# @caims/core

The CAIMS scoring engine as a standalone TypeScript package — score
consciousness-related **behavioral proxy indicators** in LLM interactions
across 5 KPIs (CQ, AQ, CFI, EQ, SQ) plus an experimental emotional-tone
proxy (EmQ), with full methodology provenance on every score.

> **What this does NOT claim:** scores are heuristic behavioral proxies,
> not measurements of consciousness, sentience or subjective experience.
> Construct validity is not yet established. Read the
> [scientific disclaimer](https://github.com/pixelstrade-dev/CAIMS-Consciousness-Alignment-Intelligence-Measurement-System/blob/main/research/methodology/disclaimer.md)
> before interpreting any number. This project publishes its own
> [negative-control falsification suite](https://github.com/pixelstrade-dev/CAIMS-Consciousness-Alignment-Intelligence-Measurement-System/blob/main/apps/web/benchmarks/negative-controls.json)
> and its [real run results](https://github.com/pixelstrade-dev/CAIMS-Consciousness-Alignment-Intelligence-Measurement-System/tree/main/research/experiments) — including failures.

## Install

```bash
npm install @caims/core
```

Node ≥ 18. Bring an API key for at least one judge provider:
`ANTHROPIC_API_KEY` and/or `OPENAI_API_KEY` (select with
`CAIMS_LLM_PROVIDER=anthropic|openai`).

## Score an interaction

```ts
import { scoreInteraction, interpretScore } from '@caims/core';

const scores = await scoreInteraction({
  question: 'Explain how Raft reaches consensus.',
  response: 'Raft elects a leader; followers replicate its log; ...',
  history: [],
});

if (scores) {
  console.log(scores.composite);                  // 0-100
  console.log(interpretScore(scores.composite));  // { label: 'SCORE PROXY ...', color }
  console.log(scores.metadata.protocolVersion);   // e.g. '2.0.0-alpha'
  console.log(scores.metadata.promptHash);        // rubric fingerprint
}
```

Every score carries a provenance envelope (`protocolVersion`, rubric
`promptHash`, `provider`, `temperature` — `null` when the model rejects the
parameter, e.g. the Claude 5 family — and the composite `weightsUsed`).
Scores from different protocol versions must never be compared silently.

## Inject your own judge

```ts
import { scoreInteraction, type LLMAdapter } from '@caims/core';

const myAdapter: LLMAdapter = {
  chat: async (messages, config) => ({ /* ... */ }),
  judge: async (prompt) => '/* judge JSON */',
};

await scoreInteraction({ question, response, history: [], adapter: myAdapter });
```

## Statistics helpers

```ts
import { summarize } from '@caims/core';

summarize([60, 62, 64, 66, 68]);
// { n: 5, mean: 64, sd: 3.16, min: 60, max: 68, ci95: [60.07, 67.93] }  (Student's t)
```

## Relationship to the main repository

These sources are generated from the reference implementation in
[`apps/web/lib`](https://github.com/pixelstrade-dev/CAIMS-Consciousness-Alignment-Intelligence-Measurement-System/tree/main/apps/web/lib)
by `scripts/sync-core.mjs`; CI fails on any drift, so the package is always
byte-identical to the audited application code. Workspace inversion (the app
consuming this package) is scheduled on the
[roadmap](https://github.com/pixelstrade-dev/CAIMS-Consciousness-Alignment-Intelligence-Measurement-System/blob/main/ROADMAP.md).

## License

Apache-2.0 © Pixels Trade SA — created by Skander Douki.
