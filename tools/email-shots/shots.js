// Email fixtures + screenshots: light / dark / Gmail-sim at 420 + 320 (references/surfaces/email.md).
// Captures through an <iframe> because headless Chrome won't lay a page out under 500 px.
//   node shots.js <mail.html> [more.html…] [--out <dir>]
//   env: W=420,320  M=light,dark,gmail  CHROME=<path to chrome>  (needs ffmpeg on PATH for the crop)
// Writes <out>/<name>-<mode>.html (serve these to the critic) and <name>-<mode>-<w>.png.
// Relative asset paths in the mail must still resolve from <out>: keep <out> next to the mail or use absolute URLs.
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');
const args = process.argv.slice(2), oi = args.indexOf('--out');
const files = args.filter((a, i) => oi < 0 || (i !== oi && i !== oi + 1));
const OUT = path.resolve(oi >= 0 ? args[oi + 1] : '.fx');
fs.mkdirSync(OUT, { recursive: true });
const chrome = process.env.CHROME || (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
  : process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : 'google-chrome');
const sim = fs.readFileSync(path.join(__dirname, 'sim-invert.js'), 'utf8');
const Q = '@media (prefers-color-scheme: dark)';
const url = f => 'file:///' + f.split(path.sep).join('/').replace(/^\//, '').replace(/ /g, '%20');
const widths = (process.env.W || '420,320').split(',').map(Number);
const modes = (process.env.M || 'light,dark,gmail').split(',');
const off = s => s.split(Q).join('@media not all').replace(/\[data-og(sc|sb)\]/g, '[data-never]');
const prof = path.join(os.tmpdir(), 'ui-loop-email-shots');
for (const file of files) {
  const name = path.basename(file).replace(/\.html?$/, ''), src = fs.readFileSync(file, 'utf8');
  const v = { light: off(src), dark: src.split(Q).join('@media all'),
    gmail: off(src).replace('</head>', '<' + 'script>' + sim + '<' + '/script>\n</head>') };
  for (const m of modes) {
    const f = path.join(OUT, `${name}-${m}.html`); fs.writeFileSync(f, v[m]);
    for (const w of widths) {
      const H = 7000, h = path.join(OUT, `_h-${name}-${m}-${w}.html`), raw = path.join(OUT, '_raw.png'), out = path.join(OUT, `${name}-${m}-${w}.png`);
      fs.writeFileSync(h, `<!doctype html><html><body style="margin:0;background:#888"><iframe src="${path.basename(f)}" style="border:0;display:block;width:${w}px;height:${H}px"></iframe></body></html>`);
      execFileSync(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
        `--window-size=500,${H}`, '--virtual-time-budget=6000', `--screenshot=${raw}`, `--user-data-dir=${prof}`, url(h)], { stdio: 'ignore' });
      execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', raw, '-vf', `crop=${w}:${H}:0:0`, out]);
      fs.unlinkSync(h); console.log('shot', path.basename(out));
    }
  }
}
