import { OpenAIAdapter } from '../openai';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Suppress logger output
jest.mock('@/lib/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

function makeOpenAIResponse(content: string, model = 'gpt-4o') {
  return {
    ok: true,
    json: async () => ({
      id: 'chatcmpl-test',
      model,
      choices: [{ message: { role: 'assistant', content }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
    }),
  };
}

describe('OpenAIAdapter', () => {
  const originalKey = process.env.OPENAI_API_KEY;

  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'sk-test-key';
    mockFetch.mockReset();
  });

  afterEach(() => {
    if (originalKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalKey;
  });

  describe('chat()', () => {
    it('returns LLMResponse with correct structure', async () => {
      mockFetch.mockResolvedValueOnce(makeOpenAIResponse('Hello world'));

      const adapter = new OpenAIAdapter();
      const result = await adapter.chat(
        [{ role: 'user', content: 'Hi' }],
        { model: 'gpt-4o', temperature: 0.5 }
      );

      expect(result.content).toBe('Hello world');
      expect(result.inputTokens).toBe(10);
      expect(result.outputTokens).toBe(20);
      expect(result.model).toBe('gpt-4o');
    });

    it('sends correct request to OpenAI API', async () => {
      mockFetch.mockResolvedValueOnce(makeOpenAIResponse('ok'));

      const adapter = new OpenAIAdapter();
      await adapter.chat(
        [{ role: 'user', content: 'test' }],
        { model: 'gpt-4o', systemPrompt: 'You are helpful', maxTokens: 1024, temperature: 0.3 }
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe('https://api.openai.com/v1/chat/completions');
      expect(options.method).toBe('POST');
      expect(options.headers['Authorization']).toBe('Bearer sk-test-key');

      const body = JSON.parse(options.body);
      expect(body.model).toBe('gpt-4o');
      expect(body.temperature).toBe(0.3);
      expect(body.max_tokens).toBe(1024);
      expect(body.messages[0]).toEqual({ role: 'system', content: 'You are helpful' });
      expect(body.messages[1]).toEqual({ role: 'user', content: 'test' });
    });

    it('uses custom base URL from OPENAI_BASE_URL', async () => {
      process.env.OPENAI_BASE_URL = 'https://custom.api.com/v1';
      mockFetch.mockResolvedValueOnce(makeOpenAIResponse('ok'));

      const adapter = new OpenAIAdapter();
      await adapter.chat([{ role: 'user', content: 'test' }], { model: 'gpt-4o' });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toBe('https://custom.api.com/v1/chat/completions');

      delete process.env.OPENAI_BASE_URL;
    });

    it('throws when API key is missing', async () => {
      delete process.env.OPENAI_API_KEY;
      const adapter = new OpenAIAdapter();
      await expect(
        adapter.chat([{ role: 'user', content: 'test' }], { model: 'gpt-4o' })
      ).rejects.toThrow('OPENAI_API_KEY environment variable is not set');
    });

    it('throws when response has no content', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'chatcmpl-test',
          model: 'gpt-4o',
          choices: [{ message: { role: 'assistant', content: null }, finish_reason: 'stop' }],
          usage: { prompt_tokens: 10, completion_tokens: 0, total_tokens: 10 },
        }),
      });

      const adapter = new OpenAIAdapter();
      await expect(
        adapter.chat([{ role: 'user', content: 'test' }], { model: 'gpt-4o' })
      ).rejects.toThrow('contained no text content');
    });

    it('throws on API error with status code', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Invalid API key',
      });

      const adapter = new OpenAIAdapter();
      await expect(
        adapter.chat([{ role: 'user', content: 'test' }], { model: 'gpt-4o' })
      ).rejects.toThrow('OpenAI API error 401');
    });
  });

  describe('judge()', () => {
    it('returns raw text content', async () => {
      const jsonResponse = '{"cq": {"integration": 75}}';
      mockFetch.mockResolvedValueOnce(makeOpenAIResponse(jsonResponse));

      const adapter = new OpenAIAdapter();
      const result = await adapter.judge('Score this interaction');

      expect(result).toBe(jsonResponse);
    });

    it('uses temperature 0 for deterministic scoring', async () => {
      mockFetch.mockResolvedValueOnce(makeOpenAIResponse('{}'));

      const adapter = new OpenAIAdapter();
      await adapter.judge('test prompt');

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.temperature).toBe(0);
    });

    it('defaults to gpt-4o model for scoring', async () => {
      mockFetch.mockResolvedValueOnce(makeOpenAIResponse('{}'));

      const adapter = new OpenAIAdapter();
      await adapter.judge('test prompt');

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.model).toBe('gpt-4o');
    });

    it('uses CAIMS_SCORING_MODEL env when set', async () => {
      const orig = process.env.CAIMS_SCORING_MODEL;
      process.env.CAIMS_SCORING_MODEL = 'gpt-4-turbo';
      mockFetch.mockResolvedValueOnce(makeOpenAIResponse('{}'));

      const adapter = new OpenAIAdapter();
      await adapter.judge('test prompt');

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.model).toBe('gpt-4-turbo');

      if (orig === undefined) delete process.env.CAIMS_SCORING_MODEL;
      else process.env.CAIMS_SCORING_MODEL = orig;
    });

    it('accepts model override in config', async () => {
      mockFetch.mockResolvedValueOnce(makeOpenAIResponse('{}'));

      const adapter = new OpenAIAdapter();
      await adapter.judge('test prompt', { model: 'gpt-4o-mini' });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.model).toBe('gpt-4o-mini');
    });
  });
});
