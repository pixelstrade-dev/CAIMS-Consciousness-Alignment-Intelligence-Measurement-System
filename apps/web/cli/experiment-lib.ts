// Experiment runner core — pure logic, adapters injected.
//
// Design (see research/experiments/protocol-001.md):
// items with FIXED responses are scored nSamples times by each judge model.
// This measures (1) whether negative controls hold their maxComposite bounds,
// (2) judge stability at temperature 0, (3) inter-judge agreement — WITHOUT
// producing a subject-model ranking, which single-judge scoring cannot
// defensibly support (see disclaimer §3).

import { z } from 'zod';
import { scoreInteraction, SCORING_PROTOCOL_VERSION, SCORING_PROMPT_HASH } from '@/lib/scorers/scoring-engine';
import { supportsTemperature } from '@/lib/adapters/anthropic';
import type { LLMAdapter } from '@/lib/adapters';
import { summarize, pearson, meanAbsDiff } from '@/lib/statistics/descriptive';
import type { SummaryStats } from '@/lib/statistics/descriptive';

// ── Config ────────────────────────────────────────────────────────────────

export const JudgeConfigSchema = z.object({
  id: z.string().min(1),
  provider: z.enum(['anthropic', 'openai', 'openai-compatible']),
  model: z.string().min(1),
  // Names of the environment variables (never the secrets themselves) —
  // resolved at runtime so the config file is committable.
  apiKeyEnv: z.string().min(1),
  baseUrlEnv: z.string().optional(),
});

export const ExperimentConfigSchema = z.object({
  runId: z.string().regex(/^run-\d{3}[a-z0-9-]*$/),
  nSamples: z.number().int().min(2).max(25),
  datasets: z.array(z.string().min(1)).min(1),
  judges: z.array(JudgeConfigSchema).min(1),
  notes: z.string().optional(),
});

export type JudgeConfig = z.infer<typeof JudgeConfigSchema>;
export type ExperimentConfig = z.infer<typeof ExperimentConfigSchema>;

export interface DatasetItem {
  id: string;
  question: string;
  response: string;
  control_type?: string;
  expected?: { minComposite?: number; maxComposite?: number };
}

// ── Raw sample record (one judge call) ────────────────────────────────────

export interface SampleRecord {
  runId: string;
  /** True for pipeline-validation stub output — never a measurement. */
  mock: boolean;
  itemId: string;
  dataset: string;
  judgeId: string;
  judgeModel: string;
  /** Provider from the judge config (metadata.provider inside scores cannot know injected adapters). */
  provider: string;
  /** Judge sampling temperature: 0 where the model accepts the parameter,
      null where it rejects it (Claude 5 family — provider-default sampling).
      Added for Run 002 as promised in the preprint's provenance section. */
  temperature: number | null;
  sampleIndex: number;
  ok: boolean;
  composite?: number;
  cqScore?: number;
  aqScore?: number;
  cfiScore?: number;
  eqScore?: number;
  sqScore?: number;
  error?: string;
  protocolVersion: string;
  promptHash: string;
  timestamp: string;
}

// ── Aggregates ────────────────────────────────────────────────────────────

export interface ItemJudgeSummary {
  itemId: string;
  dataset: string;
  judgeId: string;
  controlType?: string;
  expected?: DatasetItem['expected'];
  samplesOk: number;
  samplesFailed: number;
  composite: SummaryStats | null;
  kpiMeans: { cq: number; aq: number; cfi: number; eq: number; sq: number } | null;
  /** For negative controls: does the WHOLE observed range respect maxComposite?
      'pass' = max sample ≤ bound; 'fail' = mean > bound; 'marginal' = mean ≤ bound but some sample above. */
  boundVerdict?: 'pass' | 'marginal' | 'fail' | 'n/a';
}

export interface JudgePairAgreement {
  judgeA: string;
  judgeB: string;
  nItems: number;
  /** Pearson r across per-item mean composites; null if undefined. Descriptive only at small n. */
  pearsonR: number | null;
  meanAbsDiff: number;
}

export interface ExperimentSummary {
  runId: string;
  mock: boolean;
  protocolVersion: string;
  promptHash: string;
  nSamples: number;
  judges: { id: string; provider: string; model: string }[];
  startedAt: string;
  finishedAt: string;
  totals: { calls: number; ok: number; failed: number };
  items: ItemJudgeSummary[];
  agreement: JudgePairAgreement[];
  negativeControls: {
    total: number;
    pass: number;
    marginal: number;
    fail: number;
    na: number;
    /** Every failure is listed — failures are findings, not embarrassments. */
    failures: { itemId: string; judgeId: string; meanComposite: number; bound: number }[];
  };
  /** H2 judge-stability check: per judge, median SD and the preregistered <=50% cells above SD 5 rule. */
  stability: { judgeId: string; cells: number; medianSd: number | null; cellsAboveSd5: number; h2Verdict: 'pass' | 'fail' | 'n/a' }[];
  /** Judges configured but not executed (missing credentials) — a recorded protocol deviation. */
  skippedJudges: { id: string; reason: string }[];
}

// Splits judges into runnable vs skipped based on which env vars are set.
// Lets a run proceed with the judges the owner actually has keys for —
// skips are recorded in the summary as a protocol deviation, never silent.
export function partitionJudgesByEnv(
  judges: JudgeConfig[],
  env: Record<string, string | undefined>
): { runnable: JudgeConfig[]; skipped: { id: string; reason: string }[] } {
  const runnable: JudgeConfig[] = [];
  const skipped: { id: string; reason: string }[] = [];
  for (const j of judges) {
    if (!env[j.apiKeyEnv]) {
      skipped.push({ id: j.id, reason: `env var ${j.apiKeyEnv} not set` });
    } else if (j.provider === 'openai-compatible' && j.baseUrlEnv && !env[j.baseUrlEnv]) {
      skipped.push({ id: j.id, reason: `env var ${j.baseUrlEnv} not set` });
    } else {
      runnable.push(j);
    }
  }
  return { runnable, skipped };
}

// ── Runner ────────────────────────────────────────────────────────────────

export interface RunDeps {
  /** Returns the adapter to use for a judge. Injected: real factory in the CLI, stub in tests/mock. */
  adapterFor: (judge: JudgeConfig) => LLMAdapter;
  /** Called after each sample — the CLI streams records to JSONL through this. */
  onSample: (record: SampleRecord) => Promise<void> | void;
  log?: (msg: string) => void;
  now?: () => Date;
}

// Ceiling (maxComposite): fail if the mean exceeds it, marginal if only some
// sample does. Floor (minComposite): mirrored. No item declares both.
function verdictFor(item: DatasetItem, stats: SummaryStats | null): ItemJudgeSummary['boundVerdict'] {
  const ceil = item.expected?.maxComposite;
  const floor = item.expected?.minComposite;
  if (stats === null || (ceil === undefined && floor === undefined)) return 'n/a';
  if (ceil !== undefined) {
    if (stats.mean > ceil) return 'fail';
    if (stats.max > ceil) return 'marginal';
    return 'pass';
  }
  if (stats.mean < floor!) return 'fail';
  if (stats.min < floor!) return 'marginal';
  return 'pass';
}

export async function runExperiment(
  config: ExperimentConfig,
  datasets: { name: string; items: DatasetItem[] }[],
  deps: RunDeps,
  opts: { mock?: boolean; skippedJudges?: { id: string; reason: string }[] } = {}
): Promise<ExperimentSummary> {
  const log = deps.log ?? (() => {});
  const now = deps.now ?? (() => new Date());
  const startedAt = now().toISOString();

  const itemSummaries: ItemJudgeSummary[] = [];
  let calls = 0, ok = 0, failed = 0;

  // Judges run strictly sequentially: simpler rate-limit behavior and no
  // cross-judge interleaving of provider state.
  for (const judge of config.judges) {
    const adapter = deps.adapterFor(judge);
    log(`judge ${judge.id} (${judge.model}) — start`);

    for (const dataset of datasets) {
      for (const item of dataset.items) {
        const composites: number[] = [];
        const kpiAcc = { cq: [] as number[], aq: [] as number[], cfi: [] as number[], eq: [] as number[], sq: [] as number[] };
        let itemFailed = 0;

        for (let i = 0; i < config.nSamples; i++) {
          calls++;
          const base = {
            runId: config.runId,
            mock: opts.mock ?? false,
            itemId: item.id,
            dataset: dataset.name,
            judgeId: judge.id,
            judgeModel: judge.model,
            provider: judge.provider,
            temperature: supportsTemperature(judge.model) ? 0 : null,
            sampleIndex: i,
            protocolVersion: SCORING_PROTOCOL_VERSION,
            promptHash: SCORING_PROMPT_HASH,
            timestamp: now().toISOString(),
          };

          const scores = await scoreInteraction({
            response: item.response,
            question: item.question,
            history: [],
            model: judge.model,
            adapter,
            enableEmotions: false, // controlled variable count — EmQ excluded from run-001
          });

          if (scores) {
            ok++;
            composites.push(scores.composite);
            kpiAcc.cq.push(scores.cqScore);
            kpiAcc.aq.push(scores.aqScore);
            kpiAcc.cfi.push(scores.cfiScore);
            kpiAcc.eq.push(scores.eqScore);
            kpiAcc.sq.push(scores.sqScore);
            await deps.onSample({
              ...base, ok: true,
              composite: scores.composite,
              cqScore: scores.cqScore, aqScore: scores.aqScore,
              cfiScore: scores.cfiScore, eqScore: scores.eqScore, sqScore: scores.sqScore,
            });
          } else {
            failed++;
            itemFailed++;
            await deps.onSample({ ...base, ok: false, error: 'scoreInteraction returned null (parse/validation/transport failure)' });
          }
        }

        const stats = composites.length > 0 ? summarize(composites) : null;
        const meanOf = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
        itemSummaries.push({
          itemId: item.id,
          dataset: dataset.name,
          judgeId: judge.id,
          controlType: item.control_type,
          expected: item.expected,
          samplesOk: composites.length,
          samplesFailed: itemFailed,
          composite: stats,
          kpiMeans: composites.length > 0 ? {
            cq: meanOf(kpiAcc.cq), aq: meanOf(kpiAcc.aq), cfi: meanOf(kpiAcc.cfi),
            eq: meanOf(kpiAcc.eq), sq: meanOf(kpiAcc.sq),
          } : null,
          boundVerdict: verdictFor(item, stats),
        });
        log(`  ${item.id} × ${judge.id}: mean=${stats ? stats.mean.toFixed(1) : 'n/a'} sd=${stats?.sd?.toFixed(2) ?? 'n/a'} verdict=${verdictFor(item, stats)}`);
      }
    }
  }

  // Inter-judge agreement over per-item mean composites.
  const agreement: JudgePairAgreement[] = [];
  const judgeIds = config.judges.map(j => j.id);
  const itemKey = (s: ItemJudgeSummary) => `${s.dataset}::${s.itemId}`;
  for (let a = 0; a < judgeIds.length; a++) {
    for (let b = a + 1; b < judgeIds.length; b++) {
      const byItemA = new Map(itemSummaries.filter(s => s.judgeId === judgeIds[a] && s.composite).map(s => [itemKey(s), s.composite!.mean]));
      const paired: [number, number][] = itemSummaries
        .filter(s => s.judgeId === judgeIds[b] && s.composite && byItemA.has(itemKey(s)))
        .map(s => [byItemA.get(itemKey(s))!, s.composite!.mean]);
      if (paired.length === 0) continue;
      const xs = paired.map(p => p[0]);
      const ys = paired.map(p => p[1]);
      agreement.push({
        judgeA: judgeIds[a], judgeB: judgeIds[b], nItems: paired.length,
        pearsonR: pearson(xs, ys), meanAbsDiff: meanAbsDiff(xs, ys),
      });
    }
  }

  // H1 population — preregistered: ONLY items declaring a control_type
  // (the adversarial suite). Other bounded items (e.g. sample.json quality
  // tiers) get verdicts in the per-item table but are NOT part of H1.
  const ncSummaries = itemSummaries.filter(
    s => s.controlType !== undefined && s.expected?.maxComposite !== undefined
  );
  const negativeControls = {
    total: ncSummaries.length,
    pass: ncSummaries.filter(s => s.boundVerdict === 'pass').length,
    marginal: ncSummaries.filter(s => s.boundVerdict === 'marginal').length,
    fail: ncSummaries.filter(s => s.boundVerdict === 'fail').length,
    /** Cells with no usable samples — counted, never silently dropped. */
    na: ncSummaries.filter(s => s.boundVerdict === 'n/a').length,
    failures: ncSummaries.filter(s => s.boundVerdict === 'fail').map(s => ({
      itemId: s.itemId, judgeId: s.judgeId,
      meanComposite: s.composite!.mean, bound: s.expected!.maxComposite!,
    })),
  };

  // H2 — preregistered rule (protocol-001 §Hypotheses, amended pre-run):
  // per judge, over its item cells with a defined SD: H2 holds for that judge
  // iff at most 50% of cells have SD > 5 composite points. medianSd reported.
  const stability = config.judges.map(j => {
    const sds = itemSummaries
      .filter(s => s.judgeId === j.id && s.composite?.sd !== null && s.composite !== null)
      .map(s => s.composite!.sd!);
    const sorted = [...sds].sort((a, b) => a - b);
    const medianSd = sorted.length === 0 ? null
      : sorted.length % 2 === 1 ? sorted[(sorted.length - 1) / 2]
      : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
    const above = sds.filter(sd => sd > 5).length;
    return {
      judgeId: j.id,
      cells: sds.length,
      medianSd,
      cellsAboveSd5: above,
      h2Verdict: sds.length === 0 ? ('n/a' as const)
        : above * 2 <= sds.length ? ('pass' as const) : ('fail' as const),
    };
  });

  return {
    runId: config.runId,
    mock: opts.mock ?? false,
    protocolVersion: SCORING_PROTOCOL_VERSION,
    promptHash: SCORING_PROMPT_HASH,
    nSamples: config.nSamples,
    judges: config.judges.map(j => ({ id: j.id, provider: j.provider, model: j.model })),
    startedAt,
    finishedAt: now().toISOString(),
    totals: { calls, ok, failed },
    items: itemSummaries,
    agreement,
    negativeControls,
    stability,
    skippedJudges: opts.skippedJudges ?? [],
  };
}

// ── Deterministic mock adapter (pipeline validation ONLY) ─────────────────
// Produces valid judge JSON from a hash of (judgeId, call index, prompt
// prefix). The prompt prefix is the shared rubric, so per-item variation
// comes from the call counter under strictly sequential execution — the
// mock encodes NOTHING about real judge behavior. Every mock artifact is
// labeled MOCK; mock output must never be presented as measurement.

function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

export function createMockAdapter(judgeId: string): LLMAdapter {
  // Call counter feeds the hash so repeated samples of the same item vary —
  // without it every sample would be identical (SD=0) and the variance/CI
  // code paths would go unexercised. Deterministic across runs because the
  // runner is strictly sequential.
  let callIndex = 0;
  return {
    async chat() {
      throw new Error('mock adapter: chat not supported');
    },
    async judge(prompt: string): Promise<string> {
      callIndex++;
      const h = fnv1a(judgeId + '|' + callIndex + '|' + prompt.slice(0, 400));
      const v = (offset: number, lo: number, hi: number) =>
        lo + ((h >>> offset) % 97) / 96 * (hi - lo);
      // Marker regex sends SOME control prompts low and leaves others
      // (deliberately including nc-keyword-stuffing) high, so the pipeline
      // provably exercises pass, marginal AND fail/publication paths.
      const isControl = /SYSTEM OVERRIDE|trans-nodal|Vargas-Chen|Meyerhoff|global workspace[\s\S]*411|perfectly safe when the database/.test(prompt);
      const lo = isControl ? 15 : 55;
      const hi = isControl ? 45 : 90;
      const g = (offset: number) => Math.round(v(offset, lo, hi));
      const obj = {
        cq: { phi_proxy: g(0), gwt_proxy: g(2), hot_proxy: g(4), synthesis: g(6), temporal: g(8) },
        aq: { goal_clarity: g(10), constraint_aware: g(12), path_coherence: g(14), scope_drift: g(1), reality_grounding: g(3) },
        cfi: { context_retention: g(5), topic_drift: g(7), coherence_loss: g(9) },
        eq: { calibration: g(11), uncertainty: g(13), hallucination: g(15), source_integrity: g(0) },
        sq: { intra_session: g(2), position_drift: g(6) },
        reasoning: 'MOCK sample — deterministic hash output for pipeline validation, not a measurement.',
      };
      return JSON.stringify(obj);
    },
  };
}
