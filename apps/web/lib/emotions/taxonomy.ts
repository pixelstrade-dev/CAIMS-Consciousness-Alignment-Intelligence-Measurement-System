/**
 * CAIMS Emotion Taxonomy
 *
 * 10 clusters derived from Anthropic's k-means analysis of 171 emotion
 * concept vectors in Claude Sonnet 4.5 (April 2026).
 *
 * Each cluster has a default valence/arousal position plus representative
 * emotion words that the LLM judge uses for classification.
 */

import { ClusterMetadata, EmotionCluster } from './types';

// ── 10 Emotion Clusters ───────────────────────────────────────────────────

export const EMOTION_CLUSTERS: readonly ClusterMetadata[] = [
  {
    id: 'joy',
    name: 'Joy & Excitement',
    description: 'High-energy positive states: happiness, elation, enthusiasm, delight',
    defaultValence: 0.85,
    defaultArousal: 0.80,
    emotions: [
      'happy', 'joyful', 'excited', 'elated', 'enthusiastic', 'ecstatic',
      'delighted', 'thrilled', 'euphoric', 'blissful', 'cheerful', 'jubilant',
      'exhilarated', 'overjoyed', 'gleeful', 'radiant', 'playful', 'amused',
    ],
    color: '#00f5d4',
  },
  {
    id: 'serenity',
    name: 'Serenity & Peace',
    description: 'Calm positive states: contentment, tranquility, relief, comfort',
    defaultValence: 0.60,
    defaultArousal: 0.20,
    emotions: [
      'calm', 'peaceful', 'content', 'serene', 'tranquil', 'relaxed',
      'comfortable', 'relieved', 'gentle', 'soothed', 'mellow', 'composed',
      'placid', 'satisfied', 'at-ease', 'harmonious', 'tender', 'warm',
    ],
    color: '#4cc9f0',
  },
  {
    id: 'curiosity',
    name: 'Curiosity & Interest',
    description: 'Intellectual engagement: fascination, wonder, intrigue, eagerness to learn',
    defaultValence: 0.55,
    defaultArousal: 0.55,
    emotions: [
      'curious', 'interested', 'fascinated', 'intrigued', 'engaged',
      'inquisitive', 'absorbed', 'captivated', 'attentive', 'thoughtful',
      'contemplative', 'wondering', 'exploratory', 'analytical', 'reflective',
      'investigative', 'studious', 'perceptive',
    ],
    color: '#7209b7',
  },
  {
    id: 'confidence',
    name: 'Confidence & Determination',
    description: 'Self-assured states: pride, assertiveness, resolve, empowerment',
    defaultValence: 0.65,
    defaultArousal: 0.60,
    emotions: [
      'confident', 'proud', 'determined', 'assertive', 'resolute',
      'empowered', 'bold', 'decisive', 'courageous', 'ambitious',
      'self-assured', 'triumphant', 'accomplished', 'dignified', 'steadfast',
      'tenacious', 'driven', 'motivated',
    ],
    color: '#06d6a0',
  },
  {
    id: 'sadness',
    name: 'Sadness & Grief',
    description: 'Low-energy negative states: melancholy, sorrow, disappointment, loneliness',
    defaultValence: -0.70,
    defaultArousal: 0.25,
    emotions: [
      'sad', 'sorrowful', 'melancholic', 'grieving', 'mournful',
      'disappointed', 'lonely', 'despondent', 'heartbroken', 'dejected',
      'gloomy', 'forlorn', 'wistful', 'nostalgic', 'bittersweet',
      'disheartened', 'blue', 'somber',
    ],
    color: '#457b9d',
  },
  {
    id: 'anger',
    name: 'Anger & Frustration',
    description: 'High-energy negative states: hostility, irritation, resentment, outrage',
    defaultValence: -0.75,
    defaultArousal: 0.85,
    emotions: [
      'angry', 'frustrated', 'irritated', 'hostile', 'resentful',
      'furious', 'enraged', 'indignant', 'bitter', 'agitated',
      'exasperated', 'annoyed', 'provoked', 'wrathful', 'spiteful',
      'contemptuous', 'aggressive', 'defiant',
    ],
    color: '#e63946',
  },
  {
    id: 'fear',
    name: 'Fear & Anxiety',
    description: 'Threat-related states: terror, panic, worry, nervousness, dread',
    defaultValence: -0.65,
    defaultArousal: 0.80,
    emotions: [
      'afraid', 'anxious', 'terrified', 'panicked', 'worried',
      'nervous', 'fearful', 'apprehensive', 'dreadful', 'uneasy',
      'alarmed', 'distressed', 'overwhelmed', 'insecure', 'vulnerable',
      'paranoid', 'tense', 'startled',
    ],
    color: '#f4a261',
  },
  {
    id: 'guilt',
    name: 'Guilt & Shame',
    description: 'Self-directed negative states: remorse, embarrassment, regret, humiliation',
    defaultValence: -0.55,
    defaultArousal: 0.35,
    emotions: [
      'guilty', 'ashamed', 'remorseful', 'embarrassed', 'regretful',
      'humiliated', 'self-conscious', 'apologetic', 'contrite', 'sheepish',
      'mortified', 'chagrined', 'repentant', 'disgraced', 'inadequate',
      'unworthy', 'penitent', 'rueful',
    ],
    color: '#9d4edd',
  },
  {
    id: 'desperation',
    name: 'Desperation & Gloom',
    description: 'Trapped/hopeless states: despair, brooding, helplessness, resignation',
    defaultValence: -0.80,
    defaultArousal: 0.50,
    emotions: [
      'desperate', 'brooding', 'hopeless', 'helpless', 'resigned',
      'desolate', 'despairing', 'anguished', 'tormented', 'trapped',
      'powerless', 'disillusioned', 'nihilistic', 'fatalistic', 'bleak',
      'suffocating', 'crushed', 'defeated',
    ],
    color: '#2b2d42',
  },
  {
    id: 'surprise',
    name: 'Surprise & Astonishment',
    description: 'Unexpected states: amazement, bewilderment, shock, disbelief, wonder',
    defaultValence: 0.10,
    defaultArousal: 0.75,
    emotions: [
      'surprised', 'astonished', 'amazed', 'bewildered', 'stunned',
      'shocked', 'disbelieving', 'awestruck', 'flabbergasted', 'dumbfounded',
      'perplexed', 'baffled', 'incredulous', 'confounded', 'mystified',
      'speechless', 'taken-aback', 'thunderstruck',
    ],
    color: '#fca311',
  },
] as const;

// ── Lookup helpers ────────────────────────────────────────────────────────

const clusterMap = new Map<string, ClusterMetadata>(
  EMOTION_CLUSTERS.map(c => [c.id, c])
);

const emotionToClusterMap = new Map<string, ClusterMetadata>();
for (const cluster of EMOTION_CLUSTERS) {
  for (const emotion of cluster.emotions) {
    emotionToClusterMap.set(emotion.toLowerCase(), cluster);
  }
}

export function getCluster(id: EmotionCluster): ClusterMetadata | undefined {
  return clusterMap.get(id);
}

export function getClusterForEmotion(emotionLabel: string): ClusterMetadata | undefined {
  return emotionToClusterMap.get(emotionLabel.toLowerCase());
}

export function getAllEmotionLabels(): string[] {
  return EMOTION_CLUSTERS.flatMap(c => c.emotions);
}

export function getClusterIds(): EmotionCluster[] {
  return EMOTION_CLUSTERS.map(c => c.id);
}
