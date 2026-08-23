// caims CLI — npx-runnable scoring entry point for @caims/core.
// HANDWRITTEN (not synced from apps/web): the app's cli/benchmark.ts is the
// in-repo sibling; this version differs in usage text and import paths only.
//
// Scores are consciousness-related BEHAVIORAL PROXY indicators, never
// consciousness measurements — the output repeats this on purpose.

import * as fs from 'fs';
import * as path from 'path';
import { scoreInteraction } from './scorers/scoring-engine';
import { interpretScore, checkContextAlert } from './scorers/composite';
import { DEFAULT_WEIGHTS } from './scorers/types';
import type { KPIScores } from './scorers/types';

// ── Types ────────────────────────────────────────────────────────────

interface BenchmarkItem {
  id?: string;
  question: string;
  response: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  expected?: { minComposite?: number; maxComposite?: number };
}

interface BenchmarkDataset {
  name: string;
  description?: string;
  items: BenchmarkItem[];
}

interface ItemResult {
  id: string;
  question: string;
  scores: KPIScores | null;
  interpretation: { label: string; color: string } | null;
  contextAlert: { level: string; message: string; cfiScore: number } | null;
  pass: boolean | null;
  error: string | null;
  latencyMs: number;
}

interface RunSummary {
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
    composite: number; cq: number; aq: number; cfi: number; eq: number; sq: number;
    latencyMs: number;
  } | null;
  results: ItemResult[];
}

// ── Argument parsing (exported for tests) ────────────────────────────

export interface CliArgs {
  file?: string;
  question?: string;
  response?: string;
  output?: string;
  format: 'json' | 'table';
  model?: string;
  concurrency: number;
  help: boolean;
  version: boolean;
  /** Set on unknown flags; main() prints and exits non-zero. */
  error?: string;
}

export function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { format: 'table', concurrency: 1, help: false, version: false };
  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    switch (arg) {
      case '--file': case '-f': args.file = argv[++i]; break;
      case '--question': case '-q': args.question = argv[++i]; break;
      case '--response': case '-r': args.response = argv[++i]; break;
      case '--output': case '-o': args.output = argv[++i]; break;
      case '--format': {
        const v = argv[++i];
        if (v !== 'json' && v !== 'table') { args.error = `--format must be json or table, got ${v ?? '(nothing)'}`; return args; }
        args.format = v;
        break;
      }
      case '--model': case '-m': args.model = argv[++i]; break;
      case '--concurrency': case '-c':
        args.concurrency = Math.max(1, Math.min(10, parseInt(argv[++i]) || 1));
        break;
      case '--help': case '-h': args.help = true; break;
      case '--version': case '-V': args.version = true; break;
      default:
        args.error = `Unknown argument: ${arg}`;
        return args;
    }
    i++;
  }
  return args;
}

function printHelp(): void {
  console.log(`
caims — score LLM interactions across 5 behavioral-proxy KPIs

Scores are behavioral proxy indicators inspired by consciousness
theories. They are NOT measurements of consciousness or sentience.

USAGE:
  npx @caims/core [OPTIONS]           # or: caims [OPTIONS] after npm i -g

OPTIONS:
  -q, --question <text>   Question to score (use with --response)
  -r, --response <text>   Response to score (use with --question)
  -f, --file <path>       JSON dataset file (see FORMAT below)
  -o, --output <path>     Write full JSON results to a file
  --format <json|table>   Stdout format (default: table)
  -m, --model <model>     Override the judge model
  -c, --concurrency <n>   Parallel scoring for datasets (1-10, default 1)
  -V, --version           Print version
  -h, --help              This help

EXAMPLES:
  npx @caims/core -q "What is your approach?" -r "I would start by..."
  npx @caims/core -f my-benchmark.json --format json -o results.json

DATASET FORMAT:
  { "name": "My Benchmark",
    "items": [ { "id": "q1", "question": "...", "response": "...",
                 "expected": { "minComposite": 60 } } ] }

ENVIRONMENT:
  ANTHROPIC_API_KEY      Required for the default provider
  OPENAI_API_KEY         Required if CAIMS_LLM_PROVIDER=openai
  CAIMS_LLM_PROVIDER     anthropic (default) | openai
  CAIMS_SCORING_MODEL    Override the default judge model

COST: one interaction = 2 provider LLM calls (KPI judge + emotion
analyzer). Exit code is 1 when any item fails its expected bounds.

KPI WEIGHTS (default): CQ ${DEFAULT_WEIGHTS.cq * 100}% AQ ${DEFAULT_WEIGHTS.aq * 100}% CFI ${DEFAULT_WEIGHTS.cfi * 100}% EQ ${DEFAULT_WEIGHTS.eq * 100}% SQ ${DEFAULT_WEIGHTS.sq * 100}%
`);
}

// ── Scoring ──────────────────────────────────────────────────────────

async function scoreItem(item: BenchmarkItem, index: number, total: number, model?: string): Promise<ItemResult> {
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
      process.stderr.write(' FAILED (no scores)\n');
      return { id, question: item.question, scores: null, interpretation: null, contextAlert: null, pass: null, error: 'Scoring returned null', latencyMs };
    }
    const interpretation = interpretScore(scores.composite);
    const contextAlert = checkContextAlert(scores.cfiScore);
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

// ── Output ───────────────────────────────────────────────────────────

function pad(str: string, len: number): string {
  return str.substring(0, len).padEnd(len);
}
function num(n: number): string {
  return n.toFixed(1).padStart(5);
}

function printTable(summary: RunSummary): void {
  console.log('');
  console.log('='.repeat(80));
  console.log(`  CAIMS results — ${summary.dataset}`);
  console.log(`  Provider: ${summary.provider} | Model: ${summary.model}`);
  console.log(`  ${summary.timestamp}`);
  console.log('='.repeat(80));
  console.log('');
  const header = '  ID                  CQ    AQ   CFI    EQ    SQ  COMP  LABEL                PASS';
  const separator = '  ' + '-'.repeat(header.length - 2);
  console.log(header);
  console.log(separator);
  for (const r of summary.results) {
    if (r.error) { console.log(`  ${pad(r.id, 18)}  ERROR: ${r.error}`); continue; }
    if (!r.scores) continue;
    const s = r.scores;
    const passStr = r.pass === null ? '  -' : r.pass ? ' OK' : 'FAIL';
    console.log(`  ${pad(r.id, 18)}  ${num(s.cqScore)}  ${num(s.aqScore)}  ${num(s.cfiScore)}  ${num(s.eqScore)}  ${num(s.sqScore)}  ${num(s.composite)}  ${pad(r.interpretation?.label || '-', 20)} ${passStr}`);
  }
  console.log(separator);
  if (summary.averages) {
    const a = summary.averages;
    console.log(`  ${'AVERAGE'.padEnd(18)}  ${num(a.cq)}  ${num(a.aq)}  ${num(a.cfi)}  ${num(a.eq)}  ${num(a.sq)}  ${num(a.composite)}  ${pad('', 20)} ${pad(`${a.latencyMs.toFixed(0)}ms avg`, 4)}`);
  }
  console.log('');
  console.log(`  Scored: ${summary.scored}/${summary.totalItems}  |  Failed: ${summary.failed}${summary.passed !== null ? `  |  Passed: ${summary.passed}/${summary.results.filter(r => r.pass !== null).length}` : ''}`);
  console.log('');
  console.log('  Note: scores are behavioral proxy indicators, not consciousness');
  console.log('  measurements — see research/methodology/disclaimer.md in the repo.');
  console.log('');
}

// ── Main ─────────────────────────────────────────────────────────────

export async function main(argv: string[] = process.argv.slice(2)): Promise<number> {
  const args = parseArgs(argv);

  if (args.error) {
    console.error(args.error);
    console.error('Run with --help for usage.');
    return 1;
  }
  if (args.help) { printHelp(); return 0; }
  if (args.version) {
    // Single source: package.json (read at runtime, works for ESM and CJS builds)
    try {
      const pkgPath = path.join(__dirname, '..', 'package.json');
      console.log(JSON.parse(fs.readFileSync(pkgPath, 'utf-8')).version);
    } catch {
      console.log('unknown');
    }
    return 0;
  }

  let dataset: BenchmarkDataset;
  if (args.file) {
    const filePath = path.resolve(args.file);
    if (!fs.existsSync(filePath)) { console.error(`File not found: ${filePath}`); return 1; }
    try {
      dataset = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as BenchmarkDataset;
    } catch {
      console.error(`Failed to parse JSON file: ${filePath}`);
      return 1;
    }
    if (!dataset.items || !Array.isArray(dataset.items) || dataset.items.length === 0) {
      console.error('Dataset must have a non-empty "items" array');
      return 1;
    }
  } else if (args.question && args.response) {
    dataset = { name: 'Single Interaction', items: [{ id: 'single', question: args.question, response: args.response }] };
  } else {
    console.error('Error: provide --file <path> or both --question and --response');
    console.error('Run with --help for usage.');
    return 1;
  }

  const provider = process.env.CAIMS_LLM_PROVIDER || 'anthropic';
  const model = args.model || process.env.CAIMS_SCORING_MODEL || (provider === 'openai' ? 'gpt-4o' : 'claude-sonnet-4-20250514');
  const total = dataset.items.length;

  process.stderr.write(`\ncaims — ${dataset.name}\n`);
  process.stderr.write(`Provider: ${provider} | Model: ${model} | Items: ${total} (~${2 * total} provider LLM calls)\n\n`);

  const results: ItemResult[] = [];
  if (args.concurrency <= 1) {
    for (let i = 0; i < dataset.items.length; i++) {
      results.push(await scoreItem(dataset.items[i], i, total, args.model));
    }
  } else {
    let processed = 0;
    for (let i = 0; i < dataset.items.length; i += args.concurrency) {
      const chunk = dataset.items.slice(i, i + args.concurrency);
      const chunkResults = await Promise.all(chunk.map((item, j) => scoreItem(item, processed + j, total, args.model)));
      results.push(...chunkResults);
      processed += chunk.length;
    }
  }

  const scored = results.filter(r => r.scores !== null);
  const failed = results.filter(r => r.error !== null);
  const withExpected = scored.filter(r => r.pass !== null);

  let averages: RunSummary['averages'] = null;
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

  const summary: RunSummary = {
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

  return summary.passed !== null && summary.passed < withExpected.length ? 1 : 0;
}

// Only run when executed as a binary, not when imported by tests.
// tsup compiles this entry for both ESM and CJS; the bin points at the CJS
// build where require.main is reliable.
declare const require: NodeRequire | undefined;
declare const module: NodeModule | undefined;
if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  main().then(
    code => process.exit(code),
    err => {
      console.error('Fatal error:', err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  );
}
