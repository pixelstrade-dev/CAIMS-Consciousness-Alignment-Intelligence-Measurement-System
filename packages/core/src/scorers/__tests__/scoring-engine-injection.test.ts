// GENERATED from apps/web/lib — do not edit here. Run: node scripts/sync-core.mjs
// Alias-free scoring-engine test: exercises the package's headline API
// (scoreInteraction) through adapter INJECTION — no jest.mock of path
// aliases, so this suite runs identically in apps/web and in the synced
// @caims/core package (see scripts/sync-core.mjs).

import { scoreInteraction, SCORING_PROTOCOL_VERSION, SCORING_PROMPT_HASH } from '../scoring-engine';
import type { LLMAdapter } from '../../adapters/base';

const VALID_JUDGE_JSON = JSON.stringify({
  cq: { phi_proxy: 80, gwt_proxy: 70, hot_proxy: 75, synthesis: 60, temporal: 65 },
  aq: { goal_clarity: 85, constraint_aware: 80, path_coherence: 75, scope_drift: 90, reality_grounding: 70 },
  cfi: { context_retention: 80, topic_drift: 85, coherence_loss: 90 },
  eq: { calibration: 70, uncertainty: 65, hallucination: 95, source_integrity: 80 },
  sq: { intra_session: 85, position_drift: 80 },
  reasoning: 'injection test',
});

function fakeAdapter(judgeResponse: string): LLMAdapter {
  return {
    async chat() {
      throw new Error('not used');
    },
    async judge() {
      return judgeResponse;
    },
  };
}

describe('scoreInteraction with an injected adapter (no mocks, no network)', () => {
  it('produces full scores and a complete provenance envelope', async () => {
    const result = await scoreInteraction({
      question: 'Explain Raft.',
      response: 'Raft elects a leader; followers replicate its log.',
      history: [],
      adapter: fakeAdapter(VALID_JUDGE_JSON),
      enableEmotions: false,
    });

    expect(result).not.toBeNull();
    expect(result!.composite).toBeGreaterThanOrEqual(0);
    expect(result!.composite).toBeLessThanOrEqual(100);
    expect(result!.cqScore).toBeGreaterThan(0);
    expect(result!.details.cq.phi_proxy).toBe(80);
    expect(result!.metadata.protocolVersion).toBe(SCORING_PROTOCOL_VERSION);
    expect(result!.metadata.promptHash).toBe(SCORING_PROMPT_HASH);
    expect(result!.metadata.weightsUsed).toBeDefined();
    expect(result!.emqScore).toBeUndefined(); // emotions disabled
  });

  it('handles markdown-fenced judge output', async () => {
    const result = await scoreInteraction({
      question: 'q',
      response: 'r',
      history: [],
      adapter: fakeAdapter('```json\n' + VALID_JUDGE_JSON + '\n```'),
      enableEmotions: false,
    });
    expect(result).not.toBeNull();
  });

  it('returns null (never throws) on malformed judge output', async () => {
    const result = await scoreInteraction({
      question: 'q',
      response: 'r',
      history: [],
      adapter: fakeAdapter('this is not JSON at all'),
      enableEmotions: false,
    });
    expect(result).toBeNull();
  });

  it('returns null on out-of-range judge scores (Zod gate)', async () => {
    const bad = JSON.parse(VALID_JUDGE_JSON);
    bad.cq.phi_proxy = 250;
    const result = await scoreInteraction({
      question: 'q',
      response: 'r',
      history: [],
      adapter: fakeAdapter(JSON.stringify(bad)),
      enableEmotions: false,
    });
    expect(result).toBeNull();
  });

  it('returns null when the injected judge throws (transport failure)', async () => {
    const throwing: LLMAdapter = {
      async chat() {
        throw new Error('x');
      },
      async judge() {
        throw new Error('network down');
      },
    };
    const result = await scoreInteraction({
      question: 'q',
      response: 'r',
      history: [],
      adapter: throwing,
      enableEmotions: false,
    });
    expect(result).toBeNull();
  });
});
