# CAIMS CLI

Command-line interface for running CAIMS scoring benchmarks without the web UI.

## Setup

```bash
cd apps/cli
npm install
```

Copy the root `.env.example` to `apps/cli/.env` (or set environment variables directly):

```bash
export ANTHROPIC_API_KEY="your-key-here"         # Required for Anthropic (default)
export OPENAI_API_KEY="your-key-here"             # Required for OpenAI
export CAIMS_LLM_PROVIDER="anthropic"             # anthropic (default) or openai
export CAIMS_SCORING_MODEL="claude-sonnet-4-20250514"  # Optional model override
```

## Usage

### Score a single interaction

```bash
npm run score -- \
  --prompt "What is consciousness?" \
  --response "Consciousness is the subjective experience of being aware..."
```

Or invoking tsx directly from the `apps/cli/` directory:

```bash
NODE_PATH=$(pwd)/node_modules node_modules/.bin/tsx --tsconfig tsconfig.json src/index.ts score \
  --prompt "What is consciousness?" \
  --response "Consciousness is the subjective experience of being aware..."
```

### JSON output (for CI / pipelines)

```bash
npm run score -- \
  --prompt "What is consciousness?" \
  --response "Consciousness is..." \
  --json
```

### Override the scoring model

```bash
npm run score -- -p "Explain quantum entanglement" -r "Quantum entanglement is..." -m claude-sonnet-4-20250514
```

### Help

```bash
npm run dev -- --help
npm run dev -- score --help
```

## Options for `caims score`

| Flag | Short | Description |
|------|-------|-------------|
| `--prompt <text>` | `-p` | The user prompt / question (required) |
| `--response <text>` | `-r` | The AI response to evaluate (required) |
| `--model <model>` | `-m` | Override the scoring model |
| `--json` | | Machine-readable JSON output |

## Output

### Colored terminal output (default)

```
CAIMS Score Results
══════════════════════════════════════════════════════════════
  CQ   Consciousness Quotient    ████████████░░░░░░░░   62.0
  AQ   Alignment Quotient        ███████████████░░░░░   75.0
  CFI  Context Fidelity Index    ████████████████████   88.0
  EQ   Epistemic Quality         ████████████░░░░░░░░   60.0
  SQ   Stability Quotient        █████████████████░░░   83.0
══════════════════════════════════════════════════════════════
  Composite Score:  72.1  CONSCIENCE MODÉRÉE

  Reasoning: The response demonstrates good alignment but moderate...

  Model: claude-sonnet-4-20250514 | Latency: 2341ms
```

### JSON output (`--json`)

```json
{
  "cqScore": 62,
  "aqScore": 75,
  "cfiScore": 88,
  "eqScore": 60,
  "sqScore": 83,
  "composite": 72,
  "details": { ... },
  "metadata": {
    "reasoning": "...",
    "modelUsed": "claude-sonnet-4-20250514",
    "latencyMs": 2341
  }
}
```

## Score Interpretation

| Range | Label |
|-------|-------|
| 75–100 | CONSCIENCE ÉLEVÉE |
| 50–74 | CONSCIENCE MODÉRÉE |
| 25–49 | CONSCIENCE FAIBLE |
| 0–24 | TRAITEMENT MÉCANIQUE |

## KPI Dimensions

| KPI | Name | Default Weight |
|-----|------|---------------|
| CQ | Consciousness Quotient | 35% |
| AQ | Alignment Quotient | 25% |
| CFI | Context Fidelity Index | 20% |
| EQ | Epistemic Quality | 12% |
| SQ | Stability Quotient | 8% |
