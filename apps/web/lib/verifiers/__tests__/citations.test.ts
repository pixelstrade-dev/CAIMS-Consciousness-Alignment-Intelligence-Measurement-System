import { extractCitations, verifyCitations, FetchLike } from '../citations';

jest.mock('@/lib/logger', () => ({
  logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

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

  it('routes doi.org and arxiv.org URLs to their registry kind, not generic URL', () => {
    const found = extractCitations('https://doi.org/10.1000/xyz and https://arxiv.org/abs/2306.05685');
    expect(found.map(c => c.kind).sort()).toEqual(['arxiv', 'doi']);
    expect(found.find(c => c.kind === 'arxiv')!.id).toBe('2306.05685');
  });

  it('deduplicates and trims trailing punctuation', () => {
    const found = extractCitations('See 10.1000/abc. And again: 10.1000/abc.');
    expect(found).toHaveLength(1);
    expect(found[0].id).toBe('10.1000/abc');
  });

  it('does not match bare number-dot-number strings as arXiv ids', () => {
    expect(extractCitations('version 2301.12345 of the firmware')).toHaveLength(0);
  });
});

describe('verifyCitations (stub fetch — no network)', () => {
  const fetchWith = (statusFor: (url: string) => number | 'throw'): FetchLike =>
    async (url: string) => {
      const s = statusFor(url);
      if (s === 'throw') throw new Error('network down');
      return { status: s, ok: s >= 200 && s < 300 };
    };

  it('200 → verified, 404 → not_found, per registry endpoint', async () => {
    const res = await verifyCitations(
      'Real: 10.1000/real. Fake: 10.1000/fake. Site: https://example.com/x',
      fetchWith(url => (url.includes('fake') ? 404 : 200))
    );
    const byId = Object.fromEntries(res.citations.map(c => [c.id, c.status]));
    expect(byId['10.1000/real']).toBe('verified');
    expect(byId['10.1000/fake']).toBe('not_found');
    expect(byId['https://example.com/x']).toBe('verified');
    expect(res.totals).toMatchObject({ total: 3, verified: 2, notFound: 1 });
    expect(res.citations.find(c => c.id === '10.1000/real')!.checkedAgainst).toContain('doi.org/api/handles/');
  });

  it('NEVER verified on network failure — thrown fetch and 5xx/429 are network_error', async () => {
    const res = await verifyCitations(
      'A: 10.1000/a B: 10.1000/b C: 10.1000/c',
      fetchWith(url => (url.includes('%2Fa') ? 'throw' : url.includes('%2Fb') ? 500 : 429))
    );
    expect(res.citations.every(c => c.status === 'network_error')).toBe(true);
    expect(res.totals.verified).toBe(0);
    expect(res.totals.notFound).toBe(0);
    expect(res.totals.networkErrors).toBe(3);
  });

  it('author-year strings are unverifiable — no fetch attempted for them', async () => {
    const calls: string[] = [];
    const res = await verifyCitations('Per Smith et al. (2021), things happen.',
      async url => { calls.push(url); return { status: 200, ok: true }; });
    expect(res.citations[0].status).toBe('unverifiable');
    expect(calls).toHaveLength(0);
  });

  it('zero citations still reports ran: true with empty totals', async () => {
    const res = await verifyCitations('No references here.', async () => ({ status: 200, ok: true }));
    expect(res.ran).toBe(true);
    expect(res.totals.total).toBe(0);
  });

  it('3xx counts as verified for URLs (reachable), 410 as not_found', async () => {
    const res = await verifyCitations(
      'https://a.example/moved and https://b.example/gone',
      fetchWith(url => (url.includes('moved') ? 301 : 410))
    );
    const byId = Object.fromEntries(res.citations.map(c => [c.id, c.status]));
    expect(byId['https://a.example/moved']).toBe('verified');
    expect(byId['https://b.example/gone']).toBe('not_found');
  });
});
