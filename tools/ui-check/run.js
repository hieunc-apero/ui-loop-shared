#!/usr/bin/env node
/* Run ui-check without a browser pane: headless Chrome via playwright-core.
 *   node run.js <url> [--widths 390,1440] [--themes dark,light] [--scope ".sel"] [--ls '{"key":"value"}'] [--wait 1500]
 * --ls sets localStorage before the page loads (onboarding flags, debug state). Prints one compact
 * block per width × theme. Bypasses the page's CSP, costs no tokens. Needs playwright-core — found in
 * $PWC, else the current project's node_modules, else next to this file (first time:
 * `npm i --prefix <this folder> playwright-core`; no browser download) — and an installed Chrome
 * ($CHROME if it isn't in a standard place). */
const fs = require('fs'), path = require('path');
const a = process.argv.slice(2), url = a[0], opt = k => { const i = a.indexOf('--' + k); return i > 0 ? a[i + 1] : null; };
if (!url) { console.error('usage: node run.js <url> [--widths 390,1440] [--themes dark,light] [--scope sel] [--ls json] [--wait ms]'); process.exit(2); }
let pw; for (const c of [process.env.PWC, path.join(process.cwd(), 'node_modules/playwright-core'), path.join(__dirname, 'node_modules/playwright-core'), 'playwright-core'])
  { if (!c) continue; try { pw = require(c); break; } catch {} }
if (!pw) { console.error(`playwright-core not found. Run once: npm i --prefix "${__dirname}" playwright-core`); process.exit(2); }
const chrome = process.env.CHROME || ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome'].find(p => fs.existsSync(p));
const src = fs.readFileSync(path.join(__dirname, 'ui-check.js'), 'utf8');
(async () => {
  const b = await pw.chromium.launch(chrome ? { executablePath: chrome } : {});
  for (const theme of (opt('themes') || 'dark').split(',')) for (const w of (opt('widths') || '390,1440').split(',').map(Number)) {
    const ctx = await b.newContext({ viewport: { width: w, height: w <= 480 ? 844 : 900 }, colorScheme: theme, deviceScaleFactor: w <= 480 ? 2 : 1, bypassCSP: true });
    const ls = opt('ls'); if (ls) await ctx.addInitScript(o => { for (const [k, v] of Object.entries(o)) localStorage.setItem(k, v); }, JSON.parse(ls));
    const p = await ctx.newPage();
    await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await p.waitForTimeout(+(opt('wait') || 1200));
    await p.addScriptTag({ content: src });
    const r = await p.evaluate(s => __uiCheck({ scope: s || undefined }), opt('scope'));
    console.log(`== ${url} @${w} ${theme}: ${r.block} block · ${r.warn} warn/?`); for (const f of r.f || []) console.log('  ' + f.join(' | '));
    if (r.error) console.log('  ' + r.error);
    await ctx.close();
  }
  await b.close();
})().catch(e => { console.error(e.message); process.exit(1); });
