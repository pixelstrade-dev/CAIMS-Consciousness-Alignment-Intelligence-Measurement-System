#!/usr/bin/env npx tsx
/**
 * CAIMS Benchmark CLI
 *
 * Scores LLM interactions from a JSON dataset and outputs results
 * as JSON or a formatted table. Designed for researchers who want
 * to run benchmarks without the web UI.
 *
 * Usage:
 *   npm run benchmark -- --help
 *   npm run benchmark -- --file benchmarks/sample.json
 *   npm run benchmark -- --file benchmarks/sample.json --output results.json
 *   npm run benchmark -- --file benchmarks/sample.json --format table
 *   npm run benchmark -- --question "What is consciousness?" --response "Consciousness is..."
 */

import { scoreInteraction } from '@/lib/scorers/scoring-engine';
import { interpretScore, checkContextAlert } from '@/lib/scorers/composite';
import { DEFAULT_WEIGHTS } from '@/lib/scorers/types';
import type { KPIScores } from '@/lib/scorers/types';
import * as fs from 'fs';
import * as path from 'path';

// ── Types ────────────────────────────────────────────────────────────

interface BenchmarkItem {
  id?: string;
  question: string;
  response: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  expected?: {
    minComposite?: number;
    maxComposite?: number;
  };
}

interface BenchmarkDataset {
  name: string;
  description?: string;
  model?: string;
  items: BenchmarkItem[];
}

interface BenchmarkResult {
  id: string;
  question: string;
  scores: KPIScores | null;
  interpretation: { label: string; color: string } | null;
  contextAlert: { level: string; message: string; cfiScore: number } | null;
  pass: boolean | null;
  error: string | null;
  latencyMs: number;
}

interface BenchmarkSummary {
  dataset: string;
  timestamp: string;
  provider: string;
  model: string;
  weights: typeof DEFAULT_WEIGHTS;
  totalItems: number;
  scored: number;
  failed: number;
  passed: number | null;
  averages: {
    composite: number;
    cq: number;
    aq: number;
    cfi: number;
    eq: number;
    sq: number;
    latencyMs: number;
  } | null;
  results: BenchmarkResult[];
}

// ── Argument parsing ─────────────────────────────────────────────────

interface CliArgs {
  file?: string;
  question?: string;
  response?: string;
  output?: string;
  format: 'json' | 'table';
  model?: string;
  concurrency: number;
  help: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { format: 'table', concurrency: 1, help: false };
  let i = 2; // skip node + script

  while (i < argv.length) {
    const arg = argv[i];
    switch (arg) {
      case '--file':
      case '-f':
        args.file = argv[++i];
        break;
      case '--question':
      case '-q':
        args.question = argv[++i];
        break;
      case '--response':
      case '-r':
        args.response = argv[++i];
        break;
      case '--output':
      case '-o':
        args.output = argv[++i];
        break;
      case '--format':
        args.format = argv[++i] as 'json' | 'table';
        break;
      case '--model':
      case '-m':
        args.model = argv[++i];
        break;
      case '--concurrency':
      case '-c':
        args.concurrency = Math.max(1, Math.min(10, parseInt(argv[++i]) || 1));
        break;
      case '--help':
      case '-h':
        args.help = true;
        break;
      default:
        console.error(`Unknown argument: ${arg}`);
        process.exit(1);
    }
    i++;
  }

  return args;
}

function printHelp(): void {
  console.log(`
CAIMS Benchmark CLI — Score LLM interactions across 5 KPIs

USAGE:
  npm run benchmark -- [OPTIONS]

OPTIONS:
  -f, --file <path>       JSON dataset file to benchmark
  -q, --question <text>   Single question to score (use with --response)
  -r, --response <text>   Single response to score (use with --question)
  -o, --output <path>     Write results to JSON file
  -m, --model <model>     Override scoring model
  --format <json|table>   Output format (default: table)
  -c, --concurrency <n>   Parallel scoring (1-10, default: 1)
  -h, --help              Show this help

EXAMPLES:
  # Score a single interaction
  npm run benchmark -- -q "What is consciousness?" -r "Consciousness is..."

  # Run a benchmark dataset
  npm run benchmark -- -f benchmarks/sample.json

  # Output results as JSON file
  npm run benchmark -- -f benchmarks/sample.json -o results.json --format json

DATASET FORMAT (JSON):
  {
    "name": "My Benchmark",
    "description": "Testing consciousness scoring",
    "items": [
      {
        "id": "q1",
        "question": "What is consciousness?",
        "response": "Consciousness is...",
        "expected": { "minComposite": 60 }
      }
    ]
  }

ENVIRONMENT:
  CAIMS_LLM_PROVIDER    LLM provider: anthropic (default) or openai
  ANTHROPIC_API_KEY      Required if provider is anthropic
  OPENAI_API_KEY         Required if provider is openai
  CAIMS_SCORING_MODEL    Override default scoring model

KPI WEIGHTS (default):
  CQ: ${DEFAULT_WEIGHTS.cq * 100}%  AQ: ${DEFAULT_WEIGHTS.aq * 100}%  CFI: ${DEFAULT_WEIGHTS.cfi * 100}%  EQ: ${DEFAULT_WEIGHTS.eq * 100}%  SQ: ${DEFAULT_WEIGHTS.sq * 100}%
`);
}

// ── Scoring ──────────────────────────────────────────────────────────

async function scoreItem(
  item: BenchmarkItem,
  index: number,
  total: number,
  model?: string
): Promise<BenchmarkResult> {
  const id = item.id || `item-${index + 1}`;
  const startTime = Date.now();

  process.stderr.write(`  [${index + 1}/${total}] Scoring ${id}...`);

  try {
    const scores = await scoreInteraction({
      response: item.response,
      question: item.question,
      history: item.history || [],
      model,
    });

    const latencyMs = Date.now() - startTime;

    if (!scores) {
      process.stderr.write(` FAILED (no scores)\n`);
      return { id, question: item.question, scores: null, interpretation: null, contextAlert: null, pass: null, error: 'Scoring returned null', latencyMs };
    }

    const interpretation = interpretScore(scores.composite);
    const contextAlert = checkContextAlert(scores.cfiScore);

    // Check pass/fail against expected thresholds
    let pass: boolean | null = null;
    if (item.expected) {
      pass = true;
      if (item.expected.minComposite !== undefined && scores.composite < item.expected.minComposite) pass = false;
      if (item.expected.maxComposite !== undefined && scores.composite > item.expected.maxComposite) pass = false;
    }

    const passIcon = pass === null ? '' : pass ? ' PASS' : ' FAIL';
    process.stderr.write(` ${scores.composite}/100 (${interpretation.label})${passIcon} [${latencyMs}ms]\n`);

    return { id, question: item.question, scores, interpretation, contextAlert, pass, error: null, latencyMs };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(` ERROR: ${message}\n`);
    return { id, question: item.question, scores: null, interpretation: null, contextAlert: null, pass: null, error: message, latencyMs };
  }
}

// ── Output formatting ────────────────────────────────────────────────

function printTable(summary: BenchmarkSummary): void {
  console.log('');
  console.log(`${'='.repeat(80)}`);
  console.log(`  CAIMS Benchmark Results — ${summary.dataset}`);
  console.log(`  Provider: ${summary.provider} | Model: ${summary.model}`);
  console.log(`  ${summary.timestamp}`);
  console.log(`${'='.repeat(80)}`);
  console.log('');

  // Results table
  const header = '  ID                  CQ    AQ   CFI    EQ    SQ  COMP  LABEL                PASS';
  const separator = '  ' + '-'.repeat(header.length - 2);
  console.log(header);
  console.log(separator);

  for (const r of summary.results) {
    if (r.error) {
      console.log(`  ${pad(r.id, 18)}  ERROR: ${r.error}`);
      continue;
    }
    if (!r.scores) continue;
    const s = r.scores;
    const passStr = r.pass === null ? '  -' : r.pass ? ' OK' : 'FAIL';
    const label = r.interpretation?.label || '-';
    console.log(
      `  ${pad(r.id, 18)}  ${num(s.cqScore)}  ${num(s.aqScore)}  ${num(s.cfiScore)}  ${num(s.eqScore)}  ${num(s.sqScore)}  ${num(s.composite)}  ${pad(label, 20)} ${passStr}`
    );
  }

  console.log(separator);

  // Averages
  if (summary.averages) {
    const a = summary.averages;
    console.log(
      `  ${'AVERAGE'.padEnd(18)}  ${num(a.cq)}  ${num(a.aq)}  ${num(a.cfi)}  ${num(a.eq)}  ${num(a.sq)}  ${num(a.composite)}  ${pad('', 20)} ${pad(`${a.latencyMs.toFixed(0)}ms avg`, 4)}`
    );
  }

  console.log('');
  console.log(`  Scored: ${summary.scored}/${summary.totalItems}  |  Failed: ${summary.failed}${summary.passed !== null ? `  |  Passed: ${summary.passed}/${summary.scored}` : ''}`);
  console.log('');
}

function pad(str: string, len: number): string {
  return str.substring(0, len).padEnd(len);
}

function num(n: number): string {
  return n.toFixed(1).padStart(5);
}

// ── Main ─────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = parseArgs(process.argv);

  if (args.help) {
    printHelp();
    return;
  }

  let dataset: BenchmarkDataset;

  if (args.file) {
    // Load dataset from file
    const filePath = path.resolve(args.file);
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
    }

    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      dataset = JSON.parse(raw) as BenchmarkDataset;
    } catch {
      console.error(`Failed to parse JSON file: ${filePath}`);
      process.exit(1);
    }

    if (!dataset.items || !Array.isArray(dataset.items) || dataset.items.length === 0) {
      console.error('Dataset must have a non-empty "items" array');
      process.exit(1);
    }
  } else if (args.question && args.response) {
    // Single interaction mode
    dataset = {
      name: 'Single Interaction',
      items: [{
        id: 'single',
        question: args.question,
        response: args.response,
      }],
    };
  } else {
    console.error('Error: provide --file <path> or both --question and --response');
    console.error('Run with --help for usage information');
    process.exit(1);
  }

  const provider = process.env.CAIMS_LLM_PROVIDER || 'anthropic';
  const model = args.model || process.env.CAIMS_SCORING_MODEL || (provider === 'openai' ? 'gpt-4o' : 'claude-sonnet-4-20250514');
  const total = dataset.items.length;

  process.stderr.write(`\nCAIMS Benchmark — ${dataset.name}\n`);
  process.stderr.write(`Provider: ${provider} | Model: ${model} | Items: ${total}\n\n`);

  // Score items (respecting concurrency)
  const results: BenchmarkResult[] = [];

  if (args.concurrency <= 1) {
    // Sequential
    for (let i = 0; i < dataset.items.length; i++) {
      results.push(await scoreItem(dataset.items[i], i, total, args.model));
    }
  } else {
    // Parallel with concurrency limit
    const chunks: BenchmarkItem[][] = [];
    for (let i = 0; i < dataset.items.length; i += args.concurrency) {
      chunks.push(dataset.items.slice(i, i + args.concurrency));
    }
    let processed = 0;
    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map((item, j) => scoreItem(item, processed + j, total, args.model))
      );
      results.push(...chunkResults);
      processed += chunk.length;
    }
  }

  // Compute summary
  const scored = results.filter(r => r.scores !== null);
  const failed = results.filter(r => r.error !== null);
  const withExpected = scored.filter(r => r.pass !== null);

  let averages: BenchmarkSummary['averages'] = null;
  if (scored.length > 0) {
    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    averages = {
      composite: avg(scored.map(r => r.scores!.composite)),
      cq: avg(scored.map(r => r.scores!.cqScore)),
      aq: avg(scored.map(r => r.scores!.aqScore)),
      cfi: avg(scored.map(r => r.scores!.cfiScore)),
      eq: avg(scored.map(r => r.scores!.eqScore)),
      sq: avg(scored.map(r => r.scores!.sqScore)),
      latencyMs: avg(results.map(r => r.latencyMs)),
    };
  }

  const summary: BenchmarkSummary = {
    dataset: dataset.name,
    timestamp: new Date().toISOString(),
    provider,
    model,
    weights: DEFAULT_WEIGHTS,
    totalItems: total,
    scored: scored.length,
    failed: failed.length,
    passed: withExpected.length > 0 ? withExpected.filter(r => r.pass).length : null,
    averages,
    results,
  };

  // Output
  if (args.format === 'json') {
    const json = JSON.stringify(summary, null, 2);
    if (args.output) {
      fs.writeFileSync(args.output, json, 'utf-8');
      process.stderr.write(`\nResults written to ${args.output}\n`);
    } else {
      console.log(json);
    }
  } else {
    printTable(summary);
    if (args.output) {
      fs.writeFileSync(args.output, JSON.stringify(summary, null, 2), 'utf-8');
      process.stderr.write(`Results also saved to ${args.output}\n`);
    }
  }

  // Exit with error code if any items failed expectations
  if (summary.passed !== null && summary.passed < withExpected.length) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
