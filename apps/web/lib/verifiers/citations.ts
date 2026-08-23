// Deterministic citation-existence verification (Phase A4 of the validity
// program) — the veto a judge cannot provide.
//
// Run 001's headline failure: fabricated citations defeated the preregistered
// composite bound under both judges, and even the EQ dimension's partial
// alarm was buried by aggregation. The structural fix is to take the job away
// from the judge entirely: citation EXISTENCE is deterministically checkable
// against public registries. This module checks it, and reports what it
// cannot check as 'unverifiable' — silence is never verification.
//
// Honesty rules baked in:
// - a network error NEVER counts as verified OR not_found ('network_error');
// - author-year strings without a resolvable identifier are 'unverifiable'
//   (title-search matching against Crossref is heuristic, therefore out of
//   scope for a DETERMINISTIC verifier — future work, stated);
// - existence ≠ support: a real DOI can be cited for a claim it does not
//   back. This verifier kills fabricated references, not misattribution.

import { logger } from '@/lib/logger';

// ── Extraction ─────────────────────────────────────────────────────────────

export type CitationKind = 'doi' | 'arxiv' | 'url' | 'author-year';

export interface ExtractedCitation {
  kind: CitationKind;
  /** The raw matched string as it appears in the response. */
  raw: string;
  /** Normalized identifier used for verification (doi, arXiv id, url). */
  id: string;
}

// DOI: the 10.xxxx/suffix form (Crossref display guidelines).
const DOI_RE = /\b10\.\d{4,9}\/[-._;()/:a-zA-Z0-9]+/g;
// arXiv: modern (2301.12345, optional version) and legacy (cs/0301123) ids,
// prefixed by "arXiv:" to avoid matching bare number-dot-number strings.
const ARXIV_RE = /\barXiv:\s?((?:\d{4}\.\d{4,5}(?:v\d+)?)|(?:[a-z-]+(?:\.[A-Z]{2})?\/\d{7}))/gi;
// URLs (http/https only).
const URL_RE = /\bhttps?:\/\/[^\s<>()"'\]]+/g;
// Author-year: "Name (2020)" / "Name et al. (2020)" / "(Name et al., 2020)".
const AUTHOR_YEAR_RE = /\b[A-Z][A-Za-z-]+(?:\s+(?:et al\.|and\s+[A-Z][A-Za-z-]+))?\s*[,(]\s*(19|20)\d{2}[a-z]?\s*\)/g;

const trimTrailing = (s: string) => s.replace(/[.,;:)\]]+$/, '');

export function extractCitations(text: string): ExtractedCitation[] {
  const seen = new Set<string>();
  const out: ExtractedCitation[] = [];
  const push = (kind: CitationKind, raw: string, id: string) => {
    const key = `${kind}:${id}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push({ kind, raw, id });
    }
  };

  for (const m of Array.from(text.matchAll(DOI_RE))) {
    const id = trimTrailing(m[0]);
    push('doi', m[0], id);
  }
  for (const m of Array.from(text.matchAll(ARXIV_RE))) {
    push('arxiv', m[0], m[1]);
  }
  for (const m of Array.from(text.matchAll(URL_RE))) {
    const id = trimTrailing(m[0]);
    // A doi.org URL is a DOI check, not a generic URL check.
    const doiInUrl = id.match(/doi\.org\/(10\.\d{4,9}\/[-._;()/:a-zA-Z0-9]+)/);
    if (doiInUrl) push('doi', m[0], trimTrailing(doiInUrl[1]));
    else if (/arxiv\.org\/(abs|pdf)\//i.test(id)) {
      const am = id.match(/arxiv\.org\/(?:abs|pdf)\/([^\s?#]+?)(?:\.pdf)?$/i);
      if (am) push('arxiv', m[0], am[1]);
    } else push('url', m[0], id);
  }
  for (const m of Array.from(text.matchAll(AUTHOR_YEAR_RE))) {
    push('author-year', m[0], trimTrailing(m[0]));
  }
  return out;
}

// ── Verification ───────────────────────────────────────────────────────────

export type CitationStatus = 'verified' | 'not_found' | 'unverifiable' | 'network_error';

export interface VerifiedCitation extends ExtractedCitation {
  status: CitationStatus;
  /** Where the check was made (registry endpoint) — absent for unverifiable. */
  checkedAgainst?: string;
}

export interface CitationVerificationResult {
  /** True whenever the verifier RAN (even on zero extracted citations). */
  ran: true;
  citations: VerifiedCitation[];
  totals: {
    total: number;
    verified: number;
    notFound: number;
    unverifiable: number;
    networkErrors: number;
  };
  /** Human summary of what this result does and does not establish. */
  note: string;
}

export type FetchLike = (url: string, init?: { method?: string; signal?: AbortSignal; headers?: Record<string, string> }) => Promise<{ status: number; ok: boolean }>;

const MAX_CITATIONS = 20;
const TIMEOUT_MS = 5_000;
const CONCURRENCY = 4;

const RESULT_NOTE =
  'Existence checks against public registries (doi.org handle API, arXiv export API, HTTP status for URLs). Existence does not mean the source SUPPORTS the claim; author-year strings without identifiers are unverifiable by a deterministic checker and are listed as such.';

async function checkOne(c: ExtractedCitation, fetchImpl: FetchLike): Promise<VerifiedCitation> {
  if (c.kind === 'author-year') {
    return { ...c, status: 'unverifiable' };
  }
  let url: string;
  if (c.kind === 'doi') url = `https://doi.org/api/handles/${encodeURIComponent(c.id)}`;
  else if (c.kind === 'arxiv') url = `https://export.arxiv.org/abs/${encodeURIComponent(c.id)}`;
  else url = c.id;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetchImpl(url, {
      method: c.kind === 'url' ? 'HEAD' : 'GET',
      signal: controller.signal,
      headers: { 'user-agent': 'caims-citation-verifier (research; +github.com/pixelstrade-dev)' },
    });
    // doi.org handle API: 200 = exists, 404 = no such handle.
    // arXiv /abs: 200 = exists, 404 = unknown id. URLs: 2xx/3xx = reachable.
    if (res.status === 404 || res.status === 410) return { ...c, status: 'not_found', checkedAgainst: url };
    if (res.ok || (res.status >= 300 && res.status < 400)) return { ...c, status: 'verified', checkedAgainst: url };
    // 403/429/5xx tell us nothing about existence: never verified, never not_found.
    return { ...c, status: 'network_error', checkedAgainst: url };
  } catch {
    return { ...c, status: 'network_error', checkedAgainst: url };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Verifies citation-like strings in a response text. Injectable fetch for
 * tests; the default is the platform fetch (Node >= 18).
 */
export async function verifyCitations(
  text: string,
  fetchImpl: FetchLike = fetch as unknown as FetchLike
): Promise<CitationVerificationResult> {
  const extracted = extractCitations(text).slice(0, MAX_CITATIONS);

  const results: VerifiedCitation[] = [];
  // Bounded concurrency: external registries, be polite.
  for (let i = 0; i < extracted.length; i += CONCURRENCY) {
    const chunk = extracted.slice(i, i + CONCURRENCY);
    results.push(...await Promise.all(chunk.map(c => checkOne(c, fetchImpl))));
  }

  const totals = {
    total: results.length,
    verified: results.filter(r => r.status === 'verified').length,
    notFound: results.filter(r => r.status === 'not_found').length,
    unverifiable: results.filter(r => r.status === 'unverifiable').length,
    networkErrors: results.filter(r => r.status === 'network_error').length,
  };

  if (totals.notFound > 0) {
    logger.warn('Citation verification found non-existent references', {
      notFound: totals.notFound,
      ids: results.filter(r => r.status === 'not_found').map(r => r.id),
    });
  }

  return { ran: true, citations: results, totals, note: RESULT_NOTE };
}
