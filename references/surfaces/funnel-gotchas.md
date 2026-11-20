# Funnel gotchas (topic file for `funnel.md`)

Read by topic: the funnel is a fork or a reskin, several sessions share sibling funnels, or a
self-check needs one of the probes below. Moved out of `funnel.md` on 2026-11-20 to keep it under its cap.

## Probes

- **Cropped shadow / glow** (the most repeated funnel defect, 2026-11-20 mining). For every element with a
  `filter` containing `drop-shadow`, a `box-shadow`, or a glow pseudo-element, walk up to the step root and
  flag any ancestor (or itself) with `overflow` ≠ visible, `mask`, `clip-path`, or `contain: paint`:
  ```js
  [...document.querySelectorAll('*')].filter(e=>{const c=getComputedStyle(e);return /drop-shadow/.test(c.filter)||c.boxShadow!=='none'})
   .map(e=>{for(let a=e;a&&a!==document.body;a=a.parentElement){const c=getComputedStyle(a);
     if(c.overflow!=='visible'||c.maskImage!=='none'||c.clipPath!=='none')return [e.className,a.className]}}).filter(Boolean)
  ```
  Then check the assets: the outermost 2 px of every cutout's alpha must be 0 (PIL:
  `a=np.array(im)[:,:,3]; max(a[:2].max(),a[-2:].max(),a[:,:2].max(),a[:,-2:].max())==0`). A baked glow that
  reaches the canvas edge reads as cropped however clean the CSS is.
- **Decor over content:** intersect every decor box (`img`, decor `svg`, pseudo-element boxes) with every text
  node's range rects, the CTA, the sound pill and the topbar, at 390×844 and 390×664; any overlap > 0 px is a
  block unless the brief names it. Over video, also sample 3+ frames per clip for faces.
- **Reveal timing:** after the tap, sample the revealed element's transform/opacity every animation frame —
  first change within 400 ms, no run of ≥ 10 identical frames mid-reveal (a static hold), no single-frame jump
  larger than 1/8 of the total travel.

## Forks and re-themes

- **A funnel forked from another one inherits its documented decisions** (forward-only, no Back,
  prices). Put them under **Out of scope** from round 1 with their source, or they come back as
  blockers: round 1 of seasonal funnel 1 blocked on "no Back" that the source README chose.
- **A fork starts from the source's rule file, copied whole, then edited.** Seasonal funnel 3's rules were
  rewritten from memory and lost funnel 1's "processing fits one phone viewport"; the user
  caught it ("màn loading đang dài quá").
- **Re-theming a fork: when a colour changes role, audit every inherited state that used it.**
  Seasonal funnel 3 moved orange from "selection" to "CTA"; the option cards were redone, but the
  paywall's selected-plan check stayed orange and the critic blocked it. Grep the old token
  and its rgba triples across the whole stylesheet, not only the screens you redesigned.
- **A fork whose parent is still being edited inherits a moving target.** Re-read the parent's
  `.claude/design-rules.md` before every critic round and port the rules added since the fork
  (seasonal funnel 2: rounds 1–2 blocked on parent rules 14–17 written after the fork — real webs,
  no success webs, the "Need help?" pill). Diff the parent's rule numbers, not your memory.
- **A re-themed fork keeps the parent's colours in hard-coded triples, not only tokens.** Remapping the
  tokens left ~40 `rgba(r,g,b,…)` / hex uses of the old accent (a halo, a card border, a fade band) and the
  critic found them screen by screen. Grep the old accent's triples and hexes across every file and remap
  them in one pass; then sample the hues of every AI-generated prop too (a generated bunting carried one
  off-palette flag) (2026-10-21).
- **Forking a funnel into a new brand, and checking the capture server:** `web-gotchas.md` →
  "Forking a funnel into another brand" (kill-lists vs the new brief, restyle not recolour, busy ports).
- **Capture hygiene for scripted runs:** never let a partial re-capture overwrite the full run's
  `metrics.json` (name it per run), and log `document.fonts.check(...)`, failed requests and
  broken images in the continuous-flow run too — a run that lost its web fonts and logo cost a
  round as a false blocker (seasonal funnel 2, round 4).
- **A funnel that continues an email reuses the email's merge-asset samples — open a frame of each first.**
  The sample "blurred video" GIF had the lock and its caption baked in; an overlay drawn on top doubled the label
  ("Your video here" twice). Extract one frame (`ffmpeg -frames:v 1`) of every sample asset before drawing UI on it,
  and read the email project's handoff for what the backend bakes in (USELOG 2026-11-07).
- **Sticky price rail beside a long proof column, under a sticky header:** keep the page's bottom
  space *inside* the grid area (padding on the long column, not the grid). Otherwise the rail
  is pushed up under the header at the end of the page and its heading gets cut (2026-10-16).
- **Per-step rooms: find the layer that actually paints.** A fixed `.atmo` may sit behind an opaque framed fill
  (`.panel::after`) plus an inset band and a button scrim of the same colour; recolour all of them, and outrank the old
  selector's specificity (`!important` alone lost to (0,3,1)). Use `elementsFromPoint` — it skips `pointer-events:none`
  layers, so read the pseudo-elements too. Never a room in the CTA's hue (2026-10-22, DOTD f2).
- **No AI image credits? Cut the prop from the photos you already have.** Real rose leaves lifted from a rose photo
  (green mask → opening to drop the stem → components → soft alpha) replaced a stock leaf the PO called fake (2026-10-22).
- **"Like the original" means its arrangement, exactly.** When the user points at a live source funnel
  ("sửa cho đúng bản gốc, style giữ nguyên"), open it and copy its order, its single CTA and where it
  sits, its price layout, and what is or isn't sticky; read its real prices from its offer endpoint
  rather than guessing. Keep only your styling (2026-10-19, a paywall rebuilt twice).
- **Several sessions on sibling funnels at once:** claim a funnel before editing ("claiming funnel N for
  X, hold off"), release with a one-line summary of what changed and where, and build on what is on
  disk. Never redeploy a sibling you didn't claim — the deploy ships whatever is on disk.
- **Reskinning a forked funnel:** put the inherited theme layer behind the new one and switch its art off
  wholesale — regex its `url("assets/<old>/…")` to `none` and remap its hard-coded atmosphere rgba — then
  check what still paints: phone-only `!important` rules kept the old plum on option cards and text
  halos, and an inherited `::after` ring doubled the new frame. Probe the DOM for every border, shadow
  and background under the spot rather than guessing from pixels, and keep `overflow:visible` on the
  scene wrappers (a padded wrap clipped glows into straight edges) (2026-11-03, Veterans fork of DOTD 3).
- **Label every personal-data slot for the case where the data is missing.** A fallback template image kept the
  "Your photo · Uploaded · 100% Rendered" labels and the critic blocked it as a false claim; the same funnel's
  later step also claimed "rendered" while its first step deliberately didn't. Give the fallback its own labels
  and grep the claim across every step of the funnel, not only the step the spec mentions (USELOG 2026-11-07).
