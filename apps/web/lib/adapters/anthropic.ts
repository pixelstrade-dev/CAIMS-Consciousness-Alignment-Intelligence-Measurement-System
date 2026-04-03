import Anthropic from '@anthropic-ai/sdk';
import { LLMAdapter, LLMMessage, LLMResponse, LLMAdapterConfig } from './base';

const getClient = (() => {
  let client: Anthropic | null = null;
  return () => {
    if (!client) {
      client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
    return client;
  };
})();

export class AnthropicAdapter implements LLMAdapter {
  async chat(messages: LLMMessage[], config: LLMAdapterConfig): Promise<LLMResponse> {
    const client = getClient();
    const response = await client.messages.create({
      model: config.model,
      max_tokens: config.maxTokens || 4096,
      temperature: config.temperature ?? 0.7,
      system: config.systemPrompt || "Tu es un assistant IA avancé. Réponds de manière précise et réfléchie.",
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    });

    const textBlock = response.content.find(b => b.type === 'text');
    return {
      content: textBlock?.text || '',
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      model: response.model,
    };
  }

  async judge(prompt: string, config?: Partial<LLMAdapterConfig>): Promise<string> {
    const client = getClient();
    const model = config?.model || process.env.CAIMS_SCORING_MODEL || 'claude-sonnet-4-20250514';

    const response = await client.messages.create({
      model,
      max_tokens: config?.maxTokens || 2048,
      temperature: 0, // Always 0 for scoring - determinism
      system: "Tu es un système d'évaluation de conscience computationnelle. Tu réponds UNIQUEMENT en JSON valide, sans aucun texte avant ou après le JSON.",
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = response.content.find(b => b.type === 'text');
    return textBlock?.text || '{}';
  }
}

// Singleton
let adapter: AnthropicAdapter | null = null;
export function getAnthropicAdapter(): AnthropicAdapter {
  if (!adapter) adapter = new AnthropicAdapter();
  return adapter;
}
