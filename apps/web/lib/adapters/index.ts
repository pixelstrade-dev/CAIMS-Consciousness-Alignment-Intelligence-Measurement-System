import { LLMAdapter } from './base';
import { getAnthropicAdapter } from './anthropic';
import { getOpenAIAdapter } from './openai';

export type LLMProvider = 'anthropic' | 'openai';

/**
 * Returns the configured LLM adapter based on CAIMS_LLM_PROVIDER env var.
 *
 * Defaults to 'anthropic' if not set.
 * Each provider requires its own API key:
 *   - anthropic → ANTHROPIC_API_KEY
 *   - openai    → OPENAI_API_KEY
 */
export function getAdapter(providerOverride?: LLMProvider): LLMAdapter {
  const provider = providerOverride || getProviderFromEnv();

  switch (provider) {
    case 'anthropic':
      return getAnthropicAdapter();
    case 'openai':
      return getOpenAIAdapter();
    default:
      throw new Error(
        `Unknown LLM provider: "${provider}". Supported: anthropic, openai`
      );
  }
}

function getProviderFromEnv(): LLMProvider {
  const value = process.env.CAIMS_LLM_PROVIDER?.toLowerCase().trim();
  if (!value || value === 'anthropic') return 'anthropic';
  if (value === 'openai') return 'openai';
  throw new Error(
    `Invalid CAIMS_LLM_PROVIDER: "${value}". Supported: anthropic, openai`
  );
}

// Re-export types and specific adapters for direct access
export type { LLMAdapter, LLMMessage, LLMResponse, LLMAdapterConfig } from './base';
export { getAnthropicAdapter } from './anthropic';
export { getOpenAIAdapter } from './openai';
