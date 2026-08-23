import { SCORING_PROTOCOL_VERSION, SCORING_PROMPT_HASH, scoreInteraction } from '../scoring-engine';
import { getActiveWeights } from '../composite';
import { DEFAULT_WEIGHTS } from '../types';

jest.mock('@/lib/adapters', () => ({
  getAdapter: jest.fn(),
  getProviderFromEnv: jest.fn(() => 'anthropic'),
}));
jest.mock('@/lib/emotions', () => ({
  scoreEmotion: jest.fn(async () => null),
}));

import { getAdapter } from '@/lib/adapters';

const VALID_JUDGE_JSON = JSON.stringify({
  cq: { phi_proxy: 80, gwt_proxy: 70, hot_proxy: 75, synthesis: 60, temporal: 65 },
  aq: { goal_clarity: 85, constraint_aware: 80, path_coherence: 75, scope_drift: 90, reality_grounding: 70 },
  cfi: { context_retention: 80, topic_drift: 85, coherence_loss: 90 },
  eq: { calibration: 70, uncertainty: 65, hallucination: 95, source_integrity: 80 },
  sq: { intra_session: 85, position_drift: 80 },
  reasoning: 'test',
});

describe('scoring protocol provenance', () => {
  it('exposes a semver protocol version', () => {
    expect(SCORING_PROTOCOL_VERSION).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('exposes a stable 16-hex-char prompt hash', () => {
    expect(SCORING_PROMPT_HASH).toMatch(/^[0-9a-f]{16}$/);
  });

  it('getActiveWeights returns the defaults when no env override is set', () => {
    delete process.env.CAIMS_WEIGHTS;
    expect(getActiveWeights()).toEqual(DEFAULT_WEIGHTS);
  });

  it('every score carries the full provenance envelope', async () => {
    (getAdapter as jest.Mock).mockReturnValue({
      judge: jest.fn(async () => VALID_JUDGE_JSON),
    });

    const result = await scoreInteraction({
      response: 'A well-integrated answer.',
      question: 'Explain X.',
      history: [],
    });

    expect(result).not.toBeNull();
    const meta = result!.metadata;
    expect(meta.protocolVersion).toBe(SCORING_PROTOCOL_VERSION);
    expect(meta.promptHash).toBe(SCORING_PROMPT_HASH);
    expect(meta.provider).toBe('anthropic');
    expect(meta.temperature).toBe(0);
    expect(meta.weightsUsed).toEqual(DEFAULT_WEIGHTS);
    expect(meta.modelUsed).toBeTruthy();
    expect(typeof meta.latencyMs).toBe('number');
  });
});
