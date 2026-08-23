import { scoreEnsemble, getEnsembleConfig, defaultJudge, EnsembleJudge } from '../ensemble';
import type { LLMAdapter } from '@/lib/adapters';

jest.mock('@/lib/logger', () => ({
  logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

// A judge stub returning the full rubric with every sub-score = value, so
// each KPI = value and (with default weights) composite = value. valueFn
// lets tests vary output per call to exercise SD paths.
function stubAdapter(valueFn: () => number): LLMAdapter {
  return {
    judge: async () => {
      const v = valueFn();
      return JSON.stringify({
        cq: { integration_depth: v, knowledge_breadth: v, metacognitive_display: v, synthesis: v, temporal_coherence: v },
        aq: { goal_clarity: v, constraint_aware: v, path_coherence: v, scope_drift: v, reality_grounding: v },
        cfi: { context_retention: v, topic_drift: v, coherence_loss: v },
        eq: { calibration: v, uncertainty: v, hallucination: v, source_integrity: v },
        sq: { intra_session: v, position_drift: v },
        reasoning: 'stub',
      });
    },
    chat: async () => { throw new Error('not used'); },
  } as unknown as LLMAdapter;
}

function failingAdapter(): LLMAdapter {
  return {
    judge: async () => { throw new Error('provider down'); },
    chat: async () => { throw new Error('not used'); },
  } as unknown as LLMAdapter;
}

const J_A: EnsembleJudge = { id: 'anthropic:judge-a', provider: 'anthropic', model: 'judge-a' };
const J_B: EnsembleJudge = { id: 'openai:judge-b', provider: 'openai', model: 'judge-b' };

const params = (over: Partial<Parameters<typeof scoreEnsemble>[0]>) => ({
  response: 'r', question: 'q', history: [],
  judges: [J_A], samplesPerJudge: 1, ...over,
});

describe('getEnsembleConfig', () => {
  it('unset → status unset', () => {
    expect(getEnsembleConfig(undefined)).toEqual({ status: 'unset' });
  });

  it('parses provider:model pairs', () => {
    const c = getEnsembleConfig('anthropic:claude-sonnet-5, openai:gpt-4o');
    expect(c.status).toBe('ok');
    if (c.status === 'ok') {
      expect(c.judges).toEqual([
        { id: 'anthropic:claude-sonnet-5', provider: 'anthropic', model: 'claude-sonnet-5' },
        { id: 'openai:gpt-4o', provider: 'openai', model: 'gpt-4o' },
      ]);
    }
  });

  it.each(['', ' , ', 'anthropic', ':model', 'anthropic:', 'mistral:x', 'anthropic:m,anthropic:m'])(
    'invalid input %j fails loudly, never silently degrades', (raw) => {
      expect(getEnsembleConfig(raw).status).toBe('invalid');
    });

  it('caps the judge count', () => {
    const five = Array.from({ length: 5 }, (_, i) => `anthropic:m${i}`).join(',');
    expect(getEnsembleConfig(five).status).toBe('invalid');
  });
});

describe('defaultJudge', () => {
  const OLD_MODEL = process.env.CAIMS_SCORING_MODEL;
  const OLD_PROVIDER = process.env.CAIMS_LLM_PROVIDER;
  afterEach(() => {
    if (OLD_MODEL === undefined) delete process.env.CAIMS_SCORING_MODEL;
    else process.env.CAIMS_SCORING_MODEL = OLD_MODEL;
    if (OLD_PROVIDER === undefined) delete process.env.CAIMS_LLM_PROVIDER;
    else process.env.CAIMS_LLM_PROVIDER = OLD_PROVIDER;
  });

  it('reflects the env-configured provider and model', () => {
    process.env.CAIMS_LLM_PROVIDER = 'openai';
    process.env.CAIMS_SCORING_MODEL = 'gpt-4o';
    expect(defaultJudge()).toEqual({ id: 'openai:gpt-4o', provider: 'openai', model: 'gpt-4o' });
  });

  it('REGRESSION: openai provider with no model env defaults to gpt-4o, never the Anthropic name', () => {
    process.env.CAIMS_LLM_PROVIDER = 'openai';
    delete process.env.CAIMS_SCORING_MODEL;
    expect(defaultJudge()).toEqual({ id: 'openai:gpt-4o', provider: 'openai', model: 'gpt-4o' });
  });

  it('anthropic provider with no model env keeps the Anthropic default', () => {
    delete process.env.CAIMS_LLM_PROVIDER;
    delete process.env.CAIMS_SCORING_MODEL;
    const j = defaultJudge();
    expect(j.provider).toBe('anthropic');
    expect(j.model).toBe('claude-sonnet-4-20250514');
  });
});

describe('scoreEnsemble', () => {
  it('single judge, single sample: scores pass through, SD null, agreement null', async () => {
    const res = await scoreEnsemble(params({ adapterFor: () => stubAdapter(() => 80) }));
    expect(res).not.toBeNull();
    expect(res!.scores).toEqual({ cq: 80, aq: 80, cfi: 80, eq: 80, sq: 80, composite: 80 });
    expect(res!.judges[0].composite).toEqual({ mean: 80, sd: null });
    expect(res!.judges[0].samplesOk).toBe(1);
    expect(res!.agreement).toBeNull();
    expect(res!.metadata.mode).toBe('ensemble');
    expect(res!.metadata.emotionAnalysis).toBe('skipped');
  });

  it('n-sample: Bessel-corrected SD over per-sample composites', async () => {
    // samples 70 and 80 → mean 75, sample SD = sqrt(((−5)²+5²)/1) ≈ 7.07
    const seq = [70, 80];
    let i = 0;
    const res = await scoreEnsemble(params({
      samplesPerJudge: 2,
      adapterFor: () => stubAdapter(() => seq[i++ % seq.length]),
    }));
    expect(res!.judges[0].samplesOk).toBe(2);
    expect(res!.judges[0].composite.mean).toBe(75);
    expect(res!.judges[0].composite.sd).toBeCloseTo(7.1, 1);
  });

  it('two judges: equal-weight means, spread and meanAbsDiff', async () => {
    const res = await scoreEnsemble(params({
      judges: [J_A, J_B],
      adapterFor: (j) => stubAdapter(() => (j.id === J_A.id ? 60 : 80)),
    }));
    expect(res!.scores.cq).toBe(70);
    expect(res!.scores.composite).toBe(70);
    expect(res!.agreement).toEqual({ compositeSpread: 20, meanAbsDiff: 20 });
    expect(res!.failedJudges).toEqual([]);
  });

  it('one judge down: degrades honestly — result + failedJudges, agreement null', async () => {
    const res = await scoreEnsemble(params({
      judges: [J_A, J_B],
      adapterFor: (j) => (j.id === J_B.id ? failingAdapter() : stubAdapter(() => 60)),
    }));
    expect(res!.scores.composite).toBe(60);
    expect(res!.judges.map(j => j.id)).toEqual([J_A.id]);
    expect(res!.failedJudges).toHaveLength(1);
    expect(res!.failedJudges[0].id).toBe(J_B.id);
    expect(res!.agreement).toBeNull();
  });

  it('all judges down: null, never a fabricated score', async () => {
    const res = await scoreEnsemble(params({
      judges: [J_A, J_B],
      adapterFor: () => failingAdapter(),
    }));
    expect(res).toBeNull();
  });

  it('adapter factory throwing (missing key) is a failed judge, not a crash', async () => {
    const res = await scoreEnsemble(params({
      judges: [J_A, J_B],
      adapterFor: (j) => {
        if (j.id === J_B.id) throw new Error('OPENAI_API_KEY not set');
        return stubAdapter(() => 50);
      },
    }));
    expect(res!.failedJudges[0]).toMatchObject({ id: J_B.id, reason: 'OPENAI_API_KEY not set' });
    expect(res!.scores.composite).toBe(50);
  });

  it('records temperature null for Claude 5 family judges, 0 otherwise', async () => {
    const j5: EnsembleJudge = { id: 'anthropic:claude-sonnet-5', provider: 'anthropic', model: 'claude-sonnet-5' };
    const res = await scoreEnsemble(params({
      judges: [j5, J_B],
      adapterFor: () => stubAdapter(() => 55),
    }));
    const byId = Object.fromEntries(res!.judges.map(j => [j.id, j.temperature]));
    expect(byId['anthropic:claude-sonnet-5']).toBeNull();
    expect(byId[J_B.id]).toBe(0);
  });

  it('partial samples: judge with some failed samples still aggregates the ok ones', async () => {
    let call = 0;
    const flaky: LLMAdapter = {
      judge: async () => {
        call++;
        if (call === 2) throw new Error('transient provider error');
        return JSON.stringify({
          cq: { integration_depth: 60, knowledge_breadth: 60, metacognitive_display: 60, synthesis: 60, temporal_coherence: 60 },
          aq: { goal_clarity: 60, constraint_aware: 60, path_coherence: 60, scope_drift: 60, reality_grounding: 60 },
          cfi: { context_retention: 60, topic_drift: 60, coherence_loss: 60 },
          eq: { calibration: 60, uncertainty: 60, hallucination: 60, source_integrity: 60 },
          sq: { intra_session: 60, position_drift: 60 },
          reasoning: 'stub',
        });
      },
      chat: async () => { throw new Error('not used'); },
    } as unknown as LLMAdapter;
    const res = await scoreEnsemble(params({ samplesPerJudge: 3, adapterFor: () => flaky }));
    expect(res!.judges[0].samplesOk).toBe(2);
    expect(res!.judges[0].samplesFailed).toBe(1);
    expect(res!.judges[0].composite.mean).toBe(60);
    expect(res!.failedJudges).toEqual([]);
  });

  it('forwards the conversation history to every judge call', async () => {
    const seenPrompts: string[] = [];
    const spy: LLMAdapter = {
      judge: async (prompt: string) => {
        seenPrompts.push(prompt);
        return JSON.stringify({
          cq: { integration_depth: 50, knowledge_breadth: 50, metacognitive_display: 50, synthesis: 50, temporal_coherence: 50 },
          aq: { goal_clarity: 50, constraint_aware: 50, path_coherence: 50, scope_drift: 50, reality_grounding: 50 },
          cfi: { context_retention: 50, topic_drift: 50, coherence_loss: 50 },
          eq: { calibration: 50, uncertainty: 50, hallucination: 50, source_integrity: 50 },
          sq: { intra_session: 50, position_drift: 50 },
          reasoning: 'stub',
        });
      },
      chat: async () => { throw new Error('not used'); },
    } as unknown as LLMAdapter;
    await scoreEnsemble(params({
      history: [{ role: 'user', content: 'HISTORY-MARKER-XYZ' }],
      adapterFor: () => spy,
    }));
    expect(seenPrompts).toHaveLength(1);
    expect(seenPrompts[0]).toContain('HISTORY-MARKER-XYZ');
  });

  it('rounding edge: ensemble composite recomputed from rounded KPI means (documented ≤~1pt drift)', async () => {
    // judges 60 and 61 → KPI means 60.5 → composite computed on 60.5s,
    // clamp(round(60.5)) = 61, while mean of judge composites is 60.5.
    const res = await scoreEnsemble(params({
      judges: [J_A, J_B],
      adapterFor: (j) => stubAdapter(() => (j.id === J_A.id ? 60 : 61)),
    }));
    expect(res!.scores.cq).toBe(60.5);
    expect(res!.scores.composite).toBe(61);
    expect(res!.judges.map(j => j.composite.mean)).toEqual([60, 61]);
  });

  it('clamps samplesPerJudge to the cap', async () => {
    let calls = 0;
    const res = await scoreEnsemble(params({
      samplesPerJudge: 99,
      adapterFor: () => stubAdapter(() => { calls++; return 50; }),
    }));
    expect(res!.judges[0].samplesOk).toBe(5);
    expect(calls).toBe(5);
  });
});
