// Gmail-app dark-mode simulator (lightness flip, images pinned, u + .body wrapper). Inject into a light fixture.
//
// v1 was WRONG and produced a misleading render: it used
//   html { filter: invert(1) hue-rotate(180deg) }
// and un-inverted only `img`. A CSS background-image is not an <img>, so v1
// inverted the header bloom — which no real engine does — making a correct
// build look broken.
//
// v2 models what Gmail app / Samsung Email actually do: walk the DOM and flip
// the LIGHTNESS of CSS-declared colours, keeping hue and saturation (that is
// why a real inverted email stays recognisably purple instead of turning
// green), while leaving every raster alone — both <img> and background-image.
//
// ⚠️ STILL ONLY A MODEL. It is not Gmail. Three revisions of this email have
// already been sunk by reasoning about dark mode instead of measuring it. Use
// this to catch obvious breakage, then confirm on a real send before shipping.
// GMAIL_U_WRAPPER — Gmail wraps the message so that "u + .body" matches, which
// is how the Gmail-only logo variant is selected. Without emulating it the sim
// shows .logo-light on an inverted page and reports a logo bug that is not real.
window.addEventListener('load', function () {
  (function () {
    var b = document.body;
    if (!b.classList.contains('body')) return;
    var holder = document.createElement('div');
    holder.className = b.className;
    holder.setAttribute('style', b.getAttribute('style') || '');
    while (b.firstChild) holder.appendChild(b.firstChild);
    b.className = ''; b.removeAttribute('style');
    b.appendChild(document.createElement('u'));
    b.appendChild(holder);
  })();
  var RGB = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/;

  function flip(c) {
    var m = String(c).match(RGB);
    if (!m) return null;
    var a = m[4] === undefined ? 1 : parseFloat(m[4]);
    if (a === 0) return null;                          // transparent: nothing to flip
    var r = +m[1] / 255, g = +m[2] / 255, b = +m[3] / 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    var l = (mx + mn) / 2, h = 0, s = 0;
    if (mx !== mn) {
      var d = mx - mn;
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      h = mx === r ? (g - b) / d + (g < b ? 6 : 0)
        : mx === g ? (b - r) / d + 2
        : (r - g) / d + 4;
      h /= 6;
    }
    l = 1 - l;                                         // <- the inversion

    function hue(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    var R, G, B;
    if (s === 0) { R = G = B = l; }
    else {
      var q2 = l < 0.5 ? l * (1 + s) : l + s - l * s, p2 = 2 * l - q2;
      R = hue(p2, q2, h + 1 / 3); G = hue(p2, q2, h); B = hue(p2, q2, h - 1 / 3);
    }
    return 'rgba(' + Math.round(R * 255) + ',' + Math.round(G * 255) + ',' + Math.round(B * 255) + ',' + a + ')';
  }

  // Snapshot first: writing inline styles as we go would change what later
  // elements compute to.
  var els = [].slice.call(document.querySelectorAll('*'));
  var snap = els.map(function (el) {
    var cs = getComputedStyle(el);
    return {
      bg: cs.backgroundColor,
      fg: cs.color,
      bc: cs.borderTopColor,
      bw: cs.borderTopWidth,
      // ANY background-image pins the background — raster AND css gradient.
      // Verified against a real Gmail app send 2026-08-14: the Payment Success
      // card's linear-gradient survived untouched while its text inverted.
      // (An earlier revision of this file assumed gradients get repainted and
      // only skipped url(); that was wrong and it hid the very bug the real
      // send exposed. Do not "fix" it back.)
      hasBgImage: cs.backgroundImage !== 'none'
    };
  });

  var stats = { bgFlipped: 0, fgFlipped: 0, imgSkipped: 0, bgImagePinned: 0, strandedText: [] };
  els.forEach(function (el, i) {
    if (el.tagName === 'IMG') { stats.imgSkipped++; return; }   // rasters never repainted
    var s = snap[i], v;
    // Gmail never repaints the IMAGE, but it DOES repaint the colour underneath
    // it — that asymmetry is what the .logo-gm mix-blend-mode trick rides on.
    // Flipping only when there is no image was wrong and painted a white box
    // behind the logo. For an opaque background-image (a gradient, a full-bleed
    // raster) the colour is invisible anyway, so this is safe both ways.
    if (s.hasBgImage) stats.bgImagePinned++;
    if ((v = flip(s.bg))) { el.style.backgroundColor = v; stats.bgFlipped++; }
    if ((v = flip(s.fg))) { el.style.color = v; stats.fgFlipped++; }
    if (s.bw !== '0px' && (v = flip(s.bc))) el.style.borderColor = v;
  });

  // The failure mode that a naive render hides: a pinned background whose text
  // is NOT pinned. Report it explicitly so it cannot be missed by eye again.
  els.forEach(function (el, i) {
    if (!snap[i].hasBgImage) return;
    [].slice.call(el.querySelectorAll('*')).forEach(function (kid) {
      if (kid.tagName === 'IMG') return;
      if ((kid.textContent || '').trim() && kid.children.length === 0) {
        stats.strandedText.push((kid.textContent.trim().slice(0, 28)));
      }
    });
  });
  document.documentElement.style.background =
    flip(getComputedStyle(document.body).backgroundColor) || '#FFFFFF';

  window.__simStats = stats;
  console.log('[sim v2]', JSON.stringify(stats));
});
