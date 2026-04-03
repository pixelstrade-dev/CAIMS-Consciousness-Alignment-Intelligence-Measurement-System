import { checkRateLimit } from '../rate-limit';

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
});
