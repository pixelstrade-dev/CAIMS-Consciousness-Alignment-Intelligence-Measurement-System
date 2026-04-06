import { LLMAdapter, LLMMessage, LLMResponse, LLMAdapterConfig } from './base';
import { logger } from '@/lib/logger';

const LLM_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 3;
const RETRYABLE_STATUS_CODES = [429, 500, 502, 503];

function validateApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY environment variable is not set. ' +
      'Please add it to your .env file. See .env.example for reference.'
    );
  }
  return apiKey;
}

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIChoice {
  message: { role: string; content: string | null };
  finish_reason: string;
}

interface OpenAIResponse {
  id: string;
  model: string;
  choices: OpenAIChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

async function openAIFetch(
  apiKey: string,
  body: Record<string, unknown>
): Promise<OpenAIResponse> {
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(LLM_TIMEOUT_MS),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unknown error');
    const error = new Error(`OpenAI API error ${response.status}: ${errorBody}`);
    (error as Error & { status: number }).status = response.status;
    throw error;
  }

  return response.json() as Promise<OpenAIResponse>;
}

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

      const status = (error as Error & { status?: number }).status;
      const isRetryable =
        lastError.message.includes('timeout') ||
        lastError.message.includes('ECONNRESET') ||
        lastError.message.includes('ETIMEDOUT') ||
        (typeof status === 'number' && RETRYABLE_STATUS_CODES.includes(status));

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

export class OpenAIAdapter implements LLMAdapter {
  async chat(messages: LLMMessage[], config: LLMAdapterConfig): Promise<LLMResponse> {
    return withRetry(async () => {
      const apiKey = validateApiKey();

      const openAIMessages: OpenAIMessage[] = [];

      // System prompt as first message
      if (config.systemPrompt) {
        openAIMessages.push({ role: 'system', content: config.systemPrompt });
      } else {
        openAIMessages.push({
          role: 'system',
          content: 'You are an advanced AI assistant. Respond precisely and thoughtfully.',
        });
      }

      // Conversation history
      for (const m of messages) {
        openAIMessages.push({ role: m.role, content: m.content });
      }

      const response = await openAIFetch(apiKey, {
        model: config.model,
        messages: openAIMessages,
        max_tokens: config.maxTokens || 4096,
        temperature: config.temperature ?? 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('OpenAI response contained no text content');
      }

      return {
        content,
        inputTokens: response.usage.prompt_tokens,
        outputTokens: response.usage.completion_tokens,
        model: response.model,
      };
    }, 'OpenAIAdapter.chat');
  }

  async judge(prompt: string, config?: Partial<LLMAdapterConfig>): Promise<string> {
    return withRetry(async () => {
      const apiKey = validateApiKey();
      const model = config?.model || process.env.CAIMS_SCORING_MODEL || 'gpt-4o';

      const response = await openAIFetch(apiKey, {
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a computational consciousness evaluation system. You MUST respond ONLY with valid JSON, no text before or after the JSON.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: config?.maxTokens || 2048,
        temperature: 0,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('OpenAI judge response contained no text content');
      }

      return content;
    }, 'OpenAIAdapter.judge');
  }
}

// Singleton
let adapter: OpenAIAdapter | null = null;
export function getOpenAIAdapter(): OpenAIAdapter {
  if (!adapter) adapter = new OpenAIAdapter();
  return adapter;
}
