#!/usr/bin/env node
// anti-slop-design linter. Zero dependencies. Heuristic, not a judge of taste.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const RULES = JSON.parse(readFileSync(join(HERE, 'rules.json'), 'utf8'));
const META = Object.fromEntries(RULES.rules.map((r) => [r.id, r]));
const EXTS = new Set(['.html', '.htm', '.css', '.scss', '.jsx', '.tsx', '.js', '.ts', '.vue', '.svelte', '.astro', '.mdx']);
const SKIP = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.cache']);

const count = (re, s) => (s.match(re) || []).length;
const lineOf = (text, index) => text.slice(0, index).split('\n').length;

function visibleText(src) {
  return src
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{[^{}]*\}/g, ' ')
    .replace(/&mdash;|&#8212;/g, '\u2014')
    .replace(/&ndash;|&#8211;/g, '\u2013')
    .replace(/&[a-z]+;/g, ' ');
}

function firstMatch(text, re) {
  const m = re.exec(text);
  return m ? { line: lineOf(text, m.index), snippet: m[0].trim().slice(0, 80) } : null;
}

const BUZZ = /\b(seamless(ly)?|elevate[sd]?|unlock(s|ed|ing)?|supercharge[sd]?|revolutioni[sz]e[sd]?|empower(s|ed|ing)?|cutting-edge|next-gen(eration)?|game-?changer|leverag(e|es|ed|ing)|all-in-one|streamline[sd]?|delve|tapestry|harness(es|ed|ing)?|transform(s|ed|ing)? your|in today'?s (fast-paced|digital)|take (it|your \w+) to the next level)\b/gi;

function hueIsPurple(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length < 6) return false;
  const r = parseInt(h.slice(0, 2), 16) / 255, g = parseInt(h.slice(2, 4), 16) / 255, b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  if (d < 0.15) return false;
  let hue;
  if (max === r) hue = ((g - b) / d) % 6; else if (max === g) hue = (b - r) / d + 2; else hue = (r - g) / d + 4;
  hue = (hue * 60 + 360) % 360;
  return hue >= 245 && hue <= 300;
}

const DETECT = {
  'no-viewport': (t) => (/<html[\s>]/i.test(t) && !/<meta[^>]+name=["']viewport["']/i.test(t) ? [{ line: 1, snippet: '<html>' }] : []),
  'no-lang': (t) => {
    const m = /<html(\s[^>]*)?>/i.exec(t);
    return m && !/\blang\s*=/i.test(m[0]) ? [{ line: lineOf(t, m.index), snippet: m[0].slice(0, 60) }] : [];
  },
  'img-no-alt': (t) => {
    const out = [];
    for (const m of t.matchAll(/<img\b[^>]*>/gi)) if (!/\balt\s*=/i.test(m[0])) out.push({ line: lineOf(t, m.index), snippet: m[0].slice(0, 70) });
    return out;
  },
  'focus-removed': (t) => {
    const removed = firstMatch(t, /(outline\s*:\s*(none|0)\b|focus:outline-none|outline-none)/i);
    if (!removed) return [];
    const replaced = /:focus-visible|focus-visible:|focus:ring|focus:border|focus-within|:focus\s*\{[^}]*(box-shadow|border|background|outline\s*:\s*[1-9])/i.test(t);
    return replaced ? [] : [removed];
  },
  'no-reduced-motion': (t) => {
    const moves = firstMatch(t, /(@keyframes|animation\s*:|transition\s*:|animate-[a-z]+|transition-[a-z]+|duration-\d+)/i);
    return moves && !/prefers-reduced-motion|motion-reduce:|motion-safe:/i.test(t) ? [moves] : [];
  },
  'placeholder-text': (t) => {
    const m = firstMatch(t, /(lorem ipsum|dolor sit amet|your (company|text|content|tagline) (name )?here|company name|insert .{1,20} here|\bTODO\b.{0,20}copy)/i);
    return m ? [m] : [];
  },
  'invented-claims': (t) => {
    const text = visibleText(t);
    const re = /(\b\d[\d,.]*\s?(k|m|\+|%)\+?\s+(happy |active |satisfied |trusted )?(users|customers|clients|teams|companies|downloads|developers|businesses)\b|\b99\.\d+%\s+(uptime|accuracy|satisfaction)|\btrusted by\s+\d[\d,.]*\+?(\s+\w+)?|\brated\s+\d(\.\d)?\s*(\/|out of)\s*5)/i;
    const m = re.exec(text);
    if (!m) return [];
    if (/<!--\s*source:/i.test(t) || /data-source=/i.test(t)) return [];
    const at = t.toLowerCase().indexOf(m[0].toLowerCase().slice(0, 12));
    return [{ line: at < 0 ? 1 : lineOf(t, at), snippet: m[0].trim() }];
  },
  'gradient-purple': (t) => {
    const hits = [];
    for (const m of t.matchAll(/(linear|radial|conic)-gradient\([^;{}]*\)/gi)) {
      const hexes = m[0].match(/#[0-9a-f]{3,8}\b/gi) || [];
      if (/(purple|violet|indigo|fuchsia)/i.test(m[0]) || hexes.some(hueIsPurple)) hits.push({ line: lineOf(t, m.index), snippet: m[0].slice(0, 70) });
    }
    for (const m of t.matchAll(/\b(from|via|to)-(purple|violet|indigo|fuchsia)-\d{2,3}\b/g)) hits.push({ line: lineOf(t, m.index), snippet: m[0] });
    return hits.slice(0, 1);
  },
  'gradient-text': (t) => {
    const m = firstMatch(t, /(bg-clip-text|background-clip\s*:\s*text|-webkit-background-clip\s*:\s*text)/i);
    return m ? [m] : [];
  },
  'default-font': (t) => {
    const hits = [];
    for (const m of t.matchAll(/font-family\s*:\s*([^;}{]+)/gi)) {
      const first = m[1].trim().split(',')[0].replace(/["']/g, '').trim().toLowerCase();
      if (['inter', 'roboto', 'poppins', 'system-ui', '-apple-system', 'segoe ui', 'open sans'].includes(first)) hits.push({ line: lineOf(t, m.index), snippet: m[0].slice(0, 70) });
    }
    const tw = firstMatch(t, /\bfont-(sans)\b/);
    if (tw && !hits.length && !/font-family/i.test(t) && /tailwind/i.test(t)) hits.push(tw);
    return hits.slice(0, 1);
  },
  glass: (t) => {
    const m = firstMatch(t, /(backdrop-filter\s*:\s*blur|backdrop-blur(-[a-z0-9]+)?)/i);
    return m && /(rgba\([^)]*,\s*0?\.\d+\)|bg-(white|black|slate-\d+|gray-\d+)\/\d+|bg-opacity-\d+)/i.test(t) ? [m] : [];
  },
  'big-radius': (t) => {
    const n = count(/\brounded-(2xl|3xl)\b/g, t) + count(/border-radius\s*:\s*(1[6-9]|[2-9]\d)px/gi, t);
    return n >= 6 ? [{ line: 1, snippet: `${n} large-radius uses` }] : [];
  },
  'shadow-stack': (t) => {
    const n = count(/\bshadow-(lg|xl|2xl)\b/g, t) + count(/box-shadow\s*:[^;]*\b(\d{2,})px\s+\d{2,}px/gi, t);
    return n >= 4 ? [{ line: 1, snippet: `${n} heavy shadows` }] : [];
  },
  'hover-scale': (t) => {
    const n = count(/hover:scale-(10[5-9]|1[1-9]\d)/g, t) + count(/:hover\s*\{[^}]*transform\s*:[^;}]*scale\(1\.\d+\)/gi, t);
    return n >= 2 ? [{ line: 1, snippet: `${n} hover scale effects` }] : [];
  },
  'emoji-icons': (t) => {
    const re = /<(h[1-6]|button|li|a)\b[^>]*>\s*[^<]{0,3}(\p{Extended_Pictographic})/gu;
    const hits = [...t.matchAll(re)];
    return hits.length >= 2 ? [{ line: lineOf(t, hits[0].index), snippet: hits[0][0].slice(0, 60) }] : [];
  },
  'eyebrow-labels': (t) => {
    const tw = count(/\buppercase\b[^"']*\btracking-(wide|wider|widest)\b|\btracking-(wide|wider|widest)\b[^"']*\buppercase\b/g, t);
    let css = 0;
    for (const m of t.matchAll(/\{[^{}]*\}/g)) {
      if (/text-transform\s*:\s*uppercase/i.test(m[0]) && /letter-spacing\s*:\s*0?\.(0[89]|[1-9])\d*em/i.test(m[0])) css += 1;
    }
    const n = Math.max(tw, css);
    return n >= 3 ? [{ line: 1, snippet: `${n} tracked uppercase labels` }] : [];
  },
  'badge-pill': (t) => {
    const m = firstMatch(t, />\s*(\p{Extended_Pictographic}\s*)?(new(:[^<]{0,40})?|now in beta|now live|introducing[^<]{0,30}|announcing[^<]{0,30}|v\d\.\d (is )?(here|out)|just launched)\s*</iu);
    return m ? [m] : [];
  },
  buzzwords: (t) => {
    const found = [...visibleText(t).matchAll(BUZZ)].map((m) => m[0].toLowerCase());
    return found.length >= 2 ? [{ line: 1, snippet: [...new Set(found)].slice(0, 4).join(', ') }] : [];
  },
  'dash-copy': (t) => {
    const n = count(/[\u2013\u2014]/g, visibleText(t));
    return n >= 3 ? [{ line: 1, snippet: `${n} long dashes in page text` }] : [];
  },
  'default-palette': (t) => {
    const n = count(/\b(bg|text|border|ring|from|to|via)-(indigo|violet|purple)-(400|500|600|700)\b/g, t);
    return n >= 2 ? [{ line: 1, snippet: `${n} stock indigo/violet classes` }] : [];
  },
  'ambient-blobs': (t) => {
    const m = firstMatch(t, /\bblur-(2xl|3xl)\b|filter\s*:\s*blur\(\s*(6\d|[7-9]\d|\d{3,})px\)/i);
    return m && /(rounded-full|border-radius\s*:\s*(50%|9999px))/i.test(t) && /(absolute|position\s*:\s*absolute)/i.test(t) ? [m] : [];
  },
  'stock-names': (t) => {
    const m = firstMatch(visibleText(t), /\b(John Doe|Jane Doe|Jane Smith|John Smith|Sarah (Chen|Johnson|Miller)|Alex (Chen|Johnson|Rivera)|Michael (Chen|Johnson|Brown)|Emily (Chen|Davis|Rodriguez)|David (Kim|Chen)|Priya Sharma|Marcus Johnson)\b/);
    return m ? [m] : [];
  },
  testimonials: (t) => {
    const m = firstMatch(t, /(class|className|id)\s*=\s*["'{][^"'}]*testimonial/i) || firstMatch(visibleText(t), /(“|")[^"”]{30,200}(”|")\s*[,\-\u2013\u2014]?\s*[A-Z][a-z]+ [A-Z][a-z]+,\s*(CEO|CTO|Head|VP|Director|Founder|Product Manager|Engineer)/);
    return m ? [m] : [];
  },
  'triplet-grid': (t) => {
    const m = firstMatch(t, /(grid-cols-3|grid-template-columns\s*:\s*repeat\(\s*3\s*,)/i);
    return m && count(/\brounded|border-radius|card/gi, t) >= 3 ? [m] : [];
  },
  'centred-everything': (t) => {
    const n = count(/\btext-center\b|text-align\s*:\s*center/gi, t);
    return n >= 8 ? [{ line: 1, snippet: `${n} centred blocks` }] : [];
  },
  'generic-cta': (t) => {
    const n = count(/>\s*(get started( for free| now)?|learn more|sign up( now| for free)?|try (it )?(for )?free|start (your )?free trial)\s*</gi, t);
    return n >= 3 ? [{ line: 1, snippet: `${n} generic button labels` }] : [];
  },
  'no-main': (t) => (/<body[\s>]/i.test(t) && !/<main[\s>]|role=["']main["']/i.test(t) ? [{ line: 1, snippet: '<body>' }] : []),
  'h1-count': (t) => {
    if (!/<body[\s>]/i.test(t)) return [];
    const n = count(/<h1[\s>]/gi, t);
    return n === 1 ? [] : [{ line: 1, snippet: `${n} <h1> elements` }];
  },
};

export function lintText(text, file = '(text)') {
  const findings = [];
  const overrides = [];
  const ignores = new Map();
  for (const m of text.matchAll(/anti-slop-ignore\s+([a-z0-9-]+)\s*(?::\s*([^\n*>]*?))?\s*(?:-->|\*\/|\n|$)/gi)) {
    const id = m[1];
    const reason = (m[2] || '').trim();
    if (!reason) {
      findings.push({ file, rule: 'ignore-without-reason', tier: 'block', line: lineOf(text, m.index), snippet: m[0].trim().slice(0, 70) });
      continue;
    }
    ignores.set(id, reason);
  }
  for (const [id, fn] of Object.entries(DETECT)) {
    const hits = fn(text);
    if (!hits.length) continue;
    if (ignores.has(id)) {
      overrides.push({ file, rule: id, reason: ignores.get(id) });
      continue;
    }
    for (const h of hits) findings.push({ file, rule: id, tier: META[id].tier, line: h.line, snippet: h.snippet });
  }
  return { findings, overrides };
}

export function collect(paths) {
  const files = [];
  const walk = (p) => {
    const st = statSync(p);
    if (st.isDirectory()) {
      for (const name of readdirSync(p).sort()) if (!SKIP.has(name)) walk(join(p, name));
    } else if (EXTS.has(extname(p).toLowerCase())) files.push(p);
  };
  for (const p of paths) walk(resolve(p));
  return files;
}

export function lintPaths(paths) {
  const all = { findings: [], overrides: [], files: 0 };
  for (const f of collect(paths)) {
    const r = lintText(readFileSync(f, 'utf8'), f);
    all.findings.push(...r.findings);
    all.overrides.push(...r.overrides);
    all.files += 1;
  }
  return all;
}

const ORDER = { block: 0, tell: 1, note: 2 };

export function format(result, cwd = process.cwd()) {
  const rel = (f) => (f.startsWith(cwd) ? f.slice(cwd.length + 1) : f);
  const lines = [];
  const sorted = [...result.findings].sort((a, b) => ORDER[a.tier] - ORDER[b.tier] || a.file.localeCompare(b.file) || a.line - b.line);
  for (const f of sorted) {
    const m = META[f.rule];
    lines.push(`${f.tier.toUpperCase().padEnd(5)} ${f.rule}  ${rel(f.file)}:${f.line}  ${m.title}${f.snippet ? ` (${f.snippet})` : ''}`);
    lines.push(`      fix: ${m.fix}`);
  }
  for (const o of result.overrides) lines.push(`OVERRIDE ${o.rule}  ${rel(o.file)}  reason: ${o.reason}`);
  const c = (t) => result.findings.filter((f) => f.tier === t).length;
  lines.push(`${result.files} file(s): ${c('block')} block, ${c('tell')} tell, ${c('note')} note, ${result.overrides.length} override(s)`);
  return lines.join('\n');
}

function main(argv) {
  const args = argv.slice(2);
  const json = args.includes('--json');
  const failIdx = args.indexOf('--fail-on');
  const failOn = failIdx >= 0 ? args[failIdx + 1] : 'block';
  const paths = args.filter((a, i) => !a.startsWith('--') && !(failIdx >= 0 && i === failIdx + 1));
  if (!paths.length || args.includes('--help')) {
    console.log('usage: tells.mjs <file-or-dir>... [--json] [--fail-on block|tell|note]');
    return args.includes('--help') ? 0 : 2;
  }
  if (!(failOn in ORDER)) {
    console.error(`--fail-on must be block, tell or note, not ${failOn}`);
    return 2;
  }
  let result;
  try {
    result = lintPaths(paths);
  } catch (e) {
    console.error(`cannot read input: ${e.message}`);
    return 2;
  }
  console.log(json ? JSON.stringify(result, null, 2) : format(result));
  return result.findings.some((f) => ORDER[f.tier] <= ORDER[failOn]) ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(main(process.argv));
