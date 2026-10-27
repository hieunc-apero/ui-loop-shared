# ui-check — the measurable rules, checked while building

`ui-check.js` measures, in the page, the `[đo]` rules that a script can measure — in ~50 ms per page,
with no critic round and no tokens. The builder runs it after every change (SKILL.md step 4); its
output goes to the critic as **Measured**, so the critic spends its round looking, not re-measuring.

Measured on 322 findings the critic made in real runs (2026-10-14 → 10-20): ~31 % were fully
script-measurable, ~20 % a script can locate but an eye must confirm (text over a photo, a chip over
a face). The rest is taste and drawing — still the critic's job.

## Run it

```sh
# from the project folder (uses its node_modules/playwright-core if present)
node ~/.claude/skills/ui-loop/tools/ui-check/run.js http://localhost:3000/styles \
     --widths 390,1440 --themes dark,light --ls '{"app.onboardingSeen":"true"}'
# only the part you changed (small lane):
node …/run.js http://localhost:3000/ --widths 390 --scope ".site-bar"
# a local file or folder: served over http://127.0.0.1 for the run; theme by attribute, not media query:
node …/run.js ./out/index.html --themes dark,light --theme-attr data-theme
```

**For the critic** — it can't open `file://`. Serve the folder first and give it the URL:
`node ~/.claude/skills/ui-loop/tools/ui-check/serve.js <folder|file.html> --port 8765` (run in the
background, curl the URL, then dispatch).

First time on a machine without playwright-core anywhere: `npm i --prefix ~/.claude/skills/ui-loop/tools/ui-check playwright-core`
(no browser download — it drives the installed Chrome; `CHROME=<path>` if it's elsewhere).
In a browser pane instead: paste `ui-check.js` once per page load, then call `__uiCheck({ scope })`.

## Read the output

```
== http://localhost:3000/styles @390 dark: 4 block · 11 warn/?
  U5 | block | div.site-bar>a.btn-fx.btn-sheen | tap target 111×36 < 44 (primary)
  U6 | ?     | a.style-tile>span.truncate | text over media — measure against its darkest part "Pumpkin Pair" (×49)
```

- **block** — fix before the critic sees it (or say in the brief why it is intended).
- **warn** — a taste threshold or a likely issue; decide, don't ignore silently.
- **?** — the script found where to look (text over a photo or a gradient) but can't judge it; zoom.
- `(×N)` — the same selector N times; fix the pattern, not one instance.

| ID | Checks | Severity |
|---|---|---|
| U1 | broken images | block |
| U2 | horizontal overflow (page and the element sticking out) | block |
| U3 | text clipped by its box | block; warn if it ends in an ellipsis |
| U4 | a button label broken onto two lines | block |
| U5 | tap targets < 44 px at phone width | block if < 32 px or a primary button, else warn |
| U6 | text contrast (WCAG AA: 4.5, large text 3), through gradients; text over media | block / ? |
| U7 | fixed/sticky layer translucent over content (incl. `::before`/`::after`) | block if alpha < .5 with no blur, else warn |
| U8 | fixed/sticky layers overlapping each other | block |
| U9 | placeholder text (lorem, undefined, NaN…) / raw file or key names | block / warn |
| U10 | heading ending on a lone word | warn |
| U11 | icon centre vs text centre > 1.5 px | warn |
| U12 | siblings meant to be equal with different heights/widths | warn |
| U13 | chip/pill text-to-edge < 8 px vertical / 12 px horizontal (taste axis 4) | warn |
| U14 | text < 12 px; body < 14 px on desktop | warn |
| U15 | display type: line-height < 1.05, letter-spacing < −0.02em | warn |
| U16 | line length > 80 characters | warn |
| U17 | a native scrollbar visible (doesn't show in headless captures) | warn |
| U18 | card inside a card | warn |
| U19 | two filled/accent buttons side by side | warn |
| U20 | more than one kind of saturated fill / glow / coloured shadow in one block (taste 1) | warn |
| U21 | resting chip/pill shadow alpha > 0.35 (taste 1) | warn |
| U22 | the same component (same classes) in different looks — height, radius, fill, text (taste 3) | warn |
| U23 | native select / checkbox / radio / date control inside a styled UI (taste 3) | warn |
| U24 | body line-height outside ~1.35–1.6 (taste 4) | warn |
| U25 | card text closer than 16 px to the card's edge (taste 4) | warn |
| U26 | columns in a row not top-aligned, or a label pushing one column's card down (taste 5) | warn |
| U27 | more than one hero-size gradient in a viewport (taste 8) | warn |
| U28 | a filled CTA on a panel of its own hue and lightness (taste 8) | warn |
| U29 | a text input that starts filled in (taste 10) | warn |
| U30 | more than one headline-size heading in a fold (taste 10) | warn |
| U31 | a fixed/sticky layer covering a control on first load (taste 13) | warn |
| U32 | desktop: the first viewport is a narrow centred column (taste 14) | warn |
| U33 | desktop: no primary action in the first viewport (taste 14) | warn |
| U34 | endless animations still running under prefers-reduced-motion (run.js only; taste 11) | warn |

U20–U34 came from the taste profile's `[đo]` lines (2026-10-27) and were tuned on 10 real pages; they
are leads, not verdicts — selected states, status colours in app screens and timeline blocks can
trip U20/U22/U31.

Thresholds are options: `__uiCheck({ tap: 48, chipV: 6 })` or `window.UI_CHECK_CONFIG` set by the
project. Project rules beat the defaults; the taste profile's numbers are the defaults here.

## Growing it

When a retro adds a `[đo]` rule that a DOM measurement can decide, add it here as the next `U`
number: one check, a line in the table, and a planted defect in a fixture page to prove it fires
and a clean element to prove it doesn't. Test on a real page for false positives before committing.
Log it in both CHANGELOGs. A check that keeps crying wolf is narrowed or made `warn`.
