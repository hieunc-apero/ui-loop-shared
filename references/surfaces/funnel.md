# Surface: funnel / multi-step flow

> Part of the broader **`flow`** surface (`flow.md`): this file is the procedure for walking a
> *live* multi-step journey. Figma flows and spec conformance are in `flow.md`.

Onboarding, checkout, paywall, sign-up, wizard — anything where the unit of quality is the
sequence, not a page.

## Build

- **A code funnel also reads `web.md` before the first edit — and `web-gotchas.md` → "A whole-page
  atmosphere layer" whenever the backdrop changes.** Seasonal funnel 2's moodboard pass re-hit both traps that
  section names (a body background hiding the z −1 room on phone; a z-index on the paywall trapping
  its pinned buy button) because only this file was read (USELOG 2026-10-16, seasonal funnel 2 vibe).

Design the flow before the screens: list the steps, what each one asks, what it gives back,
and where a user can leave or go back. Write that list into the brief — the critic walks it.

- **Give a code funnel a `?step=<name>` deep link before round 1** (QA only; seed any state a
  later step needs, e.g. a sample upload). Every capture and every re-capture then reaches each
  step in one navigation instead of clicking through the flow (USELOG 2026-10-16, seasonal funnel 1).
- **A funnel forked from another one inherits its documented decisions** (forward-only, no Back,
  prices). Put them under **Out of scope** from round 1 with their source, or they come back as
  blockers: round 1 of seasonal funnel 1 blocked on "no Back" that the source README chose.
- **A deep link that seeds state shows the seed, not the flow.** `?step=processing` in a fresh
  page has no upload, so the seeded sample appears where the user's photo would. Say so in the
  critic brief under Measured, or capture those steps in the same page after a real upload —
  round 1 of seasonal funnel 3 blocked on it (USELOG 2026-10-16).
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
- **Anything that rises or swings on a step (a card out of an envelope, a lid, a flap) gets its
  clearance measured in the DOM across viewport heights** — 1440×900/800, 1280×720, 1366×640,
  390×844, 375×667 — sampling the top of every moving part through the animation against the
  title's bottom and the CTA's top. Measure the CTA's own bottom against the viewport in the same probe — a scene
  that fits its gap can still push the CTA below the fold (2026-10-21). One screenshot at 1440×900 hid an overlap at 720 tall
  (seasonal funnel 2, rounds 3–4). Size the moving object from the viewport height, not a fixed px.
- **Forking a funnel into a new brand, and checking the capture server:** `web-gotchas.md` →
  "Forking a funnel into another brand" (kill-lists vs the new brief, restyle not recolour, busy ports).
- **An entrance that fires on a timer has already fired by `load`.** A probe that wants the
  "before" frame of a curtain, a card dealing in or a hero animating cannot just screenshot early
  after `waitUntil:"load"` — `load` waits for images, while the step's own 300ms timer ran at DOM
  ready. Let the page settle, then take the state off (remove the class) and shoot that; three
  captures of a "closed" curtain came back open before this was noticed (2026-10-22).
- **A fix is done when its element is on a screenshot, not when the CSS is written.** A lock decor aimed at
  `.knock`, a class the fork never had, shipped as done and the PO asked again. Also scope every per-step
  override to its steps: an unscoped `.dd-mari` rule pulled the story props onto two headlines (2026-10-22).
- **Capture hygiene for scripted runs:** never let a partial re-capture overwrite the full run's
  `metrics.json` (name it per run), and log `document.fonts.check(...)`, failed requests and
  broken images in the continuous-flow run too — a run that lost its web fonts and logo cost a
  round as a false blocker (seasonal funnel 2, round 4).
- **Check every spec add-on against the data that exists at its step before building it.** A
  "reveal the result" effect on a paywall that has no output image can only reveal the user's own
  upload. The user rejected it as "k hợp lý" (seasonal funnel 2, 16/10). Flag it, or propose an
  alternative in the brief. Also: an overlay meant to sit on a face (a hat, a crown) can't follow
  the face in an arbitrary photo. Round 1 of the replacement blocked on a crown sitting on the
  padlock.
- **Re-read the PO sheet before hand-off, not only at the start.** The sheet changed mid-run (an
  emoji in D8, a new feedback row). The user's "update ô 8D" assumed the latest sheet was being
  read.
- **Sticky price rail beside a long proof column, under a sticky header:** keep the page's bottom
  space *inside* the grid area (padding on the long column, not the grid). Otherwise the rail
  is pushed up under the header at the end of the page and its heading gets cut (2026-10-16).

- **Measure positions at rest:** finish every entrance animation first (`el.getAnimations().forEach(a=>a.finish())`,
  in a try — infinite ones throw). A header read mid-rise was reported 14px low and the user asked to move it (2026-10-22).

- **Keyframes name both ends, and phone motion uses `transform`.** A `@keyframes` with only `to` starts from the element's
  own transform: a film strip's `rotate(-3deg)` turned to 0° every loop and cropped a sprocket row on all 3 funnels. And
  maracas animated with standalone `rotate`/`translate` ran in desktop Chrome but stood still on the user's phone — write
  phone animations as `transform` keyframes. Chrome in the pane is not proof a phone moves (2026-10-22).

- **Per-step rooms: find the layer that actually paints.** A fixed `.atmo` may sit behind an opaque framed fill
  (`.panel::after`) plus an inset band and a button scrim of the same colour; recolour all of them, and outrank the old
  selector's specificity (`!important` alone lost to (0,3,1)). Use `elementsFromPoint` — it skips `pointer-events:none`
  layers, so read the pseudo-elements too. Never a room in the CTA's hue (2026-10-22, DOTD f2).
- **No AI image credits? Cut the prop from the photos you already have.** Real rose leaves lifted from a rose photo
  (green mask → opening to drop the stem → components → soft alpha) replaced a stock leaf the PO called fake (2026-10-22).

- **Media that runs across steps (a song, an ambient loop) gets its own element outside the
  per-step markup.** Changing step swaps only the picture. If the clips share the soundtrack,
  start each new clip at the song's position. In the capture script, measure the track time
  before and after Continue (seasonal funnel 1, 16/10: "đừng play lại từ đầu").

- **"Like the original" means its arrangement, exactly.** When the user points at a live source funnel
  ("sửa cho đúng bản gốc, style giữ nguyên"), open it and copy its order, its single CTA and where it
  sits, its price layout, and what is or isn't sticky; read its real prices from its offer endpoint
  rather than guessing. Keep only your styling (2026-10-19, a paywall rebuilt twice).
- **Several sessions on sibling funnels at once:** claim a funnel before editing ("claiming funnel N for
  X, hold off"), release with a one-line summary of what changed and where, and build on what is on
  disk. Never redeploy a sibling you didn't claim — the deploy ships whatever is on disk.
- **After every deploy, prove production serves it:** fetch the cache-busted CSS/JS URL the page
  references and grep for a marker from this change; static hosts sometimes report "ready" while the
  old build still serves. Redeploy once if the marker is missing (2026-10-17 → 19: about one deploy in
  six needed a second try). If the log has no "Aliased" line, read its head: on 22/10 `npx vercel` pulled a broken
  new CLI (65.1.0, npm 404); pin the last good one (`npx -y vercel@65.0.0 deploy --prod --yes`).

## Capture for the critic

Pass `Surface: funnel` and the steps as an ordered list, each with its URL (or the action that
gets there) and the input to use:

```
1. /onboarding            → tap "Get started"
2. /onboarding/goal       → choose "Edit photos", Continue
3. /paywall               → (stop; don't purchase) check Close and Restore
```

Use test data only. The critic never submits real payment or personal data.

## What the critic checks on top of per-page rules

- Continuity: the promise on step n is what step n+1 delivers; wording, prices and plan names
  stay identical across steps.
- Progress: the user knows where they are and how much is left.
- Exits: Back works at every step and keeps what was entered; Close/Skip exist where the
  product allows them and are not hidden.
- Error and retry on the steps that call a server.
- One primary action per step.
- `[đo]` Decor over a full-bleed video/clip: faces and subjects move and differ per clip, so place dressing only in bands that are empty in every clip (top sky strip above the header, screen edges just above the headline) and check each clip, not one frame.
