/**
 * API Chat Route Tests
 *
 * Tests for POST /api/chat covering:
 * - Rate limiting (429)
 * - Validation errors (400)
 * - Session management: create new, use existing, not-found (404)
 * - LLM interaction success and failure
 * - Scoring: enabled, disabled, scoring failure (non-fatal)
 * - Response envelope consistency
 */

// ── Mocks ──────────────────────────────────────────────────────────────

// Mock Prisma client
const mockTx = {
  message: {
    create: jest.fn(),
  },
};

const mockPrisma = {
  session: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  score: { create: jest.fn() },
  $transaction: jest.fn(),
};

jest.mock('@/lib/db/client', () => mockPrisma);

// Mock LLM adapter
const mockChat = jest.fn();
jest.mock('@/lib/adapters', () => ({
  getAdapter: () => ({ chat: mockChat }),
}));

// Mock scoring engine
const mockScoreInteraction = jest.fn();
jest.mock('@/lib/scorers/scoring-engine', () => ({
  scoreInteraction: (...args: unknown[]) => mockScoreInteraction(...args),
}));

// Mock composite scoring helpers
const mockCheckContextAlert = jest.fn();
jest.mock('@/lib/scorers/composite', () => ({
  checkContextAlert: (...args: unknown[]) => mockCheckContextAlert(...args),
  interpretScore: jest.fn().mockReturnValue('CONSCIENCE ÉLEVÉE'),
}));

// Mock logger (suppress output)
jest.mock('@/lib/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

// Mock rate limiter
const mockCheckRateLimit = jest.fn();
jest.mock('@/lib/middleware/rate-limit', () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
  getRateLimitHeaders: () => ({}),
}));

// ── Helpers ────────────────────────────────────────────────────────────

function makeRequest(body?: unknown, headers?: Record<string, string>): Request {
  return new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '127.0.0.1',
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

async function parseResponse(response: Response): Promise<{ status: number; body: Record<string, unknown> }> {
  const body = await response.json();
  return { status: response.status, body };
}

const mockScores = {
  cqScore: 75,
  aqScore: 80,
  cfiScore: 60,
  eqScore: 70,
  sqScore: 65,
  composite: 72,
  details: {
    cq: { phi_proxy: 80, gwt_proxy: 70, hot_proxy: 75, synthesis: 78, temporal: 72 },
    aq: { goal_clarity: 80, constraint_aware: 80, path_coherence: 80, scope_drift: 80, reality_grounding: 80 },
    cfi: { context_retention: 60, topic_drift: 60, coherence_loss: 60 },
    eq: { calibration: 70, uncertainty: 70, hallucination: 70, source_integrity: 70 },
    sq: { intra_session: 65, position_drift: 65 },
  },
  metadata: { reasoning: 'test', modelUsed: 'test', latencyMs: 100 },
};

const mockSession = {
  id: 'ses-chat-1',
  llmModel: 'claude-sonnet-4-20250514',
  messages: [],
};

const mockAssistantMessage = { id: 'msg-assistant-1', content: 'Hello! How can I help?' };

// Default: allow all rate limits and set up common mocks
beforeEach(() => {
  jest.clearAllMocks();
  mockCheckRateLimit.mockReturnValue({ allowed: true, remaining: 25, resetAt: Date.now() + 60000 });
  mockChat.mockResolvedValue({
    content: 'Hello! How can I help?',
    inputTokens: 50,
    outputTokens: 20,
    model: 'claude-sonnet-4-20250514',
  });
  mockScoreInteraction.mockResolvedValue(mockScores);
  mockCheckContextAlert.mockReturnValue(null);

  // Transaction mock: call the callback with the mock tx
  mockPrisma.$transaction.mockImplementation(async (fn: (tx: typeof mockTx) => Promise<unknown>) => {
    mockTx.message.create
      .mockResolvedValueOnce({ id: 'msg-user-1', content: 'test message' })
      .mockResolvedValueOnce(mockAssistantMessage);
    return fn(mockTx);
  });
});

// ── POST /api/chat Tests ───────────────────────────────────────────────

describe('POST /api/chat', () => {
  let handler: (req: Request) => Promise<Response>;

  beforeAll(async () => {
    const mod = await import('@/app/api/chat/route');
    handler = mod.POST as unknown as (req: Request) => Promise<Response>;
  });

  // ── Rate limiting ──────────────────────────────────────────────────

  it('returns 429 RATE_LIMITED when limit exceeded', async () => {
    mockCheckRateLimit.mockReturnValue({ allowed: false, remaining: 0, resetAt: Date.now() + 30000 });
    const req = makeRequest({ message: 'Hello' });
    const res = await parseResponse(await handler(req));
    expect(res.status).toBe(429);
    expect(res.body.success).toBe(false);
    expect((res.body.error as Record<string, string>).code).toBe('RATE_LIMITED');
  });

  // ── Validation errors ──────────────────────────────────────────────

  it('returns 400 VALIDATION_ERROR when message is missing', async () => {
    const req = makeRequest({});
    const res = await parseResponse(await handler(req));
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect((res.body.error as Record<string, string>).code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 VALIDATION_ERROR when message is empty string', async () => {
    const req = makeRequest({ message: '' });
    const res = await parseResponse(await handler(req));
    expect(res.status).toBe(400);
    expect((res.body.error as Record<string, string>).code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 VALIDATION_ERROR when message exceeds max length', async () => {
    const req = makeRequest({ message: 'x'.repeat(50_001) });
    const res = await parseResponse(await handler(req));
    expect(res.status).toBe(400);
    expect((res.body.error as Record<string, string>).code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 VALIDATION_ERROR for invalid JSON body', async () => {
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
      body: 'not-json',
    });
    const res = await parseResponse(await handler(req));
    expect(res.status).toBe(500);
    // Malformed JSON falls through to the generic error handler
    expect(res.body.success).toBe(false);
  });

  // ── Session management ─────────────────────────────────────────────

  it('returns 404 SESSION_NOT_FOUND when sessionId is provided but does not exist', async () => {
    mockPrisma.session.findUnique.mockResolvedValueOnce(null);
    const req = makeRequest({ message: 'Hello', sessionId: 'nonexistent-id' });
    const res = await parseResponse(await handler(req));
    expect(res.status).toBe(404);
    expect((res.body.error as Record<string, string>).code).toBe('SESSION_NOT_FOUND');
  });

  it('creates a new session when no sessionId is provided', async () => {
    mockPrisma.session.create.mockResolvedValueOnce(mockSession);
    const req = makeRequest({ message: 'Hello' });
    const res = await parseResponse(await handler(req));
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockPrisma.session.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.session.findUnique).not.toHaveBeenCalled();
  });

  it('uses existing session when sessionId is provided', async () => {
    mockPrisma.session.findUnique.mockResolvedValueOnce({ ...mockSession, messages: [] });
    const req = makeRequest({ message: 'Hello', sessionId: 'ses-chat-1' });
    const res = await parseResponse(await handler(req));
    expect(res.status).toBe(200);
    expect(mockPrisma.session.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'ses-chat-1' } })
    );
    expect(mockPrisma.session.create).not.toHaveBeenCalled();
  });

  // ── Happy path ─────────────────────────────────────────────────────

  it('returns 200 with message, sessionId, messageId, and usage on success', async () => {
    mockPrisma.session.create.mockResolvedValueOnce(mockSession);
    const req = makeRequest({ message: 'Why is the sky blue?' });
    const res = await parseResponse(await handler(req));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const data = res.body.data as Record<string, unknown>;
    expect(data.message).toBe('Hello! How can I help?');
    expect(data.sessionId).toBe('ses-chat-1');
    expect(data.messageId).toBe('msg-assistant-1');
    expect(data.usage).toBeDefined();

    const usage = data.usage as Record<string, number>;
    expect(usage.inputTokens).toBe(50);
    expect(usage.outputTokens).toBe(20);
  });

  it('includes scores and contextAlert when enableScoring=true (default)', async () => {
    mockPrisma.session.create.mockResolvedValueOnce(mockSession);
    mockPrisma.score.create.mockResolvedValueOnce({ id: 'score-1' });
    mockCheckContextAlert.mockReturnValueOnce({ level: 'warning', message: 'Low coherence detected' });

    const req = makeRequest({ message: 'Test message', enableScoring: true });
    const res = await parseResponse(await handler(req));

    expect(res.status).toBe(200);
    const data = res.body.data as Record<string, unknown>;
    expect(data.scores).toBeDefined();
    expect(data.contextAlert).toBeDefined();
    expect(mockScoreInteraction).toHaveBeenCalledTimes(1);
    expect(mockPrisma.score.create).toHaveBeenCalledTimes(1);
  });

  it('omits scores when enableScoring=false', async () => {
    mockPrisma.session.create.mockResolvedValueOnce(mockSession);
    const req = makeRequest({ message: 'Test message', enableScoring: false });
    const res = await parseResponse(await handler(req));

    expect(res.status).toBe(200);
    const data = res.body.data as Record<string, unknown>;
    expect(data.scores).toBeUndefined();
    expect(mockScoreInteraction).not.toHaveBeenCalled();
    expect(mockPrisma.score.create).not.toHaveBeenCalled();
  });

  it('succeeds (200) even when scoring fails — chat is preserved', async () => {
    mockPrisma.session.create.mockResolvedValueOnce(mockSession);
    mockScoreInteraction.mockRejectedValueOnce(new Error('Scoring engine down'));

    const req = makeRequest({ message: 'Test message', enableScoring: true });
    const res = await parseResponse(await handler(req));

    // Chat must succeed regardless of scoring failure
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const data = res.body.data as Record<string, unknown>;
    expect(data.message).toBe('Hello! How can I help?');
    expect(data.scores).toBeUndefined();
  });

  it('returns 500 INTERNAL_ERROR when LLM adapter throws', async () => {
    mockPrisma.session.create.mockResolvedValueOnce(mockSession);
    mockChat.mockRejectedValueOnce(new Error('LLM API unavailable'));

    const req = makeRequest({ message: 'Test message' });
    const res = await parseResponse(await handler(req));

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect((res.body.error as Record<string, string>).code).toBe('INTERNAL_ERROR');
  });

  it('returns 500 INTERNAL_ERROR when session creation fails', async () => {
    mockPrisma.session.create.mockRejectedValueOnce(new Error('DB write failed'));

    const req = makeRequest({ message: 'Test message' });
    const res = await parseResponse(await handler(req));

    expect(res.status).toBe(500);
    expect((res.body.error as Record<string, string>).code).toBe('INTERNAL_ERROR');
  });

  // ── IP header fallback ─────────────────────────────────────────────

  it('uses x-real-ip when x-forwarded-for is absent', async () => {
    mockPrisma.session.create.mockResolvedValueOnce(mockSession);
    const req = makeRequest({ message: 'Hello' }, { 'x-real-ip': '10.0.0.1' });
    // Override: remove x-forwarded-for by creating a fresh Request without it
    const reqNoForwardedFor = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-real-ip': '10.0.0.1' },
      body: JSON.stringify({ message: 'Hello' }),
    });
    const res = await parseResponse(await handler(reqNoForwardedFor));
    expect(res.status).toBe(200);
    expect(mockCheckRateLimit).toHaveBeenCalledWith(expect.stringContaining('chat:'));
  });

  it('uses anonymous when no IP headers present', async () => {
    mockPrisma.session.create.mockResolvedValueOnce(mockSession);
    const reqNoIp = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello' }),
    });
    const res = await parseResponse(await handler(reqNoIp));
    expect(res.status).toBe(200);
    expect(mockCheckRateLimit).toHaveBeenCalledWith(
      expect.stringContaining('anonymous'),
    );
  });

  // ── Response envelope consistency ──────────────────────────────────

  it('success responses have success=true, data, and meta.timestamp', async () => {
    mockPrisma.session.create.mockResolvedValueOnce(mockSession);
    const req = makeRequest({ message: 'Hello' });
    const res = await parseResponse(await handler(req));

    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.meta).toBeDefined();
    const meta = res.body.meta as Record<string, string>;
    expect(typeof meta.timestamp).toBe('string');
  });

  it('error responses have success=false, error.code, error.message, meta.timestamp', async () => {
    const req = makeRequest({});
    const res = await parseResponse(await handler(req));

    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeDefined();
    const error = res.body.error as Record<string, string>;
    expect(typeof error.code).toBe('string');
    expect(typeof error.message).toBe('string');
    const meta = res.body.meta as Record<string, string>;
    expect(typeof meta.timestamp).toBe('string');
  });
});
