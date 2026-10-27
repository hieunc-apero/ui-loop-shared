#!/usr/bin/env node
/* Serve a local folder over http://127.0.0.1 so the critic's browser can open it — Claude in Chrome
 * refuses file:// URLs, and a critic that can't load the page judges screenshots and fires no state.
 *   node serve.js <folder|file.html> [--port 8765]     → prints the URL, keeps running
 * Start it with run_in_background, curl the URL, then hand the critic that URL (critic-round.md).
 * run.js uses the same server in-process when given a local path. No dependencies. */
const http = require('http'), fs = require('fs'), path = require('path');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.ico': 'image/x-icon' };

// Returns { url, close } — url points at the file when a file was given, else the folder root.
function serve(target, port = 0) {
  target = path.resolve(target.replace(/^file:\/+/, process.platform === 'win32' ? '' : '/'));
  const isFile = fs.existsSync(target) && fs.statSync(target).isFile(), root = isFile ? path.dirname(target) : target;
  const srv = http.createServer((q, s) => {
    let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
    const f = path.join(root, p); if (!f.startsWith(root)) { s.writeHead(403); return s.end(); }
    fs.readFile(f, (err, b) => { if (err) { s.writeHead(404); return s.end('not found'); }
      s.writeHead(200, { 'Content-Type': TYPES[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' }); s.end(b); });
  });
  return new Promise(res => srv.listen(port, '127.0.0.1', () => {
    const base = `http://127.0.0.1:${srv.address().port}/`;
    res({ url: isFile ? base + encodeURIComponent(path.basename(target)) : base, close: () => srv.close() });
  }));
}
module.exports = { serve };

if (require.main === module) {
  const a = process.argv.slice(2), i = a.indexOf('--port');
  if (!a[0]) { console.error('usage: node serve.js <folder|file.html> [--port 8765]'); process.exit(2); }
  serve(a[0], i >= 0 ? +a[i + 1] : 8765).then(({ url }) => console.log(`serving ${url}`));
}
