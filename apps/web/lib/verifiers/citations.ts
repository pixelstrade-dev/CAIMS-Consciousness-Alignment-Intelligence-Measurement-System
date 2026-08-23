// Deterministic citation-existence verification (Phase A4 of the validity
// program) — it SURFACES fabricated references; nothing here vetoes or
// changes a score.
//
// Run 001's headline failure: fabricated citations defeated the preregistered
// composite bound under both judges, and even the EQ dimension's partial
// alarm was buried by aggregation. The structural mitigation is to take the
// existence question away from the judge: citation EXISTENCE is checkable
// against public registries. This module checks it and reports; consumers
// (and the Evidence Card's caveats) carry the alarm.
//
// Honesty rules baked in (each pinned by tests):
// - a network/ambiguous outcome NEVER counts as verified OR not_found;
// - `not_found` requires a REGISTRY-CONFIRMED negative (handle API
//   responseCode 100; arXiv API well-formed feed without the entry) — a bare
//   HTTP 404 from a path-handling quirk must not condemn a real paper;
// - author-year strings without a resolvable identifier are 'unverifiable'
//   (Crossref title matching is heuristic → out of scope, stated);
// - for URLs, 'verified' means REACHABLE, not "exists as cited" — a soft-404
//   (200 error page) is not detected; the payload note says so;
// - truncation is REPORTED (extractedTotal/truncated), never silent;
// - existence ≠ support: a real DOI can be cited for a claim it does not
//   back. This surfaces fabrication, not misattribution.
//
// Registry semantics used here should be re-pinned empirically whenever in
// doubt: `node scripts/citation-registry-canary.mjs` (needs open network)
// checks known-good and known-fabricated identifiers against the live
// registries and fails on any mapping drift.

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

// DOI: 10.xxxx/suffix. Suffix charset intentionally broad (incl. + and #
// per Crossref practice); sentence terminators are trimmed afterwards.
const DOI_RE = /\b10\.\d{4,9}\/[-._;()/:+#a-zA-Z0-9]+/g;
// arXiv: modern (2301.12345, optional version) and legacy (cs/0301123) ids,
// prefixed by "arXiv:" to avoid matching bare number-dot-number strings.
const ARXIV_RE = /\barXiv:\s*((?:\d{4}\.\d{4,5}(?:v\d+)?)|(?:[a-z-]+(?:\.[A-Z]{2})?\/\d{7}))/gi;
// URLs (http/https only). Parentheses allowed; unbalanced trailing ones are
// trimmed below (Wikipedia-style "..._(disambiguation)" stays intact).
const URL_RE = /\bhttps?:\/\/[^\s<>"'\]]+/g;
// Author-year: "Name (2020)" / "Name et al. (2020)" / "(Name et al., 2020)".
const AUTHOR_YEAR_RE = /\b([A-Z][A-Za-z-]+)(?:\s+(?:et al\.|and\s+[A-Z][A-Za-z-]+))?\s*[,(]\s*(19|20)\d{2}[a-z]?\s*\)/g;
// Capitalized sentence-starters that precede a bare "(2020)" without being
// author names — filtered to keep the unverifiable bucket meaningful.
const AUTHOR_STOPWORDS = new Set([
  'The', 'In', 'On', 'At', 'By', 'Of', 'For', 'From', 'Since', 'Until',
  'During', 'After', 'Before', 'Around', 'Circa', 'About', 'And', 'But',
]);

const trimTrailing = (s: string) => s.replace(/[.,;:\]]+$/, '');

// Trim trailing ')' only while unbalanced — keeps "..._(disambiguation)".
function trimUnbalancedParens(s: string): string {
  let out = s;
  while (out.endsWith(')')) {
    const opens = (out.match(/\(/g) || []).length;
    const closes = (out.match(/\)/g) || []).length;
    if (closes > opens) out = out.slice(0, -1);
    else break;
  }
  return out;
}

const normalize = (s: string) => trimUnbalancedParens(trimTrailing(s));

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
    push('doi', m[0], normalize(m[0]));
  }
  for (const m of Array.from(text.matchAll(ARXIV_RE))) {
    push('arxiv', m[0], m[1]);
  }
  for (const m of Array.from(text.matchAll(URL_RE))) {
    const id = normalize(m[0]);
    // Registry URLs route to their registry kind. Query/fragment are
    // stripped BEFORE matching so "?x" cannot make a citation vanish.
    const pathOnly = id.replace(/[?#].*$/, '');
    const doiInUrl = pathOnly.match(/doi\.org\/(10\.\d{4,9}\/[-._;()/:+#a-zA-Z0-9]+)/);
    const arxivInUrl = pathOnly.match(/arxiv\.org\/(?:abs|pdf)\/([^\s]+?)(?:\.pdf)?$/i);
    if (doiInUrl) push('doi', m[0], normalize(doiInUrl[1]));
    else if (arxivInUrl) push('arxiv', m[0], arxivInUrl[1]);
    else push('url', m[0], id);
  }
  for (const m of Array.from(text.matchAll(AUTHOR_YEAR_RE))) {
    if (AUTHOR_STOPWORDS.has(m[1])) continue;
    push('author-year', m[0], trimTrailing(m[0]));
  }
  return out;
}

// ── SSRF guard (URL kind only — registry hosts are fixed) ──────────────────
//
// The verifier fetches URLs extracted from response text, which can be
// attacker-influenced. Defense in depth: scheme/port allowlist, literal
// private/loopback/link-local/metadata addresses denied, redirects NOT
// followed (a public→internal redirect is the classic bypass). Residual
// risk, stated: DNS names resolving to private ranges (DNS rebinding) are
// not resolved-and-pinned here; the fetch exposes only {status}, never a
// body, so this remains a blind reachability oracle at worst.

function isDeniedHost(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.local') || h.endsWith('.internal')) return true;
  if (h === '::1' || h === '0.0.0.0' || h === '::') return true;
  const v4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const [a, b] = [Number(v4[1]), Number(v4[2])];
    if (a === 127 || a === 10 || a === 0) return true;                 // loopback, RFC1918, "this net"
    if (a === 169 && b === 254) return true;                           // link-local / cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true;                  // RFC1918
    if (a === 192 && b === 168) return true;                           // RFC1918
    if (a === 100 && b >= 64 && b <= 127) return true;                 // CGNAT
  }
  if (/^(fe80:|fc|fd)/.test(h)) return true;                           // IPv6 link-local / ULA
  return false;
}

export function urlAllowed(rawUrl: string): boolean {
  let u: URL;
  try {
    u = new URL(rawUrl);
  } catch {
    return false;
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
  if (u.username || u.password) return false;
  const port = u.port ? Number(u.port) : u.protocol === 'https:' ? 443 : 80;
  if (port !== 80 && port !== 443) return false;
  return !isDeniedHost(u.hostname);
}

// ── Verification ───────────────────────────────────────────────────────────

export type CitationStatus = 'verified' | 'not_found' | 'unverifiable' | 'network_error' | 'blocked';

export interface VerifiedCitation extends ExtractedCitation {
  status: CitationStatus;
  /** Where the check was made (registry endpoint) — absent for unverifiable/blocked. */
  checkedAgainst?: string;
}

export interface CitationVerificationResult {
  /** True whenever the verifier RAN (even on zero extracted citations). */
  ran: true;
  citations: VerifiedCitation[];
  totals: {
    /** Citations actually checked (post-cap). */
    total: number;
    /** Citations extracted BEFORE the cap — never silently different. */
    extractedTotal: number;
    /** True when extractedTotal > total: the tail was NOT checked. */
    truncated: boolean;
    verified: number;
    notFound: number;
    unverifiable: number;
    networkErrors: number;
    blocked: number;
  };
  /** Human summary of what this result does and does not establish. */
  note: string;
}

export interface FetchLikeResponse {
  status: number;
  ok: boolean;
  /** Response body — required for registry-confirmed semantics. */
  text(): Promise<string>;
}
export type FetchLike = (url: string, init?: {
  method?: string;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  redirect?: 'manual' | 'follow' | 'error';
}) => Promise<FetchLikeResponse>;

const MAX_CITATIONS = 20;
const TIMEOUT_MS = 5_000;
const CONCURRENCY = 4;

const RESULT_NOTE =
  'Existence checks against public registries (doi.org handle API and arXiv API, both via body parsing — not_found requires a registry-confirmed negative). For plain URLs, verified means REACHABLE only (a 200 error page is not detected); redirects are not followed. Existence does not mean the source SUPPORTS the claim; author-year strings without identifiers are unverifiable by a deterministic checker. Truncation, when the cap is hit, is reported in totals — never silent.';

const UA = { 'user-agent': 'caims-citation-verifier (research; +github.com/pixelstrade-dev)' };

async function checkDoi(c: ExtractedCitation, fetchImpl: FetchLike, signal: AbortSignal): Promise<VerifiedCitation> {
  // Path segments encoded WITHOUT touching '/' — %2F breaks handle proxies.
  const url = `https://doi.org/api/handles/${c.id.split('/').map(encodeURIComponent).join('/')}`;
  try {
    const res = await fetchImpl(url, { method: 'GET', signal, headers: UA, redirect: 'manual' });
    // Primary evidence: the handle API body (responseCode 1 = found,
    // 100 = handle not found, 200 = handle exists without values).
    try {
      const body = JSON.parse(await res.text());
      if (body && typeof body.responseCode === 'number') {
        if (body.responseCode === 1 || body.responseCode === 200) return { ...c, status: 'verified', checkedAgainst: url };
        if (body.responseCode === 100) return { ...c, status: 'not_found', checkedAgainst: url };
      }
    } catch { /* fall through to status heuristics */ }
    // Without a parseable registry body, only a confident positive is safe:
    // a bare 404 could be a path-handling quirk, so it maps to network_error.
    if (res.ok) return { ...c, status: 'verified', checkedAgainst: url };
    return { ...c, status: 'network_error', checkedAgainst: url };
  } catch {
    return { ...c, status: 'network_error', checkedAgainst: url };
  }
}

async function checkArxiv(c: ExtractedCitation, fetchImpl: FetchLike, signal: AbortSignal): Promise<VerifiedCitation> {
  // The documented deterministic endpoint. Returns HTTP 200 for found AND
  // not-found — the Atom body is the evidence, never the status code.
  const url = `https://export.arxiv.org/api/query?id_list=${encodeURIComponent(c.id)}&max_results=1`;
  try {
    const res = await fetchImpl(url, { method: 'GET', signal, headers: UA, redirect: 'manual' });
    if (!res.ok) return { ...c, status: 'network_error', checkedAgainst: url };
    const body = await res.text();
    if (!/<feed[\s>]/.test(body)) return { ...c, status: 'network_error', checkedAgainst: url };
    const bareId = c.id.replace(/v\d+$/, '');
    // Positive: an entry whose id is the paper's abs URL.
    if (body.includes(`arxiv.org/abs/${bareId}`)) return { ...c, status: 'verified', checkedAgainst: url };
    // Registry-confirmed negative: a well-formed feed that answers with an
    // explicit error entry or no matching entry for the requested id.
    if (/arxiv\.org\/api\/errors/i.test(body) || /<opensearch:totalResults[^>]*>0</.test(body) || !/<entry[\s>]/.test(body)) {
      return { ...c, status: 'not_found', checkedAgainst: url };
    }
    // A feed with entries that do not echo the id: ambiguous — never condemn.
    return { ...c, status: 'network_error', checkedAgainst: url };
  } catch {
    return { ...c, status: 'network_error', checkedAgainst: url };
  }
}

async function checkUrl(c: ExtractedCitation, fetchImpl: FetchLike, signal: AbortSignal): Promise<VerifiedCitation> {
  if (!urlAllowed(c.id)) return { ...c, status: 'blocked' };
  try {
    const res = await fetchImpl(c.id, { method: 'HEAD', signal, headers: UA, redirect: 'manual' });
    if (res.status === 404 || res.status === 410) return { ...c, status: 'not_found', checkedAgainst: c.id };
    // Reachable (2xx) or redirecting (3xx — NOT followed): the URL exists as
    // an endpoint. This is reachability, not content verification.
    if (res.ok || (res.status >= 300 && res.status < 400)) return { ...c, status: 'verified', checkedAgainst: c.id };
    return { ...c, status: 'network_error', checkedAgainst: c.id };
  } catch {
    return { ...c, status: 'network_error', checkedAgainst: c.id };
  }
}

async function checkOne(c: ExtractedCitation, fetchImpl: FetchLike): Promise<VerifiedCitation> {
  if (c.kind === 'author-year') return { ...c, status: 'unverifiable' };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    if (c.kind === 'doi') return await checkDoi(c, fetchImpl, controller.signal);
    if (c.kind === 'arxiv') return await checkArxiv(c, fetchImpl, controller.signal);
    return await checkUrl(c, fetchImpl, controller.signal);
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
  const extractedAll = extractCitations(text);
  const extracted = extractedAll.slice(0, MAX_CITATIONS);

  const results: VerifiedCitation[] = [];
  // Bounded concurrency: external registries, be polite.
  for (let i = 0; i < extracted.length; i += CONCURRENCY) {
    const chunk = extracted.slice(i, i + CONCURRENCY);
    results.push(...await Promise.all(chunk.map(c => checkOne(c, fetchImpl))));
  }

  const totals = {
    total: results.length,
    extractedTotal: extractedAll.length,
    truncated: extractedAll.length > results.length,
    verified: results.filter(r => r.status === 'verified').length,
    notFound: results.filter(r => r.status === 'not_found').length,
    unverifiable: results.filter(r => r.status === 'unverifiable').length,
    networkErrors: results.filter(r => r.status === 'network_error').length,
    blocked: results.filter(r => r.status === 'blocked').length,
  };

  if (totals.notFound > 0) {
    logger.warn('Citation verification found non-existent references', {
      notFound: totals.notFound,
      ids: results.filter(r => r.status === 'not_found').map(r => r.id),
    });
  }
  if (totals.truncated) {
    logger.warn('Citation verification truncated — tail NOT checked', {
      extracted: totals.extractedTotal, checked: totals.total,
    });
  }

  return { ran: true, citations: results, totals, note: RESULT_NOTE };
}

/**
 * Whether a verification run actually ESTABLISHED deterministic facts —
 * the only condition under which it may lift the evidence level. A run
 * where every check failed on the network, or whose tail was truncated,
 * established nothing (or not everything) and must not upgrade the label.
 */
export function verificationEffective(r: CitationVerificationResult): boolean {
  if (r.totals.truncated) return false;
  if (r.totals.total === 0) return true; // nothing to check — trivially complete
  return r.totals.networkErrors < r.totals.total;
}
