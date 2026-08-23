#!/usr/bin/env node
// Registry canary for the deterministic citation verifier (Phase A4).
//
// The verifier's not_found/verified mappings encode assumptions about live
// registry behavior (doi.org handle API responseCode semantics; arXiv API
// Atom feeds). This script pins those assumptions EMPIRICALLY against known
// -good and known-fabricated identifiers, and exits 1 on any drift. Run it
// from a machine with open network (the CI proxy blocks these hosts):
//
//   node scripts/citation-registry-canary.mjs
//
// Canaries:
//   GOOD doi   10.5281/zenodo.22069134   (this project's own concept DOI)
//   FAKE doi   10.5281/zenodo.99999999999
//   GOOD arxiv 2308.08708               (Butlin et al.)
//   FAKE arxiv 9999.99999

const checks = [
  { kind: 'doi', id: '10.5281/zenodo.22069134', expect: 'verified' },
  { kind: 'doi', id: '10.5281/zenodo.99999999999', expect: 'not_found' },
  { kind: 'arxiv', id: '2308.08708', expect: 'verified' },
  { kind: 'arxiv', id: '9999.99999', expect: 'not_found' },
];

async function checkDoi(id) {
  const url = `https://doi.org/api/handles/${id.split('/').map(encodeURIComponent).join('/')}`;
  const res = await fetch(url, { redirect: 'manual' });
  const body = await res.json().catch(() => null);
  if (body && typeof body.responseCode === 'number') {
    if (body.responseCode === 1 || body.responseCode === 200) return 'verified';
    if (body.responseCode === 100) return 'not_found';
  }
  return `ambiguous (http ${res.status}, responseCode ${body?.responseCode})`;
}

async function checkArxiv(id) {
  const url = `https://export.arxiv.org/api/query?id_list=${encodeURIComponent(id)}&max_results=1`;
  const res = await fetch(url, { redirect: 'manual' });
  if (!res.ok) return `ambiguous (http ${res.status})`;
  const body = await res.text();
  const bare = id.replace(/v\d+$/, '');
  if (body.includes(`arxiv.org/abs/${bare}`)) return 'verified';
  if (/arxiv\.org\/api\/errors/i.test(body) || /<opensearch:totalResults[^>]*>0</.test(body)) return 'not_found';
  return 'ambiguous (feed without matching entry)';
}

let failures = 0;
for (const c of checks) {
  try {
    const got = c.kind === 'doi' ? await checkDoi(c.id) : await checkArxiv(c.id);
    const ok = got === c.expect;
    if (!ok) failures++;
    console.log(`${ok ? 'OK  ' : 'FAIL'} ${c.kind} ${c.id}: expected ${c.expect}, got ${got}`);
  } catch (e) {
    failures++;
    console.log(`FAIL ${c.kind} ${c.id}: ${e.message}`);
  }
}
if (failures > 0) {
  console.error(`\ncanary FAILED: ${failures} mismatch(es) — the verifier's registry assumptions have drifted; fix lib/verifiers/citations.ts before trusting not_found/verified.`);
  process.exit(1);
}
console.log('\ncanary OK: registry semantics match the verifier assumptions');
