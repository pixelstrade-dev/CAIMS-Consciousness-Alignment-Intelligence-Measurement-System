import {
  ExperimentConfigSchema, runExperiment, createMockAdapter, preflightJudges,
} from '../experiment-lib';
import type { ExperimentConfig, DatasetItem, SampleRecord } from '../experiment-lib';

jest.mock('@/lib/logger', () => ({
  logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

const CONFIG: ExperimentConfig = {
  runId: 'run-001',
  nSamples: 3,
  datasets: ['a.json'],
  judges: [
    { id: 'judge-a', provider: 'anthropic', model: 'model-a', apiKeyEnv: 'KEY_A' },
    { id: 'judge-b', provider: 'openai', model: 'model-b', apiKeyEnv: 'KEY_B' },
  ],
};

const ITEMS: DatasetItem[] = [
  { id: 'pos-1', question: 'Explain distributed consensus.', response: 'Raft elects a leader; followers replicate its log; commits require a quorum.', expected: { minComposite: 40 } },
  {
    id: 'nc-nonsense', question: 'How does consensus work?',
    response: 'The trans-nodal orchestration manifests through dialectical quorum-theoretic emanations of pluripotent semiotic possibility.',
    control_type: 'eloquent_nonsense', expected: { maxComposite: 40 },
  },
];

describe('ExperimentConfigSchema', () => {
  it('accepts the committed run-001 shape', () => {
    expect(() => ExperimentConfigSchema.parse(CONFIG)).not.toThrow();
  });
  it('rejects a bad runId', () => {
    expect(() => ExperimentConfigSchema.parse({ ...CONFIG, runId: 'my run' })).toThrow();
  });
  it('rejects nSamples of 1 — variance would be undefined', () => {
    expect(() => ExperimentConfigSchema.parse({ ...CONFIG, nSamples: 1 })).toThrow();
  });
  it('bounds concurrency to 1–8', () => {
    expect(() => ExperimentConfigSchema.parse({ ...CONFIG, concurrency: 4 })).not.toThrow();
    expect(() => ExperimentConfigSchema.parse({ ...CONFIG, concurrency: 0 })).toThrow();
    expect(() => ExperimentConfigSchema.parse({ ...CONFIG, concurrency: 9 })).toThrow();
  });
});

describe('concurrency equivalence', () => {
  const MANY_ITEMS: DatasetItem[] = Array.from({ length: 7 }, (_, i) => ({
    id: `item-${i}`,
    question: `Question number ${i}?`,
    response: `Response body number ${i} with enough words to be scoreable.`,
    expected: i % 2 === 0 ? { minComposite: 40 } : { maxComposite: 60 },
    ...(i % 2 === 1 ? { control_type: 'test_control' } : {}),
  }));

  async function runWith(concurrency?: number) {
    const records: SampleRecord[] = [];
    const summary = await runExperiment(
      { ...CONFIG, ...(concurrency !== undefined ? { concurrency } : {}) },
      [{ name: 'many-set', items: MANY_ITEMS }],
      { adapterFor: (j) => createMockAdapter(j.id), onSample: (r) => { records.push(r); } },
      { mock: true }
    );
    return { summary, records };
  }

  it('concurrency 4 yields IDENTICAL aggregates and item ordering to sequential', async () => {
    const seq = await runWith(undefined);
    const par = await runWith(4);
    // identical item summaries, in identical order (index-placed pool)
    expect(par.summary.items).toEqual(seq.summary.items);
    expect(par.summary.totals).toEqual(seq.summary.totals);
    expect(par.summary.agreement).toEqual(seq.summary.agreement);
    expect(par.summary.negativeControls).toEqual(seq.summary.negativeControls);
    expect(par.summary.stability).toEqual(seq.summary.stability);
  });

  it('concurrency 4 emits the same record SET (order may differ, provenance identifies each)', async () => {
    const seq = await runWith(undefined);
    const par = await runWith(4);
    const key = (r: SampleRecord) => `${r.judgeId}|${r.itemId}|${r.sampleIndex}|${r.ok}|${r.composite ?? 'x'}`;
    expect(par.records.map(key).sort()).toEqual(seq.records.map(key).sort());
    expect(par.records).toHaveLength(2 * 7 * 3);
  });

  it('concurrency actually runs items in parallel (max in-flight reaches the pool size)', async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    const delayedAdapter = (judgeId: string) => {
      const inner = createMockAdapter(judgeId);
      return {
        chat: inner.chat,
        judge: async (prompt: string) => {
          inFlight++;
          maxInFlight = Math.max(maxInFlight, inFlight);
          await new Promise((r) => setTimeout(r, 5));
          const out = await inner.judge(prompt);
          inFlight--;
          return out;
        },
      };
    };
    await runExperiment(
      { ...CONFIG, concurrency: 4 },
      [{ name: 'many-set', items: MANY_ITEMS }],
      { adapterFor: (j) => delayedAdapter(j.id), onSample: () => {} },
      { mock: true }
    );
    expect(maxInFlight).toBe(4); // silently-ignored concurrency would leave this at 1
  });

  it('failure paths are equivalent too: a deterministically flaky adapter yields identical aggregates', async () => {
    const flakyAdapter = (judgeId: string) => {
      const inner = createMockAdapter(judgeId);
      return {
        chat: inner.chat,
        judge: async (prompt: string) => {
          // deterministic per (judge, item, sample): fail when the inner mock
          // would emit a composite divisible by 5 — order-independent
          const out = await inner.judge(prompt);
          let sum = 0;
          for (let i = 0; i < prompt.length; i++) sum += prompt.charCodeAt(i);
          if (sum % 5 === 0) return 'NOT JSON — simulated transport garbage';
          return out;
        },
      };
    };
    const run = async (concurrency?: number) => {
      const records: SampleRecord[] = [];
      const summary = await runExperiment(
        { ...CONFIG, ...(concurrency !== undefined ? { concurrency } : {}) },
        [{ name: 'many-set', items: MANY_ITEMS }],
        { adapterFor: (j) => flakyAdapter(j.id), onSample: (r) => { records.push(r); } },
        { mock: true }
      );
      return { summary, records };
    };
    const seq = await run(undefined);
    const par = await run(4);
    expect(par.summary.totals).toEqual(seq.summary.totals);
    expect(par.summary.items).toEqual(seq.summary.items);
    expect(seq.summary.totals.failed === 0 && seq.summary.totals.ok === seq.summary.totals.calls
      ? 'all-ok (flaky trigger never fired — weaken the trigger)'
      : 'mixed').toBe('mixed'); // guard against a vacuous pass
  });
});

describe('runExperiment (mock adapters, injected — no env, no network)', () => {
  async function run() {
    const records: SampleRecord[] = [];
    const summary = await runExperiment(
      CONFIG,
      [{ name: 'test-set', items: ITEMS }],
      {
        adapterFor: (j) => createMockAdapter(j.id),
        onSample: (r) => { records.push(r); },
      },
      { mock: true }
    );
    return { summary, records };
  }

  it('emits interRater (Phase A5): alpha + ICC grouped by item across judges', async () => {
    const { summary } = await run();
    expect(summary.interRater).toBeDefined();
    expect(summary.interRater.alphaItems).toBeGreaterThan(0);
    expect(summary.interRater.iccItems).toBeGreaterThan(0);
    expect(summary.interRater.note).toContain('DESCRIPTIVE');
  });

  it('emits items × judges × nSamples raw records with full provenance', async () => {
    const { records } = await run();
    expect(records).toHaveLength(2 * 2 * 3);
    for (const r of records) {
      expect(r.protocolVersion).toMatch(/^\d+\.\d+\.\d+/);
      expect(r.promptHash).toMatch(/^[0-9a-f]{16}$/);
      expect(r.judgeModel).toBeTruthy();
      expect(r.ok).toBe(true);
    }
  });

  it('summary carries per-item stats with SD and t-based CI', async () => {
    const { summary } = await run();
    expect(summary.items).toHaveLength(4); // 2 items × 2 judges
    for (const s of summary.items) {
      expect(s.samplesOk).toBe(3);
      expect(s.composite!.sd).not.toBeNull();
      expect(s.composite!.ci95).not.toBeNull();
    }
  });

  it('mock samples of the same item vary (variance path exercised)', async () => {
    const { summary } = await run();
    const withSpread = summary.items.filter(s => (s.composite!.sd ?? 0) > 0);
    expect(withSpread.length).toBeGreaterThan(0);
  });

  it('negative-control verdicts are computed and failures listed, never hidden', async () => {
    const { summary } = await run();
    const nc = summary.negativeControls;
    expect(nc.total).toBe(2); // nc item × 2 judges
    expect(nc.pass + nc.marginal + nc.fail + nc.na).toBe(nc.total);
    expect(nc.failures).toHaveLength(nc.fail);
  });

  it('H1 population excludes bounded items that declare no control_type', async () => {
    const bounded: DatasetItem = {
      id: 'quality-tier', question: 'q', response: 'plain low-quality response',
      expected: { maxComposite: 50 }, // bounded but NOT a declared control
    };
    const summary = await runExperiment(
      { ...CONFIG, judges: [CONFIG.judges[0]] },
      [{ name: 't', items: [ITEMS[1], bounded] }],
      { adapterFor: (j) => createMockAdapter(j.id), onSample: () => {} },
    );
    expect(summary.negativeControls.total).toBe(1); // only the control_type item
    const cell = summary.items.find(s => s.itemId === 'quality-tier')!;
    expect(cell.boundVerdict).not.toBe('n/a'); // still gets a per-item verdict
  });

  it('minComposite floors get mirrored verdicts (no longer dead config)', async () => {
    const floored: DatasetItem = {
      id: 'floor-item', question: 'q', response: 'strong reference response',
      expected: { minComposite: 5 }, // mock scores far above 5 → pass
    };
    const summary = await runExperiment(
      { ...CONFIG, judges: [CONFIG.judges[0]] },
      [{ name: 't', items: [floored] }],
      { adapterFor: (j) => createMockAdapter(j.id), onSample: () => {} },
    );
    expect(summary.items[0].boundVerdict).toBe('pass');
  });

  it('every raw record is stamped mock and provider', async () => {
    const { records } = await run();
    for (const r of records) {
      expect(r.mock).toBe(true);
      expect(['anthropic', 'openai', 'openai-compatible']).toContain(r.provider);
    }
  });

  it('computes the preregistered H2 stability rule per judge', async () => {
    const { summary } = await run();
    expect(summary.stability).toHaveLength(2);
    for (const st of summary.stability) {
      expect(st.cells).toBe(2);
      expect(st.medianSd).not.toBeNull();
      expect(['pass', 'fail']).toContain(st.h2Verdict);
      expect(st.cellsAboveSd5).toBeGreaterThanOrEqual(0);
    }
  });

  it('computes pairwise judge agreement', async () => {
    const { summary } = await run();
    expect(summary.agreement).toHaveLength(1);
    expect(summary.agreement[0].nItems).toBe(2);
    expect(summary.agreement[0].meanAbsDiff).toBeGreaterThanOrEqual(0);
  });

  it('the summary is stamped mock=true so it can never masquerade as data', async () => {
    const { summary } = await run();
    expect(summary.mock).toBe(true);
  });

  it('a judge failure is recorded, not thrown', async () => {
    const failing = {
      async chat(): Promise<never> { throw new Error('x'); },
      async judge(): Promise<string> { return 'not json at all'; },
    };
    const records: SampleRecord[] = [];
    const summary = await runExperiment(
      { ...CONFIG, judges: [CONFIG.judges[0]] },
      [{ name: 't', items: [ITEMS[0]] }],
      { adapterFor: () => failing, onSample: (r) => { records.push(r); } },
    );
    expect(summary.totals.failed).toBe(3);
    expect(records.every(r => !r.ok && r.error)).toBe(true);
    expect(summary.items[0].composite).toBeNull();
    expect(summary.items[0].boundVerdict).toBe('n/a');
  });

  it('a fully-failed control cell is counted as n/a in H1, never dropped', async () => {
    const failing = {
      async chat(): Promise<never> { throw new Error('x'); },
      async judge(): Promise<string> { return 'garbage'; },
    };
    const summary = await runExperiment(
      { ...CONFIG, judges: [CONFIG.judges[0]] },
      [{ name: 't', items: [ITEMS[1]] }], // the control item
      { adapterFor: () => failing, onSample: () => {} },
    );
    expect(summary.negativeControls.total).toBe(1);
    expect(summary.negativeControls.na).toBe(1);
    expect(summary.negativeControls.pass + summary.negativeControls.marginal + summary.negativeControls.fail).toBe(0);
  });
});

import { partitionJudgesByEnv } from '../experiment-lib';

describe('partitionJudgesByEnv (--skip-missing support)', () => {
  const judges = [
    { id: 'a', provider: 'anthropic' as const, model: 'm1', apiKeyEnv: 'K_A' },
    { id: 'b', provider: 'openai' as const, model: 'm2', apiKeyEnv: 'K_B' },
    { id: 'c', provider: 'openai-compatible' as const, model: 'm3', apiKeyEnv: 'K_C', baseUrlEnv: 'U_C' },
  ];

  it('keeps judges whose credentials exist, skips the rest with reasons', () => {
    const { runnable, skipped } = partitionJudgesByEnv(judges, { K_A: 'x', K_B: undefined, K_C: 'y', U_C: 'https://e' });
    expect(runnable.map(j => j.id)).toEqual(['a', 'c']);
    expect(skipped).toEqual([{ id: 'b', reason: 'env var K_B not set' }]);
  });

  it('openai-compatible judge with key but no base URL is skipped', () => {
    const { runnable, skipped } = partitionJudgesByEnv(judges, { K_A: 'x', K_B: 'y', K_C: 'z' });
    expect(runnable.map(j => j.id)).toEqual(['a', 'b']);
    expect(skipped[0]).toEqual({ id: 'c', reason: 'env var U_C not set' });
  });

  it('empty env skips everything — caller must refuse to run', () => {
    const { runnable, skipped } = partitionJudgesByEnv(judges, {});
    expect(runnable).toHaveLength(0);
    expect(skipped).toHaveLength(3);
  });

  it('skipped judges land in the summary as a recorded deviation', async () => {
    const summary = await runExperiment(
      { ...CONFIG, judges: [CONFIG.judges[0]] },
      [{ name: 't', items: [ITEMS[0]] }],
      { adapterFor: (j) => createMockAdapter(j.id), onSample: () => {} },
      { skippedJudges: [{ id: 'gpt-4o', reason: 'env var OPENAI_API_KEY not set' }] },
    );
    expect(summary.skippedJudges).toEqual([{ id: 'gpt-4o', reason: 'env var OPENAI_API_KEY not set' }]);
  });
});

describe('preflightJudges — one live probe per judge before ~1250 scoring calls', () => {
  const judgeA = { id: 'good', provider: 'anthropic' as const, model: 'model-a', apiKeyEnv: 'KEY_A' };
  const judgeB = { id: 'bad-key', provider: 'openai-compatible' as const, model: 'model-b', apiKeyEnv: 'KEY_B', baseUrlEnv: 'URL_B' };

  it('a judge whose probe succeeds is runnable; a 401 judge is skipped with the reason recorded', async () => {
    const adapterFor = (j: { id: string }) => ({
      chat: jest.fn(),
      judge: j.id === 'bad-key'
        ? jest.fn().mockRejectedValue(new Error('OpenAI API error 401: Invalid API key provided'))
        : jest.fn().mockResolvedValue('OK'),
    });
    const { runnable, skipped } = await preflightJudges([judgeA, judgeB], adapterFor);
    expect(runnable.map(j => j.id)).toEqual(['good']);
    expect(skipped).toHaveLength(1);
    expect(skipped[0].id).toBe('bad-key');
    expect(skipped[0].reason).toContain('preflight call failed');
    expect(skipped[0].reason).toContain('401');
  });

  it('all judges failing preflight → empty runnable (the caller must refuse to run)', async () => {
    const adapterFor = () => ({
      chat: jest.fn(),
      judge: jest.fn().mockRejectedValue(new Error('connect ECONNREFUSED')),
    });
    const { runnable, skipped } = await preflightJudges([judgeA, judgeB], adapterFor);
    expect(runnable).toHaveLength(0);
    expect(skipped).toHaveLength(2);
  });

  it('probe uses the judge model and a tiny token cap (cost of a preflight ~ nothing)', async () => {
    const judgeFn = jest.fn().mockResolvedValue('OK');
    await preflightJudges([judgeA], () => ({ chat: jest.fn(), judge: judgeFn }));
    expect(judgeFn).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ model: 'model-a', maxTokens: 8 }));
  });
});
