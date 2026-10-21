# Surface: landing page / marketing site

## Build

Load `building-landing-pages` — it covers research, brand, build, QA and deploy, and enters at
whichever stage the work actually starts. Don't duplicate its process here.

## Capture for the critic

Serve the page (dev server or static server — never `file://`, relative assets break silently)
and pass the URL. Tell the critic `Surface: landing` so it loads the `verifying-landing-pages`
rubric (30 items from bugs that actually shipped) on top of its own checklist. Widths: 390 /
820 / 1400. If the site is localised, name the locales.

## What's different from a web app

- The page has one job (a conversion). The critic should be able to name the primary CTA from
  the first screenful; if it can't, that's a blocker.
- Text baked into images (mockups, screenshots) is invisible to grep — the critic opens the
  image files.
- Claims and numbers ("179 styles", prices, ratings) must match the product; flag any it can't
  verify.

`landing-page-auditor` is the pre-ship audit agent for the same surface. Use it once at the
end, before deploy, if the user wants a ship/no-ship verdict separate from the design loop.

## Deploying a static page to Vercel

`vercel link` writes `.env.local` (a `VERCEL_OIDC_TOKEN`) into the project folder. Put `.env*`,
`.vercel` and any preview/asset-sheet pages in `.vercelignore` before the first deploy, then
`curl` the live URL for `/.env.local` and the preview pages and expect 404 (USELOG 2026-10-15,
a personal landing project). A folder deployed with the CLI is not git-connected: every later change needs
`vercel deploy --prod` again; say so at hand-off.

## Language switch

Re-rendering copy on a language switch must not lose UI state: keep open/closed, toggled and
step states in data, not in pending `setTimeout`s. Stagger the *animation*
(`transition-delay`), never the state change — a switch during a staggered "open all" left
18/23 cards open with the wrong label (USELOG 2026-10-15). Brief the critic to switch
mid-state and to judge each language's copy for naturalness (taste axis 10).

## Swapping in new copy

New copy is a layout change. Before the critic, measure every text slot in each language at
360 as well as 390: button labels (nowrap → overflow), card faces (content vs box), any
message that swaps with another (keep both in one grid cell so the box can't jump), window
titles that ellipsis-cut, and **every decoration positioned beside text** — measure the text's
line boxes (`Range.getClientRects`), not the element box. A longer subtitle and heading slid
under a side sticker, a longer chip collided with the "23" sticker; the critic caught one, a
range measurement caught the second, a live screenshot the third (USELOG 2026-10-15).
Copy the user returns through Word/pandoc arrives with `---` for —, `...` for … and straight
quotes — restore the typography when importing.

