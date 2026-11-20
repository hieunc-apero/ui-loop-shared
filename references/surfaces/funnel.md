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
- **Click the buy button through to the checkout and record every screen between.** A
  per-frame timeline (innerText / role=dialog sampled each animation frame) catches a page that
  renders something else first — a server-rendered old paywall flashed before the payment popup
  and only the user saw it (USELOG 2026-10-28, paywall round 2).
- **A deep link that seeds state shows the seed, not the flow.** `?step=processing` in a fresh
  page has no upload, so the seeded sample appears where the user's photo would. Say so in the
  critic brief under Measured, or capture those steps in the same page after a real upload —
  round 1 of seasonal funnel 3 blocked on it (USELOG 2026-10-16).
- **Anything that rises or swings on a step (a card out of an envelope, a lid, a flap) gets its
  clearance measured in the DOM across viewport heights** — 1440×900/800, 1280×720, 1366×640,
  390×844, 375×667 — sampling the top of every moving part through the animation against the
  title's bottom and the CTA's top. Measure the CTA's own bottom against the viewport in the same probe — a scene
  that fits its gap can still push the CTA below the fold (2026-10-21). One screenshot at 1440×900 hid an overlap at 720 tall
  (seasonal funnel 2, rounds 3–4). Size the moving object from the viewport height, not a fixed px.
- **An entrance that fires on a timer has already fired by `load`.** A probe that wants the
  "before" frame of a curtain, a card dealing in or a hero animating cannot just screenshot early
  after `waitUntil:"load"` — `load` waits for images, while the step's own 300ms timer ran at DOM
  ready. Let the page settle, then take the state off (remove the class) and shoot that; three
  captures of a "closed" curtain came back open before this was noticed (2026-10-22).
- **A fix is done when its element is on a screenshot, not when the CSS is written.** A lock decor aimed at
  `.knock`, a class the fork never had, shipped as done and the PO asked again. Also scope every per-step
  override to its steps: an unscoped `.dd-mari` rule pulled the story props onto two headlines (2026-10-22).
- **Check every spec add-on against the data that exists at its step before building it.** A
  "reveal the result" effect on a paywall that has no output image can only reveal the user's own
  upload. The user rejected it as "k hợp lý" (seasonal funnel 2, 16/10). Flag it, or propose an
  alternative in the brief. Also: an overlay meant to sit on a face (a hat, a crown) can't follow
  the face in an arbitrary photo. Round 1 of the replacement blocked on a crown sitting on the
  padlock.
- **Re-read the PO sheet before hand-off, not only at the start.** The sheet changed mid-run (an
  emoji in D8, a new feedback row). The user's "update ô 8D" assumed the latest sheet was being
  read.
- **Measure positions at rest:** finish every entrance animation first (`el.getAnimations().forEach(a=>a.finish())`,
  in a try — infinite ones throw). A header read mid-rise was reported 14px low and the user asked to move it (2026-10-22).

- **After every deploy, prove production serves it:** fetch the cache-busted CSS/JS URL the page
  references and grep for a marker from this change; static hosts sometimes report "ready" while the
  old build still serves. Redeploy once if the marker is missing (2026-10-17 → 19: about one deploy in
  six needed a second try). If the log has no "Aliased" line, read its head: on 22/10 `npx vercel` pulled a broken
  new CLI (65.1.0, npm 404); pin the last good one (`npx -y vercel@65.0.0 deploy --prod --yes`). If the stamp is still old after a "ready" deploy, redeploy with `--force` (23/10: twice in a row the new files were up but `index.html` was the previous build).

- **Forks, re-themes, sibling sessions, per-step rooms, capture hygiene, email-continued funnels:**
  `funnel-gotchas.md` → "Forks and re-themes" (also personal-data fallback labels) — read it for a fork, a reskin or a fallback sample.
- **Recurring corrections across a person's funnels:** if `~/.ui-loop/projects.md` lists a cross-funnel
  checklist for the brand, walk it in the self-check and give it to the critic as project rules. A run that skipped one
  shipped the same cropped shadow, decor over the CTA and topbar cutting the hat that earlier funnels had already
  been corrected on (2026-11-20 mining: ~16 cropped-shadow flags over 10 funnels).
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

Recurring across funnels (2026-11-20 mining, each flagged on 3+ funnels; probes in `funnel-gotchas.md` → "Probes"):
- `[đo]` No cropped shadow or glow: no shadow inside a clipping ancestor, and every cutout's outer 2 px of alpha is 0.
- `[đo]` Decor never overlaps text, the CTA, the sound control or faces (0 px at 390×844 and 390×664); the CTA paints above decor.
- `[đo]` Text over imagery is made legible with text-shadow, never with a scrim over the video or decor.
- `[đo]` A selected option differs from default by fill + border + a mark, in a hue that is not the page background's.
- `[đo]` Tap-to-reveal: an idle affordance, the reveal starts ≤ 400 ms after the tap, no static hold, no jump.
- `[đo]` WebKit at 390×664: images in fixed layers load (no lazy), autofilled text keeps its colour, a CTA tapped with an input focused fires once.
- `[gu]` Props look photographic and asymmetric and match the ref side by side; later steps keep the opening's decor family; a font change starts from a comparison sheet.
- `[đo]` Decor over a full-bleed video/clip: faces and subjects move and differ per clip, so place dressing only in bands that are empty in every clip (top sky strip above the header, screen edges just above the headline) and check each clip, not one frame.
