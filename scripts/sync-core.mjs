#!/usr/bin/env node
// Generates packages/core/src from apps/web/lib (single source of truth),
// transforming `@/lib/...` path aliases into relative imports.
//
// Why generation instead of a workspace dependency (for now): inverting the
// dependency (app -> package) touches Next.js transpilation, Docker, and
// three CI workflows at once. Step 1 ships a publishable package whose
// sources are PROVABLY identical to the app's (this script in --check mode
// runs in CI and fails on any drift). Step 2 (workspace inversion) is
// scheduled in ROADMAP v2.2.
//
// Usage:
//   node scripts/sync-core.mjs          # regenerate packages/core/src
//   node scripts/sync-core.mjs --check  # exit 1 if committed files drift

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_ROOT = path.join(ROOT, 'apps/web/lib');
const DST_ROOT = path.join(ROOT, 'packages/core/src');

// Files owned by the core package. index.ts is handwritten and NOT synced.
const FILES = [
  'logger.ts',
  'adapters/base.ts',
  'adapters/anthropic.ts',
  'adapters/openai.ts',
  'adapters/index.ts',
  'scorers/types.ts',
  'scorers/composite.ts',
  'scorers/prompt-safety.ts',
  'scorers/scoring-engine.ts',
  'emotions/types.ts',
  'emotions/taxonomy.ts',
  'emotions/analyzer.ts',
  'emotions/index.ts',
  'statistics/descriptive.ts',
  'statistics/__tests__/descriptive.test.ts',
  'scorers/__tests__/composite.test.ts',
  'scorers/__tests__/scoring-engine-injection.test.ts',
  'scorers/__tests__/prompt-safety.test.ts',
  'emotions/__tests__/taxonomy.test.ts',
  'emotions/__tests__/analyzer.test.ts',
  'adapters/__tests__/anthropic-temperature.test.ts',
];

const HEADER = '// GENERATED from apps/web/lib — do not edit here. Run: node scripts/sync-core.mjs\n';

function transform(content, relFile) {
  // Replace quoted `@/lib/<subpath>` occurrences (imports, jest.mock,
  // inline import()) with the relative path from this file's directory
  // inside src/. Quote-anchored on purpose: a future prose occurrence of
  // "@/lib" in a comment or error message must not be rewritten silently.
  const fileDir = path.dirname(relFile);
  // A bare quoted '@/lib' (the app barrel) has no meaningful package
  // equivalent — refuse loudly instead of guessing.
  if (/(['"])@\/lib\1/.test(content)) {
    console.error(`sync-core: unsupported bare '@/lib' import in ${relFile}`);
    process.exit(1);
  }
  return content.replace(/(['"])@\/lib\/([A-Za-z0-9_\-./]+)\1/g, (_m, quote, sub) => {
    let rel = path.relative(fileDir === '.' ? '' : fileDir, sub).split(path.sep).join('/');
    if (!rel.startsWith('.')) rel = './' + rel;
    return quote + rel + quote;
  });
}

// Files allowed to exist in packages/core/src without being synced.
const HANDWRITTEN = new Set(['index.ts']);

function listDstFiles() {
  const out = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else out.push(path.relative(DST_ROOT, p).split(path.sep).join('/'));
    }
  };
  if (fs.existsSync(DST_ROOT)) walk(DST_ROOT);
  return out;
}

function generate() {
  const out = new Map();
  for (const rel of FILES) {
    const srcPath = path.join(SRC_ROOT, rel);
    if (!fs.existsSync(srcPath)) {
      console.error(`sync-core: missing source ${srcPath}`);
      process.exit(1);
    }
    const content = fs.readFileSync(srcPath, 'utf8');
    out.set(rel, HEADER + transform(content, rel));
  }
  return out;
}

const check = process.argv.includes('--check');
const generated = generate();

let drift = 0;
for (const [rel, content] of generated) {
  const dstPath = path.join(DST_ROOT, rel);
  if (check) {
    const existing = fs.existsSync(dstPath) ? fs.readFileSync(dstPath, 'utf8') : null;
    if (existing !== content) {
      console.error(`DRIFT: packages/core/src/${rel} differs from apps/web/lib source`);
      drift++;
    }
  } else {
    fs.mkdirSync(path.dirname(dstPath), { recursive: true });
    fs.writeFileSync(dstPath, content);
    console.log(`wrote packages/core/src/${rel}`);
  }
}

if (check) {
  // Orphan sweep: any file in src/ that is neither synced nor declared
  // handwritten would ship unaudited — fail on it.
  const expected = new Set([...FILES, ...HANDWRITTEN]);
  for (const rel of listDstFiles()) {
    if (!expected.has(rel)) {
      console.error(`ORPHAN: packages/core/src/${rel} is neither synced from apps/web/lib nor declared handwritten`);
      drift++;
    }
  }
  if (drift > 0) {
    console.error(`\nsync-core --check: ${drift} file(s) drifted. Run: node scripts/sync-core.mjs`);
    process.exit(1);
  }
  console.log('sync-core --check: no drift');
}
