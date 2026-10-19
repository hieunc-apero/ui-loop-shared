# Surface: web app

Product UI behind (or beside) a login: dashboards, editors, settings, libraries.

## Build

- Load `frontend-design` for new surfaces, `impeccable` when refining an existing one.
- Reuse the app's components and tokens first; DESIGN.md usually lists them.
- Every screen has more states than the happy path: empty, loading, error, long text,
  logged-out/guest, feature flag off. Build the ones the brief names; mention the rest.

## Capture for the critic

Start the dev server with `preview_start` (name from `.claude/launch.json`). If the port is
already taken by the user's own server, `navigate` to it and confirm it's this app. Pass the
critic the URL(s), widths (default 390 / 820 / 1440), themes, and how to reach each state —
debug panels, query params, feature flags. A state the critic can't reach is a state it can't
check.

## Capture without the browser tools

When the critic can't drive a browser, script the captures with Playwright and hand over a
folder. If the Claude-in-Chrome tab shows an error page on `localhost`/`127.0.0.1`
while `curl` gets 200, that browser can't reach this machine's servers: stop retrying and go
straight to `npm i playwright-core` in the scratchpad with `executablePath` set to the installed
Chrome (no browser download). The critic hits the same wall, so hand it files, not a URL
(USELOG 2026-10-16). What to put in it, and the two traps that produced false blockers before:

- **A second `next dev` for captures (mock workflow, another port) must use a `distDir` the
  repo already ignores** (e.g. `.next-e2e`). Tailwind v4 scans every non-ignored file, so a
  new `.next-mock/` fed escaped class names back into the CSS and broke the user's own dev
  server ("Parsing CSS source code failed") until `.next` was deleted (USELOG 2026-10-14).
- **List every file by its absolute path in the brief, never just the folder.** The critic has
  only `Read`, which cannot list a directory; given a folder it guesses names, finds none and
  returns NOT REVIEWED — a whole round burned (USELOG 2026-10-14, detail pages).

- **Viewport captures after scrolling, not only full-page.** A full-page capture leaves
  lazy-loaded media black (critic reads it as an empty placeholder, rule 1) and paints
  `position: fixed` bars in the middle of the page (critic reads it as a bar covering content).
  Take full-page for layout, plus viewport captures scrolled to each section.
- **Pinned bars: measure, don't picture.** Scroll to the bottom and record the last content
  box's `bottom` against the bar's `top`; put the numbers in `metrics.json`.
- `metrics.json` per page × width: `scrollWidth` vs `clientWidth`, broken images, console
  errors, computed colours (text and background) of every element the brief changed —
  including the small ones inside it (a "+N" badge inside a selected pill).
- One file per state the brief names (menu open, option picked, hover, other theme), named
  `state-<what>.png`.
- Feature flags and debug state set in `localStorage` before the first navigation.

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

## Typical web-app blockers

Fixed/sticky layers colliding (dock, toasts, banners), content behind a translucent header,
truncated labels at 390, tap targets under 44 px, focus invisible, scroll position kept across
route changes, filters lost on Back.

### Native scrollbars don't show in headless captures

Headless Chromium hides scrollbars (`--hide-scrollbars`), and Playwright's default leaves overlay
bars at 0 px, so a white Windows bar a user sees never appears in the capture. To check
scrollbars, launch with `chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] })` and
list every element with a visible bar (`offsetHeight − clientHeight − borders > 0` and
`scrollWidth > clientWidth`); pass that list to the critic as Measured. A fix that adds
negative margins inside a scroller can create a new bar on its parent (USELOG 2026-10-15).

- `[đo]` Headlines never end on a lone word: `text-wrap:balance` on every headline, and check the last line at each width (user feedback 16/10: "đừng để rơi chữ một mình, ít nhất để 2-3 chữ"). A measuring script that groups words by line top misreads a raised script word as its own line — confirm on the screenshot.
- `[đo]` `text-wrap:balance` alone does not keep phrases together on phones: bind the phrases the user names (nowrap spans) and give a long last phrase its own line; check 320/360/375/390/414/430, not just 390 — the user reads on their own phone width (user 16/10: "social media đang rơi chữ… gộp just for you thành 1 dòng… In Seconds thành 1 dòng").
- `[đo]` When a display font lacks glyphs (demo fonts: no digits/punctuation), never let the fallback mix into a big figure — set the whole figure ("50% OFF") in one complete face, and check the fallback glyph does not collide with neighbours.

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
cancel the animation (USELOG 2026-10-18).

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

## Cutting a subject out of a photo, and filling the hole
Tools that work on this machine: `rembg` with the `u2net` session (+ `alpha_matting=True`) for the
matte — isnet-general-use left haze; a polygon or GrabCut left background on the subject. For the
hole left behind: LaMa (`pip install simple-lama-inpainting`, ~200 MB model, CPU OK at ≤1024 px):
crop around the hole, scale so the long side is 1024, inpaint, scale back, feather 3 px.
OpenCV Telea/blurred fills leave smears the user rejects ("nền bị xóa trông không ổn"). Always
preview a cut on magenta and on the real page background before shipping (USELOG 2026-10-17).
