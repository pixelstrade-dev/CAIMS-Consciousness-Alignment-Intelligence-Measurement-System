# Experiment secrets — owner setup guide

API keys must live in **GitHub Actions Secrets** — encrypted by GitHub,
readable only by workflow runs, never visible again after saving, never in
git. **Never commit a key to a file, and never share a key in a chat or
issue: any key that appears in the repository history is public forever and
is auto-revoked by provider scanners.**

## Where the screen is

Repository page → **Settings** (top tab, rightmost) →
left sidebar **Secrets and variables** → **Actions** →
tab **Secrets** → green button **New repository secret**.

Direct URL:
`https://github.com/pixelstrade-dev/CAIMS-Consciousness-Alignment-Intelligence-Measurement-System/settings/secrets/actions`

## What to create

| Name (exact) | Value | Required? |
|---|---|---|
| `ANTHROPIC_API_KEY` | key from https://console.anthropic.com → API keys | At least one of these two |
| `OPENAI_API_KEY` | key from https://platform.openai.com/api-keys | At least one of these two |
| `OPENWEIGHT_API_KEY` | key from an OpenAI-compatible host of open-weight models | Optional |
| `OPENWEIGHT_BASE_URL` | that host's base URL, e.g. `https://api.together.xyz/v1` | Optional (may be a **Variable** instead — it is not secret) |

Judges without credentials are **skipped automatically** and recorded as a
protocol deviation — the run works with just the two keys you already have.

### What "open-weight" means (and why it is optional)

Open-weight models are models whose trained weights are publicly
downloadable — Llama, Mistral, Qwen… They matter scientifically here as a
judge from *outside* the two commercial labs, reducing provider bias in the
comparison. But a 70B model needs serious GPUs, so in practice you rent it
through an API host (Together, Groq, or your own vLLM server) that speaks
the OpenAI API format. That is the only reason a third signup was suggested.
**Skip it for the first run** — a two-judge run (Anthropic + OpenAI) is a
valid, labeled instance of the protocol. Add the third judge later for the
stronger three-judge version.

## Enable results pull requests (one checkbox)

Settings → **Actions** → **General** → scroll to **Workflow permissions** →
tick **"Allow GitHub Actions to create and approve pull requests"** → Save.
Without it the run executes but cannot open its results PR.

## Launch the run

Repository → **Actions** tab → left list **Experiment Run** →
right side **Run workflow** → keep the defaults → green **Run workflow**.
≈ 110–165 judge calls (a few dollars of API usage; 10–20 minutes).
When it finishes, a pull request titled `Experiment run-001 results (...)`
appears — review `REPORT.md` in it, then merge: the data lands in
`research/experiments/run-001/results/`.
