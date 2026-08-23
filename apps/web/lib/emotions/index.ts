/**
 * CAIMS Emotion Module — Public API
 *
 * Based on Anthropic's "Emotion Concepts and their Function in a LLM" (April 2026)
 */

export { analyzeResponseEmotion, computeConversationState, computeEmQScore, scoreEmotion } from './analyzer';
export { EMOTION_CLUSTERS, getCluster, getClusterForEmotion, getAllEmotionLabels, getClusterIds } from './taxonomy';
export type {
  EmotionCluster,
  DetectedEmotion,
  ResponseEmotionAnalysis,
  ConversationEmotionState,
  EmQDetails,
  EmotionScoringResult,
  ClusterMetadata,
} from './types';
