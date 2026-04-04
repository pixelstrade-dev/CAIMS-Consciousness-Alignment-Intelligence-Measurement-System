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

export interface LLMAdapterConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface LLMAdapter {
  chat(messages: LLMMessage[], config: LLMAdapterConfig): Promise<LLMResponse>;

  // For scoring - force temperature 0, structured JSON output
  judge(prompt: string, config?: Partial<LLMAdapterConfig>): Promise<string>;
}
