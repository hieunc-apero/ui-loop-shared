/* ui-check — the measurable [đo] checks of ui-loop, run in the page in about a second.
 * Builder: after every change (SKILL.md step 4) — `node run.js <url>` next to this file runs it headless,
 * free of tokens and of the page's CSP. In a browser pane: paste this file once per page load, then
 *   __uiCheck()  or  __uiCheck({ scope: '.card-row' })   // only elements inside this selector
 * Returns { w, h, dpr, theme, block, warn, f: [[id, sev, selector, message]] }. Findings are leads with
 * numbers, not verdicts: "?" findings (text over an image) need a look. IDs are listed in README.md. */
window.__uiCheck = function (opt) {
  opt = opt || {};
  const C = Object.assign({ tap: 44, chipV: 8, chipH: 12, small: 12, body: 14, maxCh: 80, max: 40 }, window.UI_CHECK_CONFIG || {}, opt);
  const doc = document.documentElement, W = doc.clientWidth, H = innerHeight, out = [];
  const root = C.scope ? document.querySelector(C.scope) : document.body;
  if (!root) return { error: 'scope not found: ' + C.scope };
  const cs = e => getComputedStyle(e), R = e => e.getBoundingClientRect();
  const sel = e => { const p = []; for (let i = 0; e && e.nodeType === 1 && i < 3; i++, e = e.parentElement) {
      let s = e.tagName.toLowerCase(); if (e.id) { p.unshift(s + '#' + e.id); break; }
      const c = [...e.classList].filter(x => !/^(css-|_|sc-)/.test(x)).slice(0, 2); if (c.length) s += '.' + c.join('.');
      p.unshift(s); } return p.join('>'); };
  const add = (id, sev, e, msg) => { if (out.length < C.max * 2) out.push([id, sev, e ? sel(e) : '', msg]); };
  const vis = e => { const r = R(e), s = cs(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && +s.opacity > 0.05 && r.bottom > -H && r.top < H * 4; };
  const rgb = c => { const m = c.match(/[\d.]+/g); return m ? m.map(Number).concat(m.length < 4 ? [1] : []) : [0, 0, 0, 0]; };
  const lum = c => { const f = v => (v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const mix = (top, bot) => { const a = top[3]; return [0, 1, 2].map(i => top[i] * a + bot[i] * (1 - a)).concat([1]); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const lines = e => { const rg = document.createRange(); rg.selectNodeContents(e); const t = new Set(); for (const r of rg.getClientRects()) if (r.width > 1) t.add(Math.round(r.top / 4)); return t.size; };
  const wraps = e => { let n = 0; const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT); for (let t; (t = w.nextNode());) { if (!t.textContent.trim() || !vis(t.parentElement)) continue;
    const rg = document.createRange(); rg.selectNodeContents(t); const tops = new Set([...rg.getClientRects()].filter(r => r.width > 1).map(r => Math.round(r.top / 4))); n = Math.max(n, tops.size); } return n; };
  const textOf = e => [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
  const els = [...root.querySelectorAll('*')].filter(e => !/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|HEAD|META|LINK|BR|svg|path|g)$/i.test(e.tagName));
  const visEls = els.filter(vis).filter(e => { const r = R(e); return r.width >= 4 && r.height >= 4; });  // skips sr-only text
  const media = [...document.querySelectorAll('img,video,canvas,picture')].filter(m => vis(m) && !(m.tagName === 'IMG' && m.complete && !m.naturalWidth));
  const isBtn = e => /^(BUTTON|SUMMARY)$/.test(e.tagName) || /^(button|tab|switch|checkbox|radio)$/.test(e.getAttribute('role') || '') || (e.tagName === 'A' && /btn|button|cta|pill|chip/i.test(e.className + ''));
  const isCtl = e => isBtn(e) || /^(INPUT|SELECT|TEXTAREA)$/.test(e.tagName) && e.type !== 'hidden' || e.tagName === 'A' && e.href;

  const filledBtn = c => { const s = cs(c), b = rgb(s.backgroundColor); const mx = Math.max(...b.slice(0, 3)), mn = Math.min(...b.slice(0, 3));
    return /gradient/.test(s.backgroundImage) || b[3] > 0.8 && mx > 0 && (mx - mn) / mx > 0.35; };
  // U1 broken images
  for (const i of root.querySelectorAll('img')) if (i.complete && !i.naturalWidth && vis(i)) add('U1', 'block', i, 'broken image ' + (i.currentSrc || i.src).slice(-60));
  // U2 horizontal overflow
  if (doc.scrollWidth > W + 1) {
    add('U2', 'block', null, `page scrollWidth ${doc.scrollWidth} > clientWidth ${W}`);
    visEls.filter(e => R(e).right > W + 1 && !visEls.some(p => p !== e && p.contains(e) && R(p).right > W + 1)).slice(0, 4).forEach(e => add('U2', 'block', e, `right edge ${Math.round(R(e).right)} > ${W}`));
  }
  for (const e of visEls) {
    const s = cs(e), r = R(e), txt = textOf(e);
    // U3 text clipped / truncated
    if (txt && /hidden|clip/.test(s.overflow + s.overflowX + s.overflowY) && (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 2))
      add('U3', s.textOverflow === 'ellipsis' ? 'warn' : 'block', e, `text clipped: scroll ${e.scrollWidth}×${e.scrollHeight} > box ${e.clientWidth}×${e.clientHeight}${s.textOverflow === 'ellipsis' ? ' (ellipsis)' : ''} "${txt.slice(0, 30)}"`);
    // U4 button label on two lines
    if (isBtn(e) && (e.innerText || '').trim() && wraps(e) > 1) add('U4', 'block', e, `button label wraps to ${wraps(e)} lines "${e.innerText.trim().slice(0, 30)}"`);
    // U5 tap target on a phone
    if (W <= 480 && isCtl(e) && !(e.tagName === 'A' && !isBtn(e) && /^(P|LI|SPAN)$/.test(e.parentElement.tagName)) && (r.width < C.tap || r.height < C.tap))
      add('U5', Math.min(r.width, r.height) < 32 || filledBtn(e) ? 'block' : 'warn', e, `tap target ${Math.round(r.width)}×${Math.round(r.height)} < ${C.tap}${filledBtn(e) ? ' (primary)' : ''}`);
    // U6 contrast of own text
    if (txt && txt.length > 1 && s.color) {
      const fg = rgb(s.color); let bg = [0, 0, 0, 0], unknown = '', stops = null, p = e;
      for (; p; p = p.parentElement) { const ps = cs(p), bi = ps.backgroundImage;
        if (bi !== 'none') { if (/url\(/.test(bi)) { unknown = 'image'; break; }
          const g = (bi.match(/rgba?\([^)]*\)/g) || []).map(rgb).filter(c => c[3] > 0.02);
          if (g.length && !stops) stops = g; }  // decorative washes fade to transparent: only the visible stops count
        const c = rgb(ps.backgroundColor); if (c[3] > 0) { bg = bg[3] ? mix(bg, c) : c; if (bg[3] >= 0.99) break; } }
      if (!unknown) { const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        if (media.some(m => !e.contains(m) && !m.contains(e) && (q => cx > q.left && cx < q.right && cy > q.top && cy < q.bottom)(R(m)))) unknown = 'media'; }
      if (bg[3] < 0.99) bg = mix(bg, rgb(cs(document.body).backgroundColor)[3] ? rgb(cs(document.body).backgroundColor) : [255, 255, 255, 1]);
      const fs = parseFloat(s.fontSize), big = fs >= 24 || fs >= 18.66 && +s.fontWeight >= 700, need = big ? 3 : 4.5;
      const grounds = stops ? stops.map(c => mix(c, bg)).concat([bg]) : [bg];
      const ks = grounds.map(g => ratio(fg[3] < 1 ? mix(fg, g) : fg, g)), k = Math.min(...ks), kmax = Math.max(...ks);
      if (unknown) add('U6', '?', e, `text over ${unknown} — measure against its darkest/lightest part "${txt.slice(0, 24)}"`);
      else if (kmax < need) add('U6', 'block', e, `contrast ${k.toFixed(2)}${stops ? '–' + kmax.toFixed(2) : ''}:1 < ${need} (${s.color}${stops ? ' on gradient' : ' on rgb(' + bg.slice(0, 3).map(Math.round) + ')'}) "${txt.slice(0, 24)}"`);
      else if (k < need) add('U6', '?', e, `contrast ${k.toFixed(2)}–${kmax.toFixed(2)}:1 across the gradient behind (need ${need}) — check where the text sits "${txt.slice(0, 24)}"`);
      // U14 text size
      if (fs < C.small) add('U14', 'warn', e, `font-size ${fs}px < ${C.small}`);
      else if (W >= 1024 && e.tagName === 'P' && fs < C.body) add('U14', 'warn', e, `body text ${fs}px < ${C.body} on desktop`);
      // U15 display type
      if (fs >= 28) { const lh = parseFloat(s.lineHeight) / fs, ls = parseFloat(s.letterSpacing) / fs;
        if (lh && lh < 1.05) add('U15', 'warn', e, `display line-height ${lh.toFixed(2)} < 1.05`);
        if (ls && ls < -0.02) add('U15', 'warn', e, `letter-spacing ${ls.toFixed(3)}em < -0.02em`); }
      // U9 placeholder or raw content
      if (/lorem ipsum|\bundefined\b|\bNaN\b|\[object Object\]|\bTODO\b/i.test(txt)) add('U9', 'block', e, `placeholder text "${txt.slice(0, 40)}"`);
      else if (/\b[\w-]+\.(png|jpe?g|webp|gif|mp4|mov|wav|mp3|svg)\b|\b[a-z]+_[a-z0-9_]{4,}\b/.test(txt)) add('U9', 'warn', e, `raw file/key name "${txt.slice(0, 40)}"`);
      // U16 line length
      if (e.tagName === 'P' && txt.length > 120) { const n = lines(e); if (n && txt.length / n > C.maxCh) add('U16', 'warn', e, `~${Math.round(txt.length / n)} chars per line > ${C.maxCh}`); }
    }
    // U10 lone last word in a heading
    if (/^H[1-3]$/.test(e.tagName) && (e.innerText || '').trim().split(/\s+/).length > 3) {
      const rg = document.createRange(); rg.selectNodeContents(e); const rs = [...rg.getClientRects()].filter(x => x.width > 2);
      if (rs.length > 1) { const lastTop = Math.max(...rs.map(x => x.top)); const last = rs.filter(x => Math.abs(x.top - lastTop) < 4);
        const words = (e.innerText.trim().split(/\s+/)); const w = last.reduce((a, x) => a + x.width, 0), avg = r.width / Math.max(1, words.length / lines(e));
        if (w < avg * 1.3) add('U10', 'warn', e, `heading ends on a lone word (last line ${Math.round(w)}px) — text-wrap:balance / bind phrases`); }
    }
    // U13 chip/pill padding (rounded small box with text)
    if (txt && r.height <= 48 && r.height >= 16 && parseFloat(s.borderTopLeftRadius) >= r.height / 2 - 2 && (rgb(s.backgroundColor)[3] > 0.05 || parseFloat(s.borderTopWidth) > 0)) {
      const rg = document.createRange(); rg.selectNodeContents(e); const t = rg.getBoundingClientRect();
      const v = Math.min(t.top - r.top, r.bottom - t.bottom), h = Math.min(t.left - r.left, r.right - t.right);
      if (v < C.chipV - 0.5 || h < C.chipH - 0.5) add('U13', 'warn', e, `chip text-to-edge ${v.toFixed(1)}px v / ${h.toFixed(1)}px h (want ≥ ${C.chipV}/${C.chipH})`);
    }
    // U11 icon + text vertical centres
    if (/flex/.test(s.display) && s.flexDirection.startsWith('row') && (e.innerText || '').trim() && e.children.length <= 4) {
      const ic = [...e.children].find(c => /^(svg|IMG|I)$/i.test(c.tagName) && R(c).height <= 40 && R(c).height > 0);
      if (ic) { const rg = document.createRange(); rg.selectNodeContents(e); const tr = [...rg.getClientRects()].find(x => x.width > 2 && x.left > R(ic).right - 1);
        if (tr) { const d = (R(ic).top + R(ic).height / 2) - (tr.top + tr.height / 2); if (Math.abs(d) > 1.5) add('U11', 'warn', e, `icon centre ${d > 0 ? 'below' : 'above'} text centre by ${Math.abs(d).toFixed(1)}px`); } }
    }
    // U17 visible native scrollbar
    const sb = e.offsetWidth - e.clientWidth - parseFloat(s.borderLeftWidth) - parseFloat(s.borderRightWidth);
    if (sb > 0 && e.scrollHeight > e.clientHeight && !/none/.test(s.scrollbarWidth || '')) add('U17', 'warn', e, `native scrollbar ${sb}px visible`);
  }
  // U12 siblings in one row with different sizes
  for (const p of new Set(visEls.map(e => e.parentElement))) {
    if (!p) continue; const ps = cs(p); if (!/grid|flex/.test(ps.display)) continue;
    const kids = [...p.children].filter(vis).filter(k => k.className && k.className === p.children[0].className);
    if (kids.length < 3) continue; const rows = {};
    kids.forEach(k => (rows[Math.round(R(k).top / 6)] ||= []).push(k));
    for (const row of Object.values(rows)) if (row.length > 1) {
      const hs = row.map(k => Math.round(R(k).height)), ws = row.map(k => Math.round(R(k).width));
      if (Math.max(...hs) - Math.min(...hs) > 2 && ps.alignItems !== 'flex-start' && ps.alignItems !== 'start') add('U12', 'warn', row[0], `equal siblings, heights ${hs.join('/')}`);
      if (/grid/.test(ps.display) && Math.max(...ws) - Math.min(...ws) > 2) add('U12', 'warn', row[0], `equal siblings, widths ${ws.join('/')}`);
    }
  }
  // U7/U8 fixed and sticky layers: translucent over content, overlapping each other
  const fixed = [...document.querySelectorAll('body *')].filter(e => /fixed|sticky/.test(cs(e).position) && vis(e) && R(e).height < H * 0.9);
  for (const e of fixed) { const layers = [cs(e), getComputedStyle(e, '::before'), getComputedStyle(e, '::after')];
    if (layers.some(x => x.backgroundImage !== 'none') || !e.innerText.trim()) continue;
    const a = Math.max(...layers.map(x => rgb(x.backgroundColor)[3])), bf = layers.map(x => x.backdropFilter).find(x => x && x !== 'none');
    if (a < 0.97) add('U7', a < 0.5 && !bf ? 'block' : 'warn', e, `${layers[0].position} layer bg alpha ${a.toFixed(2)}${bf ? ' + ' + bf : ''} (incl. ::before/::after) — content reads through when scrolled under`); }
  for (let i = 0; i < fixed.length; i++) for (let j = i + 1; j < fixed.length; j++) { const a = fixed[i], b = fixed[j]; if (a.contains(b) || b.contains(a)) continue;
    const x = R(a), y = R(b), ov = Math.max(0, Math.min(x.right, y.right) - Math.max(x.left, y.left)) * Math.max(0, Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top));
    if (ov > 64) add('U8', 'block', a, `fixed/sticky layers overlap ${Math.round(ov)}px² with ${sel(b)}`); }
  // U18 card inside a card
  const card = e => { const s = cs(e); return parseFloat(s.borderTopLeftRadius) >= 8 && (rgb(s.backgroundColor)[3] > 0.05 || parseFloat(s.borderTopWidth) > 0) && R(e).height > 60; };
  for (const e of visEls) if (card(e)) { const inner = [...e.querySelectorAll('*')].find(c => vis(c) && card(c) && R(c).width * R(c).height > 0.35 * R(e).width * R(e).height && !/^(IMG|VIDEO|BUTTON|INPUT|TEXTAREA)$/.test(c.tagName));
    if (inner) add('U18', 'warn', e, `card in card: ${sel(inner)} fills ${Math.round(100 * R(inner).width * R(inner).height / (R(e).width * R(e).height))}%`); }
  // U19 two filled primaries side by side
  for (const p of new Set(visEls.filter(isBtn).map(e => e.parentElement))) {
    const fb = [...p.children].filter(c => isBtn(c) && vis(c) && filledBtn(c));
    for (let i = 1; i < fb.length; i++) { const a = R(fb[i - 1]), b = R(fb[i]);
      const gap = Math.max(b.left - a.right, a.left - b.right, b.top - a.bottom, a.top - b.bottom);
      if (gap < 48) { add('U19', 'warn', p, `two filled/accent buttons ${Math.round(gap)}px apart — one primary per group`); break; } } }

  const groups = new Map(); for (const x of out) { const k = x[0] + x[1] + x[2]; if (groups.has(k)) groups.get(k).n++; else groups.set(k, { x, n: 1 }); }
  const rank = { block: 0, warn: 1, '?': 2 };
  const f = [...groups.values()].map(g => g.n > 1 ? [g.x[0], g.x[1], g.x[2], g.x[3] + ` (×${g.n})`] : g.x).sort((a, b) => rank[a[1]] - rank[b[1]]).slice(0, C.max);
  const theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  return { w: W, h: H, dpr: devicePixelRatio, theme, scope: C.scope || 'page', block: f.filter(x => x[1] === 'block').length, warn: f.filter(x => x[1] !== 'block').length, f };
};
