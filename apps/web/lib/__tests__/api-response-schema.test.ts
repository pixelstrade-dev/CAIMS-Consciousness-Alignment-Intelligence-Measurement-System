/**
 * API Response Schema Validation Tests
 *
 * Tests that all API response helpers produce valid, consistent envelopes.
 * Catches type drift between server responses and client expectations.
 */
import { z } from 'zod';

// Schema that EVERY API response must conform to
const ApiSuccessSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
  meta: z.object({
    timestamp: z.string().datetime(),
  }),
});

const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
  }),
  meta: z.object({
    timestamp: z.string().datetime(),
  }),
});

// Mock NextResponse.json since we're in a Node test environment
const capturedResponses: Array<{ body: unknown; init: { status: number } }> = [];

jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init: { status: number }) => {
      capturedResponses.push({ body, init });
      return { body, init };
    },
  },
}));

import { apiSuccess, apiError } from '@/lib/middleware/api-response';

beforeEach(() => {
  capturedResponses.length = 0;
});

describe('apiSuccess response envelope', () => {
  it('conforms to ApiSuccessSchema with data', () => {
    apiSuccess({ id: '123', name: 'test' });
    const { body, init } = capturedResponses[0];
    expect(init.status).toBe(200);
    expect(() => ApiSuccessSchema.parse(body)).not.toThrow();
  });

  it('conforms with custom status code', () => {
    apiSuccess({ id: '123' }, 201);
    const { body, init } = capturedResponses[0];
    expect(init.status).toBe(201);
    expect(() => ApiSuccessSchema.parse(body)).not.toThrow();
  });

  it('always sets success=true', () => {
    apiSuccess(null);
    const { body } = capturedResponses[0];
    expect((body as Record<string, unknown>).success).toBe(true);
  });

  it('includes valid ISO timestamp', () => {
    apiSuccess({});
    const { body } = capturedResponses[0];
    const meta = (body as Record<string, unknown>).meta as { timestamp: string };
    expect(() => new Date(meta.timestamp).toISOString()).not.toThrow();
  });
});

describe('apiError response envelope', () => {
  it('conforms to ApiErrorSchema', () => {
    apiError('VALIDATION_ERROR', 'Invalid input', 400);
    const { body, init } = capturedResponses[0];
    expect(init.status).toBe(400);
    expect(() => ApiErrorSchema.parse(body)).not.toThrow();
  });

  it('always sets success=false', () => {
    apiError('NOT_FOUND', 'Resource not found', 404);
    const { body } = capturedResponses[0];
    expect((body as Record<string, unknown>).success).toBe(false);
  });

  it('includes error code and message', () => {
    apiError('RATE_LIMITED', 'Too many requests', 429);
    const { body } = capturedResponses[0];
    const error = (body as Record<string, unknown>).error as { code: string; message: string };
    expect(error.code).toBe('RATE_LIMITED');
    expect(error.message).toBe('Too many requests');
  });

  it('returns correct HTTP status codes', () => {
    const cases = [
      { code: 'VALIDATION_ERROR', status: 400 },
      { code: 'NOT_FOUND', status: 404 },
      { code: 'RATE_LIMITED', status: 429 },
      { code: 'INTERNAL_ERROR', status: 500 },
      { code: 'SCORING_UNAVAILABLE', status: 503 },
    ];
    cases.forEach(({ code, status }) => {
      capturedResponses.length = 0;
      apiError(code, 'test', status);
      expect(capturedResponses[0].init.status).toBe(status);
    });
  });
});

describe('error code consistency', () => {
  // All known error codes in the system — this acts as a registry
  const KNOWN_ERROR_CODES = [
    'VALIDATION_ERROR',
    'SESSION_NOT_FOUND',
    'DEBATE_NOT_FOUND',
    'DEBATE_NOT_ACTIVE',
    'NO_AGENTS',
    'INVALID_AGENTS',
    'RATE_LIMITED',
    'SCORING_UNAVAILABLE',
    'INTERNAL_ERROR',
  ];

  it('known error codes are all uppercase with underscores', () => {
    KNOWN_ERROR_CODES.forEach(code => {
      expect(code).toMatch(/^[A-Z][A-Z0-9_]+$/);
    });
  });

  it('no duplicate error codes', () => {
    const unique = new Set(KNOWN_ERROR_CODES);
    expect(unique.size).toBe(KNOWN_ERROR_CODES.length);
  });
});
