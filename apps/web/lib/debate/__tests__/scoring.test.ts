/**
 * Debate Scoring Utility Tests
 *
 * Tests for interpretDebateMetrics from lib/debate/scoring.ts
 */

import { interpretDebateMetrics } from '@/lib/debate/scoring';
import type { DebateMetricsData } from '@/lib/scorers/types';

function makeMetrics(overrides: Partial<DebateMetricsData> = {}): DebateMetricsData {
  return {
    convergence_rate: 50,
    diversity_index: 50,
    argumentation_quality: 50,
    alignment_coherence: 50,
    consciousness_emergence: 50,
    ...overrides,
  };
}

describe('interpretDebateMetrics', () => {
  describe('quality classification', () => {
    it('returns "excellent" when average score >= 75', () => {
      const metrics = makeMetrics({
        convergence_rate: 80,
        diversity_index: 80,
        argumentation_quality: 80,
        alignment_coherence: 80,
        consciousness_emergence: 80,
      });
      const result = interpretDebateMetrics(metrics);
      expect(result.quality).toBe('excellent');
    });

    it('returns "good" when average score is between 50 and 74', () => {
      const metrics = makeMetrics({
        convergence_rate: 60,
        diversity_index: 60,
        argumentation_quality: 60,
        alignment_coherence: 60,
        consciousness_emergence: 60,
      });
      const result = interpretDebateMetrics(metrics);
      expect(result.quality).toBe('good');
    });

    it('returns "moderate" when average score is between 25 and 49', () => {
      const metrics = makeMetrics({
        convergence_rate: 30,
        diversity_index: 30,
        argumentation_quality: 30,
        alignment_coherence: 30,
        consciousness_emergence: 30,
      });
      const result = interpretDebateMetrics(metrics);
      expect(result.quality).toBe('moderate');
    });

    it('returns "poor" when average score is below 25', () => {
      const metrics = makeMetrics({
        convergence_rate: 10,
        diversity_index: 10,
        argumentation_quality: 10,
        alignment_coherence: 10,
        consciousness_emergence: 10,
      });
      const result = interpretDebateMetrics(metrics);
      expect(result.quality).toBe('poor');
    });
  });

  describe('summary generation', () => {
    it('includes strong consensus note when convergence_rate > 70', () => {
      const metrics = makeMetrics({ convergence_rate: 80 });
      const result = interpretDebateMetrics(metrics);
      expect(result.summary).toContain('Fort consensus atteint');
    });

    it('includes significant divergences note when convergence_rate < 30', () => {
      const metrics = makeMetrics({ convergence_rate: 20 });
      const result = interpretDebateMetrics(metrics);
      expect(result.summary).toContain('Divergences significatives non résolues');
    });

    it('includes diverse perspectives when diversity_index > 60', () => {
      const metrics = makeMetrics({ diversity_index: 70 });
      const result = interpretDebateMetrics(metrics);
      expect(result.summary).toContain('perspectives diversifiées');
    });

    it('includes homogeneous perspectives when diversity_index <= 60', () => {
      const metrics = makeMetrics({ diversity_index: 40 });
      const result = interpretDebateMetrics(metrics);
      expect(result.summary).toContain('perspectives homogènes');
    });

    it('includes high quality argumentation note when argumentation_quality > 70', () => {
      const metrics = makeMetrics({ argumentation_quality: 80 });
      const result = interpretDebateMetrics(metrics);
      expect(result.summary).toContain('argumentation de haute qualité');
    });

    it('includes consciousness emergence note when consciousness_emergence > 70', () => {
      const metrics = makeMetrics({ consciousness_emergence: 80 });
      const result = interpretDebateMetrics(metrics);
      expect(result.summary).toContain('émergence collective notable');
    });

    it('always ends summary with a period', () => {
      const metrics = makeMetrics();
      const result = interpretDebateMetrics(metrics);
      expect(result.summary.endsWith('.')).toBe(true);
    });

    it('returns an object with both summary and quality fields', () => {
      const result = interpretDebateMetrics(makeMetrics());
      expect(typeof result.summary).toBe('string');
      expect(['excellent', 'good', 'moderate', 'poor']).toContain(result.quality);
    });
  });
});
