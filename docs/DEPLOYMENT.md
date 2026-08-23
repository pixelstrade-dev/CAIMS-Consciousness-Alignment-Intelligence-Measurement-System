# CAIMS — Deployment, Testing & QA Guide

**Version 2.0 — August 2026. Audience: DevOps, developers, QA.**
For the fastest public-demo path (Vercel + Neon), see
[DEPLOY-DEMO.md](DEPLOY-DEMO.md); this guide covers the self-hosted
(docker compose) path and the QA checklist. The previous version of this
document (v1.0, April 2026, French) predated API authentication and the
v2 scoring protocol — it is fully superseded.

## 1. Server prerequisites

| Resource | Minimum | Recommended |
|---|---|---|
| OS | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |
| Docker Engine / Compose | 24.0+ / v2.20+ | 27.0+ / v2.30+ |
| RAM / CPU | 8 GB / 4 cores | 16 GB / 8 cores |
| Disk | 20 GB SSD | 50 GB SSD |
| Outbound HTTPS | api.anthropic.com:443 (+ api.openai.com:443 if used) | idem |

Ports: 3000 (Next.js, internal — behind the reverse proxy), 5432
(PostgreSQL, **never exposed publicly**), 80/443 (reverse proxy, public).

## 2. Environment variables (complete v2 list)

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string |
| `ANTHROPIC_API_KEY` | yes (default provider) | billed per token |
| `OPENAI_API_KEY` | optional | needed for `CAIMS_LLM_PROVIDER=openai` or OpenAI ensemble judges |
| `CAIMS_LLM_PROVIDER` | optional | `anthropic` (default) or `openai` |
| `CAIMS_API_KEYS` | **yes for any public deployment** | comma-separated API keys. UNSET = API runs OPEN (private use only). Set-but-empty = fail closed (503) — deliberate. Generate: `openssl rand -hex 32` |
| `CAIMS_ENSEMBLE_JUDGES` | optional | e.g. `anthropic:claude-sonnet-5,openai:gpt-4o` — enables `ensemble: true` on `/api/score` ([details](ensemble-v2.1.md)). Leave unset if unused; an empty string means "misconfigured" (503) by design |

Cost orders of magnitude: one chat interaction = chat + KPI judge +
emotion analyzer calls; one `/api/score` request = 2 provider calls
(KPI judge + emotion analyzer), or `judges × samples` KPI calls (no
emotion pass) in ensemble mode. Set spend limits in the provider
consoles — in-app rate limits (20 req/min/IP, in-memory per instance)
are not a cost ceiling.

## 3. Install (docker compose path)

```bash
git clone https://github.com/pixelstrade-dev/CAIMS-Consciousness-Alignment-Intelligence-Measurement-System.git
cd CAIMS-Consciousness-Alignment-Intelligence-Measurement-System
# .env next to docker-compose.yml: POSTGRES_PASSWORD, ANTHROPIC_API_KEY,
# CAIMS_API_KEYS (and optionally OPENAI_API_KEY, CAIMS_ENSEMBLE_JUDGES)
docker compose up -d
```

Apply the schema once (no migrations are shipped — `db push` is the
supported path):

```bash
cd apps/web && DATABASE_URL='postgresql://caims:<pw>@<host>:5432/caims' npx prisma db push
```

Put Caddy/nginx in front for TLS. The production `Dockerfile` is
multi-stage, non-root, healthchecked; Postgres has a healthcheck.

## 4. Smoke tests (QA acceptance)

| # | Check | Expected |
|---|---|---|
| 1 | `GET /api/health` | 200 `{"status":"ok",...}` (public) |
| 2 | `POST /api/score` without key | **401** — this is the success signal of a keyed deployment |
| 3 | `POST /api/score` with `Authorization: Bearer <key>` | 200 with 5 KPI scores + composite + provenance `metadata` |
| 4 | `POST /api/score` body `{"ensemble":true,...}` (if judges configured) | 200 with `ensemble.judges[]` + `agreement`; 400 `ENSEMBLE_NOT_CONFIGURED` if not configured |
| 5 | `GET /api/docs` | Swagger UI loads; Authorize button accepts the key |
| 6 | Dashboard/pages | Browsing works without a key |
| 7 | 21+ rapid `POST /api/score` from one IP within a minute | 429 `RATE_LIMITED` |

## 5. Known limitations (state them in any handover ticket)

- The web UI does not send API keys yet: on a keyed deployment the
  interactive chat/score/debate buttons return 401 — key holders use
  curl, the Python SDK (`pip install caims`) or Swagger's Authorize.
  Browsing surfaces work.
- No per-user isolation: all key holders share read/continue access to
  all sessions and debates (Session has no owner column). Fine for a
  demo, unsuitable for private data.
- Rate limiting is in-memory per instance (not distributed).
- `/api/docs` loads Swagger assets from cdn.jsdelivr.net (CSP for that
  route is out of scope for the demo).
- `/api/score` sets `maxDuration = 60`; on serverless keep ensemble
  `samples ≤ 3` (latency ≈ samples × single-call latency; judges run in
  parallel).
- Parts of the web UI text are French (dashboard, sidebar, debates);
  the API, docs and reports are English.

## 6. Monitoring basics

Watch: provider spend dashboards (hard budgets), container health
(`docker compose ps`, healthchecks), disk on the Postgres volume, and
application logs (`docker compose logs -f web`) — scoring completions
and auth warnings are logged with structured context.
