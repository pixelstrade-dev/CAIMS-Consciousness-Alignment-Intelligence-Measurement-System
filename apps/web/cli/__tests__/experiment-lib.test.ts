import {
  ExperimentConfigSchema, runExperiment, createMockAdapter,
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
