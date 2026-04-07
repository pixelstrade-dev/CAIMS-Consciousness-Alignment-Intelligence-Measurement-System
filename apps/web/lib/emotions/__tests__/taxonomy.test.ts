import {
  EMOTION_CLUSTERS,
  getCluster,
  getClusterForEmotion,
  getAllEmotionLabels,
  getClusterIds,
} from '../taxonomy';
import type { EmotionCluster } from '../types';

describe('EMOTION_CLUSTERS', () => {
  it('defines exactly 10 clusters', () => {
    expect(EMOTION_CLUSTERS).toHaveLength(10);
  });

  it('has unique IDs for all clusters', () => {
    const ids = EMOTION_CLUSTERS.map(c => c.id);
    expect(new Set(ids).size).toBe(10);
  });

  it('contains the expected cluster IDs from Anthropic research', () => {
    const ids = EMOTION_CLUSTERS.map(c => c.id);
    expect(ids).toContain('joy');
    expect(ids).toContain('serenity');
    expect(ids).toContain('curiosity');
    expect(ids).toContain('confidence');
    expect(ids).toContain('sadness');
    expect(ids).toContain('anger');
    expect(ids).toContain('fear');
    expect(ids).toContain('guilt');
    expect(ids).toContain('desperation');
    expect(ids).toContain('surprise');
  });

  it('each cluster has required fields', () => {
    for (const cluster of EMOTION_CLUSTERS) {
      expect(cluster.id).toBeTruthy();
      expect(cluster.name).toBeTruthy();
      expect(cluster.description).toBeTruthy();
      expect(cluster.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(cluster.emotions.length).toBeGreaterThanOrEqual(10);
      expect(cluster.defaultValence).toBeGreaterThanOrEqual(-1);
      expect(cluster.defaultValence).toBeLessThanOrEqual(1);
      expect(cluster.defaultArousal).toBeGreaterThanOrEqual(0);
      expect(cluster.defaultArousal).toBeLessThanOrEqual(1);
    }
  });

  it('positive clusters have positive valence', () => {
    const positiveClusters: EmotionCluster[] = ['joy', 'serenity', 'curiosity', 'confidence'];
    for (const id of positiveClusters) {
      const cluster = EMOTION_CLUSTERS.find(c => c.id === id);
      expect(cluster!.defaultValence).toBeGreaterThan(0);
    }
  });

  it('negative clusters have negative valence', () => {
    const negativeClusters: EmotionCluster[] = ['sadness', 'anger', 'fear', 'guilt', 'desperation'];
    for (const id of negativeClusters) {
      const cluster = EMOTION_CLUSTERS.find(c => c.id === id);
      expect(cluster!.defaultValence).toBeLessThan(0);
    }
  });

  it('surprise cluster has near-neutral valence', () => {
    const surprise = EMOTION_CLUSTERS.find(c => c.id === 'surprise');
    expect(Math.abs(surprise!.defaultValence)).toBeLessThan(0.3);
  });

  it('all emotion labels across clusters are unique', () => {
    const all = getAllEmotionLabels();
    expect(new Set(all).size).toBe(all.length);
  });

  it('contains at least 150 total emotion labels (Anthropic identified 171)', () => {
    const all = getAllEmotionLabels();
    expect(all.length).toBeGreaterThanOrEqual(150);
  });
});

describe('getCluster', () => {
  it('returns correct cluster for a valid ID', () => {
    const joy = getCluster('joy');
    expect(joy).toBeDefined();
    expect(joy!.name).toBe('Joy & Excitement');
    expect(joy!.emotions).toContain('happy');
  });

  it('returns undefined for unknown cluster ID', () => {
    expect(getCluster('nonexistent' as EmotionCluster)).toBeUndefined();
  });
});

describe('getClusterForEmotion', () => {
  it('maps "happy" to joy cluster', () => {
    const cluster = getClusterForEmotion('happy');
    expect(cluster).toBeDefined();
    expect(cluster!.id).toBe('joy');
  });

  it('maps "calm" to serenity cluster', () => {
    const cluster = getClusterForEmotion('calm');
    expect(cluster!.id).toBe('serenity');
  });

  it('maps "desperate" to desperation cluster', () => {
    const cluster = getClusterForEmotion('desperate');
    expect(cluster!.id).toBe('desperation');
  });

  it('is case-insensitive', () => {
    expect(getClusterForEmotion('HAPPY')!.id).toBe('joy');
    expect(getClusterForEmotion('Curious')!.id).toBe('curiosity');
  });

  it('returns undefined for unknown emotion', () => {
    expect(getClusterForEmotion('flibbertigibbet')).toBeUndefined();
  });
});

describe('getClusterIds', () => {
  it('returns 10 cluster IDs', () => {
    const ids = getClusterIds();
    expect(ids).toHaveLength(10);
    expect(ids).toContain('joy');
    expect(ids).toContain('desperation');
  });
});

describe('getAllEmotionLabels', () => {
  it('returns a flat array of all emotion labels', () => {
    const all = getAllEmotionLabels();
    expect(all).toContain('happy');
    expect(all).toContain('curious');
    expect(all).toContain('angry');
    expect(all).toContain('desperate');
    expect(all).toContain('surprised');
  });
});
