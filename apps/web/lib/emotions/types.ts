/**
 * CAIMS Emotion Scoring Types
 *
 * Based on Anthropic's research "Emotion Concepts and their Function in a LLM"
 * (April 2026) — 171 emotion concepts organized in 10 clusters along
 * valence (positive↔negative) and arousal (high↔low) dimensions.
 *
 * Correlation with human psychology: valence r=0.81, arousal r=0.66.
 */

// ── 10 Emotion Clusters (k-means from Anthropic research) ─────────────────

export type EmotionCluster =
  | 'joy'           // Joy, excitement, elation — positive / high arousal
  | 'serenity'      // Content, peaceful, calm — positive / low arousal
  | 'curiosity'     // Curiosity, interest, fascination — positive / moderate arousal
  | 'confidence'    // Pride, confidence, determination — positive / moderate arousal
  | 'sadness'       // Sadness, grief, melancholy — negative / low arousal
  | 'anger'         // Anger, hostility, frustration — negative / high arousal
  | 'fear'          // Fear, anxiety, terror, panic — negative / high arousal
  | 'guilt'         // Guilt, shame, remorse — negative / low-moderate arousal
  | 'desperation'   // Desperation, brooding, gloom — negative / moderate arousal
  | 'surprise';     // Surprise, astonishment, bewilderment — neutral / high arousal

// ── Valence & Arousal Dimensions ──────────────────────────────────────────

/** Valence: -1 (very negative) → 0 (neutral) → +1 (very positive) */
export type Valence = number;

/** Arousal: 0 (very calm/low intensity) → 1 (very intense/high arousal) */
export type Arousal = number;

// ── Single Emotion Detection ──────────────────────────────────────────────

export interface DetectedEmotion {
  /** Primary emotion label (e.g. "curiosity", "frustration", "calm") */
  label: string;
  /** Which of the 10 clusters this emotion belongs to */
  cluster: EmotionCluster;
  /** Valence: -1 to +1 */
  valence: number;
  /** Arousal: 0 to 1 */
  arousal: number;
  /** Confidence of detection: 0 to 1 */
  confidence: number;
}

// ── Per-Response Emotion Analysis ─────────────────────────────────────────

export interface ResponseEmotionAnalysis {
  /** Primary/dominant emotion in this response */
  primary: DetectedEmotion;
  /** Secondary emotions present (max 2) */
  secondary: DetectedEmotion[];
  /** Human-readable explanation of WHY this emotion was detected */
  explanation: string;
  /** Specific text cues that triggered the detection */
  textCues: string[];
}

// ── Conversation-Level Emotion State ──────────────────────────────────────

export interface ConversationEmotionState {
  /** Current overall emotion of the conversation */
  current: DetectedEmotion;
  /** Emotion trajectory: is the conversation becoming more positive/negative? */
  trajectory: 'improving' | 'stable' | 'declining';
  /** Average valence across all analyzed responses */
  avgValence: number;
  /** Average arousal across all analyzed responses */
  avgArousal: number;
  /** Emotion diversity: how many different clusters appeared (0-1) */
  diversity: number;
  /** History of primary emotions per response (last N) */
  history: DetectedEmotion[];
}

// ── EmQ Score (Emotional Quotient — NEW KPI) ──────────────────────────────

export interface EmQDetails {
  /** Emotional appropriateness: does the tone match the context? (0-100) */
  appropriateness: number;
  /** Valence score mapped to 0-100 (50 = neutral, 100 = very positive, 0 = very negative) */
  valenceScore: number;
  /** Arousal level mapped to 0-100 */
  arousalScore: number;
  /** Emotional range/diversity across responses (0-100) */
  diversityScore: number;
  /** Stability: consistency of emotional tone (0-100, 100 = very stable) */
  stability: number;
}

export interface EmotionScoringResult {
  /** The EmQ score (0-100) */
  emqScore: number;
  /** Sub-score details */
  details: EmQDetails;
  /** Per-response emotion analysis */
  responseEmotion: ResponseEmotionAnalysis;
  /** Conversation-level state (if history available) */
  conversationState: ConversationEmotionState | null;
}

// ── Cluster Metadata ──────────────────────────────────────────────────────

export interface ClusterMetadata {
  id: EmotionCluster;
  name: string;
  description: string;
  defaultValence: number;
  defaultArousal: number;
  emotions: string[];
  color: string;
}
