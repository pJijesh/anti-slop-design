// Renders the two example pages to PNG with Playwright (dev tool, not a dependency of the skill).
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(execSync('npm root -g').toString().trim() + '/playwright')); }
const root = resolve(import.meta.dirname, '..');
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1100, height: 760 }, deviceScaleFactor: 1 });
for (const name of ['before', 'after']) {
  await p.goto('file://' + resolve(root, 'examples', name + '.html'));
  await p.screenshot({ path: resolve(root, 'docs/images', name + '.png'), fullPage: false });
}
await b.close();
