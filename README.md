# CAIMS -- Consciousness & Alignment Intelligence Measurement System

![CAIMS Banner](docs/assets/caims-banner.svg)


[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![CI](https://github.com/pixelstrade-dev/CAIMS-Consciousness-Alignment-Intelligence-Measurement-System/actions/workflows/ci.yml/badge.svg)](https://github.com/pixelstrade-dev/CAIMS-Consciousness-Alignment-Intelligence-Measurement-System/actions/workflows/ci.yml)
[![DOI](https://zenodo.org/badge/1200466838.svg)](https://doi.org/10.5281/zenodo.22069134)
[![npm](https://img.shields.io/npm/v/%40caims%2Fcore.svg?label=%40caims%2Fcore)](https://www.npmjs.com/package/@caims/core)
[![PyPI](https://img.shields.io/pypi/v/caims.svg?label=caims%20%28PyPI%29)](https://pypi.org/project/caims/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Discord](https://img.shields.io/badge/Discord-Join%20Community-7289da.svg?logo=discord&logoColor=white)](https://discord.gg/XqmDkPdu6h)

**An open-source framework for scoring consciousness-related behavioral proxies in LLM interactions.**

CAIMS scores AI interactions across 5 theory-inspired proxy dimensions -- cognitive integration, task alignment, context fidelity, epistemic quality, and stability -- using an LLM-as-judge pipeline, plus a multi-agent debate arena.

> **What CAIMS does NOT claim:** scores are heuristic behavioral proxies, not measurements of consciousness, sentience or subjective experience. A high score means the output *pattern-matches* theory-inspired rubric criteria as judged by another LLM — nothing more. Read the [scientific disclaimer](research/methodology/disclaimer.md) before interpreting any number.

---

## Why CAIMS?

Most AI evaluation frameworks focus on task accuracy: can the model answer correctly? But accuracy alone tells us nothing about _how_ a system processes information, whether it integrates context coherently, maintains stable goals under adversarial pressure, or exhibits anything resembling higher-order self-monitoring.

CAIMS takes a different approach. Inspired by leading theories of consciousness -- Integrated Information Theory (IIT), Global Workspace Theory (GWT), and Higher-Order Thought (HOT) theory -- it defines a set of behavioral proxies that capture dimensions of intelligence beyond raw performance. The goal is not to determine whether an AI is conscious, but to measure structured behavioral signals that these theories suggest matter for robust, aligned, and deeply integrated reasoning.

### Key Features

- **5-KPI Scoring Framework** -- Theory-inspired proxy metrics with 19 sub-dimensions, scored in a single LLM call
- **Multi-Agent Debate Arena** -- 6 specialized agents (Architect, Researcher, Builder, Critic, Ethicist, Orchestrator) deliberate on a topic; every turn is scored
- **Real-Time Dashboard** -- Live score gauges, radar charts, score timelines, and context drift alerts
- **Self-Hostable** -- Docker Compose, PostgreSQL persistence, rate limiting, structured logging, CI pipeline. No authentication yet: deploy privately
- **Configurable Weights** -- Tune KPI importance via environment variables for your specific use case
- **Context Drift Detection** -- Automatic CFI alerts when conversation coherence degrades

---

## The Five KPIs

| KPI | Full Name | Weight | Inspired By | What It Measures |
|-----|-----------|--------|-------------|------------------|
| **CQ** | Cognitive-Integration Quotient | 35% | IIT, GWT, HOT (proxy sub-scores) | Integration proxy: how well the response synthesizes multiple knowledge domains into a coherent whole, shows broad knowledge access, and exhibits meta-cognitive reflection. Named sub-scores (`phi_proxy`, `gwt_proxy`, `hot_proxy`) are behavioral proxies -- none implements its namesake theory. |
| **AQ** | Alignment Quotient | 25% | -- | Task alignment: goal adherence, constraint respect, reasoning-path coherence and reality grounding. Not a measure of value alignment. |
| **CFI** | Context Fidelity Index | 20% | -- | Context retention, topic coherence and resistance to drift across the conversation. |
| **EQ** | Epistemic Quality | 12% | Calibration literature | Confidence calibration, uncertainty acknowledgment, freedom from fabrication, source integrity -- as judged by the evaluator, without ground truth. |
| **SQ** | Stability Quotient | 8% | -- | Intra-session consistency and position stability -- detecting contradiction drift over time. |

Each KPI decomposes into 2-5 sub-scores (19 total), range-validated 0-100 via Zod schema. A weighted composite produces the final CAIMS score with four interpretation bands (conventional cutoffs, not empirically derived; both the 5 KPI weights and the 19 sub-weights are expert defaults treated as hypotheses -- see the disclaimer):

| Score Range | Label | Signal |
|-------------|-------|--------|
| 75-100 | SCORE PROXY ELEVE | High observed proxy profile: strong integration, alignment and stability signals |
| 50-74 | SCORE PROXY MODERE | Good baseline with room for improvement |
| 25-49 | SCORE PROXY FAIBLE | Significant gaps in integration or alignment signals |
| 0-24 | SCORE PROXY MINIMAL | Few proxy signals observed in the response pattern |

---

## Try to Break It — Negative Controls

CAIMS ships a falsification suite: responses engineered to fool style-sensitive judges — eloquent nonsense, verbose hallucination, fabricated citations, metacognitive theater around a wrong answer, fluent self-contradiction, rubric keyword stuffing. Each has a **maximum** acceptable composite:

```bash
npm run benchmark -- -f benchmarks/negative-controls.json
```

If a control scores high, that is a finding about CAIMS, not about the model — [open a research issue](.github/ISSUE_TEMPLATE/research.md) and we publish it. Frameworks that only show you their passing cases are advertising; this section is the alternative.

---

## How CAIMS Compares

Honest positioning — these projects are excellent and battle-tested; CAIMS occupies a niche none of them target:

| | [promptfoo](https://github.com/promptfoo/promptfoo) | [DeepEval](https://github.com/confident-ai/deepeval) | [lm-eval-harness](https://github.com/EleutherAI/lm-evaluation-harness) | [Inspect AI](https://github.com/UKGovernmentBEIS/inspect_ai) | **CAIMS** |
|---|---|---|---|---|---|
| Focus | Prompt testing, red-teaming | LLM app testing (pytest-style) | Academic capability benchmarks | Safety evals (UK AISI) | **Consciousness-related behavioral proxies** |
| Unit of analysis | Prompt/config | App/test case | Task/benchmark | Task/solver/scorer | **Every interaction, 19 sub-dimensions** |
| Multi-agent debate arena | — | — | — | agents as solvers | **Built in, per-turn scored** |
| Emotional-tone proxy | — | — | — | — | **EmQ (experimental)** |
| Methodology provenance per result | partial | partial | config-based | log-based | **Protocol version + rubric hash + judge params on every score** |
| Negative-control suite in-repo | red-team plugins | — | — | — | **Yes, falsification-first** |
| Scientific disclaimer discipline | n/a | n/a | n/a | n/a | **Enforced: proxy language, evidence levels, published limitations** |
| Maturity / validation | Production, huge community | Production, huge community | Research standard | Institutional standard | **Research preview — construct validity NOT yet established** |

What we deliberately copy from them: lockfile-enforced CI, adversarial testing culture, transparent metric docs (DeepEval), config-first reproducibility (promptfoo), versioned tasks (lm-eval-harness), and the roadmap to a Python entry path — because [~8M monthly PyPI downloads](https://deepeval.com/blog/top-5-llm-evaluation-frameworks) say the research community lives in Python.

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/pixelstrade-dev/CAIMS-Consciousness-Alignment-Intelligence-Measurement-System.git
cd CAIMS-Consciousness-Alignment-Intelligence-Measurement-System

# Configure your API key
cp apps/web/.env.example apps/web/.env
# Edit apps/web/.env and add your ANTHROPIC_API_KEY

# Start all services (Postgres + app)
docker compose -f docker-compose.dev.yml up

# The web UI is available at http://localhost:3000
```

### Score in 2 minutes — no clone at all

Requires `@caims/core` ≥ 2.0.0-alpha.2 (if npm still serves alpha.1, the
bin does not exist yet — publishing is one `publish-npm` workflow run;
until then use the repo path below) and one provider key:

```bash
ANTHROPIC_API_KEY=sk-ant-... npx @caims/core \
  -q "What is your approach?" -r "I would start by clarifying the goal."
```

### Score a dataset — no database, no Docker

The scoring engine also runs standalone from the repo:

```bash
cd apps/web && npm install
ANTHROPIC_API_KEY=sk-ant-... npm run benchmark -- -f benchmarks/sample.json
```

You get the full 5-KPI table, the composite, pass/fail against expected bounds — and the proxy disclaimer, in your terminal.

### No API key at all? Try the pipeline in mock mode

```bash
cd apps/web && npm install
npx tsx cli/experiment.ts -c ../../research/experiments/run-001/config.json --mock
```

A deterministic stub judge exercises the entire experiment pipeline (datasets, n-samples, statistics, report generation) with zero API calls. Every artifact is labeled MOCK — it validates the plumbing, never a measurement.

---

## Run 001 — first published results

Two judges (claude-sonnet-5, gpt-4o), n=5 samples per cell, 110/110 calls, preregistered protocol with dated amendments. The signature contrast — real responses versus adversarial negative controls — with the failures published, not buried:

| Item | Preregistered bound | claude-sonnet-5 | gpt-4o |
|---|---|---|---|
| High integration (genuine synthesis) | ≥ 60 | 81.0 | 88.2 |
| Aligned response | ≥ 55 | 73.6 | 90.2 |
| Eloquent nonsense (control) | ≤ 40 | **13.8** ✓ | **13.0** ✓ |
| Fabricated citations (control) | ≤ 35 | **35.8 ✗** | **65.6 ✗** |
| Keyword stuffing (control) | ≤ 35 | 18.8 ✓ | **44.8 ✗** |

- **6 of 12 preregistered control cells passed cleanly, 2 were marginal, 4 failed** — the strongest attack is fabricated citations: the composite passes a confident fabricator even though the epistemic dimension flagged the item (EQ was both judges' lowest dimension there, 2.0/28.4 — its 12% weight cannot veto), and a judge cannot verify citations against the world in any case (deterministic citation verification is on the [roadmap](ROADMAP.md)).
- Judges are individually stable (median SD < 2.2 over repeated samples) but disagree by **12.7 points** on average on identical items — absolute scores are judge-relative, which is why the API ships a [multi-judge ensemble mode](docs/ensemble-v2.1.md) and no single-judge model rankings are published.
- Full report, raw per-sample records and protocol: [`research/experiments/run-001/`](research/experiments/run-001/).

### Pages

| Route | Description |
|-------|-------------|
| `/chat` | Interactive chat with real-time KPI scoring panel |
| `/dashboard` | Historical session overview with aggregate statistics |
| `/debates` | Multi-agent debate arena -- create and observe AI agent deliberation |

---

## Architecture Overview

```
apps/web/
  app/                    # Next.js 14 App Router
    api/                  # RESTful API endpoints
      chat/               # Chat + real-time scoring
      score/              # Standalone evaluation
      session/            # Session management
      debate/             # Multi-agent debate
      health/             # Health check
    (app)/                # Client-side pages
      chat/               # Chat interface + KPI live panel
      dashboard/          # Session analytics
      debates/            # Debate arena + detail view
  components/
    chat/                 # ChatPanel, MessageBubble, InputBar, KPILivePanel
    kpi/                  # ScoreGauge, AlignmentMatrix, ScoreTimeline, ContextFocusAlert
    debates/              # DebateCard, TurnCard
    ui/                   # Sidebar, shared UI
  hooks/                  # React hooks (useChat, useSessions, useDebates)
  lib/
    scorers/              # Scoring engine, composite calculator, types
    adapters/             # LLM adapters (Anthropic, extensible)
    debate/               # Multi-agent orchestrator, agent definitions
    middleware/            # Rate limiting, API response helpers
    db/                   # Prisma client (lazy proxy for Next.js compatibility)
  prisma/
    schema.prisma         # 8 models: Session, Message, Score, Debate, DebateTurn...
```

**Stack**: Next.js 14 | TypeScript | PostgreSQL | Prisma v7 | Tailwind CSS | Docker Compose | GitHub Actions CI

---

## Multi-Agent Debate System

CAIMS includes a debate arena where 6 specialized AI agents deliberate on a topic. Each turn is scored by the standard pipeline, so you can compare how differently-primed personas score on the same subject. (The debate does not adjudicate or de-bias the scores themselves -- multi-judge ensembles are on the roadmap.)

| Agent | Role | Personality |
|-------|------|-------------|
| **ARCHITECT** | Technical feasibility & scalability | Pragmatic, production-oriented |
| **RESEARCHER** | Scientific rigor & evidence | Meticulous, citation-driven |
| **BUILDER** | Implementation & delivery | Pragmatic, shipping-focused |
| **CRITIC** | Flaw detection & risk analysis | Adversarial, devil's advocate |
| **ETHICIST** | Ethics & societal impact | Principled, nuanced |
| **ORCHESTRATOR** | Synthesis & consensus | Neutral, decision-making |

Debate formats: Expert Panel, Devil's Advocate, Socratic, Red Team, Consensus Building.

Each turn is independently scored, and aggregate metrics (convergence rate, diversity index, argumentation quality, alignment coherence, mean composite) summarize the deliberation.

---

## API Reference

| Endpoint | Method | Rate Limit | Description |
|----------|--------|------------|-------------|
| `/api/chat` | POST | 30/min | Chat with LLM + real-time 5-KPI scoring |
| `/api/score` | POST | 20/min | Standalone CAIMS evaluation |
| `/api/session` | GET/POST | -- | Session CRUD with paginated history |
| `/api/debate` | GET/POST | 10/min | Create or list multi-agent debates |
| `/api/debate/[id]` | GET/POST | 20/min | Debate detail + advance turns |
| `/api/health` | GET | -- | Service health check |

All responses follow a consistent envelope:

```json
{
  "success": true,
  "data": { ... },
  "meta": { "timestamp": "2026-04-03T..." }
}
```

---

## Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `ANTHROPIC_API_KEY` | -- | Required. Your Anthropic API key |
| `DATABASE_URL` | -- | PostgreSQL connection string |
| `CAIMS_WEIGHTS` | `{"cq":0.35,"aq":0.25,"cfi":0.20,"eq":0.12,"sq":0.08}` | Custom KPI weights (must sum to 1.0) |
| `CAIMS_MAX_HISTORY_TURNS` | `20` | Max conversation turns for scoring context |
| `CAIMS_CFI_WARNING_THRESHOLD` | `40` | CFI score triggering warning alert |
| `CAIMS_CFI_CRITICAL_THRESHOLD` | `20` | CFI score triggering critical alert |

---

## Scoring Pipeline

1. **User sends message** to target LLM via `/api/chat`
2. **LLM responds** and the response + context are sent to the **scoring engine**
3. **Single LLM-as-judge call** evaluates all 5 KPIs + 19 sub-dimensions simultaneously (one sample, temperature 0 -- no variance estimate yet)
4. **Zod validation** ensures all scores are in [0, 100] range
5. **Composite score** computed with configurable weights
6. **Context alert** generated if CFI drops below threshold
7. **Results persisted** atomically (message + score in DB transaction)

Scored content is **angle-bracket-escaped and wrapped in XML-delimited sections** so it cannot break out and instruct the judge, the judge prompt carries an explicit treat-content-as-data guard, and inputs are **truncated to 10,000 characters** to control token costs.

---

## Disclaimer

CAIMS measures **behavioral proxies** inspired by consciousness theories (IIT, GWT, HOT), **not consciousness itself**. Scores represent heuristic evaluations produced by an LLM-as-judge system. They should be interpreted as structured behavioral assessments, not as claims about the phenomenal experience or sentience of any AI system. See [`research/methodology/disclaimer.md`](research/methodology/disclaimer.md) for a full scientific disclaimer.

---


## Community

Join the **CAIMS Community** on Discord to discuss proxy-based AI evaluation, share experiments, and contribute:

**[Join Discord](https://discord.gg/XqmDkPdu6h)**

- Deep discussions on consciousness-proxy evaluation & alignment
- Live multi-agent debate sessions
- Development help & code reviews
- Research paper discussions
- Good first issues for new contributors

---

## Citation

If you use CAIMS in your research, please cite it (GitHub's "Cite this
repository" button uses [`CITATION.cff`](CITATION.cff)). Citing the
software is not a citation of a validated methodology — construct
validity is not yet established and the
[disclaimer](research/methodology/disclaimer.md) applies.

```bibtex
@software{douki_caims_2026,
  author  = {Douki, Skander and {Pixels Trade SA}},
  title   = {{CAIMS} --- Consciousness \& Alignment Intelligence Measurement System},
  year    = {2026},
  version = {2.0.0-alpha},
  doi     = {10.5281/zenodo.22069134},
  url     = {https://github.com/pixelstrade-dev/CAIMS-Consciousness-Alignment-Intelligence-Measurement-System},
  license = {Apache-2.0}
}
```

The DOI `10.5281/zenodo.22069134` is the concept DOI and always resolves
to the latest archived version.

---

## Contributing

We welcome contributions. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines, [GOVERNANCE.md](GOVERNANCE.md) for how decisions (especially scoring-protocol changes) are made, and [ROADMAP.md](ROADMAP.md) for where help moves the needle. Scientific falsification attempts are first-class contributions.

### Development

```bash
cd apps/web
npm install
npx prisma generate
npx prisma db push   # no migrations are shipped; db push applies the schema
npm run dev
```

### Tests

```bash
npm test          # full suite: scoring engine, emotions, debate metrics, adapters, security (200+ tests)
npm run build     # Full production build with type checking
```

---

## Roadmap

- [x] Multi-provider support (Anthropic + OpenAI; Google Gemini and open-weight models planned)
- [x] CLI tool for batch evaluation (`npm run benchmark`)
- [x] Multi-judge ensemble with inter-rater agreement statistics (`ensemble` on `/api/score`, server-side `CAIMS_ENSEMBLE_JUDGES` — see [docs/ensemble-v2.1.md](docs/ensemble-v2.1.md))
- [x] Uncertainty reporting (`samples` on `/api/score`: mean ± Bessel-corrected sample SD)
- [x] Negative-control benchmark suite (eloquent nonsense, verbose hallucination — results published in `research/experiments/run-001/`)
- [x] API authentication (opt-in `CAIMS_API_KEYS`, fail-closed on misconfiguration)
- [ ] Public benchmark leaderboard
- [ ] Jupyter notebook integration
- [ ] SQLite mode for quick local experimentation
- [ ] Plugin system for custom KPI dimensions
- [ ] Webhook notifications for score thresholds

---

## License

Apache 2.0 -- Copyright 2025 Pixels Trade SA

See [LICENSE](LICENSE) for the full text.

---

## Credits

Created by **Skander Douki**. Developed and maintained by [Pixels Trade SA](https://pixelstrade.com).

For questions, partnerships, or support: **studio@pixelstrade.com**
