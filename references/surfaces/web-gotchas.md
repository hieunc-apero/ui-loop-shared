# Web gotchas — looked up by topic

Each section cost a round once. The index is in `web.md` ("Gotchas"). Moved here verbatim from
`web.md` on 2026-10-19 (v0.25) so the core stays short; nothing was removed.

## A layout swapped on the client

A desktop layout chosen by a media-query hook (`useSyncExternalStore`, server snapshot =
phone) re-mounts after hydration. Anything a script or e2e does before that — setting a
file input, typing — lands on the detached phone tree and is lost. Wait for
`networkidle` (or a desktop-only element) before interacting, in captures and in tests
(USELOG 2026-10-14, a tools page).

## Measure in characters, not `ch`

A `max-width` in `ch` holds more characters than its number: `ch` is the width of "0", wider
than the average letter. 68ch rendered 81–83 characters per line in Manrope; 56ch landed at
about 72. For a 65–75 character measure, check a real rendered line, or start near 56ch
(USELOG 2026-10-14, a creations page).

## Colour fixes: re-measure against every background

When you change a colour to fix a contrast blocker — or change a background for any reason —
recompute the ratio for that text on **every** surface it sits on (each tint, card variant,
hover state), not just the one the critic named. Round 2 of the birthday page regressed: the
pink label passed on white, then failed on five new pastel tints added for a taste note
(3.96–4.37:1) (USELOG 2026-10-15).

## The hidden pane freezes animation

While the browser pane is hidden, `requestAnimationFrame` doesn't run, so canvas/JS animation
freezes and screenshots can lag a frame. Tell the critic so in the brief, and verify animation
lifecycle (does the confetti clear?) yourself in the visible pane, or list it as unverified at
hand-off.

Entrance animations have the same trap: in this pane the first screenshot after `navigate` often
shows the frame *before* an entrance (the element looks missing). Re-shoot before believing it,
and to judge in-between frames pause the animation and step it:
`el.getAnimations()[0].pause(); …currentTime = 300` (USELOG 2026-10-16, offer hand).

## A clip on a moving element moves with it

`clip-path` (and `overflow`) are in the element's own box, so on an element that `translate`s the
clip line rides along. A clip meant to hide "everything below the pot" then shows the part it
should hide during the slide. Either clip on a parent that stays still, or animate the inset in
the same keyframe as the transform (`from{transform:translateY(34cqw);clip-path:inset(… 48cqw …)}`
for a resting `inset(… 14cqw …)`) so the line stays put. A translated or `visibility:hidden`
child still stretches an `overflow:hidden` box's scroll area — use `overflow:clip` on fixed
full-screen layers so focus/scrollIntoView can't shift them (USELOG 2026-10-16).

## Photoreal props (AI image, keyed)

When the user asks for something to look *real* ("trông thật", "realistic"), a drawn SVG won't get
there — generate a photo and key it:
- `mcp__figma__generate_image` with a `planKey` from `whoami` (paid: say so before the first call).
  `gemini-3.1-flash-image` refused (422) prompts with gore words ("open wounds", "blood dripping")
  and 2048-tall sizes; "Halloween movie prop … red fake blood running down" at 1024×1536 passed.
- Ask for a **flat pure green background** and colours with no green in the subject; key with numpy:
  alpha from `g − max(r,b)`, despill `g = min(g, max(r,b))`, crop to bbox, resize, save WebP with
  alpha. Composite on the page's background colour and look at it before wiring it in.
- Keep the raw generations out of the deploy (`.vercelignore`) and note the source in the rules.
- A photo next to flat vector props makes the props read cartoon. The user first kept the vector pot,
  then asked for it photoreal an hour later (funnel 3, 16/10): once one prop is a photo, offer to
  photo the rest of that scene in the same pass.
- **Black-background photos laid in with `mix-blend-mode:screen`:** crush the near-black floor to 0
  in the file (`(v-18)*255/237`) AND give the layer a soft radial mask, or the photo's 1–12 "black"
  lifts the page into a visible box. A blended layer must not be in its own stacking context
  (`z-index` on it or a parent between it and the backdrop) or it blends with nothing.
- **"Held between fingers":** draw the hand image twice — the whole hand behind the held object,
  and a copy clipped (`clip-path:polygon`) to the thumb in front. Make the polygon follow the thumb;
  a rectangle shows as a patch.
- **Splitting one keyed photo into back/front layers** (a pot the arm goes into): mask the front
  layer below an ellipse fitted to the inner lip, in Python, same canvas size, so both layers share
  one CSS position.

- **When image generation is blocked, hand the user the prompt instead of shipping a stand-in.** Figma AI
  credits were exhausted mid-run (they reset monthly), so a drawn SVG locket went in to keep the round
  moving — and it read flat next to the photographic candles. Offering the user a ready-to-paste prompt plus
  a spec (aspect ratio, flat chroma-green background, object centred with margin, the exact filename and
  path, and whether a second "open" frame helps) got the real asset back within minutes, and they volunteered
  to generate it ("đưa prompt đây t gen locket cho", 21/10). Keep the stand-in in place while you wait, and
  say in the hand-off which one shipped.

- **`width:auto` on a REPLACED element (`img`, `video`) does not stretch between opposing insets.** With
  `left:14px;right:14px;width:auto` an `<img>` keeps its intrinsic width, capped only by `max-width`, so a
  600px photo rendered 340px wide in a 312px opening and spilled out of its frame. Set the size explicitly
  (`width:calc(100% - 28px)`), and measure the rendered rect — the computed `width` reads as the used value,
  not as `auto`, which hides the cause (21/10, two rounds).

- **A shell that sets `img{max-width:100%}` silently clamps every prop sized past its box.** A garland at
  `width:112%`, a bed of flowers at `136%` and a bunting at `108%` all rendered at exactly 100% and ended on
  a hard vertical edge that read as a cropping bug. Give decor images `max-width:none` alongside the width
  (21/10).

## Cursors, stickers and tiny icons

Screenshots never capture the OS pointer, so a custom cursor gets its own **asset sheet**
(1× and 4× on every background the page has — light, the darkest bar, gradients) and the critic
reads pixels from a 32×32 canvas draw; wiring is checked through computed `cursor` values.
Build them for 1× from the start:
- feature centres (eyes, nose) on pixel centres *after* any transform, or the face looks like it winks;
  a catchlight must be ≤ 1 px and on a pixel centre too — on a pixel corner it greyed out half
  of a 3×3 eye (only 2/9 px stayed dark);
- outline ≥ 1.5 px at final size, plus a white halo so it survives dark bars;
- a hover/state variant must change colour or silhouette (an added heart, a tint), not only
  interior detail — a face-only change was ~4% of pixels and unreadable in motion
  (USELOG 2026-10-15, poodle cursor).
- die-cut sticker borders: build them with `feGaussianBlur` + an alpha threshold
  (`feComponentTransfer`), not `feMorphology` — its square kernel left visible steps on
  diagonals; and keep every fill inside a die-cut opaque — a translucent sleeve let the white
  border show through and read as a rendering glitch (USELOG 2026-10-15, chibi stickers);
- illustrations of a real person get the photos as the critic's `Reference`, and the critic
  is asked "does it read as her in that photo" — likeness gaps (fedora vs bucket hat, missing
  braces, fingers not in a V) only surfaced that way.
- pixel art of a real subject: block out the **silhouette** against the reference first
  (dome vs flat head, ear length and shape), then colour — the colour was right from round 1
  but the shape read as a cocker spaniel, then a bear, for three rounds.
- the same person drawn again (a new scene, a couple sticker) reuses the existing chibi's
  construction — hair silhouette, colour, face — copy it from the earlier asset instead of
  redrawing; a redrawn hairdo read as "a different artist" next to the four existing Chi
  stickers (USELOG 2026-10-15, couple polaroid).

## Transient effects (floating hearts, bursts, toasts)

Position them from the subject's own box (`getBoundingClientRect` of the sprite/button), never
by percentages of a container, and before the critic, freeze one mid-animation and test their
boxes against every fixed text/UI row (meters, labels, headings). Moving hearts "above the
head" by percentage put them on the stats row and cost a round (USELOG 2026-10-15,
Babi-gotchi). The critic sees these only if told the timing — hidden panes freeze rAF.
A busy/progress **label** is a layout change too: "Cười lên nào…" widened a button and
wrapped its neighbour to a new row, jumping the page 70px on every shot. Keep the label
constant (dim the control instead) or give the row a fixed width, and measure section
height before vs during the state (USELOG 2026-10-15, photobooth).

## Modals, embeds and audio

- A modal ships with all of this from the first build: a real close button in its chrome
  (≥44px hit area, never the decorative window glyphs), backdrop click closes, Esc closes from
  anywhere (listen on `document`, not the dialog), Tab/Shift+Tab trapped inside, focus restored
  to where it was. The critic found these one per round across three rounds (USELOG
  2026-10-15, music popup).
- Status text must follow real state: a "NOW PLAYING" strip while nothing plays, next to a
  "Play music" button, reads as a bug.
- Third-party embed APIs (Spotify iFrame API…) can fire `ready` before your listener attaches:
  treat the controller as ready after creation + a short timeout, and always give a visible
  fallback when a programmatic play is blocked (iOS).
  Spotify specifics: `play()` **restarts** the track, so never re-send it once a
  `playback_update` shows `isPaused:false` (buffering counts as started) — retrying on
  `!playing` made the first seconds loop; a `play()` sent right after `loadUri()` is dropped
  while the embed reloads — retry up to ~10s, but only until it has started; at the end of a 30s preview the embed **freezes on the last
  second without reporting a pause**, so auto-advance needs a watchdog (position near the end
  and not moving for ~2s), not just the `isPaused` event. Test auto-advance by seeking to the
  end, not by waiting a whole track (USELOG 2026-10-15, user: "sao spotify bật một lúc xong
  tự ngắt z").
  Verify with a temporary `playback_update` log: positions must only increase (no resets)
  and the next index must start; preview lengths differ per track (18s vs 30s observed).
  **Best fix for auto-advance: let the embed hold the whole playlist** — Spotify then moves to
  the next track itself, so no script `play()` is needed between songs (Safari/iOS block those
  without a fresh tap). `playback_update.playingURI` says which track is on, so a custom UI can
  follow; "next" = `seek()` to the end (works without a tap). Only a jump to a specific track
  needs `loadUri(track)`, which comes from a tap anyway. Check whether the platform can do the
  job natively before building retry logic around it (two "fixes" shipped before this one).
  A `play()` sent after a delay (after `loadUri`) is outside the tap, so some browsers refuse
  it — "some tracks don't start" depends on load time. Plan the blocked path as UI: detect "not
  started after ~2.5s", pulse your own play control and let the next tap call `play()`
  synchronously. Simulate the block in tests with a script click on a fresh page (no user
  activation).
- Audio: the builder verifies playback once and pauses it at once; brief the critic **not to
  start playback** — it plays aloud on the user's machine.
  Re-`find` a control's ref right before each real click — after any scroll a stale ref
  landed on a playlist row and restarted the song instead of pausing it; if audio is stuck,
  navigate the tab away. Script `element.click()` has no user activation, so it never starts
  audio (safe for UI-state checks, useless for testing play).
- Custom scrollbars: Chrome (121+) ignores `::-webkit-scrollbar*` once `scrollbar-color`/
  `scrollbar-width` is set on the element — put the standard props behind
  `@supports not selector(::-webkit-scrollbar)` for Firefox, and hide
  `::-webkit-scrollbar-button` or the native arrows stay (USELOG 2026-10-15, Winamp).

## Gotchas that cost a round on a seasonal campaign funnel (2026-10-16)

- **An entrance animation that ends at `opacity:1` overrides a static `opacity`.** For example,
  `.rise` with `to{opacity:1}` and fill `both` turned `.logos{opacity:.6}` back to full white.
  Dim with `filter:opacity()`, or put the rule on a wrapper.
- **A `:focus` (or `:hover`) rule that sets `animation` replaces the entrance animation too.**
  An element whose base state is `opacity:0` (waiting for `.rise`) then vanishes the moment it is
  focused, which is what happened to the funnel's text fields. Either list both animations, or pin
  `opacity:1;transform:none` in the focus rule. Always capture a focused field.
- **One SVG symbol drawn at several sizes gets a different stroke weight at each size**, so the
  small copies read fainter ("màu mạng nhện đang lệch nhau", 16/10). Give its paths
  `vector-effect="non-scaling-stroke"` and its colour one token.
  One token is still not enough when the copies sit under different overlays. The two webs under
  the top bar's gradient measured about 30% weaker than the rest, and the user said "vẫn hơi lệch
  tí". Measure, don't eyeball. Capture each copy's box twice, once as is and once with the copy at
  `visibility:hidden`, and compare the 90th-percentile luminance delta of the stroke pixels.
  Then tune per-copy alpha until they agree within a few points. A worked script is
  `references/surfaces/motif-contrast.js`.
- **iOS Safari ignores `border-radius` + `overflow:hidden` for a blurred (`filter`) or video
  child: the corners come out square.** Add `-webkit-mask-image:-webkit-radial-gradient(white,black)`
  to the rounded parent, but only where it has no glow, because a mask also cuts the parent's
  box-shadow. Keep the blurred child inside the box (`inset:0` + `transform:scale()`), not
  overhanging with a negative inset, and draw the card's edge as a top `::before` layer: with
  the mask, Safari paints the overhanging child over a real border at the corners (16/10, second report).
  A square decoration (a corner cobweb) inside a rounded card needs
  `clip-path:inset(0 round …)` matching the corner. Headless Chrome shows neither bug, so check
  on WebKit or a phone (user's iPhone screenshots, 16/10).
- **`python -m http.server` ignores Range requests,** so `video.currentTime = t` silently
  fails. To test seeking or a clip synced to an audio track, serve with
  `npx http-server -s -c-1`.
- **A gradient `<defs>` inside an SVG that is `display:none` at some width doesn't paint for
  other SVGs that use `url(#id)` from it.** Keep shared gradients in an always-rendered sprite.

- **Judge a looping animation from frozen frames, not from live screenshots.** A live screenshot at
  DPR 2 takes longer than the accent lasts, so the flare is missed. Pause every animation in the
  component and set `currentTime` to chosen moments (`el.getAnimations().forEach(a => { a.pause();
  a.currentTime = t })`). This gives exact frames (rest, anticipation, accent, hold, impact,
  rebound) for the critic (seasonal funnel 2, 16/10).
- **A decoration that sits in a rounded card's corner goes in a clip box, not an inset.** Wrap it in
  an absolutely positioned `inset:0` box with the card's inner radius and `overflow:hidden`. The
  card's own curve then cuts it. Insetting it a few px "so it doesn't poke out" made it float
  ("k stick vào card"). A `clip-path` radius on the decoration itself still let strands past the
  curve ("vẫn bị lòi ra"), seasonal funnel 2, 16/10.
- **Nested `background-clip:text` ghosts.** A headline clipped to a gradient that contains an
  `<em>` with its own clipped gradient (and `display:inline-block`/transform) painted the first
  words twice in Chrome (seasonal funnel 2 hero). Give the parent a solid colour + `text-shadow`; only
  the accent word clips. Set `text-shadow:none` on that word, or the shadow shows through.
- **Pick a display/novelty face from a test sheet of the real headlines,** 4–8 candidates
  rendered side by side, before building on it. Grenze Gotisch read "Invitation" as
  "Dnvitation" (its I) and hooked its H; Germania One kept the gothic tone and stayed legible.

- **Flex items sized in % still grow to their content's min-content.** On the offer ticket, a
  wider title face pushed the body past 68% and squeezed the stub (149 → 95px). Give
  fixed-ratio flex children `min-width:0`, and re-measure after any font change.
- **Variable fonts with an `opsz` axis (Bodoni Moda, Fraunces, Playfair 2…) switch to their
  thinnest display cut at large sizes by default** (`font-optical-sizing:auto`). For a heading
  that must read on a dark ground, set `font-optical-sizing:none; font-variation-settings:"opsz" <small>`
  and load the weight you set.
- **A caps-only display face (Cinzel, Trajan-likes) sets lowercase as small caps.** Sentence-case
  copy then mixes two cap heights, and an inline `<em>` inside a heading can keep them even when
  the heading is uppercased. Uppercase the heading *and* its inline children (critic 16/10).

- **A file picker opened by a scripted `.click()` on a `hidden` input fails some of the time**
  (user 16/10: "nhấn vào chỗ upload lúc đc lúc không"). Make the drop zone a `<label for>` the
  input, keep the input visually hidden (not `display:none`), and test with Playwright's
  `filechooser` event at a grid of points, one fresh page per tap.
- **`cqw` on the container itself resolves against the viewport, not its own width.** A scene
  with `container-type:inline-size; height:90cqw` came out 1300px tall at 1440 and the whole
  offer rendered off-screen. Size the container with `aspect-ratio`; use cqw only inside.

- **After splitting or merging SVG layers, count the parts of every figure in a zoomed capture**
  (fingers, legs, eyes). A rebuild dropped a hand's thumb layer and nobody noticed until the
  user did ("tay sao 4 ngón") — not the self-check, not two critic rounds at 1× captures.

- **Smoke, fog, mist: build it from noise, not from strokes.** Blurred, displaced stroke ribbons
  read as squiggles ("khói trông fake úa", 16/10). What reads as smoke: `feTurbulence`
  fractalNoise → `feColorMatrix` (luminance to alpha, tinted) → `feComposite in` a mask shape
  that is itself blurred (a hard mask edge shows as a trapezoid). **Motion: never animate
  `baseFrequency`** — the noise zooms and pulses in place ("khói movement bị kỳ", 16/10). Render
  the noise once as a seamless tile (`stitchTiles="stitch"`, data-URI background) and scroll
  `background-position` upward through a CSS `mask` radial gradient; two tiles at different
  sizes/speeds give depth. Keep the mask's fade inside the box on every side, or its edge shows.

## A whole-page atmosphere layer (fog, haze, grain) behind every screen

- **Put it at `z-index:-1` and let only `html` paint the base colour.** A body background paints
  over a `-1` layer; a `z-index:0` layer forces screens into `isolation:isolate`, which traps a
  fixed child's z-index inside the screen. Seasonal funnel 1's sticky buy button (z 35, inside the
  isolated paywall) went under a fixed z 34 fade band and was invisible — round 1 blocker.
- **Procedural cloud tiles seam.** `feTurbulence` with `stitchTiles` still showed a hard vertical
  line once tiled and drifting. Draw the tile plus its mirrored copy (`<use … scale(-1 1)>`) in one
  SVG twice as wide; the edges then meet themselves.
- **Every layer edge needs a mask.** A band of mist that ends mid-screen, a radial anchored at a
  pane's edge, or a blurred fog clipped by `overflow:hidden` each leave a straight line. Mask
  both ends; check the boundary between two panes by zooming on it, it is where they show.
- **Muted text on a lighter, moving base:** measure under the bright p90 of the mist, not the
  clean base.

## `hidden` loses to a class's `display`

Any element toggled with the `hidden` attribute whose class sets `display` (flex, grid,
inline-block…) stays visible — add `.x[hidden]{display:none}` with the class. Hit three
times on one page (music pill, sticker-book lock line, its open button). And guard the action
in code too: a hidden button can still be clicked by script or a stale ref (the secret
unlocked at 5/6) (USELOG 2026-10-15, sticker book).

## A photo that holds a live UI element
When an illustration's hand (or paw, tray, sign) must hold something that stays HTML (a ticket
that tears, a card with a price), don't redraw the hand. Edit the photo with an image model
(Weave Nano Banana Pro) so it holds a flat chroma-green (#00FF00) card where the element goes;
then key the green: fill it (multi-scale inpaint + blur + noise, it ends up under the element),
cut the finger pixels inside the card's hull into a separate overlay, and place element + overlay
in the image's own `cqw` (a `container-type:inline-size` wrapper) from the source pixel
coordinates. Ask for an aspect close to the element's; expect ~1 in 2 runs to ignore the brief
(USELOG 2026-10-17, funnel 3 offer). Weave allows only 2 free model runs per account; when it refuses, use
Figma's `generate_image` (Figma AI credits) into a scratch file and `download_assets` the raw image. Then: keep the element close to the placeholder's size (a hand
holding something 6× its width reads fake; ~4–5× is natural), lay its edge exactly on the
placeholder's edge line, and cut the overlay only from pixels above that line — excluding the
model's own shadow on the placeholder, which turns into a dark blob.

## Scale-up reveals stay sharp
Chrome rasterises a transform animation at the scale it can see up front. A small element grown with
`scale()` from CSS keyframes that use `var()` is rasterised at its start size and goes pixelated
mid-flight. Instead: render the final-size copy (static `transform:scale(k)` on an inner box, same
container and custom properties as the original so `cqw`/`var()` sizes match), and animate an outer
wrapper from `scale(1/k)` up to 1 with the Web Animations API and literal numbers. Never fade or
scale the container that holds it — fade only the light layers. Scope helper selectors to direct
children (`.reveal > i`), or a generic `.reveal span{transform:…}` will wreck the cloned content
(USELOG 2026-10-17, funnel 3 offer). iOS Safari goes further: it rasterises a `will-change`/animated layer once
and doesn't re-raster when it settles, so an upscaled card stays soft on iPhone while Chrome
screenshots look sharp. Lay the copy out at its final size (CSS `zoom:k`, with the cqw sizes checked)
rather than `transform:scale(k)`, drop `will-change`, and on `finished` commit the end transform and
cancel the animation (USELOG 2026-10-18). **Correction (2026-10-19): not CSS `zoom` either** — on iPhone a
zoomed card lost its rounded clip and showed its back face as a square behind it, and clip-path patches
didn't hold. Lay the copy out at its final size in plain px: JS sets the card's width/height to the stub's
size × k and its type basis (the custom property the `cqw` sizes read) in px; no zoom, no scale. Snap the
landed position to whole pixels. Keep room for the card's glow inside any clipping parent (~50px below,
~30px elsewhere), or stop the parent clipping once the reveal has happened.

## iPhone Safari layer budget
A reveal that works in desktop Chrome can break on an iPhone ("bị lỗi, hỏng") with no console error:
iOS Safari drops or flickers composited layers past its memory budget. Avoid in one animated moment:
layers sized in vmax/full-screen with masks or filters, rotating masked discs bigger than the screen,
animated `filter` (drop-shadow/blur) on a moving 3D-transformed element, and `background-position`
animations on big areas (repaints every frame). Dim by darkening the photo itself, keep effect
layers ≤ ~600px, put shadows on a static inner box, animate transform/opacity only. Playwright's
WebKit on Windows hangs on these funnels' screenshots whatever is blocked (video, fonts, CSS
features) and only clears when app.js is off — don't sink time into it; ask the user for a screen
recording from the iPhone instead. Also on iOS: avoid `perspective`/rotateY on masked or filtered
content, and don't `focus()` inside a fixed overlay on touch devices (USELOG 2026-10-17). The real
cause, found from the user's screen recording: SVG `feTurbulence` data-URI backgrounds (noise/smoke
tiles). Chrome rasters them cheaply; iOS Safari re-rasterises them and froze the page ~2 s on tap,
so timed CSS transitions completed off-screen and the reveal "jumped". Render such tiles to PNG/webp
once (Playwright screenshot of the data-URI) and ship the files. A screen recording sampled at
2–4 frames apart locates this in minutes — ask for one first.

## What Chrome screenshots hide on an iPhone (round 2, 2026-10-19)
Each of these looked right in headless Chrome and was reported from the user's iPhone:
- **A blurred `<video>` smears into colour blobs** (rings of red/green). Behind a blurred hero use a
  still (the user's photo or the clip's poster) with `filter:blur()`, inside the box (`inset:0` +
  `scale`), not the playing video.
- **A `mask-image` fade on a container fades everything in it, text included** — a title placed inside
  a fading hero went grey and "k rõ". Put the fade on the backdrop layer, not the box that holds copy.
- **Full-bleed by negative margin wider than the page gutter scrolls the whole page sideways** (−20px
  in a 16px gutter = 4px of sideways scroll on every paywall). After any full-bleed change measure
  `document.documentElement.scrollWidth` at 375 and 390; clip with `overflow-x:clip` on the page
  wrapper (not `hidden`, which breaks sticky).
- **A fixed band left behind by an old sticky button** covered content after the button stopped being
  sticky. When a sticky element goes, search for its companion layers (fade bands, bottom padding).
- **`drop-shadow`/`box-shadow` on a decoration inside a scaled or clipped box got cut.** Give the
  glow and the contact shadow their own layers (radial-gradient elements behind the object) instead.

## Placing an asset exactly as a design file shows it
A design tool reports a rotated node's corner, not its bounding box, so copying x/y misplaces it. Render
the design node, then fit the asset onto it: composite the asset at candidate (width, centre x/y,
angle) over the base and minimise the pixel difference with a coarse-to-fine search (a few seconds in
numpy). Convert the result to percentages of the host element and check it beside the reference
(2026-10-18: a hat on an app icon matched to within a few px after two guesses had missed).

## Cutting a subject out of a photo, and filling the hole
Tools that work on this machine: `rembg` with the `u2net` session (+ `alpha_matting=True`) for the
matte — isnet-general-use left haze; a polygon or GrabCut left background on the subject. For the
hole left behind: LaMa (`pip install simple-lama-inpainting`, ~200 MB model, CPU OK at ≤1024 px):
crop around the hole, scale so the long side is 1024, inpaint, scale back, feather 3 px.
OpenCV Telea/blurred fills leave smears the user rejects ("nền bị xóa trông không ổn"). Always
preview a cut on magenta and on the real page background before shipping (USELOG 2026-10-17).
Also seen (2026-10-19): with numpy 1.x, `rembg` fails on `np.long`/`np.ulong` — set `np.long=int;
np.ulong=np.uint64` before importing. Glass and other see-through parts come out as holes (a lantern lost
its panes): fill the enclosed holes and tint them. A pale object on a white ground (pink tape) is cut
to its dark print only; key it by distance from white + morphological close instead. On a plain
white ground `isnet-general-use` gave clean edges; the white-ground prompt is easier to key than green
when the subject has no white.

## HTML emails: judge with real merge values
A template full of `{{credits}}` / `{{email}}` renders at the placeholder's length, not the real
one, and squeezed a side-by-side illustration to 24 px in the before-capture. Capture a filled
copy instead: a typical value and the longest plausible one ("10,000", a 45-character address).
Long addresses wrap wherever `break-word` lands, mid-domain ("…@ou / tlook.com"); ask the backend
in the MERGE FIELDS comment to insert `<wbr>` after "@" and before dots, and to format numbers with
a thousands separator. Headless Chrome's `--window-size` crops narrow viewports; Playwright from
any repo's `node_modules` gives true 320/390 captures (USELOG 2026-10-19).
Icons for an email from Figma: `download_assets` PNG exports bake the parent's fill in (a
grey square behind the gem); take the node's SVG / raw image and render a transparent PNG at 3x
with Playwright (`omitBackground`, loaded from a file page, not `setContent`, or file:// images
come out broken). Pre-mix the app's rgba fills to solid hex for Outlook (USELOG 2026-10-19).
White text on a background-image banner: `background-size:cover` crops the image differently at
each width, so measure the worst pixel over the whole text column of the image, not one spot; bake
a dark wash under the text into the PNG until it is >= 4.5:1. A short address needs the same
`<wbr>` contract as a long one, or it splits mid-domain on a 320 phone (USELOG 2026-10-19).
"Check forced light/dark" for a dark email means Gmail iOS full invert: it flips every colour
(inline and embedded CSS) but never images. Simulate it by flipping HSL lightness of every hex /
rgba in the file and wrapping the body as `<u></u><div class="body">`, then fix: surfaces, rims,
hairlines and gradient buttons as background-image tiles (8px PNGs; rims = a 1px wrapper whose
fill is an image), text inside `.gm-s/.gm-d` screen + difference wrappers (`u + .body`), no inset
shadows. Also capture with `<style>` stripped (inline font-family and gutters on every element) and
with images off (alt text styled). Keep "<body>" out of comments: it breaks such rewrites.
Measure overflow with `document.documentElement.scrollWidth` per width AND per mode: a number and
its unit in two table cells can never wrap, so "+10,000 added" pushed a 320 page to 326 px (366 px
with fallback fonts). Put them in one cell (number `nowrap`, unit may drop). Icon cells next to a
long title need a fixed width the title can't squeeze, or the circle turns into a pill.
Never put padding or margin on a `.gm-s` blend span: under inversion its black box shows as a white
bar. Put spacing in a separate spacer span outside the blend pair (USELOG 2026-10-19).
Confirmed on a real Gmail iOS dark send (19/10): image-locked surfaces stay dark and the blend pair
keeps white/grey text light (a touch greyer), but it can't keep a coloured text: Gmail flips its
lightness (bright green -> dark green) and the blend would turn it complementary. So in a dark email
keep text neutral and carry colour in images/icons. Gmail and iOS also auto-link an address or
number in their own blue, which Gmail then inverts to brown-orange: wrap such values in your own
`<a style="color:...;text-decoration:none">` and add `a[x-apple-data-detectors]{color:inherit!important}`.
The lightness-flip simulator matched the real device on all of this; trust it for colours too.
Better than defending a dark-only mail: ship light as the inline default and dark through
`@media (prefers-color-scheme: dark)` + `[data-ogsc]/[data-ogsb]` (class per dark colour). Gmail then
inverts the light theme into a usable dark one by itself. Design the light theme for that: cards a step
darker than the page (they invert lighter), a logo in a mid tone that reads on white and black, icons in
mid tones, the CTA label as an image (stretched gradient/rim backgrounds + fixed-size label PNG, so it
never shrinks on narrow screens like a whole-button image does), alt text coloured per theme.
Email images are cached by URL (Gmail's image proxy): give every changed image a new filename;
re-uploading under the same name kept the old logo in a real Gmail send (USELOG 2026-10-19).
A logo that must flip with Gmail's inversion (black-led on light, white-led on Gmail dark): Gmail
recolours the cell behind an image but never the image, so split it into a background-image layer
(the coloured part, identical in both modes) under an `<img style="mix-blend-mode:difference">`
layer fitted per pixel against the page colour (#FFF light, #202124 Gmail iOS dark); show it only
under `u + .body`, keep the plain logo as the default so stripped-<style> clients fall back.
White can only reach #DFDEDB on #202124 this way (USELOG 2026-10-19).


## Forking a funnel into another brand

- **Grep the parent's `display:none !important` decor kill-lists against the new brief's add-ons.** The
  parent hid every cobweb and spider as a concept split between its sibling funnels. The new brief asked
  for both, and only the critic's spec check noticed (USELOG 2026-10-20). Concept decisions don't carry
  over to a new brief; craft rules do.
- **A new brand needs a restyle, not a recolour.** A hue-shift of the parent's tokens kept its fonts,
  radii, glass cards, fog and pill CTA. The user said it "still looks like the old funnel" (USELOG
  2026-10-20). Take type, corner shape, surfaces, CTA shape and decor from the new refs, and load the
  restyle as its own stylesheet last, so the parent's layered overrides stay intact.
- **Confirm the server is yours before capturing.** `curl` the port and check the `<title>`. A dev server
  started on a busy port fails quietly, and the sibling funnel already on that port answers every capture.
  A critic whose browser can't reach this machine returns NOT REVIEWED: give it capture files instead.
- **Two fixed `z-index:-1` layers paint in DOM order.** A new decor layer inserted before the old
  atmosphere layer was painted over and invisible on every step. Give the base `-2`.
- **A prop `<img>` keeps its `height` attribute when CSS sets only `width`.** Two keyed props rendered at their
  natural pixel height (708 / 638 px) — one stretched, one pushed behind the clip — and only a DOM probe showed
  it. Give every prop image `height:auto` (or `width:auto`) alongside the side you size.
- **Open/close a photo prop by moving halves, not `scaleX`.** Stretching keyed curtains to "close" them also
  stretched the hands into long arms. Split the ref's own closed frame into two halves and slide them apart.
- **`drop-shadow` plus a CSS `mask`, `clip-path` or `overflow:hidden` on the same element paints that
  element's BOX** — it bit three times in one run on 21/10 (a masked wreath, two clipped halves and a
  clipped chain each drew a pale rectangle). Put the filter on an unclipped wrapper so the shadow traces
  the clipped silhouette, or drop it and light the object with a radial glow behind. The original case: even when the file's alpha is clean (every
  corner 0, < 2 % of pixels at 1–25). It stayed invisible on a dark room and showed once the room behind was blurred
  lighter. Keep the grade (`brightness/sepia/…`) and drop the shadow, or put the shadow on a wrapper.
- **A keyed AI prop with a `drop-shadow` shows a box.** Chroma keys leave alpha 1–10% in the
  "transparent" area, so the shadow (and a CSS mask) outlines the whole canvas. Zero alpha below ~0.1 in the
  file, and bake fades into the file instead of masking in CSS.

- **`!important` on a property that an animation drives freezes the animation.** Important declarations beat
  keyframes in the cascade. A restyle set `transform:none !important` on a marquee track and the reel stopped
  scrolling, and nobody noticed because every check used stills (USELOG 2026-10-20). After restyling anything
  animated, measure motion: read its position twice, two seconds apart.
- **A swapped asset inherits the old one's box.** The re-themed offer kept the parent's `aspect-ratio:483/566` for
  a new 560/545 image: the box ran 40 px under a phone's pinned button and ate its taps (USELOG 2026-10-20, DOTD).
  When an image is replaced, grep its class for `aspect-ratio`, `width`/`height` and keyframe offsets.
- **An invisible animated element still takes taps.** A pass at `opacity:0`, parked in its start position, sat
  over the CTA at 1366×640, so the click never reached the button. Give hidden animated parts
  `pointer-events:none` until they show, and check `elementFromPoint` at the CTA's centre at short heights.
- **Sample motion over time, not one frame.** A `--pop` overshoot lifted the rising pass 4 px into the headline
  and a lid flew across it mid-flight, while the 2.2 s frame looked clean. Read every moving part's rect every
  ~150 ms through the animation, against the title's bottom and the CTA's top.
- **`animation:none` on an element with an entry class (`.rise`) leaves it at the keyframe's start (opacity 0).**
  A title lockup that reused a neon sign's class sat invisible; only a computed-style probe showed it.
- **Particle layers (petals, embers, sparks) go behind content**, never `z-index` above it: the critic found
  them on option labels, inputs and copy across four steps.
- **Prefix every class a restyle adds.** A corner-ornament class `.fl` collided with the shell's footer-logo `.fl`,
  pulled the logo out of flow and laid it over the paywall links (USELOG 2026-10-20, DOTD 2). Grep the shell for a
  new class name before using it.
- **A CTA label's fit is a per-width measurement.** Wrapping a long label on phones and then narrowing the desktop
  column put it back under the arrow at 1440. Measure the text range (`Range.getClientRects`) against the arrow's
  left edge at 360/375/390/1024/1280/1440 after any change to the button's width, label or font.
- **The parent shell hard-codes its palette outside the tokens** (a top-bar gradient, the pinned-button fade). After
  a re-theme, sample the computed background at the top bar and behind the pinned CTA, not only the tokens — the
  old maroon survived three re-themed funnels until a critic noticed a warm band (USELOG 2026-10-20, DOTD 3).
- **A value JS sets inline loses to an inherited `!important`.** A per-step figure set `style.aspectRatio` from JS while an older
  stylesheet had `aspect-ratio … !important`: the figure rendered 75% wider than the layout maths and covered the CTA. Use
  `el.style.setProperty(prop, value, "important")`, and measure the rendered rect, not the computed intent (USELOG 2026-10-21).
