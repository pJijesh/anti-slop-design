// Generates references/tells.md and the per-agent adapters from rules.json and core.md.
// Run: node scripts/build.mjs   Check only: node scripts/build.mjs --check
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKILL = join(ROOT, 'skills', 'anti-slop-design');
export const BLOCK_START = '<!-- anti-slop-design:start -->';
export const BLOCK_END = '<!-- anti-slop-design:end -->';

const rules = JSON.parse(readFileSync(join(SKILL, 'scripts', 'rules.json'), 'utf8'));
const core = readFileSync(join(SKILL, 'core.md'), 'utf8').trimEnd() + '\n';

export function tellsDoc() {
  const out = ['# The tells catalogue', '', 'Generated from `scripts/rules.json` by `node scripts/build.mjs`. Do not edit by hand.', ''];
  for (const tier of ['block', 'tell', 'note']) {
    out.push(`## ${tier.toUpperCase()}`, '', rules.tiers[tier], '');
    for (const r of rules.rules.filter((x) => x.tier === tier)) {
      out.push(`### \`${r.id}\`: ${r.title}`, '', `Why: ${r.why}`, '', `Instead: ${r.fix}`, '');
    }
  }
  out.push('## Overriding a rule', '', 'Add a comment in the file: `anti-slop-ignore <rule-id>: <reason>`. The reason is required. Overrides are listed in the linter output so they stay visible.', '');
  return out.join('\n');
}

export function cursorRule() {
  return `---
description: Design guidance for building or reviewing web pages and UI so they do not look AI-generated
globs: "**/*.html,**/*.css,**/*.tsx,**/*.jsx,**/*.vue,**/*.svelte,**/*.astro"
alwaysApply: false
---

# Anti-slop design

${core}`;
}

export function agentsBlock() {
  return `${BLOCK_START}
## Anti-slop design

Use when building, redesigning or reviewing a web page or UI.

${core.trimEnd()}
${BLOCK_END}
`;
}

export function outputs() {
  return {
    [join(SKILL, 'references', 'tells.md')]: tellsDoc(),
    [join(ROOT, 'adapters', 'cursor', 'anti-slop-design.mdc')]: cursorRule(),
    [join(ROOT, 'adapters', 'AGENTS.block.md')]: agentsBlock(),
  };
}

export function main(argv) {
  const check = argv.includes('--check');
  let stale = 0;
  for (const [path, text] of Object.entries(outputs())) {
    const current = existsSync(path) ? readFileSync(path, 'utf8') : null;
    if (current === text) continue;
    if (check) { console.error(`stale: ${path.slice(ROOT.length + 1)}`); stale += 1; continue; }
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, text);
    console.log(`wrote ${path.slice(ROOT.length + 1)}`);
  }
  if (check) console.log(stale ? `${stale} generated file(s) out of date; run: node scripts/build.mjs` : 'generated files are current');
  return stale ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(main(process.argv.slice(2)));
