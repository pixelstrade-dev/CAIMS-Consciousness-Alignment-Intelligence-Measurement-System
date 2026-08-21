import { computeDebateMetrics } from '../metrics';
import type { DebateTurnScore } from '../metrics';

function score(composite: number, cq = composite, aq = composite): DebateTurnScore {
  return { composite, cqScore: cq, aqScore: aq };
}

describe('computeDebateMetrics', () => {
  it('returns null for empty input', () => {
    expect(computeDebateMetrics([])).toBeNull();
  });

  it('identical scores yield full convergence and zero diversity', () => {
    const m = computeDebateMetrics([score(70), score(70), score(70)])!;
    expect(m.convergenceRate).toBe(100);
    expect(m.diversityIndex).toBe(0);
    expect(m.meanComposite).toBe(70);
  });

  it('does not pin convergence to 0 for moderate spread (the old variance unit bug)', () => {
    // SD of [60, 80] is 10 → old code computed 100 − variance(=100) = 0.
    // Correct: 100 − 2·10 = 80.
    const m = computeDebateMetrics([score(60), score(80)])!;
    expect(m.convergenceRate).toBe(80);
  });

  it('extreme spread drives convergence to 0 without going negative', () => {
    const m = computeDebateMetrics([score(0), score(100)])!;
    expect(m.convergenceRate).toBe(0);
  });

  it('argumentationQuality and alignmentCoherence are distinct metrics', () => {
    // Same AQ mean (70) but different spreads must give different coherence.
    const tight = computeDebateMetrics([score(50, 50, 70), score(50, 50, 70)])!;
    const wide = computeDebateMetrics([score(50, 50, 40), score(50, 50, 100)])!;
    expect(tight.argumentationQuality).toBe(70);
    expect(wide.argumentationQuality).toBe(70);
    expect(tight.alignmentCoherence).toBe(100);
    expect(wide.alignmentCoherence).toBeLessThan(tight.alignmentCoherence);
  });

  it('diversityIndex uses CQ spread, not composite spread', () => {
    const m = computeDebateMetrics([score(70, 40, 70), score(70, 80, 70)])!;
    expect(m.convergenceRate).toBe(100); // composites identical
    expect(m.diversityIndex).toBe(100); // SD(cq)=20 → 5·20 = 100
  });

  it('all outputs stay within 0-100', () => {
    const m = computeDebateMetrics([score(0, 0, 0), score(100, 100, 100), score(50, 50, 50)])!;
    for (const v of Object.values(m)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
  });

  it('single turn yields degenerate but valid metrics', () => {
    const m = computeDebateMetrics([score(64)])!;
    expect(m.convergenceRate).toBe(100);
    expect(m.diversityIndex).toBe(0);
    expect(m.meanComposite).toBe(64);
  });
});
