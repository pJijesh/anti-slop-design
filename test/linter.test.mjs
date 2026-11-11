import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lintText, RULES } from '../skills/anti-slop-design/scripts/tells.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LINTER = join(ROOT, 'skills/anti-slop-design/scripts/tells.mjs');
const ids = (html) => lintText(html).findings.map((f) => f.rule);

const PAGE = (body = '', head = '') =>
  `<!DOCTYPE html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${head}</head><body><main><h1>Title</h1>${body}</main></body></html>`;

// One positive sample per rule. Each must trigger exactly that rule.
const POSITIVE = {
  'no-viewport': '<html lang="en"><body><main><h1>x</h1></main></body></html>',
  'no-lang': '<html><head><meta name="viewport" content="width=device-width"></head><body><main><h1>x</h1></main></body></html>',
  'img-no-alt': PAGE('<img src="a.png">'),
  'focus-removed': PAGE('', '<style>a:focus { outline: none; }</style>'),
  'no-reduced-motion': PAGE('', '<style>.a { transition: color .2s; }</style>'),
  'placeholder-text': PAGE('<p>Lorem ipsum dolor sit amet</p>'),
  'invented-claims': PAGE('<p>Trusted by 5,000+ teams worldwide</p>'),
  'ignore-without-reason': PAGE('<!-- anti-slop-ignore glass -->'),
  'gradient-purple': PAGE('', '<style>body{background:linear-gradient(135deg,#667eea,#764ba2)}</style>'),
  'gradient-text': PAGE('', '<style>h1{background-clip:text}</style>'),
  'default-font': PAGE('', "<style>body{font-family:'Inter',sans-serif}</style>"),
  glass: PAGE('', '<style>.c{background:rgba(255,255,255,.1);backdrop-filter:blur(10px)}</style>'),
  'big-radius': PAGE('<div class="rounded-2xl"></div>'.repeat(6)),
  'shadow-stack': PAGE('<div class="shadow-xl"></div>'.repeat(4)),
  'hover-scale': PAGE('<div class="hover:scale-105"></div><div class="hover:scale-110"></div>'),
  'emoji-icons': PAGE('<h3>⚡ Fast</h3><h3>🔒 Safe</h3>'),
  'eyebrow-labels': PAGE('<p class="uppercase tracking-widest">a</p><p class="uppercase tracking-wider">b</p><p class="uppercase tracking-wide">c</p>'),
  'badge-pill': PAGE('<span>New: AI alerts</span>'),
  buzzwords: PAGE('<p>Seamless, cutting-edge tools that empower teams</p>'),
  'dash-copy': PAGE('<p>One \u2014 two \u2014 three \u2014 four</p>'),
  'default-palette': PAGE('<a class="bg-indigo-600 text-violet-500">x</a>'),
  'ambient-blobs': PAGE('<div class="absolute rounded-full blur-3xl"></div>'),
  'stock-names': PAGE('<p>Written by Sarah Chen</p>'),
  testimonials: PAGE('<section class="testimonials"></section>'),
  'triplet-grid': PAGE('<div class="grid-cols-3"><div class="rounded"></div><div class="rounded"></div><div class="rounded"></div></div>'),
  'centred-everything': PAGE('<p class="text-center">x</p>'.repeat(8)),
  'generic-cta': PAGE('<a>Get started</a><a>Learn more</a><a>Sign up</a>'),
  'no-main': '<html lang="en"><head><meta name="viewport" content="width=device-width"></head><body><h1>x</h1></body></html>',
  'h1-count': '<html lang="en"><head><meta name="viewport" content="width=device-width"></head><body><main><h2>x</h2></main></body></html>',
};

test('every rule in rules.json has a positive sample, and the samples cover no unknown rule', () => {
  const known = RULES.rules.map((r) => r.id).sort();
  assert.deepEqual(Object.keys(POSITIVE).sort(), known);
});

for (const [rule, html] of Object.entries(POSITIVE)) {
  test(`rule ${rule} fires on its sample`, () => {
    assert.ok(ids(html).includes(rule), `${rule} did not fire; got ${ids(html).join(', ')}`);
  });
}

test('a clean page produces no findings', () => {
  assert.deepEqual(ids(PAGE('<p>A plain sentence about tide tables.</p>')), []);
});

test('focus outline removal is accepted when :focus-visible is styled', () => {
  const html = PAGE('', '<style>a{outline:none}a:focus-visible{outline:3px solid #000}</style>');
  assert.ok(!ids(html).includes('focus-removed'));
});

test('motion is accepted when prefers-reduced-motion is handled', () => {
  const html = PAGE('', '<style>@media (prefers-reduced-motion: no-preference){a{transition:color .1s}}</style>');
  assert.ok(!ids(html).includes('no-reduced-motion'));
});

test('a blue gradient is not flagged as purple', () => {
  assert.ok(!ids(PAGE('', '<style>b{background:linear-gradient(#0b3d91,#1565c0)}</style>')).includes('gradient-purple'));
});

test('a source comment allows a statistic', () => {
  assert.ok(!ids(PAGE('<!-- source: annual report 2025 --><p>Trusted by 5,000+ teams</p>')).includes('invented-claims'));
});

test('thresholds: two long dashes are fine, one buzzword is fine', () => {
  assert.ok(!ids(PAGE('<p>a \u2014 b \u2014 c</p>')).includes('dash-copy'));
  assert.ok(!ids(PAGE('<p>a seamless step</p>')).includes('buzzwords'));
});

test('an ignore with a reason suppresses the rule and is recorded', () => {
  const r = lintText(PAGE('<!-- anti-slop-ignore stock-names: the client asked for this name -->\n<p>Sarah Chen</p>'));
  assert.ok(!r.findings.some((f) => f.rule === 'stock-names'));
  assert.equal(r.overrides.length, 1);
  assert.match(r.overrides[0].reason, /client asked/);
});

test('an ignore without a reason is itself a block-level finding', () => {
  const r = lintText(PAGE('<!-- anti-slop-ignore glass -->'));
  const f = r.findings.find((x) => x.rule === 'ignore-without-reason');
  assert.equal(f.tier, 'block');
});

test('script and style text does not count as page copy', () => {
  const html = PAGE('<script>const s = "seamless elevate unlock";</script>');
  assert.ok(!ids(html).includes('buzzwords'));
});

test('findings carry a line number', () => {
  const html = '<!DOCTYPE html>\n<html lang="en">\n<head><meta name="viewport" content="width=device-width"></head>\n<body><main><h1>x</h1>\n<img src="a.png">\n</main></body></html>';
  const f = lintText(html).findings.find((x) => x.rule === 'img-no-alt');
  assert.equal(f.line, 5);
});

test('every rule has a title, why, fix and valid tier', () => {
  for (const r of RULES.rules) {
    assert.ok(r.title && r.why && r.fix, r.id);
    assert.ok(['block', 'tell', 'note'].includes(r.tier), r.id);
    assert.ok(RULES.tiers[r.tier]);
  }
});

const run = (...args) => spawnSync(process.execPath, [LINTER, ...args], { encoding: 'utf8' });

test('CLI exits 1 on the sloppy example and 0 on the crafted one', () => {
  assert.equal(run(join(ROOT, 'examples/before.html')).status, 1);
  const good = run(join(ROOT, 'examples/after.html'));
  assert.equal(good.status, 0);
  assert.match(good.stdout, /0 block, 0 tell, 0 note/);
});

test('the sloppy example trips every tier', () => {
  const out = run(join(ROOT, 'examples/before.html'), '--json');
  const data = JSON.parse(out.stdout);
  const tiers = new Set(data.findings.map((f) => f.tier));
  assert.deepEqual([...tiers].sort(), ['block', 'note', 'tell']);
  assert.ok(data.findings.length >= 15);
});

test('--fail-on tell makes a tell-only file fail', () => {
  const dir = join(ROOT, 'test', 'tmp-tell-only.html');
  return import('node:fs').then(({ writeFileSync, rmSync }) => {
    writeFileSync(dir, PAGE('<p>Written by Sarah Chen</p>'));
    try {
      assert.equal(run(dir).status, 0);
      assert.equal(run(dir, '--fail-on', 'tell').status, 1);
    } finally { rmSync(dir); }
  });
});

test('CLI usage errors exit 2', () => {
  assert.equal(run().status, 2);
  assert.equal(run(join(ROOT, 'examples/after.html'), '--fail-on', 'nope').status, 2);
  assert.equal(run('/no/such/file.html').status, 2);
});

test('the output is deterministic', () => {
  const a = run(join(ROOT, 'examples/before.html')).stdout;
  const b = run(join(ROOT, 'examples/before.html')).stdout;
  assert.equal(a, b);
});
