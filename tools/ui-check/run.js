#!/usr/bin/env node
/* Run ui-check without a browser pane: headless Chrome via playwright-core.
 *   node run.js <url|folder|file.html> [--widths 390,1440] [--themes dark,light] [--theme-attr data-theme]
 *               [--scope ".sel"] [--ls '{"key":"value"}'] [--wait 1500]
 * A local path (or file:// URL) is served over http://127.0.0.1 for the run (serve.js), so relative
 * assets and fetches behave as they will for the critic. --themes emulates prefers-color-scheme; pages
 * that switch theme by an attribute instead get --theme-attr <name> (sets <html name="dark|light">).
 * --ls sets localStorage before the page loads (onboarding flags, debug state). Prints one compact
 * block per width × theme, then U34 (motion under reduced-motion). Bypasses the page's CSP, costs no
 * tokens. Needs playwright-core — found in $PWC, else the current project's node_modules, else next to
 * this file (first time: `npm i --prefix <this folder> playwright-core`; no browser download) — and an
 * installed Chrome ($CHROME if it isn't in a standard place). */
const fs = require('fs'), path = require('path');
const a = process.argv.slice(2), opt = k => { const i = a.indexOf('--' + k); return i > 0 ? a[i + 1] : null; };
let url = a[0];
if (!url) { console.error('usage: node run.js <url|folder|file.html> [--widths 390,1440] [--themes dark,light] [--theme-attr data-theme] [--scope sel] [--ls json] [--wait ms]'); process.exit(2); }
let pw; for (const c of [process.env.PWC, path.join(process.cwd(), 'node_modules/playwright-core'), path.join(__dirname, 'node_modules/playwright-core'), 'playwright-core'])
  { if (!c) continue; try { pw = require(c); break; } catch {} }
if (!pw) { console.error(`playwright-core not found. Run once: npm i --prefix "${__dirname}" playwright-core`); process.exit(2); }
const chrome = process.env.CHROME || ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome'].find(p => fs.existsSync(p));
const src = fs.readFileSync(path.join(__dirname, 'ui-check.js'), 'utf8');
(async () => {
  let server = null;
  if (!/^https?:/.test(url)) { const [p, q = ''] = url.split('?'); server = await require('./serve.js').serve(p); url = server.url + (q ? '?' + q : ''); }
  const b = await pw.chromium.launch(chrome ? { executablePath: chrome } : {});
  const attr = opt('theme-attr'), widths = (opt('widths') || '390,1440').split(',').map(Number);
  const open = async (w, theme, extra = {}) => {
    const ctx = await b.newContext({ viewport: { width: w, height: w <= 480 ? 844 : 900 }, colorScheme: theme, deviceScaleFactor: w <= 480 ? 2 : 1, bypassCSP: true, ...extra });
    const ls = opt('ls'); if (ls) await ctx.addInitScript(o => { for (const [k, v] of Object.entries(o)) localStorage.setItem(k, v); }, JSON.parse(ls));
    if (attr) await ctx.addInitScript(([n, t]) => { const set = () => document.documentElement.setAttribute(n, t); set(); document.addEventListener('DOMContentLoaded', set); }, [attr, theme]);
    const p = await ctx.newPage();
    await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await p.waitForTimeout(+(opt('wait') || 1200));
    return { ctx, p };
  };
  for (const theme of (opt('themes') || 'dark').split(',')) for (const w of widths) {
    const { ctx, p } = await open(w, theme);
    await p.addScriptTag({ content: src });
    const r = await p.evaluate(s => __uiCheck({ scope: s || undefined }), opt('scope'));
    console.log(`== ${url} @${w} ${theme}${attr ? ' (' + attr + ')' : ''}: ${r.block} block · ${r.warn} warn/?`); for (const f of r.f || []) console.log('  ' + f.join(' | '));
    if (r.error) console.log('  ' + r.error);
    await ctx.close();
  }
  // U34 reduced motion honoured (taste axis 11): endless animations still running under prefers-reduced-motion
  { const { ctx, p } = await open(widths[0], 'dark', { reducedMotion: 'reduce' });
    const n = await p.evaluate(() => document.getAnimations().filter(x => x.playState === 'running' && x.effect && x.effect.getTiming().iterations === Infinity
      && !(x.effect.target && x.effect.target.closest && x.effect.target.closest('[aria-busy="true"],[role="progressbar"],.spinner,.loading')))
      .map(x => (x.animationName || 'waapi') + ' on ' + (x.effect.target ? x.effect.target.tagName.toLowerCase() : '?')));
    if (n.length) console.log(`  U34 | warn | | ${n.length} endless animation(s) still run under prefers-reduced-motion: ${[...new Set(n)].slice(0, 4).join(', ')}`);
    await ctx.close(); }
  await b.close(); if (server) server.close();
})().catch(e => { console.error(e.message); process.exit(1); });
