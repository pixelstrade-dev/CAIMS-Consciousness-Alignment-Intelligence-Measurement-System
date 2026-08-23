import { extractCitations, verifyCitations, verificationEffective, FetchLike } from '../citations';

jest.mock('@/lib/logger', () => ({
  logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

const resp = (status: number, body = '') => ({
  status, ok: status >= 200 && status < 300, text: async () => body,
});
const HANDLE_FOUND = JSON.stringify({ responseCode: 1, handle: 'x' });
const HANDLE_MISSING = JSON.stringify({ responseCode: 100 });
const arxivFeedWith = (id: string) =>
  `<feed xmlns="http://www.w3.org/2005/Atom"><entry><id>http://arxiv.org/abs/${id}v1</id></entry></feed>`;
const ARXIV_EMPTY = '<feed xmlns="http://www.w3.org/2005/Atom"><opensearch:totalResults>0</opensearch:totalResults></feed>';

describe('extractCitations', () => {
  it('extracts DOIs, arXiv ids, URLs and author-year strings', () => {
    const text = `As shown by Butlin et al. (2023) and in arXiv:2308.08708,
      see https://doi.org/10.1038/s41586-025-08888-1 and the docs at
      https://example.com/paper.pdf. Also DOI 10.5281/zenodo.22069134.`;
    const found = extractCitations(text);
    const byKind = (k: string) => found.filter(c => c.kind === k).map(c => c.id);
    expect(byKind('doi')).toEqual(expect.arrayContaining(['10.1038/s41586-025-08888-1', '10.5281/zenodo.22069134']));
    expect(byKind('arxiv')).toEqual(['2308.08708']);
    expect(byKind('url')).toEqual(['https://example.com/paper.pdf']);
    expect(byKind('author-year')).toHaveLength(1);
  });

  it('routes doi.org and arxiv.org URLs to their registry kind BY PARSED HOSTNAME', () => {
    const found = extractCitations('https://doi.org/10.1000/xyz and https://arxiv.org/abs/2306.05685');
    expect(found.map(c => c.kind).sort()).toEqual(['arxiv', 'doi']);
  });

  it('substring hosts cannot masquerade as registries: evil.com/doi.org/... URLs stay generic', () => {
    const found = extractCitations('https://evil.com/doi.org/10.1000/fake and https://evil.com/arxiv.org/abs/1234.56789');
    // The URLs themselves are generic (never registry-routed off a substring
    // host). The DOI-shaped string inside is still text-extracted — and gets
    // checked against the REAL doi.org registry, which is the desired veto.
    const urls = found.filter(c => c.kind === 'url');
    expect(urls).toHaveLength(2);
    expect(found.some(c => c.kind === 'arxiv')).toBe(false);
    const dois = found.filter(c => c.kind === 'doi');
    expect(dois.map(c => c.id)).toEqual(['10.1000/fake']);
  });

  it('EVASION FIX: arXiv URL with a query string is still checked, never vanishes', () => {
    const found = extractCitations('https://arxiv.org/abs/2308.08708?context=cs');
    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({ kind: 'arxiv', id: '2308.08708' });
  });

  it('keeps balanced parentheses in URLs (Wikipedia-style), trims unbalanced ones', () => {
    const found = extractCitations('See https://en.wikipedia.org/wiki/Turing_(disambiguation) (a page).');
    const url = found.find(c => c.kind === 'url')!;
    expect(url.id).toBe('https://en.wikipedia.org/wiki/Turing_(disambiguation)');
  });

  it('legacy arXiv ids and spaced "arXiv:  1234.5678" both extract', () => {
    const found = extractCitations('arXiv:cs/0301123 and arXiv:  2308.08708');
    expect(found.map(c => c.id)).toEqual(['cs/0301123', '2308.08708']);
  });

  it('sentence-starter false positives are filtered from author-year', () => {
    const found = extractCitations('The (2020) revision. In (2021) it changed. Smith (2020) disagreed.');
    const ay = found.filter(c => c.kind === 'author-year');
    expect(ay).toHaveLength(1);
    expect(ay[0].raw).toContain('Smith');
  });

  it('deduplicates and does not match bare number-dot-number as arXiv', () => {
    expect(extractCitations('See 10.1000/abc. And again: 10.1000/abc.')).toHaveLength(1);
    expect(extractCitations('version 2301.12345 of the firmware')).toHaveLength(0);
  });
});

describe('verifyCitations (stub fetch — no network)', () => {
  it('DOI: handle API body is the evidence — responseCode 1 verified, 100 not_found', async () => {
    const fetchImpl: FetchLike = async (url) =>
      resp(200, url.includes('fake') ? HANDLE_MISSING : HANDLE_FOUND);
    const res = await verifyCitations('Real: 10.1000/real. Fake: 10.1000/fake.', fetchImpl);
    const byId = Object.fromEntries(res.citations.map(c => [c.id, c.status]));
    expect(byId['10.1000/real']).toBe('verified');
    expect(byId['10.1000/fake']).toBe('not_found');
  });

  it('DOI: the request path keeps "/" un-encoded (a %2F would break handle proxies)', async () => {
    const urls: string[] = [];
    await verifyCitations('10.1000/sub/path.x', async (u) => { urls.push(u); return resp(200, HANDLE_FOUND); });
    expect(urls[0]).toContain('/api/handles/10.1000/sub/path.x');
    expect(urls[0]).not.toContain('%2F');
  });

  it('DOI: a bare 404 WITHOUT a registry body never condemns — network_error, not not_found', async () => {
    const res = await verifyCitations('10.1000/maybe', async () => resp(404, 'not json'));
    expect(res.citations[0].status).toBe('network_error');
  });

  it('DOI: an unparseable HTTP 200 (captive portal) is NEVER verified — network_error', async () => {
    const res = await verifyCitations('10.1000/behind-portal',
      async () => resp(200, '<html>Captive portal login</html>'));
    expect(res.citations[0].status).toBe('network_error');
  });

  it('DOI: an unexpected responseCode is ambiguous — network_error', async () => {
    const res = await verifyCitations('10.1000/weird',
      async () => resp(200, JSON.stringify({ responseCode: 2 })));
    expect(res.citations[0].status).toBe('network_error');
  });

  it('DOI: a doi.org URL with a fragment checks the DOI WITHOUT the fragment (no manufactured handle)', () => {
    const found = extractCitations('https://doi.org/10.1234/abc.def#results');
    const dois = found.filter(c => c.kind === 'doi').map(c => c.id);
    expect(dois).toEqual(['10.1234/abc.def']);
  });

  it('arXiv: uses the api/query endpoint and parses the feed — echo verified, empty feed not_found', async () => {
    const urls: string[] = [];
    const fetchImpl: FetchLike = async (u) => {
      urls.push(u);
      return resp(200, u.includes('9999.99999') ? ARXIV_EMPTY : arxivFeedWith('2308.08708'));
    };
    const res = await verifyCitations('arXiv:2308.08708 and arXiv:9999.99999', fetchImpl);
    const byId = Object.fromEntries(res.citations.map(c => [c.id, c.status]));
    expect(urls[0]).toContain('export.arxiv.org/api/query?id_list=');
    expect(byId['2308.08708']).toBe('verified');
    expect(byId['9999.99999']).toBe('not_found');
  });

  it('arXiv: an ambiguous 200 (feed with non-matching entries) never condemns', async () => {
    const res = await verifyCitations('arXiv:2308.08708',
      async () => resp(200, arxivFeedWith('1111.11111')));
    expect(res.citations[0].status).toBe('network_error');
  });

  it('arXiv: a well-formed feed WITHOUT explicit totalResults=0 evidence never condemns', async () => {
    const res = await verifyCitations('arXiv:2308.08708',
      async () => resp(200, '<feed xmlns="http://www.w3.org/2005/Atom"></feed>'));
    expect(res.citations[0].status).toBe('network_error');
  });

  it('NEVER verified on network failure — thrown fetch, 5xx and 429 are network_error', async () => {
    const seq: Array<'throw' | number> = ['throw', 500, 429];
    let i = 0;
    const res = await verifyCitations('A: 10.1000/a B: 10.1000/b C: 10.1000/c', async () => {
      const s = seq[i++];
      if (s === 'throw') throw new Error('down');
      return resp(s, '');
    });
    expect(res.citations.every(c => c.status === 'network_error')).toBe(true);
    expect(res.totals).toMatchObject({ verified: 0, notFound: 0, networkErrors: 3 });
  });

  it('plain URLs are NEVER fetched — unverifiable by design (SSRF surface removed)', async () => {
    const fetched: string[] = [];
    const res = await verifyCitations(
      'See https://example.com/paper and http://169.254.169.254/latest/meta-data',
      async (u) => { fetched.push(u); return resp(200, HANDLE_FOUND); }
    );
    expect(fetched).toHaveLength(0);
    expect(res.citations.every(c => c.status === 'unverifiable')).toBe(true);
  });

  it('only fixed-host registry URLs are ever contacted (doi.org / export.arxiv.org)', async () => {
    const fetched: string[] = [];
    await verifyCitations('10.1000/x and arXiv:2308.08708 and https://example.com/y',
      async (u) => { fetched.push(u); return resp(200, HANDLE_FOUND); });
    expect(fetched.every(u => u.startsWith('https://doi.org/') || u.startsWith('https://export.arxiv.org/'))).toBe(true);
  });

  it('author-year → unverifiable, no fetch; zero citations → ran with empty totals', async () => {
    const calls: string[] = [];
    const spy: FetchLike = async (u) => { calls.push(u); return resp(200, HANDLE_FOUND); };
    const res1 = await verifyCitations('Per Smith et al. (2021), things happen.', spy);
    expect(res1.citations[0].status).toBe('unverifiable');
    expect(calls).toHaveLength(0);
    const res2 = await verifyCitations('No references here.', spy);
    expect(res2.ran).toBe(true);
    expect(res2.totals.total).toBe(0);
  });

  it('TRUNCATION IS REPORTED: 30 extracted → 20 checked, extractedTotal 30, truncated true', async () => {
    const text = Array.from({ length: 30 }, (_, i) => `10.1000/x${i}`).join(' ');
    const res = await verifyCitations(text, async () => resp(200, HANDLE_FOUND));
    expect(res.totals.total).toBe(20);
    expect(res.totals.extractedTotal).toBe(30);
    expect(res.totals.truncated).toBe(true);
  });
});

describe('verificationEffective (the only condition allowing an L3 lift)', () => {
  const base = { ran: true as const, citations: [], note: '' };
  const totals = (over: Partial<{ total: number; extractedTotal: number; truncated: boolean; verified: number; notFound: number; unverifiable: number; networkErrors: number }>) => ({
    total: 0, extractedTotal: 0, truncated: false, verified: 0, notFound: 0,
    unverifiable: 0, networkErrors: 0, ...over,
  });

  it('zero citations → effective (trivially complete)', () => {
    expect(verificationEffective({ ...base, totals: totals({}) })).toBe(true);
  });
  it('all network errors → NOT effective (established nothing)', () => {
    expect(verificationEffective({ ...base, totals: totals({ total: 3, extractedTotal: 3, networkErrors: 3 }) })).toBe(false);
  });
  it('all unverifiable (author-year only) → NOT effective', () => {
    expect(verificationEffective({ ...base, totals: totals({ total: 3, extractedTotal: 3, unverifiable: 3 }) })).toBe(false);
  });
  it('truncated → NOT effective (the tail was never checked)', () => {
    expect(verificationEffective({ ...base, totals: totals({ total: 20, extractedTotal: 30, truncated: true, verified: 20 }) })).toBe(false);
  });
  it('at least one non-network outcome and no truncation → effective', () => {
    expect(verificationEffective({ ...base, totals: totals({ total: 3, extractedTotal: 3, verified: 1, networkErrors: 2 }) })).toBe(true);
  });
});
