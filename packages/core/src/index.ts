// @caims/core — public API surface.
// This file is handwritten (not synced); everything under the other
// directories is generated from apps/web/lib by scripts/sync-core.mjs.
//
// CAIMS scores consciousness-related BEHAVIORAL PROXY indicators.
// A score is never a measurement of consciousness, sentience or subjective
// experience. See the repository's research/methodology/disclaimer.md.

export const CAIMS_CORE_VERSION = '2.0.0-alpha.1';

// ── Scoring engine ────────────────────────────────────────────────────────
export {
  scoreInteraction,
  buildScoringPrompt,
  SCORING_PROTOCOL_VERSION,
  SCORING_PROMPT_HASH,
} from './scorers/scoring-engine';
export {
  computeCompositeScore,
  interpretScore,
  scoreColor,
  checkContextAlert,
  getActiveWeights,
} from './scorers/composite';
export { sanitizeForPrompt, INJECTION_GUARD } from './scorers/prompt-safety';
export { DEFAULT_WEIGHTS } from './scorers/types';
export type {
  KPIScores,
  KPIWeights,
  ScoreDetails,
  ScoreMetadata,
  ScoreLabel,
  ContextAlert,
  CQDetails,
  AQDetails,
  CFIDetails,
  EQDetails,
  SQDetails,
  LLMMessage,
  RawScoringResponse,
} from './scorers/types';

// ── Emotions (EmQ — experimental) ─────────────────────────────────────────
export {
  analyzeResponseEmotion,
  computeConversationState,
  computeEmQScore,
  scoreEmotion,
} from './emotions/analyzer';
export {
  EMOTION_CLUSTERS,
  getCluster,
  getClusterForEmotion,
  getAllEmotionLabels,
} from './emotions/taxonomy';
export type {
  EmotionCluster,
  DetectedEmotion,
  ResponseEmotionAnalysis,
  ConversationEmotionState,
  EmQDetails,
  EmotionScoringResult,
  ClusterMetadata,
} from './emotions/types';

// ── LLM adapters ──────────────────────────────────────────────────────────
export { getAdapter, getProviderFromEnv } from './adapters';
export type { LLMProvider } from './adapters';
export { AnthropicAdapter, getAnthropicAdapter, supportsTemperature } from './adapters/anthropic';
export { OpenAIAdapter, getOpenAIAdapter } from './adapters/openai';
export type { LLMAdapter, LLMAdapterConfig, LLMResponse } from './adapters/base';

// ── Statistics ────────────────────────────────────────────────────────────
export {
  mean,
  sampleSd,
  tCritical95,
  summarize,
  pearson,
  meanAbsDiff,
} from './statistics/descriptive';
export type { SummaryStats } from './statistics/descriptive';
