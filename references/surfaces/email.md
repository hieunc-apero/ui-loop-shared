# Surface: HTML email (marketing, retention, transactional)

An email is not a web page. It is rendered by a dozen engines that strip CSS, ignore media
queries, block images, auto-link text, and — the expensive one — **recolour the mail for dark
mode on their own**. Most rounds lost on email were lost to reasoning about a client instead of
rendering it. Everything here comes from runs that shipped a defect first.

Topic file: `email-gotchas.md` (same folder) — open the section whose topic the work touches.

## Build

No build skill fits email; `building-landing-pages`, `impeccable` and `design-taste-frontend`
assume a browser. Load `impeccable` only for copy/hierarchy judgement, never for markup.

- **Start from the project's newest shipped mail, not from scratch.** Find every copy of the
  reference mail, compare version lines, read its changelog — the newest file on disk is not
  always the newest version, and an older copy re-imports bugs already fixed.
- **Build from a script, fix in the script.** One generator (head CSS, logo, card shell, CTA,
  footer as functions; each mail = a list of blocks). Hand-fixes to the generated HTML are
  wiped by the next run. Shared blocks return no trailing spacer — the builder owns the gaps.
- **Restyling is not permission to cut content.** Port the shell, keep every element unless the
  user says otherwise; if it looks wrong at the new density, say so and let them cut it.
- **Copy comes from the content owner's sheet, verbatim** — including the design-note cells
  (table rows, tags, badge wording, "don't use X"), not only the Text rows. An empty design cell
  means no visual. After every copy swap, search every sheet sentence in the built HTML with tags
  stripped; the remaining misses must be design mappings only.
- **Merge fields come from the owner's field list. Never coin one.** A block that needs data the
  list lacks → ask. Ask the backend (in a MERGE FIELDS comment) for `<wbr>` after "@" and before
  dots in addresses and thousands separators in numbers.

## Structure (the skeleton every mail keeps)

- XHTML transitional doctype; `x-apple-disable-message-reformatting`; `color-scheme` and
  `supported-color-schemes` = `light dark`; body class `body` (the Gmail wrapper hooks on it).
- One centred table, `width="100%" max-width:420–600px`, with an `<!--[if mso]>` fixed-width
  ghost table for Outlook desktop. Layout in tables; `role="presentation"` on every layout table.
- **Every style inline**, on every element that shows text — font-family, size, colour, padding.
  `<style>` is a progressive layer (phone tweaks, dark classes) that some clients strip; the mail
  must read with it gone. Colour sits on the leaf that carries the text, never inherited from a
  parent: an inheriting `<span>` has no `!important` rule of its own and anything recolours it.
- Preheader only when the content owner wrote one (hidden div, padded with `&#8199;`).
- No SVG (Gmail and Outlook strip it), no webfont you can't license or load — Inter/system stack
  with explicit fallbacks. Vector is the source; PNG @2–3x is the wire format.
- Phone rules under `@media only screen and (max-width:359px)` for the 320 case; design at 420.

## Style (what the user has accepted, generalised)

- **One CTA**, full width at the foot. A long mail (> ~1,300 px) may repeat the *same* CTA right
  under its first block — never inside a card, never a second, different action.
- **Hero open on the page** (headline, picture, body); cards only for supporting blocks (a table,
  an offer summary). Hero → next block ≈ 28 px, not a double gap.
- **One accent colour.** Headlines get punch from size and plain words; one accented phrase at most.
- **Three type tiers per card** — labels (~12), body (~15), the key number. A point that must
  stand out (renewal terms) gets weight and full-strength colour, not its own tile.
- Heading size follows the block's **position**: a shared block that opens some mails as h1 drops
  to section-head size when it sits after the hero.
- Rows the app shows as swipe cards stay a swipe row (fixed-width inline-blocks, next card peeks).
- In a comparison table only the winning column is coloured; headers stay on one line.
- A checkout or app screen drawn inside a mail keeps its own buttons muted — the mail's CTA is
  the only coloured button.
- Footer verbatim from the owner's footer source; every link and address in your own `<a>`.

## Dark mode — the part that breaks 🔒

Three client families, three behaviours:

| Client | What it does | How you control it |
|---|---|---|
| Apple Mail, iOS Mail, Outlook.com, some Androids | honours `@media (prefers-color-scheme: dark)` / `[data-ogsc]` `[data-ogsb]` | your own dark theme, via classes |
| **Gmail apps (iOS/Android)** | ignores your dark CSS and **flips the lightness of every CSS colour** (inline and embedded; hue and saturation kept) — background, text, border. **Never touches images**, `<img>` or `background-image` (raster *or* gradient) | design the light theme so its flip is good; pin what must not flip with images |
| Gmail web, Outlook desktop | mostly leave the light mail alone | nothing |

**Architecture: light inline, real dark through classes.** Inline styles and `bgcolor` carry the
light value; the element's class is named after its dark value (`tx0F0F0F`, `bg1C1C1F`) and the
media query + `[data-ogsc]/[data-ogsb]` supply it. Gmail then inverts the light theme into a
usable dark one by itself. Never build a dark-only mail and try to stop Gmail — that loses rounds.

**Design the light theme for the flip:**
- Cards a step darker than the page (they invert a step lighter). Hairlines and rims as real fills.
- **Accent dark enough to flip light**: a mid violet `#5B3FA8` flipped to `#7357C0` and failed
  3.5:1; `#43288F` flips to ~`#8B70D7`, 6.3:1. Measure contrast *after* the flip, not just in light/dark.
- **Keep live text neutral.** Gmail flips a coloured text's lightness (bright green → dark green);
  colour that must survive goes in images and icons.
- A tint fill flips to near-black on a near-black card and vanishes: give Gmail a solid fill via
  `u + .body .cls { … !important }`.
- A bright mid-tone fill keeps its lightness while its dark label flips white (~2:1): an HTML
  button needs a dark fill with a white label.
- Auto-linked addresses/numbers turn Gmail-blue → inverted brown: wrap them in your own
  `<a style="color:…;text-decoration:none">`; add `a[x-apple-data-detectors]{color:inherit!important}`.

**The background-image rule 🔒** — an element may carry a `background-image` only if everything
on top of it is also an image. Gmail pins the image but repaints the text over it: dark copy on a
pinned dark card. Live text sits on a flat `bgcolor`.

**Elements that must not flip** are built from images:
- **CTA**: gradient and 1 px rim as stretched background images, the **label as a fixed-size
  PNG** (not a whole-button image, which shrinks on narrow screens). Flat colour + live label
  measured 1.47:1 after Gmail's flip. Two CTAs at different container widths: inset them to the
  same width so their labels scale alike.
- **QR / code plates** stay white in every theme — a re-tinted QR doesn't scan.
- Surfaces that must stay dark in a dark-designed mail: 8 px PNG tiles as background images.

**The logo 🔒** (wordmark that must read on white and on Gmail's flipped page) — three variants,
one visible at a time:
- `.logo-gm` — **visible by default, not gated by any selector** (`u + .body` does *not* fire in
  the Gmail apps): the coloured half as the cell's `background-image` (identical in both modes)
  under an `<img style="mix-blend-mode:difference">` of the ink half, fitted per pixel against
  the page colour (#FFF light, #202124 Gmail iOS dark). `mso-hide:all`.
- `.logo-light` — inside `<!--[if mso]>…<![endif]-->`, Outlook desktop only.
- `.logo-dark` — swapped in by the dark media query and `[data-ogsc]`, which also hide `.logo-gm`.
- A client without blend modes shows the ink half as-is — accept it. Never live text, never SVG.
- Any text you keep light on a dark mail via blend pairs (`.gm-s` screen + `.gm-d` difference):
  no padding or margin on the blend span (its black box shows as a white bar).

**Images:** cached by URL in Gmail's proxy — every changed image gets a **new filename**, never a
re-upload under the old name. Style alt text (font, size, colour per theme) for images-off. Text
baked into a picture shrinks with it (a 760 px picture shows at 0.38x at 320): keep labels in
HTML, or bake them ≥ 16 px. A white screenshot glares in dark clients and Gmail won't swap it —
crop it short. Real screenshots in a mass mail: replace every personal value with solid bars.

## Self-check (before a critic round)

Render and look, every time — a theme rewrite handed over on measurements alone came back with
three defects visible in the first screenshot.

1. **Fixtures per mode**, generated from the current build (all of them, every round):
   - `light` — dark media query neutralised (`@media not all`, `[data-og*]` renamed);
   - `dark` — forced on (`@media all`);
   - `gmail` — light fixture + `tools/email-shots/sim-invert.js` injected (lightness flip, images
     pinned, the `<u></u><div class="body">` wrapper Gmail adds).
   Headless Chrome inherits the OS theme: an un-neutralised "light" fixture renders dark on a
   dark-mode machine, quietly.
2. **Widths 420 and 320** through an `<iframe>` harness — headless Chrome won't lay a page out
   under 500 px and silently crops (`tools/email-shots/shots.js` does both).
3. **Real merge values**, typical and longest plausible (a 45-character address, "10,000").
4. Per width × mode: `document.documentElement.scrollWidth` ≤ width; contrast of **every
   (text, ground) pair in all three modes**, the same class on each ground it sits on
   (body ≥ 4.5, large ≥ 3); the simulator's `__simStats.strandedText` empty.
5. `<style>` stripped (inline fallbacks hold) and images off (alt text styled, layout intact).
6. Assets reachable at their production URLs (HTTP 200), no test hosts left.

The simulator is a model — it has been wrong before, and each time a render or a **real send**
corrected it. Hand-off names what was only simulated; a real send to Gmail iOS dark + Apple Mail
is the last check before anything goes out.

## Capture for the critic

Serve the fixtures folder (`tools/ui-check/serve.js`) and pass, per mail, the light / dark /
gmail pages at 420 and 320 plus the PNGs. Brief `Surface: email`, the content sheet columns the
mail implements, and the merge values used. The critic reads `references/critic/modes.md` →
`email`.
