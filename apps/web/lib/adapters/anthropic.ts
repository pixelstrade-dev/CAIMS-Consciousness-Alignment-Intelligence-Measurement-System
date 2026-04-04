import Anthropic from '@anthropic-ai/sdk';
import { LLMAdapter, LLMMessage, LLMResponse, LLMAdapterConfig } from './base';
import { logger } from '@/lib/logger';

const LLM_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 3;
const RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 529];

function validateApiKey(): string {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY environment variable is not set. ' +
      'Please add it to your .env file. See .env.example for reference.'
    );
  }
  return apiKey;
}

const getClient = (() => {
  let client: Anthropic | null = null;
  return () => {
    if (!client) {
      const apiKey = validateApiKey();
      client = new Anthropic({ apiKey, timeout: LLM_TIMEOUT_MS });
    }
    return client;
  };
})();

async function withRetry<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if retryable
      const isRetryable =
        lastError.message.includes('timeout') ||
        lastError.message.includes('ECONNRESET') ||
        lastError.message.includes('ETIMEDOUT') ||
        (error instanceof Anthropic.APIError && RETRYABLE_STATUS_CODES.includes(error.status));

      if (!isRetryable || attempt === MAX_RETRIES) {
        logger.error(`[${context}] Failed after ${attempt} attempt(s)`, {
          error: lastError.message,
          attempt,
        });
        throw lastError;
      }

      const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
      logger.warn(`[${context}] Attempt ${attempt} failed, retrying in ${delayMs}ms`, {
        error: lastError.message,
      });
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

export class AnthropicAdapter implements LLMAdapter {
  async chat(messages: LLMMessage[], config: LLMAdapterConfig): Promise<LLMResponse> {
    return withRetry(async () => {
      const client = getClient();
      const response = await client.messages.create({
        model: config.model,
        max_tokens: config.maxTokens || 4096,
        temperature: config.temperature ?? 0.7,
        system: config.systemPrompt || 'You are an advanced AI assistant. Respond precisely and thoughtfully.',
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      });

      const textBlock = response.content.find(b => b.type === 'text');
      if (!textBlock?.text) {
        throw new Error('LLM response contained no text content');
      }

      return {
        content: textBlock.text,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        model: response.model,
      };
    }, 'AnthropicAdapter.chat');
  }

  async judge(prompt: string, config?: Partial<LLMAdapterConfig>): Promise<string> {
    return withRetry(async () => {
      const client = getClient();
      const model = config?.model || process.env.CAIMS_SCORING_MODEL || 'claude-sonnet-4-20250514';

      const response = await client.messages.create({
        model,
        max_tokens: config?.maxTokens || 2048,
        temperature: 0,
        system: 'You are a computational consciousness evaluation system. You MUST respond ONLY with valid JSON, no text before or after the JSON.',
        messages: [{ role: 'user', content: prompt }],
      });

      const textBlock = response.content.find(b => b.type === 'text');
      if (!textBlock?.text) {
        throw new Error('LLM judge response contained no text content');
      }

      return textBlock.text;
    }, 'AnthropicAdapter.judge');
  }
}

// Singleton
let adapter: AnthropicAdapter | null = null;
export function getAnthropicAdapter(): AnthropicAdapter {
  if (!adapter) adapter = new AnthropicAdapter();
  return adapter;
}
