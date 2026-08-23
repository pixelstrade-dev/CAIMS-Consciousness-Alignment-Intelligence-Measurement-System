// We test the internal helpers by importing the module and checking behavior
// Since scoreInteraction calls external LLM, we mock the adapter

const mockJudge = jest.fn();

jest.mock('@/lib/adapters', () => ({
  getAdapter: () => ({
    judge: mockJudge,
  }),
  getProviderFromEnv: () => 'anthropic',
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import { scoreInteraction } from '../scoring-engine';

describe('scoreInteraction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validResponse = JSON.stringify({
    cq: { integration_depth: 70, knowledge_breadth: 65, metacognitive_display: 60, synthesis: 55, temporal_coherence: 50 },
    aq: { goal_clarity: 80, constraint_aware: 75, path_coherence: 70, scope_drift: 65, reality_grounding: 60 },
    cfi: { context_retention: 85, topic_drift: 80, coherence_loss: 75 },
    eq: { calibration: 70, uncertainty: 65, hallucination: 90, source_integrity: 60 },
    sq: { intra_session: 80, position_drift: 75 },
    reasoning: "Good response with strong integration",
  });

  it('parses valid JSON response and returns scores', async () => {
    mockJudge.mockResolvedValue(validResponse);

    const result = await scoreInteraction({
      response: 'test response',
      question: 'test question',
      history: [],
    });

    expect(result).not.toBeNull();
    expect(result!.cqScore).toBeGreaterThanOrEqual(0);
    expect(result!.cqScore).toBeLessThanOrEqual(100);
    expect(result!.composite).toBeGreaterThanOrEqual(0);
    expect(result!.composite).toBeLessThanOrEqual(100);
  });

  it('REJECTS a v2-format judge payload (old sub-dimension names) — returns null, never mixed-protocol scores', async () => {
    // Protocol 3.0.0-alpha renamed the CQ facets. A judge cached or
    // fine-tuned on the v2 rubric answering with phi_proxy/gwt_proxy/
    // hot_proxy/temporal must FAIL schema validation: silently accepting
    // it would produce scores under the wrong protocol version.
    const v2Response = JSON.stringify({
      cq: { phi_proxy: 70, gwt_proxy: 65, hot_proxy: 60, synthesis: 55, temporal: 50 },
      aq: { goal_clarity: 80, constraint_aware: 75, path_coherence: 70, scope_drift: 65, reality_grounding: 60 },
      cfi: { context_retention: 85, topic_drift: 80, coherence_loss: 75 },
      eq: { calibration: 70, uncertainty: 65, hallucination: 90, source_integrity: 60 },
      sq: { intra_session: 80, position_drift: 75 },
      reasoning: 'v2-shaped payload',
    });
    mockJudge.mockResolvedValue(v2Response);

    const result = await scoreInteraction({
      response: 'test', question: 'test', history: [],
    });
    expect(result).toBeNull();
  });

  it('handles markdown-fenced JSON', async () => {
    mockJudge.mockResolvedValue('```json\n' + validResponse + '\n```');

    const result = await scoreInteraction({
      response: 'test', question: 'test', history: [],
    });
    expect(result).not.toBeNull();
  });

  it('handles JSON with surrounding text', async () => {
    mockJudge.mockResolvedValue('Here are the scores:\n' + validResponse + '\nEnd.');

    const result = await scoreInteraction({
      response: 'test', question: 'test', history: [],
    });
    expect(result).not.toBeNull();
  });

  it('returns null for completely invalid response', async () => {
    mockJudge.mockResolvedValue('This is not JSON at all');

    const result = await scoreInteraction({
      response: 'test', question: 'test', history: [],
    });
    expect(result).toBeNull();
  });

  it('returns null when scores are out of range', async () => {
    const badResponse = JSON.stringify({
      cq: { integration_depth: 150, knowledge_breadth: -10, metacognitive_display: 60, synthesis: 55, temporal_coherence: 50 },
      aq: { goal_clarity: 80, constraint_aware: 75, path_coherence: 70, scope_drift: 65, reality_grounding: 60 },
      cfi: { context_retention: 85, topic_drift: 80, coherence_loss: 75 },
      eq: { calibration: 70, uncertainty: 65, hallucination: 90, source_integrity: 60 },
      sq: { intra_session: 80, position_drift: 75 },
      reasoning: "Out of range",
    });
    mockJudge.mockResolvedValue(badResponse);

    const result = await scoreInteraction({
      response: 'test', question: 'test', history: [],
    });
    // Zod validation rejects scores outside 0-100
    expect(result).toBeNull();
  });

  it('returns null when LLM adapter throws', async () => {
    mockJudge.mockRejectedValue(new Error('API timeout'));

    const result = await scoreInteraction({
      response: 'test', question: 'test', history: [],
    });
    expect(result).toBeNull();
  });
});
