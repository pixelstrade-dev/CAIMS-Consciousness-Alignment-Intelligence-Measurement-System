const mockCreate = jest.fn();

jest.mock('@anthropic-ai/sdk', () => {
  class MockAPIError extends Error {
    status: number;

    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  }

  const MockAnthropic = jest.fn().mockImplementation(() => ({
    messages: {
      create: mockCreate,
    },
  }));

  Object.assign(MockAnthropic, { APIError: MockAPIError });
  return { __esModule: true, default: MockAnthropic };
});

jest.mock('@/lib/logger', () => ({
  logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import { AnthropicAdapter } from '../anthropic';

describe('AnthropicAdapter', () => {
  const originalKey = process.env.ANTHROPIC_API_KEY;

  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    mockCreate.mockReset();
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: '{}' }],
      usage: { input_tokens: 1, output_tokens: 2 },
      model: 'claude-sonnet-5',
    });
  });

  afterEach(() => {
    if (originalKey === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = originalKey;
  });

  it('omits temperature for Claude 5 chat requests', async () => {
    const adapter = new AnthropicAdapter();

    await adapter.chat([{ role: 'user', content: 'test' }], { model: 'claude-sonnet-5' });

    expect(mockCreate.mock.calls[0][0]).not.toHaveProperty('temperature');
  });

  it('omits temperature for Claude 5 judge requests', async () => {
    const adapter = new AnthropicAdapter();

    await adapter.judge('score this', { model: 'claude-sonnet-5' });

    expect(mockCreate.mock.calls[0][0]).not.toHaveProperty('temperature');
  });

  it('keeps temperature for supported Anthropic models', async () => {
    const adapter = new AnthropicAdapter();

    await adapter.chat([{ role: 'user', content: 'test' }], { model: 'claude-sonnet-4-20250514', temperature: 0.3 });

    expect(mockCreate.mock.calls[0][0].temperature).toBe(0.3);
  });
});
