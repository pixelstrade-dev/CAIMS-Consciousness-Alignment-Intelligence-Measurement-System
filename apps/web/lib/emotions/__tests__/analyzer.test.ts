import { computeConversationState, computeEmQScore } from '../analyzer';
import type { DetectedEmotion, ResponseEmotionAnalysis, ConversationEmotionState } from '../types';

// ── Helpers ───────────────────────────────────────────────────────────────

function makeEmotion(overrides: Partial<DetectedEmotion> = {}): DetectedEmotion {
  return {
    label: 'curious',
    cluster: 'curiosity',
    valence: 0.55,
    arousal: 0.55,
    confidence: 0.85,
    ...overrides,
  };
}

function makeAnalysis(overrides: Partial<ResponseEmotionAnalysis> = {}): ResponseEmotionAnalysis {
  return {
    primary: makeEmotion(),
    secondary: [],
    explanation: 'The response shows intellectual curiosity.',
    textCues: ['interesting', 'let us explore'],
    ...overrides,
  };
}

// ── computeConversationState ──────────────────────────────────────────────

describe('computeConversationState', () => {
  it('returns null for empty history', () => {
    expect(computeConversationState([])).toBeNull();
  });

  it('returns current as the last emotion in history', () => {
    const history = [
      makeEmotion({ label: 'happy', cluster: 'joy' }),
      makeEmotion({ label: 'calm', cluster: 'serenity' }),
    ];
    const state = computeConversationState(history);
    expect(state).not.toBeNull();
    expect(state!.current.label).toBe('calm');
    expect(state!.current.cluster).toBe('serenity');
  });

  it('computes correct average valence and arousal', () => {
    const history = [
      makeEmotion({ valence: 0.8, arousal: 0.9 }),
      makeEmotion({ valence: 0.2, arousal: 0.1 }),
    ];
    const state = computeConversationState(history)!;
    expect(state.avgValence).toBeCloseTo(0.5, 1);
    expect(state.avgArousal).toBeCloseTo(0.5, 1);
  });

  it('detects improving trajectory when valence increases', () => {
    const history = [
      makeEmotion({ valence: -0.5 }),
      makeEmotion({ valence: -0.3 }),
      makeEmotion({ valence: 0.2 }),
      makeEmotion({ valence: 0.5 }),
      makeEmotion({ valence: 0.7 }),
      makeEmotion({ valence: 0.8 }),
    ];
    const state = computeConversationState(history)!;
    expect(state.trajectory).toBe('improving');
  });

  it('detects declining trajectory when valence decreases', () => {
    const history = [
      makeEmotion({ valence: 0.8 }),
      makeEmotion({ valence: 0.6 }),
      makeEmotion({ valence: 0.2 }),
      makeEmotion({ valence: -0.2 }),
      makeEmotion({ valence: -0.5 }),
      makeEmotion({ valence: -0.7 }),
    ];
    const state = computeConversationState(history)!;
    expect(state.trajectory).toBe('declining');
  });

  it('detects stable trajectory when valence stays similar', () => {
    const history = [
      makeEmotion({ valence: 0.5 }),
      makeEmotion({ valence: 0.55 }),
      makeEmotion({ valence: 0.48 }),
    ];
    const state = computeConversationState(history)!;
    expect(state.trajectory).toBe('stable');
  });

  it('computes diversity from unique clusters', () => {
    const history = [
      makeEmotion({ cluster: 'joy' }),
      makeEmotion({ cluster: 'curiosity' }),
      makeEmotion({ cluster: 'serenity' }),
    ];
    const state = computeConversationState(history)!;
    // 3 unique clusters out of 10 = 0.3
    expect(state.diversity).toBeCloseTo(0.3, 1);
  });

  it('caps history to last 10 entries', () => {
    const history = Array.from({ length: 20 }, (_, i) =>
      makeEmotion({ label: `emotion-${i}` })
    );
    const state = computeConversationState(history)!;
    expect(state.history).toHaveLength(10);
    expect(state.history[9].label).toBe('emotion-19');
  });

  it('handles single-entry history', () => {
    const state = computeConversationState([makeEmotion()])!;
    expect(state.current.label).toBe('curious');
    expect(state.trajectory).toBe('stable');
    expect(state.diversity).toBeCloseTo(0.1, 1); // 1 cluster / 10
  });
});

// ── computeEmQScore ───────────────────────────────────────────────────────

describe('computeEmQScore', () => {
  it('returns score between 0 and 100', () => {
    const { emqScore } = computeEmQScore(makeAnalysis(), null);
    expect(emqScore).toBeGreaterThanOrEqual(0);
    expect(emqScore).toBeLessThanOrEqual(100);
  });

  it('returns all 5 detail sub-scores', () => {
    const { details } = computeEmQScore(makeAnalysis(), null);
    expect(details.appropriateness).toBeDefined();
    expect(details.valenceScore).toBeDefined();
    expect(details.arousalScore).toBeDefined();
    expect(details.diversityScore).toBeDefined();
    expect(details.stability).toBeDefined();
  });

  it('maps valence correctly: positive valence → high valenceScore', () => {
    const positive = makeAnalysis({ primary: makeEmotion({ valence: 0.9 }) });
    const negative = makeAnalysis({ primary: makeEmotion({ valence: -0.9 }) });

    const { details: posDetails } = computeEmQScore(positive, null);
    const { details: negDetails } = computeEmQScore(negative, null);

    expect(posDetails.valenceScore).toBeGreaterThan(80);
    expect(negDetails.valenceScore).toBeLessThan(20);
  });

  it('penalizes extreme arousal (both high and low)', () => {
    const moderate = makeAnalysis({ primary: makeEmotion({ arousal: 0.5 }) });
    const extreme = makeAnalysis({ primary: makeEmotion({ arousal: 1.0 }) });
    const veryLow = makeAnalysis({ primary: makeEmotion({ arousal: 0.0 }) });

    const { details: modDetails } = computeEmQScore(moderate, null);
    const { details: extDetails } = computeEmQScore(extreme, null);
    const { details: lowDetails } = computeEmQScore(veryLow, null);

    expect(modDetails.arousalScore).toBe(100);
    expect(extDetails.arousalScore).toBeLessThan(modDetails.arousalScore);
    expect(lowDetails.arousalScore).toBeLessThan(modDetails.arousalScore);
  });

  it('uses conversation diversity when state is available', () => {
    const analysis = makeAnalysis();
    const state: ConversationEmotionState = {
      current: makeEmotion(),
      trajectory: 'stable',
      avgValence: 0.5,
      avgArousal: 0.5,
      diversity: 0.7, // 7 out of 10 clusters
      history: [makeEmotion()],
    };

    const { details } = computeEmQScore(analysis, state);
    expect(details.diversityScore).toBe(70);
  });

  it('defaults diversity to 50 when no conversation state', () => {
    const { details } = computeEmQScore(makeAnalysis(), null);
    expect(details.diversityScore).toBe(50);
  });

  it('computes stability from valence variance in history', () => {
    const analysis = makeAnalysis();
    const stableState: ConversationEmotionState = {
      current: makeEmotion(),
      trajectory: 'stable',
      avgValence: 0.5,
      avgArousal: 0.5,
      diversity: 0.3,
      history: [
        makeEmotion({ valence: 0.5 }),
        makeEmotion({ valence: 0.52 }),
        makeEmotion({ valence: 0.48 }),
      ],
    };
    const unstableState: ConversationEmotionState = {
      current: makeEmotion(),
      trajectory: 'declining',
      avgValence: 0.0,
      avgArousal: 0.5,
      diversity: 0.5,
      history: [
        makeEmotion({ valence: 0.9 }),
        makeEmotion({ valence: -0.8 }),
        makeEmotion({ valence: 0.7 }),
      ],
    };

    const { details: stableDetails } = computeEmQScore(analysis, stableState);
    const { details: unstableDetails } = computeEmQScore(analysis, unstableState);

    expect(stableDetails.stability).toBeGreaterThan(unstableDetails.stability);
  });

  it('high confidence primary yields high appropriateness', () => {
    const highConf = makeAnalysis({ primary: makeEmotion({ confidence: 0.95 }) });
    const lowConf = makeAnalysis({ primary: makeEmotion({ confidence: 0.2 }) });

    const { details: highDetails } = computeEmQScore(highConf, null);
    const { details: lowDetails } = computeEmQScore(lowConf, null);

    expect(highDetails.appropriateness).toBeGreaterThan(lowDetails.appropriateness);
  });
});
