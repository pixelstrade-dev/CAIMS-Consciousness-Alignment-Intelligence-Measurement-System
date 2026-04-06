/**
 * Debate Export Route Tests
 *
 * Verifies the GET /api/debate/[id]/export endpoint for both JSON and PDF
 * export formats, covering success paths and error paths.
 */

// ── Mocks ──────────────────────────────────────────────────────────────

const mockPrisma = {
  debate: {
    findUnique: jest.fn(),
  },
};

jest.mock('@/lib/db/client', () => mockPrisma);

jest.mock('@/lib/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

// ── Test data ──────────────────────────────────────────────────────────

const mockDebate = {
  id: 'debate-123',
  topic: 'AI consciousness and alignment',
  format: 'expert_panel',
  status: 'concluded',
  createdAt: new Date('2024-01-15T10:00:00Z'),
  agents: [
    {
      id: 'agent-1',
      agentId: 'agt-architect',
      name: 'Architect',
      role: 'Systems Designer',
      scores: [],
    },
  ],
  turns: [
    {
      id: 'turn-1',
      turnNumber: 1,
      content: 'Initial position on AI consciousness.',
      tokenCount: 42,
      agent: { name: 'Architect', role: 'Systems Designer', agentId: 'agt-architect' },
      score: {
        composite: 78.5,
        cqScore: 80.0,
        aqScore: 75.0,
        cfiScore: 82.0,
        eqScore: 77.0,
        sqScore: 79.0,
      },
    },
  ],
  metrics: {
    convergenceRate: 85.0,
    diversityIndex: 40.0,
    argumentationQuality: 76.2,
    alignmentCoherence: 81.5,
    consciousnessEmergence: 78.5,
    compositeDebateScore: 78.5,
  },
};

// ── Helpers ────────────────────────────────────────────────────────────

function makeRequest(url: string): Request {
  return new Request(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
}

// ── Tests ──────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/debate/[id]/export', () => {
  let GET: (req: Request, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;

  beforeAll(async () => {
    const mod = await import('@/app/api/debate/[id]/export/route');
    GET = mod.GET as typeof GET;
  });

  describe('JSON export', () => {
    it('returns 200 with JSON content for format=json', async () => {
      mockPrisma.debate.findUnique.mockResolvedValueOnce(mockDebate);

      const req = makeRequest('http://localhost/api/debate/debate-123/export?format=json');
      const res = await GET(req, { params: Promise.resolve({ id: 'debate-123' }) });

      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('application/json');
      expect(res.headers.get('Content-Disposition')).toContain('.json');
    });

    it('JSON payload contains id, topic, agents, turns and metrics', async () => {
      mockPrisma.debate.findUnique.mockResolvedValueOnce(mockDebate);

      const req = makeRequest('http://localhost/api/debate/debate-123/export?format=json');
      const res = await GET(req, { params: Promise.resolve({ id: 'debate-123' }) });

      const body = await res.json();
      expect(body.id).toBe('debate-123');
      expect(body.topic).toBe('AI consciousness and alignment');
      expect(Array.isArray(body.agents)).toBe(true);
      expect(Array.isArray(body.turns)).toBe(true);
      expect(body.metrics).not.toBeNull();
    });

    it('JSON payload includes score details for each turn', async () => {
      mockPrisma.debate.findUnique.mockResolvedValueOnce(mockDebate);

      const req = makeRequest('http://localhost/api/debate/debate-123/export?format=json');
      const res = await GET(req, { params: Promise.resolve({ id: 'debate-123' }) });

      const body = await res.json();
      const turn = body.turns[0];
      expect(turn.score).not.toBeNull();
      expect(turn.score.composite).toBe(78.5);
      expect(turn.score.cqScore).toBe(80.0);
    });

    it('returns JSON when no format param is provided (defaults to json)', async () => {
      mockPrisma.debate.findUnique.mockResolvedValueOnce(mockDebate);

      const req = makeRequest('http://localhost/api/debate/debate-123/export');
      const res = await GET(req, { params: Promise.resolve({ id: 'debate-123' }) });

      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('application/json');
    });
  });

  describe('PDF export', () => {
    it('returns 200 with PDF content-type for format=pdf', async () => {
      mockPrisma.debate.findUnique.mockResolvedValueOnce(mockDebate);

      const req = makeRequest('http://localhost/api/debate/debate-123/export?format=pdf');
      const res = await GET(req, { params: Promise.resolve({ id: 'debate-123' }) });

      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('application/pdf');
    });

    it('PDF response has attachment content-disposition with .pdf extension', async () => {
      mockPrisma.debate.findUnique.mockResolvedValueOnce(mockDebate);

      const req = makeRequest('http://localhost/api/debate/debate-123/export?format=pdf');
      const res = await GET(req, { params: Promise.resolve({ id: 'debate-123' }) });

      expect(res.headers.get('Content-Disposition')).toContain('.pdf');
      expect(res.headers.get('Content-Disposition')).toContain('attachment');
    });

    it('PDF response body is non-empty binary data', async () => {
      mockPrisma.debate.findUnique.mockResolvedValueOnce(mockDebate);

      const req = makeRequest('http://localhost/api/debate/debate-123/export?format=pdf');
      const res = await GET(req, { params: Promise.resolve({ id: 'debate-123' }) });

      const buffer = await res.arrayBuffer();
      expect(buffer.byteLength).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    it('returns 404 when debate is not found', async () => {
      mockPrisma.debate.findUnique.mockResolvedValueOnce(null);

      const req = makeRequest('http://localhost/api/debate/not-found/export?format=json');
      const res = await GET(req, { params: Promise.resolve({ id: 'not-found' }) });

      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('DEBATE_NOT_FOUND');
    });

    it('returns 400 for an invalid format param', async () => {
      const req = makeRequest('http://localhost/api/debate/debate-123/export?format=csv');
      const res = await GET(req, { params: Promise.resolve({ id: 'debate-123' }) });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('INVALID_FORMAT');
    });

    it('returns 500 when database throws an error', async () => {
      mockPrisma.debate.findUnique.mockRejectedValueOnce(new Error('DB connection failed'));

      const req = makeRequest('http://localhost/api/debate/debate-123/export?format=json');
      const res = await GET(req, { params: Promise.resolve({ id: 'debate-123' }) });

      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
