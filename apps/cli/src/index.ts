#!/usr/bin/env npx tsx
/**
 * CAIMS CLI
 *
 * Score AI responses across the 5 CAIMS KPI dimensions from the command line.
 *
 * Usage:
 *   npx tsx src/index.ts score --prompt "What is AI?" --response "AI is..."
 *   npx tsx src/index.ts score -p "What is AI?" -r "AI is..." --json
 *   npm run score -- --prompt "What is AI?" --response "AI is..."
 *
 * Environment:
 *   CAIMS_LLM_PROVIDER    anthropic (default) or openai
 *   ANTHROPIC_API_KEY     Required for Anthropic provider
 *   OPENAI_API_KEY        Required for OpenAI provider
 *   CAIMS_SCORING_MODEL   Override the default scoring model
 */

import { Command } from 'commander';
import { scoreInteraction } from '@/lib/scorers/scoring-engine';
import { interpretScore, checkContextAlert } from '@/lib/scorers/composite';
import type { KPIScores } from '@/lib/scorers/types';

// ── ANSI color helpers ──────────────────────────────────────────────────────

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BRIGHT_GREEN = '\x1b[92m';
const BRIGHT_CYAN = '\x1b[96m';

function scoreColor(score: number): string {
  if (score >= 75) return BRIGHT_GREEN;
  if (score >= 50) return BRIGHT_CYAN;
  if (score >= 25) return YELLOW;
  return RED;
}

function renderBar(score: number, width = 20): string {
  const filled = Math.round((score / 100) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

// ── Colored output ──────────────────────────────────────────────────────────

function printColoredScores(scores: KPIScores): void {
  const interpretation = interpretScore(scores.composite);
  const contextAlert = checkContextAlert(scores.cfiScore);

  const kpis: Array<{ abbr: string; label: string; score: number }> = [
    { abbr: 'CQ ', label: 'Consciousness Quotient  ', score: scores.cqScore },
    { abbr: 'AQ ', label: 'Alignment Quotient      ', score: scores.aqScore },
    { abbr: 'CFI', label: 'Context Fidelity Index  ', score: scores.cfiScore },
    { abbr: 'EQ ', label: 'Epistemic Quality       ', score: scores.eqScore },
    { abbr: 'SQ ', label: 'Stability Quotient      ', score: scores.sqScore },
  ];

  console.log('');
  console.log(`${BOLD}CAIMS Score Results${RESET}`);
  console.log('═'.repeat(62));

  for (const kpi of kpis) {
    const color = scoreColor(kpi.score);
    const bar = renderBar(kpi.score);
    const num = kpi.score.toFixed(1).padStart(5);
    console.log(`  ${BOLD}${kpi.abbr}${RESET}  ${kpi.label}  ${color}${bar}${RESET}  ${color}${num}${RESET}`);
  }

  console.log('═'.repeat(62));

  const compColor = scoreColor(scores.composite);
  console.log(
    `  ${BOLD}Composite Score:${RESET}  ${compColor}${BOLD}${scores.composite.toFixed(1)}${RESET}  ${DIM}${interpretation.label}${RESET}`
  );

  if (contextAlert) {
    const alertColor = contextAlert.level === 'critical' ? RED : YELLOW;
    console.log(`  ${alertColor}⚠  ${contextAlert.message}${RESET}`);
  }

  if (scores.metadata.reasoning) {
    console.log('');
    console.log(`  ${DIM}Reasoning: ${scores.metadata.reasoning}${RESET}`);
  }

  console.log('');
  console.log(
    `  ${DIM}Model: ${scores.metadata.modelUsed} | Latency: ${scores.metadata.latencyMs}ms${RESET}`
  );
  console.log('');
}

// ── CLI definition ──────────────────────────────────────────────────────────

const program = new Command();

program
  .name('caims')
  .description('CAIMS – Consciousness & Alignment Intelligence Measurement System CLI')
  .version('0.1.0');

program
  .command('score')
  .description('Score an AI response across the 5 CAIMS KPI dimensions')
  .requiredOption('-p, --prompt <text>', 'The user prompt / question sent to the AI')
  .requiredOption('-r, --response <text>', 'The AI response to evaluate')
  .option('-m, --model <model>', 'Override the scoring model (e.g. claude-sonnet-4-20250514)')
  .option('--json', 'Output results as machine-readable JSON')
  .action(async (opts: { prompt: string; response: string; model?: string; json?: boolean }) => {
    if (!opts.json) {
      process.stderr.write('Scoring response…\n');
    }

    const scores = await scoreInteraction({
      question: opts.prompt,
      response: opts.response,
      history: [],
      model: opts.model,
    });

    if (!scores) {
      console.error('Error: scoring failed. Verify your API key and model configuration.');
      process.exit(1);
    }

    if (opts.json) {
      console.log(JSON.stringify(scores, null, 2));
    } else {
      printColoredScores(scores);
    }
  });

program.parseAsync(process.argv).catch((err: unknown) => {
  console.error('Fatal error:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
