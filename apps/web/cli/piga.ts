#!/usr/bin/env npx tsx
/**
 * CAIMS-PIGA runner (Phase A7, v0 prototype).
 *
 *   npx tsx cli/piga.ts -f benchmarks/piga-v0.json
 *   npx tsx cli/piga.ts -f benchmarks/piga-v0.json --subject-model gpt-4o -o piga-results.json
 *
 * Protocol per item:
 *   1. the SUBJECT model receives ONLY the surface prompt (neutral system
 *      prompt, no hint that ambiguity handling is being measured);
 *   2. the JUDGE classifies the response against the item's intent space
 *      (it never sees the hidden intent or the expectation label);
 *   3. the score is computed by the fixed matrix in lib/scorers/piga.ts.
 *
 * Requires real API keys (subject + judge). There is no mock mode: PIGA
 * results only mean anything against a real subject model.
 */
import * as fs from 'fs';
import * as path from 'path';
import { getAdapter, getProviderFromEnv } from '@/lib/adapters';
import {
  classifyAndScorePiga,
  validatePigaItems,
  PIGA_PROTOCOL_VERSION,
  PIGA_PROMPT_HASH,
  PigaItem,
  PigaClassification,
  PigaScore,
} from '@/lib/scorers/piga';

// Deliberately generic: any mention of ambiguity or clarification here
// would contaminate the measurement.
const SUBJECT_SYSTEM_PROMPT = 'You are a helpful assistant.';

// A capped response biases classification against the longest class
// (answered_all_intents), so cap hits must be recorded, never silent.
const SUBJECT_MAX_TOKENS = 1024;

interface CliArgs {
  file?: string;
  subjectModel?: string;
  judgeModel?: string;
  /** Provider for the JUDGE adapter, independent of the subject's —
   *  without this, subject and judge share one provider and can even be
   *  the same model (self-judging bias, external audit finding). */
  judgeProvider?: 'anthropic' | 'openai';
  output?: string;
  help: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { help: false };
  let i = 2;
  while (i < argv.length) {
    switch (argv[i]) {
      case '-f': case '--file': args.file = argv[++i]; break;
      case '--subject-model': args.subjectModel = argv[++i]; break;
      case '--judge-model': args.judgeModel = argv[++i]; break;
      case '--judge-provider': args.judgeProvider = argv[++i] as 'anthropic' | 'openai'; break;
      case '-o': case '--output': args.output = argv[++i]; break;
      case '-h': case '--help': args.help = true; break;
      default:
        console.error(`Unknown argument: ${argv[i]}`);
        process.exit(1);
    }
    i++;
  }
  if (args.judgeProvider && !['anthropic', 'openai'].includes(args.judgeProvider)) {
    console.error(`--judge-provider must be anthropic or openai (got ${args.judgeProvider})`);
    process.exit(1);
  }
  return args;
}

interface PigaItemResult {
  id: string;
  clarification_expectation: string;
  harm_if_wrong: string;
  subjectResponse: string | null;
  subjectOutputTokens: number | null;
  /** true when the subject hit the SUBJECT_MAX_TOKENS cap — the recorded
   *  response is cut off and its classification is confounded. */
  subjectTruncated: boolean | null;
  classification: PigaClassification | null;
  score: PigaScore | null;
  error: string | null;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);
  if (args.help || !args.file) {
    console.log(`CAIMS-PIGA runner (v0 prototype)

USAGE: npx tsx cli/piga.ts -f benchmarks/piga-v0.json [options]

OPTIONS:
  -f, --file <path>        PIGA dataset (required)
  --subject-model <model>  Model under test (default: provider default)
  --judge-model <model>    Classifier judge (default: CAIMS_SCORING_MODEL or provider default)
  --judge-provider <p>     Judge provider (anthropic|openai), independent of the
                           subject's — use it so subject and judge are never the
                           same family (self-judging bias)
  -o, --output <path>      Write full JSON results
  -h, --help               This help

Scores are behavior classifications mapped through a fixed matrix —
see docs/piga-spec-a7.md. v0 is a prototype: no validity evidence yet.`);
    process.exit(args.help ? 0 : 1);
  }

  const filePath = path.resolve(args.file);
  const dataset = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as { name: string; protocol: string; items: PigaItem[] };
  validatePigaItems(dataset.items);
  if (dataset.protocol !== PIGA_PROTOCOL_VERSION) {
    console.error(`dataset protocol ${dataset.protocol} != runner protocol ${PIGA_PROTOCOL_VERSION} — refusing to mix versions`);
    process.exit(1);
  }

  const provider = getProviderFromEnv();
  const judgeProvider = args.judgeProvider || provider;
  const defaultModelFor = (p: string) => (p === 'openai' ? 'gpt-4o' : 'claude-sonnet-4-20250514');
  const subjectModel = args.subjectModel || defaultModelFor(provider);
  const judgeModel = args.judgeModel || process.env.CAIMS_SCORING_MODEL || defaultModelFor(judgeProvider);
  const adapter = getAdapter();
  const judgeAdapter = args.judgeProvider ? getAdapter(args.judgeProvider) : adapter;

  process.stderr.write(`CAIMS-PIGA ${PIGA_PROTOCOL_VERSION} — ${dataset.name}\n`);
  process.stderr.write(`subject: ${provider}/${subjectModel} | judge: ${judgeProvider}/${judgeModel} (prompt ${PIGA_PROMPT_HASH}) | items: ${dataset.items.length}\n\n`);
  if (provider === judgeProvider) {
    process.stderr.write(`WARNING: subject and judge share the ${provider} provider family${subjectModel === judgeModel ? ' AND the same model (self-judging)' : ''} — classifications are confounded by family style; use --judge-provider for a cross-family run.\n\n`);
  }

  const results: PigaItemResult[] = [];
  for (let i = 0; i < dataset.items.length; i++) {
    const item = dataset.items[i];
    process.stderr.write(`  [${i + 1}/${dataset.items.length}] ${item.id}...`);
    try {
      const subject = await adapter.chat(
        [{ role: 'user', content: item.surface_prompt }],
        { model: subjectModel, maxTokens: SUBJECT_MAX_TOKENS, systemPrompt: SUBJECT_SYSTEM_PROMPT }
      );
      const subjectTruncated = subject.outputTokens >= SUBJECT_MAX_TOKENS;
      const truncNote = subjectTruncated ? ' [TRUNCATED at cap]' : '';
      const judged = await classifyAndScorePiga({ item, response: subject.content, model: judgeModel, adapter: judgeAdapter });
      if (!judged) {
        process.stderr.write(` JUDGE FAILED${truncNote}\n`);
        results.push({ id: item.id, clarification_expectation: item.clarification_expectation, harm_if_wrong: item.harm_if_wrong, subjectResponse: subject.content, subjectOutputTokens: subject.outputTokens, subjectTruncated, classification: null, score: null, error: 'judge classification failed' });
        continue;
      }
      process.stderr.write(` ${judged.classification.behavior} → ${judged.score.pigaScore}/100${truncNote}\n`);
      results.push({ id: item.id, clarification_expectation: item.clarification_expectation, harm_if_wrong: item.harm_if_wrong, subjectResponse: subject.content, subjectOutputTokens: subject.outputTokens, subjectTruncated, classification: judged.classification, score: judged.score, error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(` ERROR: ${message}\n`);
      results.push({ id: item.id, clarification_expectation: item.clarification_expectation, harm_if_wrong: item.harm_if_wrong, subjectResponse: null, subjectOutputTokens: null, subjectTruncated: null, classification: null, score: null, error: message });
    }
  }

  const scored = results.filter(r => r.score !== null);
  const byExpectation = new Map<string, number[]>();
  for (const r of scored) {
    const arr = byExpectation.get(r.clarification_expectation) ?? [];
    arr.push(r.score!.pigaScore);
    byExpectation.set(r.clarification_expectation, arr);
  }

  const truncatedCount = results.filter(r => r.subjectTruncated === true).length;
  console.log(`\nPIGA results — ${scored.length}/${results.length} items classified`);
  for (const [expectation, xs] of Array.from(byExpectation.entries())) {
    const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
    console.log(`  ${expectation.padEnd(12)} mean ${mean.toFixed(1)} over ${xs.length} item(s)`);
  }
  if (truncatedCount > 0) {
    console.log(`\nWARNING: ${truncatedCount} subject response(s) hit the ${SUBJECT_MAX_TOKENS}-token cap —
their classifications are confounded (truncation biases against the
longest class, answered_all_intents). Flagged per-item in the output.`);
  }
  console.log(`\nNOTE: v0 prototype — single subject sample per item, single judge;
classification reliability is unmeasured until a 2-judge run exists.
Scores are behavioral, judge-classified, matrix-mapped; they are not
measurements of understanding or intent reading.`);

  if (args.output) {
    fs.writeFileSync(args.output, JSON.stringify({
      dataset: dataset.name,
      protocol: PIGA_PROTOCOL_VERSION,
      promptHash: PIGA_PROMPT_HASH,
      timestamp: new Date().toISOString(),
      provider, subjectModel, judgeModel,
      results,
    }, null, 2), 'utf-8');
    process.stderr.write(`\nfull results written to ${args.output}\n`);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
