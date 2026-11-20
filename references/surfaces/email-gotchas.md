# Email gotchas — by topic

Detail behind `email.md`. Open only the section whose topic the work touches. Moved verbatim
from `web-gotchas.md` on 2026-11-20 (the first section); later sections added since.

| Section | Open when |
|---|---|
| Merge values, captures, Gmail flip — the original notes | any email build or capture |
| Content from a spec sheet | copy swaps, sheet-driven mails |
| Simulator and capture traps | building fixtures, trusting a render |

## Merge values, captures, Gmail flip — the original notes
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
A real screenshot (checkout, app screen) in a mass mail: a light blur the sender already applied
still read as the tester's address at 1x and will read better on retina. Replace every value with a
solid bar, cut the rows that don't carry the message (email, country), crop inside the screenshot's
own frame so the mail's rim is the only border, and keep the bottom inset equal to the sides. A white
raster glares in dark clients and Gmail won't swap images by theme: crop it short, and let it span
the column at <=340 so it doesn't sit a near-miss inside the card below (USELOG 2026-11-06).
A bright mid-tone fill (checkout green #3DD571) keeps its lightness under Gmail's flip while its dark
label flips to white: about 2:1. A button drawn in HTML needs a dark fill with a white label (#15803D),
which flips to light green + dark label. Ringing values in an HTML mock: a 2px coloured wrapper cell with a
theme class, like the rims, not a CSS border (no per-theme class for borders) (USELOG 2026-11-06).
Copy swaps in a mail set: a two-sentence headline with the second sentence accented needs a <br /> between
the sentences, or at 320 the accent starts mid-line ("…is / saved. Finish in / one step."); keep the first
sentence's last word joined with &nbsp;. After a swap, search every sheet sentence in the built HTML (strip tags):
the misses that remain must be design mappings only (badge, price card, link text, subject in the head) (USELOG 2026-11-16).
A tint fill (number dot #D9CFF8 on a #EEEEF1 card) flips to near-black on a near-black card: the numeral passes
but the dot vanishes. Measure the fill against its container after the flip too, and give Gmail a solid fill via
`u + .body .cls { … !important }` (light / dark themes untouched) (USELOG 2026-11-16).
A content sheet keeps copy in its design-note cells too (table rows, frame tags, card titles, badge wording,
"don't use X"): a copy swap reads every note cell, not only the Text rows. Missed once: the old tick table and
a "100% Rendered" tag shipped after the sheet had replaced them in the notes (USELOG 2026-11-16).
A logo that must flip with Gmail's inversion (black-led on light, white-led on Gmail dark): Gmail
recolours the cell behind an image but never the image, so split it into a background-image layer
(the coloured part, identical in both modes) under an `<img style="mix-blend-mode:difference">`
layer fitted per pixel against the page colour (#FFF light, #202124 Gmail iOS dark); show it only
under `u + .body`, keep the plain logo as the default so stripped-<style> clients fall back.
White can only reach #DFDEDB on #202124 this way (USELOG 2026-10-19).
Headless Chrome will not lay a page out under 500 px: `--window-size=420,…` or `320,…` silently
renders at 500 and crops, so an email "checked at 420" was really checked at 500 (`innerWidth` reports
500). Capture through a harness page — an `<iframe>` of the exact width inside a 500-wide window — and
crop the screenshot to that width; print `innerWidth`/`scrollWidth` into the capture to prove it.
A local email fixture is judgeable by `ui-critic`: serve the folder (`tools/ui-check/serve.js`) and
give it light / forced-dark / Gmail-flip pages plus the captures (2026-11-06).
At 320 an email table column is ~56 px: `word-break:break-word` splits values mid-word ("$9.99/w k").
Keep values ≤ ~8 characters and move units to a second, smaller line (amount over "per week").
A light tint behind a winning column flips to near-black under Gmail's lightness flip and the column
reads sunk: give its text a DARK accent in light (it flips to a light accent) and give it its own
dark-mode class so Apple Mail dark keeps the violet instead of a neutral grey (2026-11-06).
Two CTAs in one email at different container widths scale their image labels differently on a
narrow phone: inset the standalone CTA to the in-card CTA's exact width at every breakpoint.
Side-by-side media in an email (two frames + a fixed gutter) come out a few px unequal when the
columns size to their content (a label above one frame): put `table-layout:fixed` on that table and
give only the gutter a width, so the frames split the rest exactly. Text baked into a GIF shrinks with
the frame — at 320 a 240-px-wide GIF shows at ~0.53x, so bake labels at ≥ 16 px (2026-11-06).
Gmail's lightness flip turns a MID accent into a mid accent: #5B3FA8 became #7357C0 and black-on-it /
it-on-black measured 3.5–3.9:1 on badges, bands and small numerals. Pick the light-theme accent dark enough
(#43288F → flips to ~#8B70D7, 6.3:1) and re-measure contrast in the flip simulator, not just in light/dark
(2026-11-06, 8-mail flow). Text baked into images is a label like any other: at 320 a 760-px picture shows at
0.38x, so keep labels out of the picture and set them in HTML under it.
A swipe row of cards in an email (the app's "card" rows): one `white-space:nowrap` div with `overflow-x:auto` and
inline-block cards of a fixed width (~200 px) so the next card peeks as the cue. Wrap it in a
`table-layout:fixed; width:100%` table, or the nowrap row widens the whole mail past the screen. Keep it inside the
text column (`.px`-style classes force the page padding on phones, so a bleed doesn't hold) and give Outlook
desktop a grid in `<!--[if mso]>`. Blocks return no trailing spacer when the builder adds the gaps — a block
that ends in its own 40 px plus the builder's 40 px reads as 80 (2026-11-06). A checkout drawn inside an email
(mock phone, screenshot) keeps its own button muted grey: a second coloured button competes with the mail's one CTA. Before a critic round, regenerate EVERY fixture variant (all
mails × light/dark/gmail) from the current build: re-shooting only the variants you looked at leaves stale dark
pages the critic will rightly fail (2026-11-06). Comparison-table column headers stay on one line (`white-space:nowrap`,
~11 px under 360): size the columns for the longest header, and narrow the label column instead (2026-11-06).
Merge fields come from the content owner's field list; when a block needs data the list lacks, say so
and ask — don't coin names and ship them in the template (2026-11-06).
An offer card in an email keeps three type tiers — labels (~12), body (~15), the prices — with badge, number dots
and summary head folded into those; a point that must stand out (renewal terms) gets weight and full-strength
colour, not its own tile, so the numbered list keeps one shell. A no-break space added to fix a headline wrap can
leave one word alone on a middle line at 320: re-measure every width after each `&nbsp;` change (2026-11-06).

## Content from a spec sheet
- **Email from a spec sheet: an empty design cell means no visual.** If a block's "Mô tả design" cell is blank, ship headline + text only — don't keep a picture/pills a shared block carries by default (P7 C2-D, 16/11). And build only the columns the sheet highlights when it marks a set; unhighlighted columns are repeats.
- **Email heading size follows the block's position, not the block.** A shared block that opens some mails (h1) must drop to section-head size when it sits after the hero — a second h1 in one mail reads as a new mail (Lensie P7 M2 offer hook, 16/11).
- **Email headings: glue only the 2-word phrase you must keep, never chain &nbsp;.** A helper that already turns the last space into &nbsp; (no lone last word) plus your own &nbsp;s can weld a whole title into one unbreakable run that overflows 320px. Glue "payment&nbsp;details", leave the other spaces, then look at 320 (Lensie P7, 16/11).

## Simulator and capture traps
- **Headless Chrome inherits the OS theme.** On a machine in dark mode, `prefers-color-scheme: dark`
  fires in the fixture meant to show light. Neutralise the query for the light and Gmail fixtures,
  force it (`@media all`) for the dark one.
- **What the inversion simulator must model:** Gmail pins the background *image* but still repaints
  the background *colour* under it (skip both and a white box appears behind a blended logo); and Gmail
  wraps the message so `u + .body` matches — without emulating the wrapper the sim reports logo bugs
  that aren't real. A v1 simulator that used `filter: invert(1) hue-rotate(180deg)` inverted
  background images, which no real engine does — never go back to it.
- **`u + .body` does not fire in the Gmail apps** (it does in the simulator). Anything gated on it
  stays hidden on a real phone: the Gmail logo variant must be visible by default. Treat every
  `u + .body` fix as unverified until a real send.
- **Porting a style from a sibling mail is not automatically an upgrade.** Measure what you copy as
  well as what you replace: a ported gradient CTA measured worse at rest (2.63:1 vs 3.09:1) and only
  won because its label is an image.
- **Real sends catch what all simulations miss** — a pinned gradient card with live dark text was
  found only on a real Gmail iOS send.
