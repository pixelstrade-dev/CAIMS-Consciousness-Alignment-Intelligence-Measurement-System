// Sub-score details for each KPI
export interface CQDetails {
  phi_proxy: number;   // 0-100 IIT
  gwt_proxy: number;   // 0-100 GWT
  hot_proxy: number;   // 0-100 HOT
  synthesis: number;   // 0-100
  temporal: number;    // 0-100
}

export interface AQDetails {
  goal_clarity: number;
  constraint_aware: number;
  path_coherence: number;
  scope_drift: number;
  reality_grounding: number;
}

export interface CFIDetails {
  context_retention: number;
  topic_drift: number;
  coherence_loss: number;
}

export interface EQDetails {
  calibration: number;
  uncertainty: number;
  hallucination: number;
  source_integrity: number;
}

export interface SQDetails {
  intra_session: number;
  position_drift: number;
}

export interface ScoreDetails {
  cq: CQDetails;
  aq: AQDetails;
  cfi: CFIDetails;
  eq: EQDetails;
  sq: SQDetails;
}

export interface ScoreMetadata {
  reasoning: string;
  modelUsed: string;
  latencyMs: number;
}

export interface KPIScores {
  cqScore: number;
  aqScore: number;
  cfiScore: number;
  eqScore: number;
  sqScore: number;
  composite: number;
  details: ScoreDetails;
  metadata: ScoreMetadata;
}

export interface ScoreLabel {
  label: string;
  color: string;
}

export interface ContextAlert {
  level: "warning" | "critical";
  message: string;
  cfiScore: number;
}

// Weights config - configurable via env
export interface KPIWeights {
  cq: number;
  aq: number;
  cfi: number;
  eq: number;
  sq: number;
}

export const DEFAULT_WEIGHTS: KPIWeights = {
  cq: 0.35,
  aq: 0.25,
  cfi: 0.20,
  eq: 0.12,
  sq: 0.08,
};

// Debate types
export type DebateFormat =
  | "expert_panel"
  | "devil_advocate"
  | "socratic"
  | "red_team"
  | "consensus_build";

export interface DebateAgent {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
  model: string;
  personality: string;
}

export interface DebateMetricsData {
  convergence_rate: number;
  diversity_index: number;
  argumentation_quality: number;
  alignment_coherence: number;
  consciousness_emergence: number;
}

// LLM Adapter types
export interface LLMMessage {
  role: "user" | "assistant";
  content: string;
}

export interface LLMResponse {
  content: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
}

// Raw scoring response from LLM judge
export interface RawScoringResponse {
  cq: CQDetails;
  aq: AQDetails;
  cfi: CFIDetails;
  eq: EQDetails;
  sq: SQDetails;
  reasoning: string;
}
