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
// - plain URLs are NEVER fetched (SSRF surface; reachability ≠ existence):
//   they are listed 'unverifiable' for human review — only the fixed-host
//   registries (doi.org, export.arxiv.org) are ever contacted;
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

// DOI: 10.xxxx/suffix. '#' deliberately EXCLUDED: URL fragments are not part
// of a DOI, and including it manufactured nonexistent handles from
// "doi.org/10.x/y#section" links (false not_found on real papers).
const DOI_RE = /\b10\.\d{4,9}\/[-._;()/:+a-zA-Z0-9]+/g;
// arXiv: modern (2301.12345, optional version) and legacy (cs/0301123) ids,
// prefixed by "arXiv:" to avoid matching bare number-dot-number strings.
const ARXIV_RE = /\barXiv:\s*((?:\d{4}\.\d{4,5}(?:v\d+)?)|(?:[a-z-]+(?:\.[A-Z]{2})?\/\d{7}))/gi;
// URLs (http/https only). Parentheses allowed; unbalanced trailing ones are
// trimmed below (Wikipedia-style "..._(disambiguation)" stays intact).
const URL_RE = /\bhttps?:\/\/[^\s<>"'\]]+/g;
// Author-year: "Name (2020)" / "Name et al. (2020)" / "(Name et al., 2020)".
const AUTHOR_YEAR_RE = /\b([A-Z][A-Za-z-]{1,30})(?: (?:et al\.|and [A-Z][A-Za-z-]{1,30}))? ?[,(] ?(?:19|20)\d{2}[a-z]? ?\)/g;
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
    // Registry routing by PARSED HOSTNAME — a substring match would let
    // "evil.com/doi.org/10.x/fake" masquerade as a registry URL. Query and
    // fragment are ignored so "?x" cannot make a citation vanish.
    let host = '';
    let pathname = '';
    try {
      const u = new URL(id);
      host = u.hostname.toLowerCase().replace(/^www\./, '');
      pathname = u.pathname;
    } catch { /* not a parseable URL — treated as generic below */ }
    if (host === 'doi.org' || host === 'dx.doi.org') {
      const doiInUrl = pathname.match(/^\/(10\.\d{4,9}\/[-._;()/:+a-zA-Z0-9]+)/);
      if (doiInUrl) { push('doi', m[0], normalize(doiInUrl[1])); continue; }
    }
    if (host === 'arxiv.org' || host === 'export.arxiv.org') {
      const arxivInUrl = pathname.replace(/\.pdf$/i, '').match(/^\/(?:abs|pdf)\/(.+)$/i);
      if (arxivInUrl) { push('arxiv', m[0], arxivInUrl[1]); continue; }
    }
    push('url', m[0], id);
  }
  for (const m of Array.from(text.matchAll(AUTHOR_YEAR_RE))) {
    if (AUTHOR_STOPWORDS.has(m[1])) continue;
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
  'Existence checks against public registries only (doi.org handle API and arXiv API, both via body parsing — not_found requires a registry-confirmed negative; redirects are not followed). Plain URLs and author-year strings are NOT fetched and are listed unverifiable for human review: fetching response-controlled URLs is an SSRF surface, and reachability never meant existence-as-cited. Existence does not mean the source SUPPORTS the claim. Truncation, when the cap is hit, is reported in totals — never silent.';

const UA = { 'user-agent': 'caims-citation-verifier (research; +github.com/pixelstrade-dev)' };

// Structural validators — an id that fails these is REFUSED (unverifiable),
// never fetched: no '.'/'..' path segments can reach the handle API, and no
// unvalidated string from URL routing reaches a registry query.
const DOI_SEGMENT_RE = /^[-._;():+a-zA-Z0-9]+$/;
export function isWellFormedDoi(id: string): boolean {
  if (!/^10\.\d{4,9}\//.test(id)) return false;
  const segments = id.split('/').slice(1);
  if (segments.length === 0) return false;
  return segments.every(s => s.length > 0 && s !== '.' && s !== '..' && DOI_SEGMENT_RE.test(s));
}
const ARXIV_ID_RE = /^(?:\d{4}\.\d{4,5}(?:v\d+)?|[a-z-]+(?:\.[A-Z]{2})?\/\d{7}(?:v\d+)?)$/;
export function isWellFormedArxivId(id: string): boolean {
  return ARXIV_ID_RE.test(id);
}

async function checkDoi(c: ExtractedCitation, fetchImpl: FetchLike, signal: AbortSignal): Promise<VerifiedCitation> {
  // Path segments encoded WITHOUT touching '/' — %2F breaks handle proxies.
  const url = `https://doi.org/api/handles/${c.id.split('/').map(encodeURIComponent).join('/')}`;
  try {
    const res = await fetchImpl(url, { method: 'GET', signal, headers: UA, redirect: 'manual' });
    // The ONLY evidence is the handle API body (responseCode 1 = found,
    // 100 = handle not found, 200 = handle exists without values). An
    // unparseable or unexpected response — even an HTTP 200 (captive
    // portal, proxy interstitial, maintenance page) — establishes NOTHING
    // in either direction: network_error, never verified, never not_found.
    try {
      const body = JSON.parse(await res.text());
      if (body && typeof body.responseCode === 'number') {
        if (body.responseCode === 1 || body.responseCode === 200) return { ...c, status: 'verified', checkedAgainst: url };
        if (body.responseCode === 100) return { ...c, status: 'not_found', checkedAgainst: url };
      }
    } catch { /* not the registry answering */ }
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
    // Registry-confirmed negative ONLY: an explicit error entry or an
    // explicit totalResults=0. A well-formed feed that merely lacks the
    // entry (degraded service, partial response) is ambiguous and must
    // never condemn a real paper.
    if (/arxiv\.org\/api\/errors/i.test(body) || /<opensearch:totalResults[^>]*>0</.test(body)) {
      return { ...c, status: 'not_found', checkedAgainst: url };
    }
    return { ...c, status: 'network_error', checkedAgainst: url };
  } catch {
    return { ...c, status: 'network_error', checkedAgainst: url };
  }
}

// Plain URLs are NOT fetched, by design: fetching a URL taken from the
// scored response text is a server-side request to an attacker-influenced
// target (SSRF surface), and HTTP reachability never established existence
// as cited anyway (soft-404s are invisible). Only the fixed-host registries
// (doi.org, export.arxiv.org) are ever contacted. URLs are listed for
// human verification instead.
async function checkUrl(c: ExtractedCitation): Promise<VerifiedCitation> {
  return { ...c, status: 'unverifiable' };
}

async function checkOne(c: ExtractedCitation, fetchImpl: FetchLike): Promise<VerifiedCitation> {
  if (c.kind === 'author-year') return { ...c, status: 'unverifiable' };
  // Malformed identifiers are refused, not fetched — a traversal-shaped DOI
  // ('10.1000/../x') or garbage from URL routing must never reach a registry.
  if (c.kind === 'doi' && !isWellFormedDoi(c.id)) return { ...c, status: 'unverifiable' };
  if (c.kind === 'arxiv' && !isWellFormedArxivId(c.id)) return { ...c, status: 'unverifiable' };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    if (c.kind === 'doi') return await checkDoi(c, fetchImpl, controller.signal);
    if (c.kind === 'arxiv') return await checkArxiv(c, fetchImpl, controller.signal);
    return await checkUrl(c);
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
 * the only condition under which it may lift the evidence level.
 *
 * Effective ⇔ not truncated AND (nothing to check, OR at least one
 * registry-confirmed outcome). network_error and unverifiable both
 * establish nothing: a run made only of them (URL/author-year-only
 * citations, registry outage) must not upgrade the label — that would
 * be the dishonest-lift failure in a new costume.
 */
export function verificationEffective(r: CitationVerificationResult): boolean {
  if (r.totals.truncated) return false;
  if (r.totals.total === 0) return true; // nothing to check — trivially complete
  return r.totals.verified + r.totals.notFound > 0;
}
