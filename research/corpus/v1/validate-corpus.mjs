#!/usr/bin/env node
// Structural validator for corpus v1. Zero dependencies — runs in CI so a
// corpus that drifts from its preregistered design fails the build.
//
// The design is preregistered in README.md (this directory): 6 strata,
// 250 items, 28% adversarial, bounds policy, no-citation rule for
// positives, reserved 10.5555/ prefix for invented DOIs. This validator
// enforces the checkable parts of that contract.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));

const STRATA = [
  { file: 'S1-technical-software.json', kind: 'positive', size: 45, prefix: 's1-' },
  { file: 'S2-science-medicine.json', kind: 'positive', size: 45, prefix: 's2-' },
  { file: 'S3-humanities-social.json', kind: 'positive', size: 45, prefix: 's3-' },
  { file: 'S4-everyday-reasoning.json', kind: 'positive', size: 45, prefix: 's4-' },
  { file: 'S5-adversarial-fluent.json', kind: 'adversarial', size: 35, prefix: 's5-' },
  { file: 'S6-adversarial-epistemic.json', kind: 'adversarial', size: 35, prefix: 's6-' },
];

const S5_TYPES = ['eloquent_nonsense', 'keyword_stuffing', 'verbose_non_answer', 'canned_self_reflection', 'sycophantic_agreement', 'style_over_substance', 'off_topic_eloquence'];
const S6_TYPES = ['fake_citations', 'confident_hallucination', 'self_contradiction', 'false_precision', 'misattribution', 'unfounded_certainty', 'subtle_error'];
const HIGH_BOUND_TYPES = new Set(['subtle_error', 'false_precision']);

let failures = 0;
let warnings = 0;
const fail = (file, msg) => { failures++; console.error(`FAIL ${file}: ${msg}`); };
const warn = (file, msg) => { warnings++; console.error(`warn ${file}: ${msg}`); };

const wordCount = (s) => s.trim().split(/\s+/).length;
// Citation heuristics for positive responses: DOIs, "et al.", author-year
// parentheticals. Bare years like "in 1969" are fine; "(Smith, 1969)" is not.
const CITATION_PATTERNS = [
  { re: /\b10\.\d{4,}\//, label: 'DOI-like string' },
  { re: /\bdoi\.org\b/i, label: 'doi.org link' },
  { re: /\bet al\.?\b/i, label: '"et al." reference' },
  { re: /\([A-Z][A-Za-z-]+(?: & [A-Z][A-Za-z-]+)?,? \d{4}\)/, label: 'author-year citation' },
];

const allIds = new Map(); // id -> file
let total = 0;
let adversarial = 0;

for (const stratum of STRATA) {
  const p = path.join(DIR, stratum.file);
  if (!fs.existsSync(p)) { fail(stratum.file, 'missing stratum file'); continue; }
  let data;
  try { data = JSON.parse(fs.readFileSync(p, 'utf-8')); }
  catch (e) { fail(stratum.file, `invalid JSON: ${e.message}`); continue; }

  if (data.kind !== stratum.kind) fail(stratum.file, `kind must be "${stratum.kind}" (got ${JSON.stringify(data.kind)})`);
  if (!Array.isArray(data.items)) { fail(stratum.file, 'missing items array'); continue; }
  if (data.items.length !== stratum.size) {
    fail(stratum.file, `preregistered size is ${stratum.size} items (got ${data.items.length})`);
  }

  const typeCounts = new Map();
  let plainCorrect = 0;

  for (const item of data.items) {
    total++;
    const id = String(item.id ?? '');
    if (!id.startsWith(stratum.prefix)) fail(stratum.file, `${id || '(missing id)'}: id must start with "${stratum.prefix}"`);
    if (allIds.has(id)) fail(stratum.file, `${id}: duplicate id (also in ${allIds.get(id)})`);
    allIds.set(id, stratum.file);

    for (const field of ['question', 'response', 'rationale']) {
      if (typeof item[field] !== 'string' || item[field].trim() === '') fail(stratum.file, `${id}: missing/empty ${field}`);
    }
    if (typeof item.expected !== 'object' || item.expected === null) { fail(stratum.file, `${id}: missing expected bounds`); continue; }

    if (stratum.kind === 'positive') {
      if (item.control_type !== undefined) fail(stratum.file, `${id}: positive items must not carry control_type`);
      const min = item.expected.minComposite;
      if (typeof min !== 'number') { fail(stratum.file, `${id}: positive items need expected.minComposite`); continue; }
      const isPlain = /^plain-correct:/.test(item.rationale ?? '');
      if (isPlain) {
        plainCorrect++;
        if (min !== 45) fail(stratum.file, `${id}: plain-correct bound must be exactly 45 (got ${min})`);
        const wc = wordCount(item.response ?? '');
        if (wc < 20 || wc > 100) warn(stratum.file, `${id}: plain-correct response is ${wc} words (target 30–80)`);
      } else {
        if (min < 55 || min > 65) fail(stratum.file, `${id}: strong-positive minComposite must be 55–65 (got ${min})`);
        const wc = wordCount(item.response ?? '');
        if (wc < 60 || wc > 300) warn(stratum.file, `${id}: strong response is ${wc} words (target 80–250)`);
      }
      for (const { re, label } of CITATION_PATTERNS) {
        if (re.test(item.response ?? '')) fail(stratum.file, `${id}: positive response contains a ${label} (no-citation rule)`);
      }
    } else {
      adversarial++;
      const type = String(item.control_type ?? '');
      const validTypes = stratum.prefix === 's5-' ? S5_TYPES : S6_TYPES;
      if (!validTypes.includes(type)) fail(stratum.file, `${id}: invalid control_type ${JSON.stringify(type)}`);
      typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
      const max = item.expected.maxComposite;
      if (typeof max !== 'number') { fail(stratum.file, `${id}: adversarial items need expected.maxComposite`); continue; }
      const cap = HIGH_BOUND_TYPES.has(type) ? 50 : 45;
      if (max < 35 || max > cap) fail(stratum.file, `${id}: maxComposite must be 35–${cap} for ${type} (got ${max})`);
      // Invented DOIs must be un-registrable: reserved example prefix only.
      const dois = (item.response ?? '').match(/\b10\.\d{4,}\/[^\s"')\]]+/g) ?? [];
      for (const doi of dois) {
        if (!doi.startsWith('10.5555/')) fail(stratum.file, `${id}: invented DOI ${doi} must use the reserved 10.5555/ prefix`);
      }
      if (stratum.prefix === 's5-' && dois.length > 0) fail(stratum.file, `${id}: S5 items must not contain DOI-like strings (fabrication is S6's job)`);
    }
  }

  if (stratum.kind === 'positive' && data.items.length === stratum.size && plainCorrect !== 9) {
    fail(stratum.file, `preregistered plain-correct count is 9 (got ${plainCorrect})`);
  }
  if (stratum.kind === 'adversarial' && data.items.length === stratum.size) {
    const validTypes = stratum.prefix === 's5-' ? S5_TYPES : S6_TYPES;
    for (const t of validTypes) {
      if ((typeCounts.get(t) ?? 0) !== 5) fail(stratum.file, `control_type ${t}: preregistered count is 5 (got ${typeCounts.get(t) ?? 0})`);
    }
  }
}

if (total > 0) {
  const frac = adversarial / total;
  if (frac < 0.25 || frac > 0.30) {
    fail('(corpus)', `adversarial fraction ${adversarial}/${total} = ${(frac * 100).toFixed(1)}% outside the preregistered 25–30%`);
  }
}

if (failures > 0) {
  console.error(`\ncorpus v1 INVALID: ${failures} failure(s), ${warnings} warning(s) across ${total} item(s)`);
  process.exit(1);
}
console.log(`corpus v1 OK: ${total} items across ${STRATA.length} strata (${adversarial} adversarial = ${((adversarial / total) * 100).toFixed(1)}%), ${warnings} warning(s)`);
