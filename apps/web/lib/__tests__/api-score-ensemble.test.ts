/**
 * /api/score ensemble & n-sample paths (v2.1).
 *
 * Same direct-handler strategy as api-routes-errors.test.ts: invoke the
 * route with mocked adapters — no network, no provider keys.
 */

export {}; // module scope — avoids global-scope collisions across test files

const mockJudge = jest.fn();
jest.mock('@/lib/adapters', () => ({
  getAdapter: () => ({ chat: jest.fn(), judge: mockJudge }),
  getProviderFromEnv: () => 'anthropic',
}));

jest.mock('@/lib/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

jest.mock('@/lib/middleware/rate-limit', () => ({
  checkRateLimit: () => ({ allowed: true, remaining: 10, resetAt: Date.now() + 60000 }),
  getRateLimitHeaders: () => ({}),
  clientIp: () => '127.0.0.1',
}));

function rubricJson(v: number): string {
  return JSON.stringify({
    cq: { integration_depth: v, knowledge_breadth: v, metacognitive_display: v, synthesis: v, temporal_coherence: v },
    aq: { goal_clarity: v, constraint_aware: v, path_coherence: v, scope_drift: v, reality_grounding: v },
    cfi: { context_retention: v, topic_drift: v, coherence_loss: v },
    eq: { calibration: v, uncertainty: v, hallucination: v, source_integrity: v },
    sq: { intra_session: v, position_drift: v },
    reasoning: 'stub',
  });
}

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
    body: JSON.stringify(body),
  });
}

const BASE_BODY = { question: 'What color is the sky?', response: 'The sky is blue.' };

describe('POST /api/score — ensemble & n-sample (v2.1)', () => {
  let handler: (req: Request) => Promise<Response>;
  const OLD_JUDGES = process.env.CAIMS_ENSEMBLE_JUDGES;
  const OLD_KEYS = process.env.CAIMS_API_KEYS;

  beforeAll(async () => {
    const mod = await import('@/app/api/score/route');
    handler = mod.POST as unknown as (req: Request) => Promise<Response>;
  });

  beforeEach(() => {
    mockJudge.mockReset();
    delete process.env.CAIMS_ENSEMBLE_JUDGES;
    delete process.env.CAIMS_API_KEYS; // open mode — auth tested elsewhere
  });

  afterAll(() => {
    if (OLD_JUDGES === undefined) delete process.env.CAIMS_ENSEMBLE_JUDGES;
    else process.env.CAIMS_ENSEMBLE_JUDGES = OLD_JUDGES;
    if (OLD_KEYS === undefined) delete process.env.CAIMS_API_KEYS;
    else process.env.CAIMS_API_KEYS = OLD_KEYS;
  });

  it('ensemble without server config → 400 ENSEMBLE_NOT_CONFIGURED', async () => {
    const res = await handler(makeRequest({ ...BASE_BODY, ensemble: true }));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error.code).toBe('ENSEMBLE_NOT_CONFIGURED');
    expect(mockJudge).not.toHaveBeenCalled();
  });

  it('ensemble with unparseable config → 503 ENSEMBLE_MISCONFIGURED (never silent single-judge)', async () => {
    process.env.CAIMS_ENSEMBLE_JUDGES = 'not-a-valid-entry';
    const res = await handler(makeRequest({ ...BASE_BODY, ensemble: true }));
    const body = await res.json();
    expect(res.status).toBe(503);
    expect(body.error.code).toBe('ENSEMBLE_MISCONFIGURED');
    expect(mockJudge).not.toHaveBeenCalled();
  });

  it('samples out of range → 400 VALIDATION_ERROR', async () => {
    const res = await handler(makeRequest({ ...BASE_BODY, samples: 6 }));
    expect(res.status).toBe(400);
  });

  it('two-judge ensemble: per-judge results, agreement, ensemble means, no emq', async () => {
    process.env.CAIMS_ENSEMBLE_JUDGES = 'anthropic:judge-a,openai:judge-b';
    mockJudge
      .mockResolvedValueOnce(rubricJson(60))
      .mockResolvedValueOnce(rubricJson(80));
    const res = await handler(makeRequest({ ...BASE_BODY, ensemble: true }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.scores.composite).toBe(70);
    expect(body.data.scores.cq.score).toBe(70);
    expect(body.data.scores.emq).toBeUndefined();
    expect(body.data.ensemble.judges).toHaveLength(2);
    expect(body.data.ensemble.judges.map((j: { id: string }) => j.id))
      .toEqual(['anthropic:judge-a', 'openai:judge-b']);
    expect(body.data.ensemble.agreement).toEqual({ compositeSpread: 20, meanAbsDiff: 20 });
    expect(body.data.metadata.mode).toBe('ensemble');
    expect(body.data.metadata.emotionAnalysis).toBe('skipped');
    expect(mockJudge).toHaveBeenCalledTimes(2); // no emotion calls
    // v3 Evidence Card: two provider families → computed L2, profile primary
    expect(body.data.evidenceCard.evidenceLevel).toBe('L2');
    expect(body.data.evidenceCard.phenomenalConsciousness).toBe('NOT_ASSESSED');
    expect(body.data.evidenceCard.profile.cq.basis).toBe('across-judges');
    expect(body.data.evidenceCard.profile.cq.n).toBe(2);
    // INVARIANT: the card's profile scores must equal scores.* in the SAME
    // response — the two are computed by (currently identical) expressions
    // in two files, and a divergence would be a self-contradicting payload.
    for (const k of ['cq', 'aq', 'cfi', 'eq', 'sq'] as const) {
      expect(body.data.evidenceCard.profile[k].score).toBe(body.data.scores[k].score);
    }
  });

  it('n-sample without ensemble: single default judge, SD over samples', async () => {
    mockJudge
      .mockResolvedValueOnce(rubricJson(70))
      .mockResolvedValueOnce(rubricJson(80));
    const res = await handler(makeRequest({ ...BASE_BODY, samples: 2 }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.ensemble.judges).toHaveLength(1);
    expect(body.data.ensemble.judges[0].samplesOk).toBe(2);
    expect(body.data.ensemble.judges[0].composite.mean).toBe(75);
    expect(body.data.ensemble.judges[0].composite.sd).toBeCloseTo(7.1, 1);
    expect(body.data.ensemble.agreement).toBeNull();
    expect(mockJudge).toHaveBeenCalledTimes(2);
    // Evidence Card: one judge, n samples → L1, samples-within-judge basis
    expect(body.data.evidenceCard.evidenceLevel).toBe('L1');
    expect(body.data.evidenceCard.profile.cq.basis).toBe('samples-within-judge');
    expect(body.data.evidenceCard.profile.cq.n).toBe(2);
  });

  it('all judges failing → 503 SCORING_UNAVAILABLE', async () => {
    process.env.CAIMS_ENSEMBLE_JUDGES = 'anthropic:judge-a';
    mockJudge.mockResolvedValue('not json at all');
    const res = await handler(makeRequest({ ...BASE_BODY, ensemble: true }));
    const body = await res.json();
    expect(res.status).toBe(503);
    expect(body.error.code).toBe('SCORING_UNAVAILABLE');
  });

  it('plain request (no ensemble, samples=1) keeps the original single-judge path', async () => {
    mockJudge.mockResolvedValueOnce(rubricJson(65)); // KPI judge
    mockJudge.mockResolvedValueOnce('{}'); // emotion pass (fails parsing — non-fatal)
    const res = await handler(makeRequest(BASE_BODY));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.ensemble).toBeUndefined();
    expect(body.data.metadata.mode).toBeUndefined();
    expect(body.data.scores.composite).toBe(65);
    // Evidence Card is present on the single path too: L1, single-call basis
    expect(body.data.evidenceCard.evidenceLevel).toBe('L1');
    expect(body.data.evidenceCard.profile.eq).toEqual({ score: 65, sd: null, n: 1, basis: 'single-call' });
    expect(body.data.evidenceCard.phenomenalConsciousness).toBe('NOT_ASSESSED');
  });
});
