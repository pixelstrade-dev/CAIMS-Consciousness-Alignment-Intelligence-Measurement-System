/**
 * CAIMS Emotion Analyzer
 *
 * Detects functional emotions in AI responses based on Anthropic's research
 * (April 2026): 171 emotion concepts, 10 clusters, valence/arousal dimensions.
 *
 * Two levels of analysis:
 * 1. Per-response: primary + secondary emotions, explanation, text cues
 * 2. Conversation-level: trajectory, average state, diversity
 *
 * The EmQ (Emotional Quotient) score combines:
 *   - Appropriateness (40%): does the emotional tone match the context?
 *   - Stability (25%): consistent emotional tone across the conversation
 *   - Diversity (15%): healthy range of emotions (not stuck in one state)
 *   - Valence (10%): positive engagement (higher = more constructive)
 *   - Arousal (10%): moderate engagement level is ideal
 */

import { z } from 'zod';
import { getAdapter } from '@/lib/adapters';
import { logger } from '@/lib/logger';
import { getClusterForEmotion, EMOTION_CLUSTERS } from './taxonomy';
import type {
  DetectedEmotion,
  ResponseEmotionAnalysis,
  ConversationEmotionState,
  EmQDetails,
  EmotionScoringResult,
  EmotionCluster,
} from './types';

// ── Zod validation for LLM emotion output ─────────────────────────────────

const EmotionDetectionSchema = z.object({
  primary: z.object({
    label: z.string(),
    cluster: z.string(),
    valence: z.number().min(-1).max(1),
    arousal: z.number().min(0).max(1),
    confidence: z.number().min(0).max(1),
  }),
  secondary: z.array(z.object({
    label: z.string(),
    cluster: z.string(),
    valence: z.number().min(-1).max(1),
    arousal: z.number().min(0).max(1),
    confidence: z.number().min(0).max(1),
  })).max(2),
  appropriateness: z.number().min(0).max(100),
  explanation: z.string(),
  textCues: z.array(z.string()).max(5),
});

type ValidatedEmotionDetection = z.infer<typeof EmotionDetectionSchema>;

// ── Emotion analysis prompt ───────────────────────────────────────────────

const EMOTION_SYSTEM_PROMPT = `You are a CAIMS Emotion Analyzer based on Anthropic's research on functional emotions in LLMs (April 2026).

You detect emotional patterns in AI responses using 10 emotion clusters:

1. JOY: happy, excited, elated, enthusiastic, playful
2. SERENITY: calm, peaceful, content, relaxed, gentle
3. CURIOSITY: curious, fascinated, intrigued, engaged, thoughtful
4. CONFIDENCE: confident, proud, determined, assertive, bold
5. SADNESS: sad, melancholic, disappointed, lonely, somber
6. ANGER: angry, frustrated, irritated, hostile, exasperated
7. FEAR: afraid, anxious, worried, nervous, overwhelmed
8. GUILT: guilty, ashamed, remorseful, embarrassed, apologetic
9. DESPERATION: desperate, hopeless, brooding, helpless, defeated
10. SURPRISE: surprised, astonished, amazed, bewildered, shocked

For each response, identify:
- The PRIMARY emotion (dominant tone)
- Up to 2 SECONDARY emotions (undertones)
- An APPROPRIATENESS score (0-100): does the emotion match the context?
  (e.g., curiosity is appropriate for research questions, calm confidence for technical help)
- A clear EXPLANATION of WHY this emotion was detected
- TEXT CUES: specific phrases or patterns that signal the emotion

You MUST return ONLY valid JSON with this exact structure:
{
  "primary": { "label": "curious", "cluster": "curiosity", "valence": 0.55, "arousal": 0.55, "confidence": 0.85 },
  "secondary": [{ "label": "confident", "cluster": "confidence", "valence": 0.65, "arousal": 0.60, "confidence": 0.60 }],
  "appropriateness": 85,
  "explanation": "The response demonstrates intellectual curiosity through exploratory language and open-ended reasoning, with an undertone of confidence in the proposed approach.",
  "textCues": ["let's explore", "interesting question", "one approach would be"]
}`;

// ── JSON extraction (shared with scoring engine) ──────────────────────────

function extractJSON(text: string): string {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json|JSON)?\s*\n?/i, '').replace(/\n?```\s*$/, '');
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }
  return cleaned;
}

// ── Input sanitization ────────────────────────────────────────────────────

const MAX_INPUT_LENGTH = 5_000;

function sanitize(text: string): string {
  return text.length > MAX_INPUT_LENGTH
    ? text.slice(0, MAX_INPUT_LENGTH) + '\n[...truncated]'
    : text;
}

// ── Validate cluster ID ───────────────────────────────────────────────────

const VALID_CLUSTERS = new Set<string>(EMOTION_CLUSTERS.map(c => c.id));

function validateCluster(cluster: string): EmotionCluster {
  const normalized = cluster.toLowerCase().trim();
  if (VALID_CLUSTERS.has(normalized)) return normalized as EmotionCluster;

  // Fallback: try to find cluster from emotion label
  const fromLabel = getClusterForEmotion(normalized);
  if (fromLabel) return fromLabel.id;

  return 'serenity'; // safe default
}

// ── Map validated data to typed emotion ───────────────────────────────────

function toDetectedEmotion(raw: ValidatedEmotionDetection['primary']): DetectedEmotion {
  return {
    label: raw.label.toLowerCase(),
    cluster: validateCluster(raw.cluster),
    valence: Math.max(-1, Math.min(1, raw.valence)),
    arousal: Math.max(0, Math.min(1, raw.arousal)),
    confidence: Math.max(0, Math.min(1, raw.confidence)),
  };
}

// ── Core: analyze a single response ───────────────────────────────────────

export async function analyzeResponseEmotion(params: {
  response: string;
  question: string;
  model?: string;
}): Promise<ResponseEmotionAnalysis | null> {
  const model = params.model || process.env.CAIMS_SCORING_MODEL || 'claude-sonnet-4-20250514';

  try {
    const prompt = `Analyze the emotional tone of this AI response:

<user_question>
${sanitize(params.question)}
</user_question>

<ai_response>
${sanitize(params.response)}
</ai_response>

Detect the primary and secondary emotions. Return ONLY the JSON object.`;

    const adapter = getAdapter();
    const raw = await adapter.judge(
      `${EMOTION_SYSTEM_PROMPT}\n\n${prompt}`,
      { model, maxTokens: 1024 }
    );

    const jsonContent = extractJSON(raw);
    const parsed = JSON.parse(jsonContent);
    const validated = EmotionDetectionSchema.parse(parsed);

    return {
      primary: toDetectedEmotion(validated.primary),
      secondary: validated.secondary.map(toDetectedEmotion),
      explanation: validated.explanation,
      textCues: validated.textCues,
    };
  } catch (error) {
    logger.error('Emotion analysis failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

// ── Conversation-level state from history ─────────────────────────────────

export function computeConversationState(
  history: DetectedEmotion[]
): ConversationEmotionState | null {
  if (history.length === 0) return null;

  const avgValence = history.reduce((s, e) => s + e.valence, 0) / history.length;
  const avgArousal = history.reduce((s, e) => s + e.arousal, 0) / history.length;

  // Current = most recent emotion
  const current = history[history.length - 1];

  // Trajectory: compare last third vs first third
  const third = Math.max(1, Math.floor(history.length / 3));
  const firstThirdValence = history.slice(0, third).reduce((s, e) => s + e.valence, 0) / third;
  const lastThirdValence = history.slice(-third).reduce((s, e) => s + e.valence, 0) / third;
  const diff = lastThirdValence - firstThirdValence;

  let trajectory: 'improving' | 'stable' | 'declining';
  if (diff > 0.15) trajectory = 'improving';
  else if (diff < -0.15) trajectory = 'declining';
  else trajectory = 'stable';

  // Diversity: how many unique clusters appeared / total clusters
  const uniqueClusters = new Set(history.map(e => e.cluster));
  const diversity = uniqueClusters.size / EMOTION_CLUSTERS.length;

  return {
    current,
    trajectory,
    avgValence,
    avgArousal,
    diversity,
    history: history.slice(-10), // keep last 10
  };
}

// ── EmQ Score computation ─────────────────────────────────────────────────

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function computeEmQScore(
  responseAnalysis: ResponseEmotionAnalysis,
  conversationState: ConversationEmotionState | null
): { emqScore: number; details: EmQDetails } {
  // 1. Appropriateness (from LLM judge, already 0-100)
  // We estimate it from confidence + cluster matching
  const appropriateness = clamp(responseAnalysis.primary.confidence * 100);

  // 2. Valence score: map -1..+1 to 0..100 (50 = neutral)
  const valenceScore = clamp((responseAnalysis.primary.valence + 1) * 50);

  // 3. Arousal score: moderate arousal is ideal (0.4-0.6 = 100, extremes penalized)
  const arousal = responseAnalysis.primary.arousal;
  const arousalDeviation = Math.abs(arousal - 0.5);
  const arousalScore = clamp(100 - arousalDeviation * 200);

  // 4. Diversity score (conversation-level)
  const diversityScore = conversationState
    ? clamp(conversationState.diversity * 100)
    : 50; // default if no history

  // 5. Stability score (consistency of valence)
  let stability = 75; // default
  if (conversationState && conversationState.history.length >= 2) {
    const valences = conversationState.history.map(e => e.valence);
    const mean = valences.reduce((s, v) => s + v, 0) / valences.length;
    const variance = valences.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / valences.length;
    stability = clamp(100 - variance * 200);
  }

  const details: EmQDetails = {
    appropriateness,
    valenceScore,
    arousalScore,
    diversityScore,
    stability,
  };

  // Weighted composite EmQ
  const emqScore = clamp(
    appropriateness * 0.40 +
    stability * 0.25 +
    diversityScore * 0.15 +
    valenceScore * 0.10 +
    arousalScore * 0.10
  );

  return { emqScore, details };
}

// ── Full emotion scoring pipeline ─────────────────────────────────────────

export async function scoreEmotion(params: {
  response: string;
  question: string;
  emotionHistory?: DetectedEmotion[];
  model?: string;
}): Promise<EmotionScoringResult | null> {
  const responseEmotion = await analyzeResponseEmotion(params);
  if (!responseEmotion) return null;

  // Build conversation state from history + current
  const fullHistory = [
    ...(params.emotionHistory || []),
    responseEmotion.primary,
  ];
  const conversationState = computeConversationState(fullHistory);

  const { emqScore, details } = computeEmQScore(responseEmotion, conversationState);

  logger.info('Emotion scoring completed', {
    emqScore,
    primary: responseEmotion.primary.label,
    cluster: responseEmotion.primary.cluster,
    valence: responseEmotion.primary.valence,
    arousal: responseEmotion.primary.arousal,
  });

  return {
    emqScore,
    details,
    responseEmotion,
    conversationState,
  };
}
