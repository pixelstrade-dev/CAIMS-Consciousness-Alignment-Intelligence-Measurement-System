/**
 * API Debate [id] Route Tests
 *
 * Tests for GET and POST /api/debate/[id] covering:
 * - GET: fetch debate detail (200), not found (404), DB error (500)
 * - POST (advance): rate limiting (429), validation (400), debate not found (404),
 *   debate not active (400), no regular agents (400), first turn success (200),
 *   scoring integration, debate conclusion after maxTurns
 */

// ── Mocks ──────────────────────────────────────────────────────────────

// Mock Prisma client
const mockTx = {
  debateTurn: { create: jest.fn() },
  debateAgentScore: { create: jest.fn() },
};

const mockPrisma = {
  debate: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  debateMetrics: { upsert: jest.fn() },
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

function makeGetRequest(id: string): Request {
  return new Request(`http://localhost/api/debate/${id}`, {
    method: 'GET',
    headers: { 'x-forwarded-for': '127.0.0.1' },
  });
}

function makePostRequest(id: string, body?: unknown): Request {
  return new Request(`http://localhost/api/debate/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '127.0.0.1',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

async function parseResponse(response: Response): Promise<{ status: number; body: Record<string, unknown> }> {
  const body = await response.json();
  return { status: response.status, body };
}

function makeParams(id: string): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id }) };
}

const mockTurnAgent = { name: 'ARCHITECT', role: 'System Designer', agentId: 'agt-architect' };
const mockCriticTurnAgent = { name: 'CRITIC', role: 'Critical Analyst', agentId: 'agt-critic' };

const mockDebateAgents = [
  {
    id: 'db-agent-1',
    agentId: 'agt-architect',
    name: 'ARCHITECT',
    role: 'System Designer',
    systemPrompt: 'You are an architect.',
    scores: [],
  },
  {
    id: 'db-agent-2',
    agentId: 'agt-critic',
    name: 'CRITIC',
    role: 'Critical Analyst',
    systemPrompt: 'You are a critic.',
    scores: [],
  },
];

const mockOrchestratorAgent = {
  id: 'db-agent-orch',
  agentId: 'agt-orchestrator',
  name: 'ORCHESTRATOR',
  role: 'Orchestrator',
  systemPrompt: 'You are the orchestrator.',
  scores: [],
};

const mockDebateBase = {
  id: 'dbt-1',
  topic: 'Is consciousness computable?',
  format: 'expert_panel',
  status: 'active',
  maxTurns: 3,
  agents: mockDebateAgents,
  turns: [],
  metrics: null,
};

const mockTurnResult = {
  id: 'turn-new',
  turnNumber: 1,
  content: 'First turn content',
  tokenCount: 50,
  debateId: 'dbt-1',
  agentId: 'db-agent-1',
  agent: mockTurnAgent,
};

const mockTurnScore = {
  id: 'tscore-1',
  cqScore: 75, aqScore: 80, cfiScore: 60, eqScore: 70, sqScore: 65, composite: 72,
  details: {}, metadata: {},
};

const mockScores = {
  cqScore: 75, aqScore: 80, cfiScore: 60, eqScore: 70, sqScore: 65, composite: 72,
  details: {
    cq: { phi_proxy: 80, gwt_proxy: 70, hot_proxy: 75, synthesis: 78, temporal: 72 },
    aq: { goal_clarity: 80, constraint_aware: 80, path_coherence: 80, scope_drift: 80, reality_grounding: 80 },
    cfi: { context_retention: 60, topic_drift: 60, coherence_loss: 60 },
    eq: { calibration: 70, uncertainty: 70, hallucination: 70, source_integrity: 70 },
    sq: { intra_session: 65, position_drift: 65 },
  },
  metadata: { reasoning: 'test', modelUsed: 'test', latencyMs: 100 },
};

// Use resetAllMocks to ensure queued mock values don't bleed between tests
beforeEach(() => {
  jest.resetAllMocks();

  // Re-apply default implementations after reset
  mockCheckRateLimit.mockReturnValue({ allowed: true, remaining: 15, resetAt: Date.now() + 60000 });
  mockChat.mockResolvedValue({
    content: 'First turn content',
    inputTokens: 100,
    outputTokens: 50,
    model: 'claude-sonnet-4-20250514',
  });
  mockScoreInteraction.mockResolvedValue(mockScores);

  // Transaction mock: call callback with mock tx providing expected turn/score results
  mockPrisma.$transaction.mockImplementation(async (fn: (tx: typeof mockTx) => Promise<unknown>) => {
    mockTx.debateTurn.create.mockResolvedValueOnce(mockTurnResult);
    mockTx.debateAgentScore.create.mockResolvedValueOnce(mockTurnScore);
    return fn(mockTx);
  });
});

// ── GET /api/debate/[id] ───────────────────────────────────────────────

describe('GET /api/debate/[id]', () => {
  let handler: (req: Request, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;

  beforeAll(async () => {
    const mod = await import('@/app/api/debate/[id]/route');
    handler = mod.GET as unknown as typeof handler;
  });

  it('returns 200 with debate data when found', async () => {
    mockPrisma.debate.findUnique.mockResolvedValueOnce(mockDebateBase);
    const req = makeGetRequest('dbt-1');
    const res = await parseResponse(await handler(req, makeParams('dbt-1')));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const data = res.body.data as Record<string, unknown>;
    expect(data.debate).toBeDefined();
    const debate = data.debate as Record<string, unknown>;
    expect(debate.id).toBe('dbt-1');
    expect(debate.topic).toBe('Is consciousness computable?');
  });

  it('returns 404 DEBATE_NOT_FOUND when debate does not exist', async () => {
    mockPrisma.debate.findUnique.mockResolvedValueOnce(null);
    const req = makeGetRequest('nonexistent-id');
    const res = await parseResponse(await handler(req, makeParams('nonexistent-id')));

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect((res.body.error as Record<string, string>).code).toBe('DEBATE_NOT_FOUND');
  });

  it('returns 500 INTERNAL_ERROR when Prisma throws', async () => {
    mockPrisma.debate.findUnique.mockRejectedValueOnce(new Error('DB connection lost'));
    const req = makeGetRequest('dbt-error');
    const res = await parseResponse(await handler(req, makeParams('dbt-error')));

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect((res.body.error as Record<string, string>).code).toBe('INTERNAL_ERROR');
  });

  it('response has consistent success envelope with meta.timestamp', async () => {
    mockPrisma.debate.findUnique.mockResolvedValueOnce(mockDebateBase);
    const req = makeGetRequest('dbt-1');
    const res = await parseResponse(await handler(req, makeParams('dbt-1')));

    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.meta).toBeDefined();
    const meta = res.body.meta as Record<string, string>;
    expect(typeof meta.timestamp).toBe('string');
  });

  it('error response has consistent envelope with success=false, error.code, meta.timestamp', async () => {
    mockPrisma.debate.findUnique.mockResolvedValueOnce(null);
    const req = makeGetRequest('gone');
    const res = await parseResponse(await handler(req, makeParams('gone')));

    expect(res.body.success).toBe(false);
    const error = res.body.error as Record<string, string>;
    expect(typeof error.code).toBe('string');
    expect(typeof error.message).toBe('string');
    const meta = res.body.meta as Record<string, string>;
    expect(typeof meta.timestamp).toBe('string');
  });
});

// ── POST /api/debate/[id] (advance) ───────────────────────────────────

describe('POST /api/debate/[id] (advance)', () => {
  let handler: (req: Request, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;

  beforeAll(async () => {
    const mod = await import('@/app/api/debate/[id]/route');
    handler = mod.POST as unknown as typeof handler;
  });

  // ── Rate limiting ────────────────────────────────────────────────────

  it('returns 429 RATE_LIMITED when limit exceeded', async () => {
    mockCheckRateLimit.mockReturnValue({ allowed: false, remaining: 0, resetAt: Date.now() + 30000 });
    const req = makePostRequest('dbt-1', {});
    const res = await parseResponse(await handler(req, makeParams('dbt-1')));

    expect(res.status).toBe(429);
    expect((res.body.error as Record<string, string>).code).toBe('RATE_LIMITED');
  });

  // ── Validation errors ────────────────────────────────────────────────
  // Note: Zod validation runs BEFORE the DB lookup, so findUnique is never called.
  // Using resetAllMocks ensures no stale mock values from prior tests.

  it('returns 400 VALIDATION_ERROR when maxTurns is 0 (below min of 1)', async () => {
    const req = makePostRequest('dbt-1', { maxTurns: 0 });
    const res = await parseResponse(await handler(req, makeParams('dbt-1')));

    expect(res.status).toBe(400);
    expect((res.body.error as Record<string, string>).code).toBe('VALIDATION_ERROR');
    // findUnique should NOT have been called — validation threw first
    expect(mockPrisma.debate.findUnique).not.toHaveBeenCalled();
  });

  it('returns 400 VALIDATION_ERROR when maxTurns is 51 (above max of 50)', async () => {
    const req = makePostRequest('dbt-1', { maxTurns: 51 });
    const res = await parseResponse(await handler(req, makeParams('dbt-1')));

    expect(res.status).toBe(400);
    expect((res.body.error as Record<string, string>).code).toBe('VALIDATION_ERROR');
    expect(mockPrisma.debate.findUnique).not.toHaveBeenCalled();
  });

  // ── Debate state errors ──────────────────────────────────────────────

  it('returns 404 DEBATE_NOT_FOUND when debate does not exist', async () => {
    mockPrisma.debate.findUnique.mockResolvedValueOnce(null);
    const req = makePostRequest('nonexistent-id', {});
    const res = await parseResponse(await handler(req, makeParams('nonexistent-id')));

    expect(res.status).toBe(404);
    expect((res.body.error as Record<string, string>).code).toBe('DEBATE_NOT_FOUND');
  });

  it('returns 400 DEBATE_NOT_ACTIVE when debate is concluded', async () => {
    mockPrisma.debate.findUnique.mockResolvedValueOnce({
      ...mockDebateBase,
      status: 'concluded',
    });
    const req = makePostRequest('dbt-concluded', {});
    const res = await parseResponse(await handler(req, makeParams('dbt-concluded')));

    expect(res.status).toBe(400);
    expect((res.body.error as Record<string, string>).code).toBe('DEBATE_NOT_ACTIVE');
  });

  it('returns 400 NO_AGENTS when debate has no regular agents (only orchestrator)', async () => {
    mockPrisma.debate.findUnique.mockResolvedValueOnce({
      ...mockDebateBase,
      agents: [mockOrchestratorAgent],
      turns: [],
    });
    const req = makePostRequest('dbt-no-agents', {});
    const res = await parseResponse(await handler(req, makeParams('dbt-no-agents')));

    expect(res.status).toBe(400);
    expect((res.body.error as Record<string, string>).code).toBe('NO_AGENTS');
  });

  // ── Happy path ───────────────────────────────────────────────────────

  it('returns 200 with first turn data when debate has no existing turns', async () => {
    mockPrisma.debate.findUnique.mockResolvedValueOnce({
      ...mockDebateBase,
      turns: [],
    });

    const req = makePostRequest('dbt-1', { maxTurns: 3 });
    const res = await parseResponse(await handler(req, makeParams('dbt-1')));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const data = res.body.data as Record<string, unknown>;
    expect(data.turn).toBeDefined();
    const turn = data.turn as Record<string, unknown>;
    expect(turn.turnNumber).toBe(1);
    expect(data.debateStatus).toBe('active');
    expect(data.usage).toBeDefined();
  });

  it('includes score in turn result when scoring succeeds', async () => {
    mockPrisma.debate.findUnique.mockResolvedValueOnce({
      ...mockDebateBase,
      turns: [],
    });

    const req = makePostRequest('dbt-1', {});
    const res = await parseResponse(await handler(req, makeParams('dbt-1')));

    expect(res.status).toBe(200);
    const data = res.body.data as Record<string, unknown>;
    const turn = data.turn as Record<string, unknown>;
    expect(turn.score).toBeDefined();
  });

  it('advances debate with existing turns (second agent speaks)', async () => {
    const firstTurn = {
      id: 'turn-0',
      turnNumber: 1,
      content: 'First agent turn',
      agent: mockTurnAgent,
    };

    mockPrisma.debate.findUnique.mockResolvedValueOnce({
      ...mockDebateBase,
      agents: mockDebateAgents,
      turns: [firstTurn],
    });

    // Second turn will use agent at position 1 (critic)
    const secondTurnResult = { ...mockTurnResult, id: 'turn-2', turnNumber: 2, agent: mockCriticTurnAgent };
    mockPrisma.$transaction.mockImplementationOnce(async (fn: (tx: typeof mockTx) => Promise<unknown>) => {
      mockTx.debateTurn.create.mockResolvedValueOnce(secondTurnResult);
      mockTx.debateAgentScore.create.mockResolvedValueOnce(mockTurnScore);
      return fn(mockTx);
    });

    const req = makePostRequest('dbt-1', { maxTurns: 3 });
    const res = await parseResponse(await handler(req, makeParams('dbt-1')));

    expect(res.status).toBe(200);
    const data = res.body.data as Record<string, unknown>;
    expect(data.debateStatus).toBe('active');
    const turn = data.turn as Record<string, unknown>;
    expect(turn.turnNumber).toBe(2);
  });

  it('concludes debate when maxTurns is reached', async () => {
    // With 2 regular agents and maxTurns=1, debate concludes after 2 turns (1 full round).
    // existing: 1 turn (agent 0). This new turn makes agent 1 speak → 2 total regular turns.
    // completedRounds = floor(2/2) = 1 >= maxTurns(1) → should conclude.
    const existingTurns = [
      { id: 'turn-1', turnNumber: 1, content: 'T1', agent: mockTurnAgent },
    ];

    const concludingTurnResult = { ...mockTurnResult, id: 'turn-2', turnNumber: 2, agent: mockCriticTurnAgent };

    mockPrisma.debate.findUnique
      // First call: load debate for advancing
      .mockResolvedValueOnce({
        ...mockDebateBase,
        agents: mockDebateAgents,
        turns: existingTurns,
      })
      // Second call: load debate for computing metrics after conclusion
      .mockResolvedValueOnce({
        id: 'dbt-1',
        turns: [
          { id: 'turn-1', score: mockTurnScore },
          { id: 'turn-2', score: mockTurnScore },
        ],
      });

    mockPrisma.debate.update.mockResolvedValueOnce({ id: 'dbt-1', status: 'concluded' });
    mockPrisma.debateMetrics.upsert.mockResolvedValueOnce({ id: 'metrics-1' });

    mockPrisma.$transaction.mockImplementationOnce(async (fn: (tx: typeof mockTx) => Promise<unknown>) => {
      mockTx.debateTurn.create.mockResolvedValueOnce(concludingTurnResult);
      mockTx.debateAgentScore.create.mockResolvedValueOnce(mockTurnScore);
      return fn(mockTx);
    });

    const req = makePostRequest('dbt-1', { maxTurns: 1 });
    const res = await parseResponse(await handler(req, makeParams('dbt-1')));

    expect(res.status).toBe(200);
    const data = res.body.data as Record<string, unknown>;
    expect(data.debateStatus).toBe('concluded');
    expect(data.turnsRemaining).toBe(0);
    expect(mockPrisma.debate.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'concluded' } })
    );
  });

  it('still succeeds when metrics computation fails after conclusion (non-fatal)', async () => {
    const existingTurns = [
      { id: 'turn-1', turnNumber: 1, content: 'T1', agent: mockTurnAgent },
    ];

    mockPrisma.debate.findUnique
      .mockResolvedValueOnce({
        ...mockDebateBase,
        agents: mockDebateAgents,
        turns: existingTurns,
      })
      // Second call for metrics load fails
      .mockRejectedValueOnce(new Error('Metrics DB error'));

    mockPrisma.debate.update.mockResolvedValueOnce({ id: 'dbt-1', status: 'concluded' });

    const concludingTurnResult = { ...mockTurnResult, id: 'turn-2', turnNumber: 2, agent: mockCriticTurnAgent };
    mockPrisma.$transaction.mockImplementationOnce(async (fn: (tx: typeof mockTx) => Promise<unknown>) => {
      mockTx.debateTurn.create.mockResolvedValueOnce(concludingTurnResult);
      mockTx.debateAgentScore.create.mockResolvedValueOnce(mockTurnScore);
      return fn(mockTx);
    });

    const req = makePostRequest('dbt-1', { maxTurns: 1 });
    const res = await parseResponse(await handler(req, makeParams('dbt-1')));

    // Debate conclusion succeeded; metrics failure is logged but does not break the response
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const data = res.body.data as Record<string, unknown>;
    expect(data.debateStatus).toBe('concluded');
  });

  it('returns 500 INTERNAL_ERROR when Prisma throws on debate load', async () => {
    mockPrisma.debate.findUnique.mockRejectedValueOnce(new Error('DB connection lost'));
    const req = makePostRequest('dbt-err', {});
    const res = await parseResponse(await handler(req, makeParams('dbt-err')));

    expect(res.status).toBe(500);
    expect((res.body.error as Record<string, string>).code).toBe('INTERNAL_ERROR');
  });

  it('returns 500 INTERNAL_ERROR when LLM adapter throws', async () => {
    mockPrisma.debate.findUnique.mockResolvedValueOnce({
      ...mockDebateBase,
      turns: [],
    });
    mockChat.mockRejectedValueOnce(new Error('LLM API error'));

    const req = makePostRequest('dbt-1', {});
    const res = await parseResponse(await handler(req, makeParams('dbt-1')));

    expect(res.status).toBe(500);
    expect((res.body.error as Record<string, string>).code).toBe('INTERNAL_ERROR');
  });

  // ── IP header fallback ───────────────────────────────────────────────

  it('uses x-real-ip when x-forwarded-for is absent', async () => {
    mockPrisma.debate.findUnique.mockResolvedValueOnce({
      ...mockDebateBase,
      turns: [],
    });

    const req = new Request('http://localhost/api/debate/dbt-1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-real-ip': '10.0.0.2' },
      body: JSON.stringify({}),
    });

    const res = await parseResponse(await handler(req, makeParams('dbt-1')));
    expect(res.status).toBe(200);
    expect(mockCheckRateLimit).toHaveBeenCalledWith(
      expect.stringContaining('debate-advance:'),
      expect.any(Object)
    );
  });

  it('uses anonymous when no IP headers present', async () => {
    mockPrisma.debate.findUnique.mockResolvedValueOnce({
      ...mockDebateBase,
      turns: [],
    });

    const req = new Request('http://localhost/api/debate/dbt-1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const res = await parseResponse(await handler(req, makeParams('dbt-1')));
    expect(res.status).toBe(200);
    expect(mockCheckRateLimit).toHaveBeenCalledWith(
      expect.stringContaining('anonymous'),
      expect.any(Object)
    );
  });

  // ── Response envelope consistency ──────────────────────────────────

  it('success responses have success=true, data, and meta.timestamp', async () => {
    mockPrisma.debate.findUnique.mockResolvedValueOnce({
      ...mockDebateBase,
      turns: [],
    });

    const req = makePostRequest('dbt-1', {});
    const res = await parseResponse(await handler(req, makeParams('dbt-1')));

    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.meta).toBeDefined();
    const meta = res.body.meta as Record<string, string>;
    expect(typeof meta.timestamp).toBe('string');
  });

  it('error responses have success=false, error.code, error.message, and meta.timestamp', async () => {
    mockPrisma.debate.findUnique.mockResolvedValueOnce(null);
    const req = makePostRequest('nonexistent', {});
    const res = await parseResponse(await handler(req, makeParams('nonexistent')));

    expect(res.body.success).toBe(false);
    const error = res.body.error as Record<string, string>;
    expect(typeof error.code).toBe('string');
    expect(typeof error.message).toBe('string');
    const meta = res.body.meta as Record<string, string>;
    expect(typeof meta.timestamp).toBe('string');
  });
});
