#!/usr/bin/env node
// Structural validator for the construct registry. Zero dependencies —
// runs in CI so a card that starts overclaiming fails the build.
//
// Silence is how overclaiming starts: every validity_evidence field must
// be PRESENT ("none" is legal, absence is not), consciousness claims are
// prohibited by construction, and causal claims are locked to false until
// interventional evidence exists.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));

const REQUIRED_STRING = [
  'construct_id', 'name', 'version', 'status', 'measurement_target',
  'observable', 'instrument', 'statistics', 'validity_domain',
];
const REQUIRED_ARRAY = [
  'theory_inspiration', 'allowed_claims', 'prohibited_claims',
  'known_confounds', 'negative_controls', 'positive_controls',
];
const EVIDENCE_FIELDS = ['content', 'convergent', 'discriminant', 'criterion', 'reliability'];

let failures = 0;
const fail = (file, msg) => {
  failures++;
  console.error(`FAIL ${file}: ${msg}`);
};

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort();
if (files.length === 0) {
  console.error('FAIL: no construct cards found');
  process.exit(1);
}

for (const file of files) {
  let card;
  try {
    card = JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf-8'));
  } catch (e) {
    fail(file, `invalid JSON: ${e.message}`);
    continue;
  }

  for (const key of REQUIRED_STRING) {
    if (typeof card[key] !== 'string' || card[key].trim() === '') {
      fail(file, `missing/empty string field "${key}"`);
    }
  }
  for (const key of REQUIRED_ARRAY) {
    if (!Array.isArray(card[key]) || card[key].length === 0) {
      fail(file, `missing/empty array field "${key}"`);
    }
  }

  if (card.construct_id && file !== `${card.construct_id}.json`) {
    fail(file, `filename must equal "${card.construct_id}.json"`);
  }

  // The two hard locks.
  if (card.consciousness_claim !== 'prohibited') {
    fail(file, `consciousness_claim must be exactly "prohibited" (got ${JSON.stringify(card.consciousness_claim)})`);
  }
  if (card.causal_claim !== false) {
    fail(file, `causal_claim must be false until interventional evidence exists (got ${JSON.stringify(card.causal_claim)})`);
  }

  // Theory entries must self-mark as inspiration, never implementation.
  for (const t of card.theory_inspiration ?? []) {
    if (typeof t !== 'string' || !t.toLowerCase().includes('inspiration only, not an implementation')) {
      fail(file, `theory_inspiration entry must carry "(inspiration only, not an implementation)": ${JSON.stringify(t)}`);
    }
  }

  // Every evidence field present — "none" is legal, absence is not.
  const ev = card.validity_evidence;
  if (typeof ev !== 'object' || ev === null) {
    fail(file, 'missing validity_evidence object');
  } else {
    for (const key of EVIDENCE_FIELDS) {
      if (typeof ev[key] !== 'string' || ev[key].trim() === '') {
        fail(file, `validity_evidence.${key} must be present ("none" is a legal value; absence is not)`);
      }
    }
  }

  // sub_dimensions/planned_renames: objects when present.
  for (const key of ['sub_dimensions', 'planned_renames']) {
    if (card[key] !== undefined && (typeof card[key] !== 'object' || card[key] === null || Array.isArray(card[key]))) {
      fail(file, `"${key}" must be an object`);
    }
  }
}

if (failures > 0) {
  console.error(`\nconstruct registry INVALID: ${failures} failure(s) across ${files.length} card(s)`);
  process.exit(1);
}
console.log(`construct registry OK: ${files.length} card(s) validated (${files.join(', ')})`);
