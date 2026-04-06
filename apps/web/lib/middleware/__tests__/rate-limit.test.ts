import { checkRateLimit, getRateLimitHeaders } from '../rate-limit';

describe('checkRateLimit', () => {
  it('allows requests under the limit', () => {
    const id = `test-${Date.now()}-${Math.random()}`;
    const result = checkRateLimit(id, { windowMs: 60_000, maxRequests: 5 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('blocks requests over the limit', () => {
    const id = `test-block-${Date.now()}-${Math.random()}`;
    const config = { windowMs: 60_000, maxRequests: 2 };

    checkRateLimit(id, config); // 1
    checkRateLimit(id, config); // 2
    const third = checkRateLimit(id, config); // 3 = blocked

    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
  });

  it('resets after window expires', () => {
    const id = `test-reset-${Date.now()}-${Math.random()}`;
    const config = { windowMs: 1, maxRequests: 1 }; // 1ms window

    checkRateLimit(id, config); // 1 = fills up

    // After the tiny window, should reset
    // Use a sync sleep to ensure window passes
    const start = Date.now();
    while (Date.now() - start < 5) { /* busy wait 5ms */ }

    const result = checkRateLimit(id, config);
    expect(result.allowed).toBe(true);
  });

  it('uses default config when none provided', () => {
    const id = `test-default-${Date.now()}-${Math.random()}`;
    const result = checkRateLimit(id);
    expect(result.allowed).toBe(true);
    // Default is 30 requests/min
    expect(result.remaining).toBe(29);
  });

  it('returns correct remaining count on each call', () => {
    const id = `test-remaining-${Date.now()}-${Math.random()}`;
    const config = { windowMs: 60_000, maxRequests: 3 };

    const r1 = checkRateLimit(id, config);
    expect(r1.remaining).toBe(2);

    const r2 = checkRateLimit(id, config);
    expect(r2.remaining).toBe(1);

    const r3 = checkRateLimit(id, config);
    expect(r3.remaining).toBe(0);

    const r4 = checkRateLimit(id, config);
    expect(r4.remaining).toBe(0); // stays at 0
    expect(r4.allowed).toBe(false);
  });

  it('returns a future resetAt timestamp', () => {
    const id = `test-resetat-${Date.now()}-${Math.random()}`;
    const now = Date.now();
    const result = checkRateLimit(id, { windowMs: 60_000, maxRequests: 5 });
    expect(result.resetAt).toBeGreaterThan(now);
    expect(result.resetAt).toBeLessThanOrEqual(now + 60_000 + 100);
  });

  it('tracks different identifiers independently', () => {
    const id1 = `test-ind1-${Date.now()}-${Math.random()}`;
    const id2 = `test-ind2-${Date.now()}-${Math.random()}`;
    const config = { windowMs: 60_000, maxRequests: 1 };

    checkRateLimit(id1, config); // fills id1
    const r1 = checkRateLimit(id1, config);
    expect(r1.allowed).toBe(false);

    // id2 should still be allowed
    const r2 = checkRateLimit(id2, config);
    expect(r2.allowed).toBe(true);
  });
});

describe('getRateLimitHeaders', () => {
  it('returns correct header format', () => {
    const headers = getRateLimitHeaders({ remaining: 5, resetAt: 1700000000000 });
    expect(headers['X-RateLimit-Remaining']).toBe('5');
    expect(headers['X-RateLimit-Reset']).toBe('1700000000');
  });

  it('handles zero remaining', () => {
    const headers = getRateLimitHeaders({ remaining: 0, resetAt: 1700000000000 });
    expect(headers['X-RateLimit-Remaining']).toBe('0');
  });

  it('rounds up resetAt to nearest second', () => {
    const headers = getRateLimitHeaders({ remaining: 1, resetAt: 1700000000500 });
    expect(headers['X-RateLimit-Reset']).toBe('1700000001');
  });
});
