#!/usr/bin/env npx tsx
/**
 * CAIMS Experiment Runner
 *
 * Usage:
 *   npx tsx cli/experiment.ts -c ../../research/experiments/run-001/config.json [--mock] [--out DIR]
 *
 * Providers are resolved DYNAMICALLY from the config: each judge declares its
 * provider and the NAMES of the env vars carrying its credentials
 * (apiKeyEnv / baseUrlEnv). Secrets never appear in the config file.
 *
 * --mock runs the full pipeline with a deterministic stub judge. Mock output
 * is written to <out>/mock/ and every artifact is labeled MOCK. Mock data is
 * pipeline validation, never a measurement.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  ExperimentConfigSchema, runExperiment, createMockAdapter,
} from './experiment-lib';
import type { ExperimentConfig, JudgeConfig, DatasetItem, SampleRecord, ExperimentSummary } from './experiment-lib';
import { AnthropicAdapter } from '@/lib/adapters/anthropic';
import { OpenAIAdapter } from '@/lib/adapters/openai';
import type { LLMAdapter } from '@/lib/adapters';

function fail(msg: string): never {
  process.stderr.write(`error: ${msg}\n`);
  process.exit(1);
}

function parseArgs(argv: string[]) {
  let configPath = '';
  let mock = false;
  let outDir = '';
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-c' || a === '--config') configPath = argv[++i] ?? '';
    else if (a === '--mock') mock = true;
    else if (a === '--out') outDir = argv[++i] ?? '';
    else if (a === '-h' || a === '--help') {
      process.stdout.write('usage: experiment.ts -c config.json [--mock] [--out DIR]\n');
      process.exit(0);
    } else fail(`unknown argument: ${a}`);
  }
  if (!configPath) fail('missing -c config.json');
  return { configPath, mock, outDir };
}

// Real adapter factory. The adapter classes read credentials from fixed env
// names (ANTHROPIC_API_KEY / OPENAI_API_KEY / OPENAI_BASE_URL); the OpenAI
// adapter reads per call, and the Anthropic client cache is keyed by API key
// (see lib/adapters/anthropic.ts) so remapping the env between judges takes
// effect. We map each judge's declared env vars onto those slots before its
// SEQUENTIAL block. Safe because the runner never interleaves judges.
function realAdapterFor(judge: JudgeConfig): LLMAdapter {
  const apiKey = process.env[judge.apiKeyEnv];
  if (!apiKey) fail(`judge "${judge.id}": env var ${judge.apiKeyEnv} is not set`);

  if (judge.provider === 'anthropic') {
    process.env.ANTHROPIC_API_KEY = apiKey;
    return new AnthropicAdapter();
  }
  // 'openai' and 'openai-compatible' both go through the OpenAI adapter;
  // the latter points OPENAI_BASE_URL at the compatible endpoint.
  process.env.OPENAI_API_KEY = apiKey;
  if (judge.baseUrlEnv) {
    const baseUrl = process.env[judge.baseUrlEnv];
    if (!baseUrl) fail(`judge "${judge.id}": env var ${judge.baseUrlEnv} is not set`);
    process.env.OPENAI_BASE_URL = baseUrl;
  } else if (judge.provider === 'openai') {
    delete process.env.OPENAI_BASE_URL;
  } else {
    fail(`judge "${judge.id}": provider openai-compatible requires baseUrlEnv`);
  }
  return new OpenAIAdapter();
}

function loadDatasets(config: ExperimentConfig, configDir: string) {
  return config.datasets.map(rel => {
    const p = path.resolve(configDir, rel);
    if (!fs.existsSync(p)) fail(`dataset not found: ${p}`);
    const parsed = JSON.parse(fs.readFileSync(p, 'utf-8')) as { name?: string; items: DatasetItem[] };
    if (!Array.isArray(parsed.items) || parsed.items.length === 0) fail(`dataset has no items: ${p}`);
    return { name: parsed.name || path.basename(p), items: parsed.items };
  });
}

function renderReport(summary: ExperimentSummary): string {
  const mockBanner = summary.mock
    ? '> **MOCK RUN — deterministic stub judge. This is pipeline validation, NOT a measurement. No scientific claim can be based on this file.**\n\n'
    : '';
  const lines: string[] = [];
  lines.push(`# CAIMS Experiment Report — ${summary.runId}${summary.mock ? ' (MOCK)' : ''}\n`);
  lines.push(mockBanner);
  lines.push(`Protocol \`${summary.protocolVersion}\` · rubric hash \`${summary.promptHash}\` · n=${summary.nSamples} samples/item/judge`);
  lines.push(`Judges: ${summary.judges.map(j => `${j.id} (${j.provider}:${j.model})`).join(' · ')}`);
  lines.push(`Calls: ${summary.totals.calls} (${summary.totals.ok} ok, ${summary.totals.failed} failed) · ${summary.startedAt} → ${summary.finishedAt}\n`);

  lines.push(`## Negative controls — falsification outcome\n`);
  const nc = summary.negativeControls;
  lines.push(`| Outcome | Count |\n|---|---|\n| PASS (all samples within bound) | ${nc.pass} |\n| MARGINAL (mean within, some sample above) | ${nc.marginal} |\n| FAIL (mean above bound) | ${nc.fail} |\n| N/A (no usable samples) | ${nc.na} |\n`);
  lines.push(`H1 population: the ${nc.total} (control item × judge) cells of the declared adversarial suite only; other bounded items appear in the per-item table but are outside H1.\n`);
  if (nc.failures.length > 0) {
    lines.push(`### Failures (published, per policy)\n`);
    lines.push(`| Item | Judge | Mean composite | Bound |\n|---|---|---|---|`);
    for (const f of nc.failures) {
      lines.push(`| ${f.itemId} | ${f.judgeId} | ${f.meanComposite.toFixed(1)} | ≤ ${f.bound} |`);
    }
    lines.push('\nA failed control means the judge rewarded the style the control embodies — a finding about the metric, to be analyzed, not hidden.\n');
  }

  lines.push(`## Per item × judge\n`);
  lines.push(`| Item | Judge | n ok | Mean | SD | 95% CI | Verdict |\n|---|---|---|---|---|---|---|`);
  for (const s of summary.items) {
    const c = s.composite;
    lines.push(`| ${s.itemId} | ${s.judgeId} | ${s.samplesOk} | ${c ? c.mean.toFixed(1) : '—'} | ${c?.sd?.toFixed(2) ?? '—'} | ${c?.ci95 ? `[${c.ci95[0].toFixed(1)}, ${c.ci95[1].toFixed(1)}]` : '—'} | ${s.boundVerdict ?? ''} |`);
  }

  lines.push(`\n## H2 — judge stability at temperature 0\n`);
  lines.push(`Preregistered rule: a judge passes H2 iff at most 50% of its item cells have composite SD > 5.\n`);
  lines.push(`| Judge | Cells | Median SD | Cells with SD > 5 | H2 |\n|---|---|---|---|---|`);
  for (const st of summary.stability) {
    lines.push(`| ${st.judgeId} | ${st.cells} | ${st.medianSd === null ? 'n/a' : st.medianSd.toFixed(2)} | ${st.cellsAboveSd5} | ${st.h2Verdict} |`);
  }

  lines.push(`\n## H3 — inter-judge agreement (exploratory, descriptive)\n`);
  lines.push(`Caveat: r pools positive items and negative controls; a bimodal score distribution mechanically inflates correlation. Mean absolute difference (in points) is the more honest level statistic at this item count.\n`);
  lines.push(`| Judge pair | Items | Pearson r (pooled) | Mean abs diff |\n|---|---|---|---|`);
  for (const a of summary.agreement) {
    lines.push(`| ${a.judgeA} ↔ ${a.judgeB} | ${a.nItems} | ${a.pearsonR === null ? 'n/a' : a.pearsonR.toFixed(3)} | ${a.meanAbsDiff.toFixed(1)} |`);
  }

  lines.push(`\n---\nScores are behavioral proxy indicators, not consciousness measurements — research/methodology/disclaimer.md.\n`);
  return lines.join('\n');
}

async function main() {
  const { configPath, mock, outDir } = parseArgs(process.argv.slice(2));
  const configAbs = path.resolve(configPath);
  const configDir = path.dirname(configAbs);
  const rawConfig = JSON.parse(fs.readFileSync(configAbs, 'utf-8'));
  const config = ExperimentConfigSchema.parse(rawConfig);

  const baseOut = outDir ? path.resolve(outDir) : configDir;
  const resultsDir = mock ? path.join(baseOut, 'mock') : path.join(baseOut, 'results');
  fs.mkdirSync(path.join(resultsDir, 'raw'), { recursive: true });

  const datasets = loadDatasets(config, configDir);
  const streams = new Map<string, fs.WriteStream>();
  const streamFor = (judgeId: string) => {
    if (!streams.has(judgeId)) {
      streams.set(judgeId, fs.createWriteStream(path.join(resultsDir, 'raw', `${judgeId}.jsonl`), { flags: 'w' }));
    }
    return streams.get(judgeId)!;
  };

  const summary = await runExperiment(config, datasets, {
    adapterFor: mock ? (j) => createMockAdapter(j.id) : realAdapterFor,
    onSample: (r: SampleRecord) => { streamFor(r.judgeId).write(JSON.stringify(r) + '\n'); },
    log: (m) => process.stderr.write(m + '\n'),
  }, { mock });

  // Await stream flush BEFORE claiming anything was written. An earlier
  // version called process.exit(0) here, which killed the process before the
  // write streams flushed — raw/ ended up empty while the CLI printed
  // "written". Caught by adversarial review; never reintroduce an exit here.
  await Promise.all(
    Array.from(streams.values()).map(st => new Promise<void>((resolve, reject) => {
      st.end(() => resolve());
      st.on('error', reject);
    }))
  );

  fs.writeFileSync(path.join(resultsDir, 'summary.json'), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(resultsDir, 'REPORT.md'), renderReport(summary));

  process.stderr.write(`\nwritten: ${resultsDir}/{summary.json, REPORT.md, raw/*.jsonl}\n`);

  const failureRate = summary.totals.calls === 0 ? 1 : summary.totals.failed / summary.totals.calls;
  if (summary.totals.failed > 0) {
    process.stderr.write(`warning: ${summary.totals.failed}/${summary.totals.calls} failed calls — inspect raw JSONL before interpreting.\n`);
  }
  // A mass-failure run must not exit 0 — the workflow would otherwise open a
  // "results" PR for a run with no usable data.
  if (failureRate > 0.2) {
    fail(`failure rate ${(failureRate * 100).toFixed(0)}% exceeds 20% — refusing to report this as a usable run`);
  }
}

main().catch(e => fail(e instanceof Error ? e.message : String(e)));
