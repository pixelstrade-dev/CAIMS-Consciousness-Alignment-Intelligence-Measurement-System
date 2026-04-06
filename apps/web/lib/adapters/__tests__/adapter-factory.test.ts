import { AnthropicAdapter } from '../anthropic';
import { OpenAIAdapter } from '../openai';

// Mock both adapters to prevent API key validation at construction
jest.mock('../anthropic', () => {
  const MockAnthropicAdapter = jest.fn();
  MockAnthropicAdapter.prototype.chat = jest.fn();
  MockAnthropicAdapter.prototype.judge = jest.fn();
  return {
    AnthropicAdapter: MockAnthropicAdapter,
    getAnthropicAdapter: jest.fn(() => new MockAnthropicAdapter()),
  };
});

jest.mock('../openai', () => {
  const MockOpenAIAdapter = jest.fn();
  MockOpenAIAdapter.prototype.chat = jest.fn();
  MockOpenAIAdapter.prototype.judge = jest.fn();
  return {
    OpenAIAdapter: MockOpenAIAdapter,
    getOpenAIAdapter: jest.fn(() => new MockOpenAIAdapter()),
  };
});

// Import after mocks are set up
import { getAdapter } from '../index';

describe('getAdapter factory', () => {
  const originalProvider = process.env.CAIMS_LLM_PROVIDER;

  afterEach(() => {
    if (originalProvider === undefined) delete process.env.CAIMS_LLM_PROVIDER;
    else process.env.CAIMS_LLM_PROVIDER = originalProvider;
  });

  it('returns AnthropicAdapter by default (no env var)', () => {
    delete process.env.CAIMS_LLM_PROVIDER;
    const adapter = getAdapter();
    expect(adapter).toBeInstanceOf(AnthropicAdapter);
  });

  it('returns AnthropicAdapter when CAIMS_LLM_PROVIDER=anthropic', () => {
    process.env.CAIMS_LLM_PROVIDER = 'anthropic';
    const adapter = getAdapter();
    expect(adapter).toBeInstanceOf(AnthropicAdapter);
  });

  it('returns OpenAIAdapter when CAIMS_LLM_PROVIDER=openai', () => {
    process.env.CAIMS_LLM_PROVIDER = 'openai';
    const adapter = getAdapter();
    expect(adapter).toBeInstanceOf(OpenAIAdapter);
  });

  it('is case-insensitive for provider name', () => {
    process.env.CAIMS_LLM_PROVIDER = 'OpenAI';
    const adapter = getAdapter();
    expect(adapter).toBeInstanceOf(OpenAIAdapter);
  });

  it('trims whitespace from provider name', () => {
    process.env.CAIMS_LLM_PROVIDER = '  anthropic  ';
    const adapter = getAdapter();
    expect(adapter).toBeInstanceOf(AnthropicAdapter);
  });

  it('throws for unknown provider', () => {
    process.env.CAIMS_LLM_PROVIDER = 'gemini';
    expect(() => getAdapter()).toThrow('Invalid CAIMS_LLM_PROVIDER: "gemini"');
  });

  it('accepts explicit provider override', () => {
    process.env.CAIMS_LLM_PROVIDER = 'anthropic';
    const adapter = getAdapter('openai');
    expect(adapter).toBeInstanceOf(OpenAIAdapter);
  });

  it('throws for unknown override provider', () => {
    expect(() => getAdapter('cohere' as 'openai')).toThrow('Unknown LLM provider: "cohere"');
  });
});
