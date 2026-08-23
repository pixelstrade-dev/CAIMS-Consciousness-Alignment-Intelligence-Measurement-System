// GENERATED from apps/web/lib — do not edit here. Run: node scripts/sync-core.mjs
// Multi-judge ensemble + n-sample scoring (v2.1 production path).
//
// Run 001 (research/experiments/run-001/) measured a 12.7-point mean absolute
// difference between two judges scoring identical items: single-judge absolute
// scores are judge-relative. This module is the production answer — score the
// same interaction under several judges (and/or several samples per judge) and
// report per-judge results, the ensemble mean, and the inter-judge spread, so
// no single judge's scale is silently presented as "the" score.
//
// Judges are configured SERVER-SIDE via CAIMS_ENSEMBLE_JUDGES
// ("provider:model,provider:model") — never by the client, so an API caller
// cannot spend credits on arbitrary models. Emotion analysis (EmQ) is not run
// in ensemble mode: it is a separate judged pass and its ensemble aggregation
// is future work — stated rather than half-done.

import { scoreInteraction, SCORING_PROTOCOL_VERSION, SCORING_PROMPT_HASH } from './scoring-engine';
import { computeCompositeScore, getActiveWeights } from './composite';
import { getAdapter, getProviderFromEnv, LLMProvider, LLMAdapter } from '../adapters';
import { supportsTemperature } from '../adapters/anthropic';
import { KPIWeights, LLMMessage } from './types';
import { mean, sampleSd } from '../statistics/descriptive';
import { logger } from '../logger';

export const MAX_ENSEMBLE_JUDGES = 4;
export const MAX_SAMPLES_PER_JUDGE = 5;

export interface EnsembleJudge {
  /** Stable display id, e.g. "anthropic:claude-sonnet-5". */
  id: string;
  provider: LLMProvider;
  model: string;
}

export type EnsembleConfig =
  | { status: 'unset' }
  | { status: 'invalid'; reason: string }
  | { status: 'ok'; judges: EnsembleJudge[] };

/**
 * Parses CAIMS_ENSEMBLE_JUDGES ("anthropic:claude-sonnet-5,openai:gpt-4o").
 * unset → ensemble mode unavailable (single-judge API unchanged);
 * set-but-unparseable → 'invalid' so the route can fail loudly instead of
 * silently degrading to one judge (same fail-closed philosophy as auth).
 */
export function getEnsembleConfig(raw: string | undefined = process.env.CAIMS_ENSEMBLE_JUDGES): EnsembleConfig {
  if (raw === undefined) return { status: 'unset' };
  const entries = raw.split(',').map(e => e.trim()).filter(e => e.length > 0);
  if (entries.length === 0) {
    return { status: 'invalid', reason: 'CAIMS_ENSEMBLE_JUDGES is set but contains no judges' };
  }
  if (entries.length > MAX_ENSEMBLE_JUDGES) {
    return { status: 'invalid', reason: `CAIMS_ENSEMBLE_JUDGES lists ${entries.length} judges (max ${MAX_ENSEMBLE_JUDGES})` };
  }
  const judges: EnsembleJudge[] = [];
  for (const entry of entries) {
    const idx = entry.indexOf(':');
    if (idx <= 0 || idx === entry.length - 1) {
      return { status: 'invalid', reason: `entry "${entry}" is not provider:model` };
    }
    const provider = entry.slice(0, idx).trim().toLowerCase();
    const model = entry.slice(idx + 1).trim();
    if (provider !== 'anthropic' && provider !== 'openai') {
      return { status: 'invalid', reason: `unknown provider "${provider}" in "${entry}" (supported: anthropic, openai)` };
    }
    const id = `${provider}:${model}`;
    if (judges.some(j => j.id === id)) {
      return { status: 'invalid', reason: `duplicate judge "${id}"` };
    }
    judges.push({ id, provider: provider as LLMProvider, model });
  }
  return { status: 'ok', judges };
}

/** The single env-configured judge, for n-sample runs without an ensemble. */
export function defaultJudge(): EnsembleJudge {
  const provider = getProviderFromEnv();
  // Provider-aware default — a Claude model name must never be sent to the
  // OpenAI API (same rule as scoreInteraction's default).
  const model =
    process.env.CAIMS_SCORING_MODEL ||
    (provider === 'openai' ? 'gpt-4o' : 'claude-sonnet-4-20250514');
  return { id: `${provider}:${model}`, provider, model };
}

// Statistics come from @/lib/statistics/descriptive — the same mean and
// Bessel-corrected sample SD (null when n < 2) the Run 001 protocol used.
const round1 = (x: number) => Math.round(x * 10) / 10;

// ── Result shapes ──────────────────────────────────────────────────────────
export interface EnsembleJudgeResult {
  id: string;
  provider: LLMProvider;
  model: string;
  temperature: number | null;
  samplesOk: number;
  samplesFailed: number;
  /** Per-KPI means across this judge's ok samples. */
  kpiMeans: { cq: number; aq: number; cfi: number; eq: number; sq: number };
  /** Per-KPI Bessel-corrected sample SD across this judge's ok samples; null when samples < 2. */
  kpiSd: { cq: number | null; aq: number | null; cfi: number | null; eq: number | null; sq: number | null };
  composite: { mean: number; sd: number | null };
}

export interface EnsembleScores {
  /** Ensemble means (equal judge weight); same keys as single-judge scores. */
  scores: { cq: number; aq: number; cfi: number; eq: number; sq: number; composite: number };
  judges: EnsembleJudgeResult[];
  /** Judges whose every sample failed — reported, never hidden. */
  failedJudges: { id: string; provider: LLMProvider; model: string; reason: string }[];
  /** Inter-judge agreement on THIS item; null with fewer than 2 ok judges. */
  agreement: {
    /** max − min of per-judge composite means. */
    compositeSpread: number;
    /** Mean absolute pairwise difference of per-judge composite means. */
    meanAbsDiff: number;
  } | null;
  metadata: {
    mode: 'ensemble';
    protocolVersion: string;
    promptHash: string;
    samplesPerJudge: number;
    weightsUsed: KPIWeights;
    /** EmQ is not aggregated in ensemble mode (future work). */
    emotionAnalysis: 'skipped';
  };
}

const KPI_KEYS = ['cq', 'aq', 'cfi', 'eq', 'sq'] as const;

// ── Main entry ─────────────────────────────────────────────────────────────
export async function scoreEnsemble(params: {
  response: string;
  question: string;
  history: LLMMessage[];
  judges: EnsembleJudge[];
  samplesPerJudge: number;
  /** Injectable adapter factory (tests); defaults to the provider registry. */
  adapterFor?: (judge: EnsembleJudge) => LLMAdapter;
}): Promise<EnsembleScores | null> {
  const samples = Math.min(Math.max(1, Math.floor(params.samplesPerJudge)), MAX_SAMPLES_PER_JUDGE);
  const adapterFor = params.adapterFor ?? ((j: EnsembleJudge) => getAdapter(j.provider));

  const judgeResults: EnsembleJudgeResult[] = [];
  const failedJudges: EnsembleScores['failedJudges'] = [];

  // PARALLEL across judges (they usually target different providers, so this
  // divides wall-clock latency by the judge count — a serverless-timeout
  // concern raised in review); SEQUENTIAL across samples within one judge so
  // no single provider sees a burst. Worst case stays bounded at
  // MAX_ENSEMBLE_JUDGES × MAX_SAMPLES_PER_JUDGE = 20 calls per request.
  const perJudge = await Promise.all(params.judges.map(async (judge):
    Promise<{ ok: EnsembleJudgeResult } | { fail: EnsembleScores['failedJudges'][number] }> => {
    let adapter: LLMAdapter;
    try {
      adapter = adapterFor(judge);
    } catch (e) {
      return { fail: {
        id: judge.id, provider: judge.provider, model: judge.model,
        reason: e instanceof Error ? e.message : String(e),
      } };
    }

    const kpiSamples: Record<(typeof KPI_KEYS)[number], number[]> =
      { cq: [], aq: [], cfi: [], eq: [], sq: [] };
    const composites: number[] = [];
    let failed = 0;

    for (let s = 0; s < samples; s++) {
      const scores = await scoreInteraction({
        response: params.response,
        question: params.question,
        history: params.history,
        model: judge.model,
        adapter,
        enableEmotions: false,
      });
      if (!scores) {
        failed++;
        continue;
      }
      kpiSamples.cq.push(scores.cqScore);
      kpiSamples.aq.push(scores.aqScore);
      kpiSamples.cfi.push(scores.cfiScore);
      kpiSamples.eq.push(scores.eqScore);
      kpiSamples.sq.push(scores.sqScore);
      composites.push(scores.composite);
    }

    if (composites.length === 0) {
      return { fail: {
        id: judge.id, provider: judge.provider, model: judge.model,
        reason: `all ${samples} sample(s) failed (transport/parse/validation)`,
      } };
    }

    const sd = sampleSd(composites);
    return { ok: {
      id: judge.id,
      provider: judge.provider,
      model: judge.model,
      temperature: supportsTemperature(judge.model) ? 0 : null,
      samplesOk: composites.length,
      samplesFailed: failed,
      kpiMeans: {
        cq: round1(mean(kpiSamples.cq)),
        aq: round1(mean(kpiSamples.aq)),
        cfi: round1(mean(kpiSamples.cfi)),
        eq: round1(mean(kpiSamples.eq)),
        sq: round1(mean(kpiSamples.sq)),
      },
      kpiSd: Object.fromEntries(
        KPI_KEYS.map(k => {
          const s = sampleSd(kpiSamples[k]);
          return [k, s === null ? null : round1(s)];
        })
      ) as EnsembleJudgeResult['kpiSd'],
      composite: { mean: round1(mean(composites)), sd: sd === null ? null : round1(sd) },
    } };
  }));

  // Preserve the configured judge order in both result lists.
  for (const r of perJudge) {
    if ('ok' in r) judgeResults.push(r.ok);
    else failedJudges.push(r.fail);
  }

  if (judgeResults.length === 0) {
    logger.error('Ensemble scoring failed: every judge failed', {
      judges: params.judges.map(j => j.id),
    });
    return null;
  }

  // Equal-weight ensemble means across ok judges.
  const kpiEnsemble = Object.fromEntries(
    KPI_KEYS.map(k => [k, round1(mean(judgeResults.map(j => j.kpiMeans[k])))])
  ) as Record<(typeof KPI_KEYS)[number], number>;
  const composite = computeCompositeScore(kpiEnsemble);

  const judgeComposites = judgeResults.map(j => j.composite.mean);
  let agreement: EnsembleScores['agreement'] = null;
  if (judgeComposites.length >= 2) {
    const diffs: number[] = [];
    for (let i = 0; i < judgeComposites.length; i++) {
      for (let j = i + 1; j < judgeComposites.length; j++) {
        diffs.push(Math.abs(judgeComposites[i] - judgeComposites[j]));
      }
    }
    agreement = {
      compositeSpread: round1(Math.max(...judgeComposites) - Math.min(...judgeComposites)),
      meanAbsDiff: round1(mean(diffs)),
    };
  }

  if (failedJudges.length > 0) {
    logger.warn('Ensemble scoring degraded: some judges failed', {
      failed: failedJudges.map(f => f.id),
      succeeded: judgeResults.map(j => j.id),
    });
  }

  return {
    scores: { ...kpiEnsemble, composite },
    judges: judgeResults,
    failedJudges,
    agreement,
    metadata: {
      mode: 'ensemble',
      protocolVersion: SCORING_PROTOCOL_VERSION,
      promptHash: SCORING_PROMPT_HASH,
      samplesPerJudge: samples,
      weightsUsed: getActiveWeights(),
      emotionAnalysis: 'skipped',
    },
  };
}
