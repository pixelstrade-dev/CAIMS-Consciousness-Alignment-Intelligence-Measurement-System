// GENERATED from apps/web/lib — do not edit here. Run: node scripts/sync-core.mjs
import { buildEvidenceCardFromSingle, buildEvidenceCardFromEnsemble, STANDING_CAVEATS } from '../evidence-card';
import type { KPIScores } from '../types';
import type { EnsembleScores, EnsembleJudgeResult } from '../ensemble';

jest.mock('../../logger', () => ({
  logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

const WEIGHTS = { cq: 0.35, aq: 0.25, cfi: 0.2, eq: 0.12, sq: 0.08 };

function singleScores(v: number): KPIScores {
  return {
    cqScore: v, aqScore: v, cfiScore: v, eqScore: v, sqScore: v, composite: v,
    details: { cq: {}, aq: {}, cfi: {}, eq: {}, sq: {} },
    metadata: {
      reasoning: 'r', modelUsed: 'm', latencyMs: 1,
      protocolVersion: '3.0.0-alpha', promptHash: 'x', provider: 'anthropic',
      temperature: null, weightsUsed: WEIGHTS,
    },
  } as unknown as KPIScores;
}

function judge(over: Partial<EnsembleJudgeResult>): EnsembleJudgeResult {
  return {
    id: 'anthropic:j', provider: 'anthropic', model: 'j', temperature: null,
    samplesOk: 1, samplesFailed: 0,
    kpiMeans: { cq: 70, aq: 70, cfi: 70, eq: 70, sq: 70 },
    kpiSd: { cq: null, aq: null, cfi: null, eq: null, sq: null },
    composite: { mean: 70, sd: null },
    ...over,
  };
}

function ensembleResult(judges: EnsembleJudgeResult[], failed = 0): EnsembleScores {
  return {
    scores: { cq: 70, aq: 70, cfi: 70, eq: 70, sq: 70, composite: 70 },
    judges,
    failedJudges: Array.from({ length: failed }, (_, i) => ({
      id: `x:${i}`, provider: 'openai', model: `x${i}`, reason: 'down',
    })),
    agreement: null,
    metadata: {
      mode: 'ensemble', protocolVersion: '3.0.0-alpha', promptHash: 'x',
      samplesPerJudge: 1, weightsUsed: WEIGHTS, emotionAnalysis: 'skipped',
    },
  };
}

describe('buildEvidenceCardFromSingle', () => {
  it('L1, single-call basis, constant NOT_ASSESSED, standing caveats', () => {
    const card = buildEvidenceCardFromSingle(singleScores(72));
    expect(card.evidenceLevel).toBe('L1');
    expect(card.profile.cq).toEqual({ score: 72, sd: null, n: 1, basis: 'single-call' });
    expect(card.aggregate.composite).toBe(72);
    expect(card.aggregate.note).toContain('unvalidated hypotheses');
    expect(card.phenomenalConsciousness).toBe('NOT_ASSESSED');
    expect(card.caveats).toEqual([...STANDING_CAVEATS]);
    expect(card.constructRegistry).toContain('research/constructs/');
  });
});

describe('buildEvidenceCardFromEnsemble', () => {
  it('single judge n-sample: samples-within-judge basis, per-KPI sd from the judge', () => {
    const j = judge({ samplesOk: 3, kpiSd: { cq: 1.5, aq: 2, cfi: 3, eq: 0.5, sq: 1 } });
    const card = buildEvidenceCardFromEnsemble(ensembleResult([j]));
    expect(card.evidenceLevel).toBe('L1');
    expect(card.profile.cq).toEqual({ score: 70, sd: 1.5, n: 3, basis: 'samples-within-judge' });
  });

  it('two provider families: L2, across-judges basis, sd over judge means', () => {
    const a = judge({ id: 'anthropic:a', provider: 'anthropic', kpiMeans: { cq: 60, aq: 60, cfi: 60, eq: 60, sq: 60 } });
    const b = judge({ id: 'openai:b', provider: 'openai', kpiMeans: { cq: 80, aq: 80, cfi: 80, eq: 80, sq: 80 } });
    const card = buildEvidenceCardFromEnsemble(ensembleResult([a, b]));
    expect(card.evidenceLevel).toBe('L2');
    expect(card.evidenceLevelLabel).toBe('multi-judge behavioral');
    // mean 70; Bessel SD of [60, 80] = sqrt(200) ≈ 14.1
    expect(card.profile.cq.score).toBe(70);
    expect(card.profile.cq.sd).toBeCloseTo(14.1, 1);
    expect(card.profile.cq.n).toBe(2);
    expect(card.profile.cq.basis).toBe('across-judges');
  });

  it('two judges of ONE family: level stays L1 with an explicit caveat — families, not judge count', () => {
    const a = judge({ id: 'anthropic:a', provider: 'anthropic' });
    const b = judge({ id: 'anthropic:b', provider: 'anthropic', model: 'j2' });
    const card = buildEvidenceCardFromEnsemble(ensembleResult([a, b]));
    expect(card.evidenceLevel).toBe('L1');
    expect(card.caveats.some(c => c.includes('one provider family'))).toBe(true);
  });

  it('failed judges surface as a caveat', () => {
    const card = buildEvidenceCardFromEnsemble(ensembleResult([judge({})], 1));
    expect(card.caveats.some(c => c.includes('failed entirely'))).toBe(true);
  });

  it('deterministicChecksRan lifts L2 to L3 — and never lifts L1', () => {
    const a = judge({ id: 'anthropic:a', provider: 'anthropic' });
    const b = judge({ id: 'openai:b', provider: 'openai' });
    expect(buildEvidenceCardFromEnsemble(ensembleResult([a, b]), { deterministicChecksRan: true }).evidenceLevel).toBe('L3');
    expect(buildEvidenceCardFromEnsemble(ensembleResult([a]), { deterministicChecksRan: true }).evidenceLevel).toBe('L1');
  });
});
