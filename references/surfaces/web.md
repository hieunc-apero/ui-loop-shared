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

## Gotchas — open `web-gotchas.md` at the section when the work touches its topic

Each one cost a round once. Not read every run: look up the section that matches what you are
building or what the critic flagged.

| Section in `web-gotchas.md` | Open when |
|---|---|
| A layout swapped on the client | scripting captures/e2e on a page with a client-chosen desktop layout |
| Measure in characters, not `ch` | setting a max-width for text, line length |
| Colour fixes: re-measure against every background | changing a colour, contrast fixes |
| The hidden pane freezes animation | capturing animation, entrance frames, the browser pane is hidden |
| A clip on a moving element moves with it | clip-path / mask on a moving or transformed element |
| Photoreal props (AI image, keyed) | adding a photo prop, AI image, chroma key |
| Cursors, stickers and tiny icons | custom cursor, stickers, small icons |
| Transient effects (floating hearts, bursts, toasts) | bursts, floating particles, toasts |
| Modals, embeds and audio | modal, iframe/embed, audio player |
| Gotchas that cost a round on a seasonal campaign funnel (2026-10-16) | themed funnel: backdrops, sticky buy button, fixed layers, headline type |
| A whole-page atmosphere layer (fog, haze, grain) behind every screen | fog/haze/grain or any full-page backdrop layer |
| `hidden` loses to a class's `display` | toggling with the `hidden` attribute |
| A photo that holds a live UI element | a photo hand/object holding a UI element |
| Scale-up reveals stay sharp | scale-up reveal animations |
| iPhone Safari layer budget | many animated layers, iOS Safari jank/blur |
| Cutting a subject out of a photo, and filling the hole | cutting out a subject, inpainting |
