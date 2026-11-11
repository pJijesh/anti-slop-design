// Builds docs/images/before-after.png and banner.png from the two example screenshots (dev tool, needs Playwright).
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { resolve, join } from 'node:path';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(execSync('npm root -g').toString().trim() + '/playwright')); }
const root = resolve(import.meta.dirname, '..');
const img = (n) => 'file://' + resolve(root, 'docs/images', n);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1400, height: 560 } });
const tmp = mkdtempSync(join(tmpdir(), 'asd-'));
const html1 = join(tmp, 'c.html');
writeFileSync(html1, `<body style="margin:0;background:#f4efe4;font-family:Helvetica,Arial,sans-serif;color:#1b1a17">
<div style="display:flex;gap:24px;padding:24px 24px 0">
 <figure style="margin:0;flex:1"><img src="${img('before.png')}" style="width:100%;border:1px solid #cfc6b2;display:block"><figcaption style="padding:10px 0;font-size:18px"><b>Before.</b> 7 block, 10 tell, 3 note</figcaption></figure>
 <figure style="margin:0;flex:1"><img src="${img('after.png')}" style="width:100%;border:1px solid #cfc6b2;display:block"><figcaption style="padding:10px 0;font-size:18px"><b>After.</b> 0 block, 0 tell, 0 note</figcaption></figure>
</div></body>`);
await p.goto('file://' + html1);
await p.waitForTimeout(300);
await p.screenshot({ path: resolve(root, 'docs/images/before-after.png'), clip: { x: 0, y: 0, width: 1400, height: 545 } });
const q = await b.newPage({ viewport: { width: 1280, height: 360 } });
await q.setContent(`<body style="margin:0;width:1280px;height:360px;background:#f4efe4;color:#1b1a17;font-family:Georgia,'Times New Roman',serif;position:relative">
<div style="position:absolute;left:80px;top:60px;font-size:60px;font-weight:700;letter-spacing:-1px">anti-slop-design</div>
<div style="position:absolute;left:80px;top:140px;font-size:26px;color:#4a463d;font-family:Helvetica,Arial,sans-serif;width:760px;line-height:1.4">A design skill that asks why every choice is there, then checks.</div>
<div style="position:absolute;left:80px;bottom:60px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:20px;line-height:1.6">
<span style="color:#b8431c">BLOCK</span> invented-claims  before.html:26<br><span style="color:#4a463d">TELL&nbsp;</span> gradient-purple  before.html:7<br><span style="color:#4a463d">0 block, 0 tell, 0 note</span>  after.html</div>
<div style="position:absolute;right:80px;bottom:60px;font-size:18px;color:#4a463d;font-family:Helvetica,Arial,sans-serif">Claude Code, Codex, Cursor, OpenCode</div></body>`);
await q.screenshot({ path: resolve(root, 'docs/images/banner.png') });
await b.close();
