import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['.git', 'node_modules']);
const TEXT = new Set(['.md', '.mjs', '.json', '.html', '.yml', '.yaml', '.mdc', '.cff', '.txt', '']);
const files = [];
(function walk(d) {
  for (const n of readdirSync(d)) {
    if (SKIP.has(n)) continue;
    const p = join(d, n);
    statSync(p).isDirectory() ? walk(p) : files.push(p);
  }
})(ROOT);

test('no em or en dashes in any text file except the linter rules and tests that name them', () => {
  const allowed = new Set([]);
  const bad = [];
  for (const f of files) {
    const rel = f.slice(ROOT.length + 1);
    if (!TEXT.has(extname(f)) || allowed.has(rel)) continue;
    const t = readFileSync(f, 'utf8');
    if (/[\u2013\u2014]/.test(t)) bad.push(rel);
  }
  assert.deepEqual(bad, []);
});

test('markdown relative links resolve', () => {
  const bad = [];
  for (const f of files.filter((x) => x.endsWith('.md'))) {
    for (const m of readFileSync(f, 'utf8').matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
      const t = m[1];
      if (/^[a-z]+:/.test(t) || t.startsWith('#')) continue;
      const target = t.split('#')[0];
      if (target && !existsSync(resolve(dirname(f), target))) bad.push(`${f.slice(ROOT.length + 1)} -> ${t}`);
    }
  }
  assert.deepEqual(bad, []);
});

test('SKILL.md has valid frontmatter and every referenced file exists', () => {
  const text = readFileSync(join(ROOT, 'skills/anti-slop-design/SKILL.md'), 'utf8');
  const fm = /^---\nname: ([a-z-]+)\ndescription: (.+)\n---\n/.exec(text);
  assert.ok(fm, 'frontmatter');
  assert.equal(fm[1], 'anti-slop-design');
  assert.ok(fm[2].length <= 1024);
  for (const m of text.matchAll(/references\/([a-z-]+\.md)/g)) assert.ok(existsSync(join(ROOT, 'skills/anti-slop-design/references', m[1])), m[1]);
});

test('skill and package versions agree with the changelog', () => {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  assert.match(readFileSync(join(ROOT, 'CHANGELOG.md'), 'utf8'), new RegExp(`## \\[${pkg.version.replace(/\./g, '\\.')}\\]`));
});

test('README follows the house structure', () => {
  const r = readFileSync(join(ROOT, 'README.md'), 'utf8');
  assert.equal(r.split('\n')[0], '# anti-slop-design');
  const order = ['**Problem:**', '**For:**', '**Demonstrates:**', '## What it does', '## Install', '## How it works', '## How it is built', '## Design choices', '## Limitations', '## Verification status', '## Roadmap', '## Licence'];
  const pos = order.map((m) => r.indexOf(m));
  assert.ok(pos.every((p) => p >= 0), `missing: ${order.filter((_, i) => pos[i] < 0)}`);
  assert.deepEqual(pos, [...pos].sort((a, b) => a - b));
});

test('README rule counts match rules.json', () => {
  const rules = JSON.parse(readFileSync(join(ROOT, 'skills/anti-slop-design/scripts/rules.json'), 'utf8')).rules;
  const r = readFileSync(join(ROOT, 'README.md'), 'utf8');
  const by = (t) => rules.filter((x) => x.tier === t).length;
  assert.ok(r.includes(`${rules.length} rules`));
  assert.ok(r.includes(`${by('block')} block`) && r.includes(`${by('tell')} tell`) && r.includes(`${by('note')} note`));
});

test('required files exist', () => {
  for (const f of ['LICENSE', 'CONTRIBUTING.md', 'SECURITY.md', 'CODE_OF_CONDUCT.md', 'CITATION.cff', 'CHANGELOG.md', '.github/workflows/test.yml', '.github/dependabot.yml', 'docs/images/before.png', 'docs/images/after.png', 'docs/images/banner.png']) {
    assert.ok(existsSync(join(ROOT, f)), f);
  }
});

test('the skill has no dependencies', () => {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  assert.equal(pkg.dependencies, undefined);
  assert.equal(pkg.devDependencies, undefined);
});

test('README example counts match the linter output', async () => {
  const { lintPaths } = await import('../skills/anti-slop-design/scripts/tells.mjs');
  const count = (file, tier) => lintPaths([join(ROOT, 'examples', file)]).findings.filter((f) => f.tier === tier).length;
  const r = readFileSync(join(ROOT, 'README.md'), 'utf8');
  assert.ok(r.includes(`before.html: ${count('before.html', 'block')} block, ${count('before.html', 'tell')} tell, ${count('before.html', 'note')} note`));
  assert.ok(r.includes(`after.html:  ${count('after.html', 'block')} block, ${count('after.html', 'tell')} tell, ${count('after.html', 'note')} note`));
});
