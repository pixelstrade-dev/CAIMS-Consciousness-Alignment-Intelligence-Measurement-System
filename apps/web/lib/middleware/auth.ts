// API-key authentication for cost-bearing endpoints.
//
// Model: opt-in enforcement. When CAIMS_API_KEYS is unset the API stays open
// (local development, self-hosted private deployments) and a warning is
// logged once. When set (comma-separated list of keys), every protected
// endpoint requires one of the keys via `Authorization: Bearer <key>` or
// `x-api-key: <key>`. This is what makes a PUBLIC demo deployment safe:
// read-only GETs stay open, everything that spends LLM credits is keyed.
//
// Keys are compared in constant time (timingSafeEqual) so response timing
// leaks nothing about key prefixes.

import { timingSafeEqual } from 'crypto';
import { logger } from '@/lib/logger';

let warnedOpenMode = false;

function configuredKeys(): string[] {
  const raw = process.env.CAIMS_API_KEYS;
  if (!raw) return [];
  return raw
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 0);
}

function extractPresentedKey(headers: { get(name: string): string | null }): string | null {
  const auth = headers.get('authorization');
  if (auth && auth.toLowerCase().startsWith('bearer ')) {
    const key = auth.slice(7).trim();
    if (key) return key;
  }
  const headerKey = headers.get('x-api-key');
  if (headerKey && headerKey.trim()) return headerKey.trim();
  return null;
}

function constantTimeMatch(presented: string, expected: string): boolean {
  const a = Buffer.from(presented, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) {
    // Still burn a comparison so length mismatch costs the same.
    timingSafeEqual(a, a);
    return false;
  }
  return timingSafeEqual(a, b);
}

export type AuthResult =
  | { ok: true; mode: 'open' | 'keyed' }
  | { ok: false; reason: 'missing_key' | 'invalid_key' };

export function checkApiKey(headers: { get(name: string): string | null }): AuthResult {
  const keys = configuredKeys();

  if (keys.length === 0) {
    if (!warnedOpenMode) {
      warnedOpenMode = true;
      logger.warn(
        'CAIMS_API_KEYS is not set — the API is running OPEN. Fine for local/private use; set CAIMS_API_KEYS before any public deployment.'
      );
    }
    return { ok: true, mode: 'open' };
  }

  const presented = extractPresentedKey(headers);
  if (!presented) return { ok: false, reason: 'missing_key' };

  // Compare against every configured key; no early exit on match so the
  // total work is independent of which key (if any) matched.
  let matched = false;
  for (const expected of keys) {
    if (constantTimeMatch(presented, expected)) matched = true;
  }
  return matched ? { ok: true, mode: 'keyed' } : { ok: false, reason: 'invalid_key' };
}

// Test-only: reset the one-time open-mode warning.
export function _resetAuthWarningForTests(): void {
  warnedOpenMode = false;
}
