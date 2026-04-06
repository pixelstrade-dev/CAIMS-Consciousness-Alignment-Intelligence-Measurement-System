/**
 * Simple API Route Tests
 *
 * Tests for trivial routes:
 * - GET /api/health — health check
 * - GET /api/openapi.json — OpenAPI spec
 * - GET /api/docs — Swagger UI HTML
 */

// Suppress logger (docs route may import modules that log)
jest.mock('@/lib/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

// ── /api/health ────────────────────────────────────────────────────────

describe('GET /api/health', () => {
  it('returns 200 with status ok and version', async () => {
    const mod = await import('@/app/api/health/route');
    const handler = mod.GET as () => Promise<Response>;

    const response = await handler();
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('ok');
    expect(body.data.version).toBe('1.0.0');
  });

  it('response has consistent success envelope with meta.timestamp', async () => {
    const mod = await import('@/app/api/health/route');
    const handler = mod.GET as () => Promise<Response>;

    const response = await handler();
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.meta).toBeDefined();
    expect(typeof body.meta.timestamp).toBe('string');
  });
});

// ── /api/openapi.json ──────────────────────────────────────────────────

describe('GET /api/openapi.json', () => {
  it('returns 200 with a valid OpenAPI spec', async () => {
    const mod = await import('@/app/api/openapi.json/route');
    const handler = mod.GET as () => Promise<Response>;

    const response = await handler();
    expect(response.status).toBe(200);

    const spec = await response.json();
    expect(spec.openapi).toBeDefined();
    expect(spec.info).toBeDefined();
    expect(spec.info.title).toBeDefined();
    expect(spec.paths).toBeDefined();
  });

  it('includes CORS header allowing all origins', async () => {
    const mod = await import('@/app/api/openapi.json/route');
    const handler = mod.GET as () => Promise<Response>;

    const response = await handler();
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  it('includes Cache-Control header for 1 hour', async () => {
    const mod = await import('@/app/api/openapi.json/route');
    const handler = mod.GET as () => Promise<Response>;

    const response = await handler();
    expect(response.headers.get('Cache-Control')).toContain('max-age=3600');
  });
});

// ── /api/docs ──────────────────────────────────────────────────────────

describe('GET /api/docs', () => {
  it('returns 200 with HTML content', async () => {
    const mod = await import('@/app/api/docs/route');
    const handler = mod.GET as (req: Request) => Promise<Response>;

    const req = new Request('http://localhost/api/docs');
    const response = await handler(req);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('text/html');
  });

  it('includes Cache-Control header for 1 hour', async () => {
    const mod = await import('@/app/api/docs/route');
    const handler = mod.GET as (req: Request) => Promise<Response>;

    const req = new Request('http://localhost/api/docs');
    const response = await handler(req);
    expect(response.headers.get('Cache-Control')).toContain('max-age=3600');
  });

  it('HTML body contains Swagger UI reference', async () => {
    const mod = await import('@/app/api/docs/route');
    const handler = mod.GET as (req: Request) => Promise<Response>;

    const req = new Request('http://localhost/api/docs');
    const response = await handler(req);
    const html = await response.text();
    expect(html).toContain('swagger');
  });
});
