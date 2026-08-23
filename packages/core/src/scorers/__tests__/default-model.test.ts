// GENERATED from apps/web/lib — do not edit here. Run: node scripts/sync-core.mjs
// Regression guard for the provider-aware default judge model: with
// CAIMS_LLM_PROVIDER=openai and no explicit model, the engine must default
// to an OpenAI model — it used to pass the Anthropic default model name to
// the OpenAI API (guaranteed 404).

const mockJudge = jest.fn();
jest.mock('../../adapters', () => ({
  getAdapter: () => ({ judge: mockJudge }),
  getProviderFromEnv: () => 'openai',
}));

jest.mock('../../logger', () => ({
  logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import { scoreInteraction } from '../scoring-engine';

const RUBRIC = JSON.stringify({
  cq: { phi_proxy: 50, gwt_proxy: 50, hot_proxy: 50, synthesis: 50, temporal: 50 },
  aq: { goal_clarity: 50, constraint_aware: 50, path_coherence: 50, scope_drift: 50, reality_grounding: 50 },
  cfi: { context_retention: 50, topic_drift: 50, coherence_loss: 50 },
  eq: { calibration: 50, uncertainty: 50, hallucination: 50, source_integrity: 50 },
  sq: { intra_session: 50, position_drift: 50 },
  reasoning: 'stub',
});

describe('provider-aware default judge model (openai)', () => {
  const OLD = process.env.CAIMS_SCORING_MODEL;

  afterEach(() => {
    if (OLD === undefined) delete process.env.CAIMS_SCORING_MODEL;
    else process.env.CAIMS_SCORING_MODEL = OLD;
    mockJudge.mockReset();
  });

  it('defaults to gpt-4o under the OpenAI provider (never the Anthropic model name)', async () => {
    delete process.env.CAIMS_SCORING_MODEL;
    mockJudge.mockResolvedValueOnce(RUBRIC);
    const scores = await scoreInteraction({
      question: 'q', response: 'r', history: [], enableEmotions: false,
    });
    expect(scores).not.toBeNull();
    expect(mockJudge).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ model: 'gpt-4o' })
    );
    expect(scores!.metadata.modelUsed).toBe('gpt-4o');
  });

  it('CAIMS_SCORING_MODEL still wins over the provider default', async () => {
    process.env.CAIMS_SCORING_MODEL = 'my-fine-tune';
    mockJudge.mockResolvedValueOnce(RUBRIC);
    await scoreInteraction({ question: 'q', response: 'r', history: [], enableEmotions: false });
    expect(mockJudge).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ model: 'my-fine-tune' })
    );
  });

  it('an explicit model param wins over everything', async () => {
    process.env.CAIMS_SCORING_MODEL = 'my-fine-tune';
    mockJudge.mockResolvedValueOnce(RUBRIC);
    await scoreInteraction({
      question: 'q', response: 'r', history: [], model: 'explicit-model', enableEmotions: false,
    });
    expect(mockJudge).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ model: 'explicit-model' })
    );
  });
});
