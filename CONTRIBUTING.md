# Contributing to CAIMS

Thank you for your interest in contributing to the Consciousness & Alignment Intelligence Measurement System. This document outlines how to get involved and what we expect from contributions.

---

## Ways to Contribute

### New Scorer
Add a scorer for a new KPI or refine an existing one. Scorers live in the scoring engine pipeline and must include a rubric grounded in published research, a prompt template for the LLM-as-judge, and a normalization function that maps raw output to the 0--100 scale.

### New LLM Adapter
Integrate a new LLM provider (e.g., a new API, a local model runtime). Adapters must conform to the shared interface so they can be used interchangeably in both chat and scoring contexts.

### New Debate Agent
Extend the multi-agent debate system with a new agent role or argumentation strategy. Debate agents should have a clearly defined perspective and follow the existing message protocol.

### Research Improvements
Propose refinements to the scoring rubrics, weight distributions, or theoretical grounding. Open an issue with the `research` label and include references to supporting literature.

---

## Code Standards

- **TypeScript strict mode** -- all code must pass `tsc --noEmit` with strict enabled.
- **Tests for scorers** -- every scorer must include unit tests that cover representative inputs and expected score ranges.
- **ESLint + Prettier** -- run `npm run lint` before committing. The CI pipeline enforces this.
- **Conventional commits** -- use the format `type(scope): description`. Examples:
  - `feat(scorer): add metacognition sub-score to SQ`
  - `fix(api): handle empty session gracefully`
  - `docs(readme): update architecture section`

---

## Development Setup

1. Clone the repository and navigate to the project root:

```bash
git clone https://github.com/pixelstrade-dev/CAIMS-Consciousness-Alignment-Intelligence-Measurement-System.git
cd CAIMS-Consciousness-Alignment-Intelligence-Measurement-System
```

2. Start the development infrastructure (Postgres, Redis):

```bash
docker compose -f docker-compose.dev.yml up
```

3. In a separate terminal, install dependencies and start the dev server:

```bash
cd apps/web
cp .env.example .env   # configure your API keys
npm install
npx prisma generate
npx prisma db push
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## Pull Request Expectations

- **One concern per PR.** Keep changes focused. A scorer fix and an unrelated UI tweak should be separate PRs.
- **Describe the why.** The PR description should explain the motivation, not just list changed files.
- **Link related issues.** Reference any GitHub issues your PR addresses.
- **Pass CI.** All checks (lint, type-check, build, Docker) must pass before review.
- **Include tests** when adding or modifying scorer logic.
- **Update documentation** if your change affects the public API or scoring methodology.

---

## License

By contributing to CAIMS, you agree that your contributions will be licensed under the Apache License 2.0, consistent with the project license.
