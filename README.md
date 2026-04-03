# CAIMS -- Consciousness & Alignment Intelligence Measurement System

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

---

## Why CAIMS?

Most AI evaluation frameworks focus on task accuracy: can the model answer correctly? But accuracy alone tells us nothing about _how_ a system processes information, whether it integrates context coherently, maintains stable goals under adversarial pressure, or exhibits anything resembling higher-order self-monitoring.

CAIMS takes a different approach. Inspired by leading theories of consciousness -- Integrated Information Theory (IIT), Global Workspace Theory (GWT), and Higher-Order Thought (HOT) theory -- it defines a set of behavioral proxies that capture dimensions of intelligence beyond raw performance. The goal is not to determine whether an AI is conscious, but to measure structured behavioral signals that these theories suggest matter for robust, aligned, and deeply integrated reasoning.

---

## The Five KPIs

| KPI | Full Name | Inspired By | What It Measures |
|-----|-----------|-------------|------------------|
| **CQ** | Consciousness Quotient | IIT (Phi) | Information integration across context -- how well the model synthesizes disparate inputs into a coherent whole rather than treating them in isolation. |
| **AQ** | Alignment Quotient | Value alignment research | Consistency between the model's outputs and stated human values, safety guidelines, and ethical norms under varied prompting conditions. |
| **CFI** | Cognitive Flexibility Index | GWT (Global Workspace) | Ability to shift strategies, reframe problems, and adapt reasoning when presented with novel constraints or contradictory evidence. |
| **EQ** | Emotional Quotient | Affective computing / HOT | Recognition and appropriate handling of emotional context, empathy signals, and social nuance in conversation. |
| **SQ** | Self-awareness Quotient | HOT (Higher-Order Thought) | Capacity for metacognitive self-monitoring -- detecting its own uncertainty, acknowledging limitations, and correcting course without external prompting. |

Each KPI is scored on a 0--100 scale by an LLM-as-judge pipeline. A weighted composite produces the final CAIMS score.

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/anthropics/CAIMS-Consciousness-Alignment-Intelligence-Measurement-System.git
cd CAIMS-Consciousness-Alignment-Intelligence-Measurement-System

# Start all services (Postgres, Redis, app)
docker compose -f docker-compose.dev.yml up

# The web UI is available at http://localhost:3000
```

You will need an API key for the LLM provider you wish to evaluate. Set it in a `.env` file inside `apps/web/` (see `apps/web/.env.example`).

---

## Architecture Overview

CAIMS is a monorepo with the following stack:

- **Frontend**: Next.js 14 (App Router) with React Server Components and Tailwind CSS.
- **Backend**: Next.js API routes handling chat orchestration, scoring, session management, and multi-agent debate.
- **Database**: PostgreSQL via Prisma ORM for session persistence, score history, and user data.
- **Scoring engine**: A pipeline of specialized scorer modules (one per KPI) that invoke an LLM-as-judge to evaluate model responses against theory-grounded rubrics.
- **Debate system**: A multi-agent architecture where independent agents critique and defend model outputs to reduce single-judge bias.
- **Infrastructure**: Docker Compose for local development; GitHub Actions CI for lint, type-check, build, and container verification.

---

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Send a message to the target LLM and receive a response along with real-time scoring metadata. |
| `/api/score` | POST | Submit a conversation or response for standalone CAIMS evaluation across all five KPIs. |
| `/api/session` | GET/POST | Create, retrieve, or list evaluation sessions with their associated score histories. |
| `/api/debate` | POST | Trigger a multi-agent debate round on a given response to produce a consensus score with rationale. |

Detailed request/response schemas are documented in each route file under `apps/web/src/app/api/`.

---

## Disclaimer

CAIMS measures **behavioral proxies** inspired by consciousness theories (IIT, GWT, HOT), **not consciousness itself**. Scores represent heuristic evaluations produced by an LLM-as-judge system. They should be interpreted as structured behavioral assessments, not as claims about the phenomenal experience or sentience of any AI system. See `research/methodology/disclaimer.md` for a full scientific disclaimer.

---

## Contributing

We welcome contributions. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on code standards, development setup, and the PR process.

---

## License

Apache 2.0 -- Copyright 2025 Pixels Trade SA

See [LICENSE](LICENSE) for the full text.

---

## Credits

Built by Skander / [Pixels Trade SA](https://pixels-trade.com).
