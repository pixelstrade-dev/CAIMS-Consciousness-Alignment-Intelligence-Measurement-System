# Public demo deployment — owner/devops runbook

Everything below is prepared in-repo; the account-dependent clicks are the
owner's (stated plainly: automation cannot hold your Vercel/Neon/DNS
accounts, and should not).

## Non-negotiable precondition

Set `CAIMS_API_KEYS` **before** the deployment is reachable. Without it the
API runs open and anyone can spend your LLM credits. With it:
- all GET pages/endpoints stay public (read-only demo browsing),
- every cost-bearing POST (`/api/chat`, `/api/score`, `/api/debate*`,
  `POST /api/session`) requires `Authorization: Bearer <key>` or
  `x-api-key`.
Generate a key: `openssl rand -hex 32`.

## Option A — Vercel + Neon (recommended, ~20 min)

1. **Database**: create a free Postgres on https://neon.tech → copy the
   connection string (with `?sslmode=require`).
2. **Vercel**: https://vercel.com/new → import the GitHub repo →
   Root Directory: `apps/web` (framework auto-detected: Next.js).
3. **Environment variables** (Vercel → Project → Settings → Environment
   Variables), all for Production:
   | Name | Value |
   |---|---|
   | `DATABASE_URL` | the Neon string |
   | `ANTHROPIC_API_KEY` | your key |
   | `OPENAI_API_KEY` | optional (multi-provider) |
   | `CAIMS_API_KEYS` | the generated key(s) |
   | `CAIMS_LLM_PROVIDER` | `anthropic` |
4. **Schema**: from your machine, once:
   `cd apps/web && DATABASE_URL='<neon-url>' npx prisma db push`
5. Deploy. Smoke-check:
   - `GET https://<app>/api/health` → `{"status":"ok",...}` (public)
   - `POST /api/score` without key → **401** (this is the success signal)
   - `POST /api/score` with `Authorization: Bearer <key>` → scores.
6. Budget guard: set spend limits in the Anthropic/OpenAI consoles; the
   in-app rate limits are per-instance and not a cost ceiling.

## Option B — single VPS (docker compose)

`docker compose up -d` with a `.env` containing the same variables
(`CAIMS_API_KEYS` included, `POSTGRES_PASSWORD` set — compose fails silently
to a blank password if unset), behind Caddy/nginx for TLS. The production
`Dockerfile` is multi-stage, non-root, healthchecked.

## What the demo shows publicly

Dashboard, past sessions/debates and scores (read-only), the methodology
disclaimer link, Swagger UI at `/api/docs`. Scoring actions require a key —
hand demo keys to individuals, rotate by editing `CAIMS_API_KEYS`
(comma-separated allows several active at once) and redeploying.

## Explicitly out of scope for the demo (roadmap)

Per-user accounts/multi-tenancy (Session has no owner column), distributed
rate limiting (in-memory per instance), CSP on `/api/docs` (Swagger CDN).
