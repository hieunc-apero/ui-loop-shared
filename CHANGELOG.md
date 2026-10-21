# Changelog

History of the shared `ui-loop` engine (SKILL.md, `references/`, `agents/`, `setup/`). One entry
per change to the instructions. Not a log of projects — each user's runs are in their own
`~/.ui-loop/USELOG.md`. What was inherited, and from where: [docs/lineage.md](docs/lineage.md).

Entries before v0.22 come from the single-user repo (now the maintainer's private data repo): paths like `knowledge/taste/…`, `USELOG.md` and `evals/2026-…` in them
refer to that repo.

Every entry says **Changed**, **Why**, and — once evals exist — the **score** before and
after, so the history shows whether a change helped rather than only that it happened.




## 2026-10-20 — fork restyle: class collisions, per-width CTA fit, hard-coded shell colours
**Changed:** `web-gotchas.md` → "Forking a funnel into another brand": prefix added classes; measure CTA label vs
arrow at every width after width/label changes; sample computed backgrounds at the top bar and pinned CTA.
**Why:** two sibling re-themes of one funnel shell: a new `.fl` class broke the paywall footer; a phone-only label
fix regressed on desktop; a hard-coded maroon in the shell outlived three re-themes.

## 2026-10-20 — fork restyle: swapped assets, invisible tap-eaters, motion sampling
**Changed:** `web-gotchas.md` → "Forking a funnel into another brand": a replaced image inherits the old one's
aspect-ratio; hidden animated parts get `pointer-events:none`; sample moving parts every ~150 ms; `animation:none`
on an entry-animated element leaves it invisible; particle layers sit behind content.
**Why:** a funnel re-themed from one poster ref: the offer box overlapped the pinned CTA on short phones and a
hidden pass blocked the CTA on a short desktop (both found by DOM probes, not screenshots); critic round 1 blocked
on petals over text; a pop overshoot touched the headline only between frames.

## 2026-10-20 — fork restyle: prop image sizing, open/close by halves
**Changed:** `web-gotchas.md` → "Forking a funnel into another brand": a prop `<img>` keeps its height attribute
when CSS sizes only the width (set the other side `auto`); open/close a photo prop by sliding halves, never `scaleX`.
**Why:** a funnel fork restyled from two poster refs: both props mis-sized silently (caught by a DOM probe), and a
stretched-curtain intro distorted the hands (caught in self-check before the critic).

## 2026-10-20 — iPhone gotchas round 2, design-file placement, funnel delivery checks
**Changed:** `web-gotchas.md`: corrected "Scale-up reveals stay sharp" (CSS `zoom` broke the card's rounded
clip on iPhone — lay the copy out in px at final size, no zoom, no scale; keep glow room inside clipping
parents); new "What Chrome screenshots hide on an iPhone" (blurred video blobs, a container mask fading
its text, full-bleed sideways scroll + `scrollWidth` check, orphaned sticky bands, filter shadows cut);
new "Placing an asset exactly as a design file shows it" (fit by pixel difference); rembg notes (numpy
shim, see-through holes, pale-on-white keying). `funnel.md`: "like the original" = its arrangement;
claim/release protocol between parallel sessions; verify production serves each deploy.
**Why:** a seasonal funnel project over 17–19/10: four iPhone-only defects reported from screenshots that
Chrome captures didn't show; the earlier `zoom` advice caused one of them; an asset placed by a design
file's x/y missed twice; about one deploy in six had to be repeated.

## v0.27 — 2026-10-21 — one sentence sets up a new machine
**Changed:** `setup/BOOTSTRAP.md` — instructions for Claude on a new machine/account: ask only the
data repo URL, check git/node/Chrome/repo access, clone or update the engine, run
`install.sh --data … --mirror --with-skills`, verify (install rerun clean, plugin list, data folder,
a ui-check smoke test on a `data:` page, agents present), list what only the user can do (Figma
`/mcp` login, a browser for the critic, a new session), report a ✅/⚠️ table. `install.sh
--with-skills` runs each missing build skill's install command once (`setup/skills.txt` now holds
shell commands: `claude plugin install …`, `claude plugin marketplace add …`, `npx skills add …@… -g
-y`) and installs playwright-core for ui-check; `--dry-run` prints them. INSTALL.md opens with the
sentence to paste.
**Why:** the user asked what to tell Claude on a new machine so it installs everything and is ready.
Tested: dry run on an empty account (13 missing skills → 9 commands, the Figma plugin once);
`claude plugin install` on an installed plugin is a clean no-op; `--with-skills` for real on this
machine installed playwright-core and the rerun reported the runner ready; the smoke test fires
U4 + U5.

## v0.26.1 — 2026-10-21 — anonymise two leftover names

**Changed:** `references/surfaces/landing.md` and one older CHANGELOG entry named a personal landing
project; both now say "a personal landing project".
**Why:** the engine is public and keeps project and person names out (v0.22). Found by scanning
the tree for known private names. Earlier commits still contain the name; history was not rewritten.

## v0.26 — 2026-10-20 — ui-check: the measurable rules, checked while building
**Changed:** `tools/ui-check/` — `ui-check.js` measures 19 script-measurable rules in the page (U1–U19:
broken images, overflow, clipped text, wrapped button labels, tap targets, contrast incl. through
gradients and over media, translucent fixed/sticky layers incl. `::before/::after`, overlapping fixed
layers, placeholder/raw names, lone last words, icon/text centres, unequal siblings, chip padding,
small text, display type, line length, native scrollbars, card in card, two primaries) in ~30–120 ms;
`run.js` runs it headless (playwright-core + installed Chrome, bypasses CSP, no tokens) with widths,
themes, scope and localStorage presets. SKILL.md step 4: run it after every change, fix every
`block`, zoom on every `?`; small lane scopes it to the element. Its output goes to the critic as
Measured; `ui-critic` treats it as leads (blocks become blockers once zoomed, `?` judged by eye,
no re-measuring). Retro: a new `[đo]` rule a DOM measurement can decide becomes the next U check.
**Why:** the user asked to improve during design instead of waiting for the critic. Of 322
findings the critic made in real runs, ~31 % were fully script-measurable and ~20 % locatable by
script for an eye to confirm. Tested on a fixture with planted defects (every check fires, clean
controls don't) and on two real pages of the first project at 390/1440: after fixing four
false-positive sources (whole-page gradient wash, two-tier button labels, ::before veils, repeat
noise) it reported real defects only (truncated tile titles, a 19 px "View all", 36 px primary CTA,
a lone last word). A local static server was tried for in-pane injection and dropped: page CSPs
block it.

## 2026-10-20 — engine mirror in the data repo (`--mirror`)
**Changed:** `setup/mirror-engine.sh` copies the engine's committed tree into `~/.ui-loop/engine/` and
commits it there ("engine mirror: <sha> <subject>"), then pushes. `setup/hooks.sh` is now the single
hook body for `post-commit`, `post-merge`, `post-rewrite` (re-copy agents after a pull where they
are copies; refresh the mirror if `~/.ui-loop/engine/` exists). `install.sh --mirror` opts in; hooks
are now always installed. The mirror is read-only: SKILL.md says never read or edit it.
**Why:** the user wanted the private repo to hold everything, engine included. A hand-kept copy would
drift (it just did with CHANGELOG); an automatic one can't. Tested in a scratch HOME: install
→ first mirror commit; an engine commit → hook → second mirror commit.

## 2026-10-20 — every engine change is logged in two CHANGELOGs
**Changed:** `references/loop/retro.md` — an engine change gets an entry here (no names, quotes or
paths) **and** the same entry with the real context (project, run, the user's words) in the user's
`~/.ui-loop/CHANGELOG.md`. `setup/data-template/CHANGELOG.md` added. Also back-filled the entry
below for ten `web-gotchas` commits that had none.
**Why:** after the split (v0.22) the user's own readable history had only the anonymised copy; the
real-name history survived only in git. The user wants their changelog kept and continued.

## 2026-10-19 — web-gotchas: HTML email (Gmail)
**Changed:** `references/surfaces/web-gotchas.md` (10 commits `d017ee1` → `78037d6`): judge HTML
emails with real merge values; Figma icons re-rendered transparent; banner text contrast and `<wbr>`
for short addresses; Gmail dark-mode inversion simulated and defended; overflow per client mode,
number+unit cells, fixed icon cells; no spacing on blend spans; findings from a real send in Gmail
iOS dark (coloured text, auto-links); light default + dark media, a Gmail-proof light theme;
versioned image filenames (Gmail proxy cache); a logo that follows Gmail's inversion via a
difference-blend split.
**Why:** a transactional email (USELOG 2026-10-19, ten versions with user reactions): long addresses
breaking mid-domain at 700 px, numbers without separators, orphans; the dark-mode defects only showed
in a real send. Logged late (2026-10-20).

## 2026-10-19 — step 3: verify before/after pairs

**Changed:** `SKILL.md` step 3 — diff a before/after pair before building on it. A pair from
an edit showcase was two different framings; the critic caught it a round later (USELOG
2026-10-19). No eval covers it.

## v0.25 — 2026-10-19 — cost: lanes, scoped/verify rounds, core vs archive, size caps
**Changed:**
- **A. Lanes** (SKILL.md "Lane"): small (one element, direction decided → self-check of the element
  and its neighbours at every width/theme it renders in, no critic, one USELOG line, rules only if
  the user reacts), medium (one section → one `scoped` critic round), large (as before). Escalate,
  never shrink after the fact; "sửa nhanh"/"chấm kỹ" set it. Global CLAUDE.md block says so.
- **B. Round types** (`references/loop/critic-round.md`, critic input 5): `full` · `scoped` (only
  the changed regions and what touches them, their widths/themes) · `verify` (round 2+: re-measure
  previous blockers + the regions the fixes touched; no full checklist or taste pass; shorter report).
- **C. Core vs read-by-topic.** SKILL.md 20.7 → 11.3 KB (dispatch template → `loop/critic-round.md`;
  learn/retro → `loop/retro.md`). `ui-critic.md` 19.6 → 16.2 KB (surface modes → `critic/modes.md`,
  read only for non-web surfaces). `web.md` 28.6 → 6.6 KB core + `web-gotchas.md` with a topic index
  (verbatim, line-checked: nothing lost). Taste: core `taste.md` (principles + thresholds + topics per
  axis, 🔒 on protected checks) + `taste-archive.md` (the full previous profile, verbatim).
- **D. Size caps** (`loop/retro.md`, `tools/size-check.sh`): SKILL 14 KB, critic 17 KB, surface core
  8 KB, taste core 12 KB; project design-rules uncapped. Over a cap: merge (keep all citations) →
  move the story to the archive → demote to the archive (never delete; never a 🔒 rule; only if
  uncited in the last 30 USELOG entries; reachable by topic). Promote back + 🔒 when the problem
  returns. Each move is its own commit and its own "Đã cập nhật luật:" line.
**Why:** the user: every run costs a lot of tokens and time, small edits most of all. Measured:
critic rounds 100–160k tokens (≈28k of it static reading: critic 20 KB + taste 43 KB + project
rules 24 KB), runs 300–480k; the main session loaded ≈121 KB per web run; small fixes ran the
full matrix; core files only grew (taste 25 → 43 KB in five days).
**Expected (static reading only, before screenshots):** main session per web run 121 → 68 KB
(large) / ≈14 KB (small); critic per round 92 → 55 KB (full/scoped) / ≈27 KB (verify). Small lane
drops the critic entirely. **To measure:** `Lane:` and `Cost:` on every USELOG entry from now; re-run
the git-history eval to check the critic misses nothing more (not run yet).

## v0.24 — 2026-10-19 — INSTALL.md + uninstall
**Changed:** `INSTALL.md` at the root: prerequisites, three cases (first time · new machine with
existing data via `--data` · another Claude account on the same machine), commands for
macOS/Linux/Git Bash, PowerShell and cmd, how to verify (installer output, `/agents`, `/ui-loop`,
a "chỉ chấm" test), optional tools, moving `~/.ui-loop` to a private repo, update, uninstall,
and a table of the errors seen so far. `install.sh --uninstall [dirs]` removes the skill link,
the agents (only if they are ui-loop's) and the CLAUDE.md block; never the clone or `~/.ui-loop`.
**Why:** the user asked for an install guide that works on another machine or account as is.
The cmd line was tested from a real `.bat`, the PowerShell line from powershell, uninstall on
a scratch account (CLAUDE.md's own content kept, clone untouched).

## v0.23 — 2026-10-19 — public
**Changed:** `hieunc-apero/ui-loop-shared` made public, MIT (same as `building-landing-pages`). Before
that, project and client names were replaced throughout (the first project → "project A" / "the
first project", campaign funnels → "seasonal funnel N", the second account's taste file → "a
second user's"), a Figma fileKey/node id removed, and `setup/maintainers.txt` lists GitHub logins
instead of emails. Retro for non-maintainers: fork if needed, then a pull request. History squashed
to one commit so no earlier wording is public.
**Why:** the user asked to make the shared engine public.

## v0.22 — 2026-10-19 — split: shared engine + one data folder per person
**Changed:** the repo is now only the engine, published as `hieunc-apero/ui-loop-shared` with a fresh
history. Everything that belonged to one person moved to their **data folder `~/.ui-loop/`** (its
own git repo): `taste.md` (was `knowledge/taste/<user>.md`), `projects.md` (was
`knowledge/projects.md`), `USELOG.md`, `evals/` cases and results. SKILL.md gains "Two folders" and
reads/writes there (steps 2, 5, 8, 9, 10); no profile → run without one and say so. Critic and
builder read `~/.ui-loop/taste.md` and no longer fall back to the maintainer's profile. Retro:
data folder commit + push; engine changes push straight only for `setup/maintainers.txt`, others go
to a `proposal/…` branch + PR, and engine edits must carry no one's names, quotes or paths.
`install.sh` creates `~/.ui-loop` (clone with `--data <url>`, or `setup/data-template/` + `git init`).
`tools/taste-mining/` (was `knowledge/taste/mining/`); `evals/README.md` keeps the method only.
`.gitignore` blocks the old personal paths so a session still on old instructions can't push them.
**Why:** the user wants teammates to use ui-loop. In one repo they would have read the maintainer's
taste quotes and run log, been judged by someone else's taste, and needed write access for the
retro, mixing their lessons into the maintainer's files.
**Kept:** the full pre-split history, with all data, stays in the maintainer's private data repo (= their
maintainer's `~/.ui-loop`).

## v0.21 — 2026-10-19
**Changed:** `SKILL.md` step 3 — load the surface's build skill **with the Skill tool** before building
(table per surface: `frontend-design` / `impeccable`, `building-landing-pages`, `figma-use`, SwiftUI
skills); skip only for a named one-or-two-property fix; step 4 self-check re-asks. USELOG format gains a
**Skills loaded:** line; `ui-builder` names what it loaded. `setup/skills.txt` lists the build skills
with their sources; `install.sh` reports the missing ones per account (installs nothing).
**Why:** counting Skill calls across all transcripts: 55 ui-loop runs, `frontend-design` loaded 3
times, `impeccable` 5, `ui-ux-pro-max` 3 — the references said "load X" and runs read past it. And a
new machine had no way to know these skills were expected.
**Measure:** share of USELOG entries from here on with a build skill on the Skills loaded line.
`building-landing-pages` installs from the public `hieunc-apero/building-landing-pages` (same skill,
project names stripped); no extra private repo needed.

## v0.20 — 2026-10-19
**Changed:** `setup/install.sh` rewritten as a real installer — takes one or more config dirs (one per
account; default `$CLAUDE_CONFIG_DIR` / `~/.claude` plus every account installed before), links the
skill (symlink, or a junction on Windows without symlink rights), links agents (copies when symlinks
are refused, plus git hooks that re-copy after every pull/rebase), and writes the global auto-invoke
+ retro block into each `CLAUDE.md` between markers, replacing an older hand-copied block. Idempotent.
`.gitattributes` keeps `*.sh` LF so it runs after a Windows checkout. `setup/README.md`: new machine /
new account / PowerShell, what gets installed, optional MCPs, what private data the repo carries.
**Why:** user asked to package the set so it installs on another machine or account. Old script
only copied agents into `~/.claude/agents` and left `CLAUDE.md` to be pasted by hand.
Tested on two empty and pre-filled fake config dirs (twice each, and with a stale copy refreshed by
the hook), then installed for real into `~/.claude` and `~/.claude-trung` (CLAUDE.md text unchanged
apart from the markers).

## v0.19 — 2026-10-16
**Changed:** `references/surfaces/funnel.md` — a code funnel reads web.md's atmosphere-layer section before
changing a backdrop; `SKILL.md` step 6 — the user ending the loop is a stop condition (ship, list what is
unverified); taste axis 8 — moodboard genre faces, blackletter V, iconic prop silhouettes.
**Why:** Seasonal funnel 2 moodboard pass re-hit two traps already documented in web.md; user cut round 2 with
"k cần loop, deploy đi".

## v0.18 — 2026-10-16
**Changed:** `references/surfaces/web.md` — new section "A whole-page atmosphere layer": z-index:-1
with only `html` painting the base, mirrored turbulence tiles, mask every layer edge, measure muted
text under the bright mist.
**Why:** Seasonal funnel 1 haze pass: round 1 blocked on a hidden phone buy button (isolation trap) and
a stage/panel seam; three self-check rounds went to tile seams and layer edges.

## v0.17 — 2026-10-16

- `references/surfaces/web.md`: entrance frames can be missing in the first screenshot (re-shoot,
  or pause and step `currentTime`); a clip on a translating element rides with it; `overflow:clip`
  for fixed layers; recipe for photoreal props (Figma generate_image → green key → WebP).
  Evidence: funnel 3 offer, rounds 1–2 both blocked on the arm showing under the pot. No eval
  covers this; score n/a.

## v0.16 — 2026-10-16

**Changed:** `references/surfaces/funnel.md`: check each spec add-on against the data at its step
(no reveal without an output; no face-anchored overlays on arbitrary photos); re-read the PO sheet
before hand-off. Maintainer's taste file: axis 7 (effects make sense on real data; a paywall sells what
is waiting) and axis 1 (phone story headlines 28–34px).
**Why:** Seasonal funnel 2 paywall: the user rejected the sheet's sparkle-wave reveal. The first
replacement failed the critic (an accessory on a blurred photo sat on the lock). The sheet changed
mid-run.

## v0.15 — 2026-10-16

**Changed:** `references/surfaces/funnel.md` — a fork re-reads its parent's rules before every
round; rising/swinging step animations get DOM clearance measured across viewport heights;
scripted-capture hygiene (per-run metrics, fonts/requests logged in the flow run).
`references/surfaces/web.md` — nested `background-clip:text` ghosting; choose display faces
from a side-by-side test sheet of the real headlines.
**Why:** Seasonal funnel 2 ran 4 critic rounds: 2 of them blocked on parent rules written after the
fork, 1 on an overlap only visible at a shorter viewport, 1 false blocker from a capture run
that lost its fonts. No eval covers these yet.

## v0.14 — 2026-10-16

**Changed:** `ui-critic` — two measurement traps from the effectiveness eval: (1) a *Clean* claim
is a measurement: name the selector and raw value, read pseudo-elements, confirm what's under a
translucent element with `elementsFromPoint`; (2) "distinct / looks the same" judged from a
per-card structure table (image count, sizes, arrangement, subject, files), not a description.
New `evals/2026-10-16-effectiveness/report.md` (Vietnamese): real-use, before/after and
controlled-eval numbers with method, cost and limits; `evals/2026-10-14-git-history/
results-2026-10-16.md`.

**Why / score:** user asked for numbers proving effectiveness. Real use: 76 blockers intercepted
in 30 loop runs (≈30/day), ≈75% of known issues caught before hand-off, complaints per UI commit
0.26 → 0.185, ≈65 min/day of user attention saved (range 17 min–2.6 h); cost ≈3–5 h agent time
and 3–5M tokens/day. Controlled eval on the 5 re-run defects: **2/5, unchanged from v0.3** — the
two persistent misses (C2.1, C4.2/C6.2) were the critic asserting instead of measuring, which is
what this version targets. Unprompted later-fixed findings on C2 rose 6 → 9.

**Not yet re-scored** after this change.

**Rules updated:** agents/ui-critic.md (2 traps, Clean evidence); evals (new report + results).

## 2026-10-16 — taste + web/funnel gotchas from a seasonal-funnel revision

**Changed:** the maintainer's taste file (axes 1, 5, 11, 12: theme wash, top-aligned phone columns,
logo decorations on a letterform, continuous soundtrack, breathing video frame, theme every inherited
surface); `references/surfaces/web.md` (animation-reset opacity, no-Range dev server, gradient defs in
hidden SVG); `references/surfaces/funnel.md` (cross-step media outside per-step markup).
**Why:** the user's 13-point revision of seasonal funnel 1 and three critic rounds on it.


## 2026-10-16 — funnel: deep links, inherited decisions, sticky rail; web: unreachable localhost

**Changed:** `references/surfaces/funnel.md` (three build notes: `?step=` deep link, a fork's
documented decisions go under Out of scope from round 1, sticky rail bottom space inside the grid);
`references/surfaces/web.md` (Claude-in-Chrome can't reach localhost → playwright-core + system Chrome).
**Why:** Seasonal funnel 1 run — round 1 blocked on an inherited "no Back", round 2 on a sticky
rail cut by the header, and ~5 tool calls went to a Chrome tab that could never load localhost.


## 2026-10-15 — web capture: show native scrollbars

**Changed:** `references/surfaces/web.md`, new section: launch without `--hide-scrollbars` and
list elements with a visible bar when the work touches scrolling.
**Why:** the user's white scrollbar couldn't be reproduced headless (0 px overlay bars); with
classic bars on, the critic caught a new bar a negative margin created in round 2.

## 2026-10-15 — measured values come from this round's capture

**Changed:** SKILL step 5 template, "Measured": measure on the capture being judged.
**Why:** the chat-fade run passed the critic pixel numbers from the previous capture; they
didn't match the file, and the critic spent its "Not checked" chasing the mismatch
(USELOG 2026-10-15, chat top fade).

## 2026-10-15 — brief lists reused shared components as out of scope

**Changed:** SKILL step 5 dispatch template — "Out of scope" names shared components the change
only reuses (toast, sheet) and where they land.
**Why:** round 1 of the project A payment run blocked on the shared job toast covering the Home
composer — a placement the user decided for every toast, not part of this change. It cost a
round and had to be moved to Out of scope in round 2 (USELOG 2026-10-15).

## 2026-10-15 — self-check on the real path; big sheets need a close

**Changed:** SKILL step 4 — features that react to the person leaving (background tab,
notifications, timers) are tested on the path the person takes, not the easiest one to script.
`agents/ui-critic.md` universal checklist — a sheet covering most of a phone needs its own
≥ 44 px close. Taste axis 15 (long work in the background).
**Why:** Project A notifications passed a test that left the screen first; the user's switch-tab
path never fired (USELOG 2026-10-15). The close-control finding recurred in a project file but
holds for every app.

## 2026-10-15 — figma capture: cached screenshots

**Changed:** `references/surfaces/figma.md` → "Capture for the critic": `get_screenshot` may
return a cached render after an edit; re-request with a different `maxDimension`, and say so
in the critic brief.
**Why:** in the ED-02a run the first post-fix screenshot showed stale copy. The round-2
critic was told to work around it and judged fresh renders. No eval covers it.

## 2026-10-15 — step 6: rewrite an overturned project rule before the next round; app.md: draw the size the complaint is about

**Changed:**
- SKILL.md step 6: when the user makes a decision mid-run that overturns a project rule,
  rewrite the rule before the next critic round.
- references/surfaces/app.md: when the complaint is about a size, add a frame at that size
  (375).
- figma.md: `detachInstance()` inside a loop invalidates IDs.

**Why:** in the multi-gen options B/C/D run, the critic kept citing rule 59, which described
the pill (Option A) that had been dropped. And "it takes too much space on small phones" was
judged on 393 frames only. No eval covers either.

## 2026-10-15 — figma.md: Plugin API traps

**Changed:** references/surfaces/figma.md, new section "Plugin API traps that cost a
round". It covers four traps: auto-layout frames get a white fill by default; binding a
variable can reset paint opacity, and instances can drift from the main component;
unloadable font families; and an instance must go back into the wrapper the original node
sat in. In the project A multi-gen run, three of the four critic rounds included a fix for
one of these. No eval covers Figma API mechanics.

## 2026-10-15 — step 5: fresh capture folder every round

**Changed:** SKILL.md step 5 — re-capture every state into a new folder each round. In the
Motion Control run, round 1's only blocker came from a screenshot taken before the fix it
judged. No eval covers capture hygiene.

## 2026-10-15 — step 5: re-check rule paths every round

**Changed:** SKILL.md step 5 — before every critic round (not only round 1), confirm each rule
and taste path exists. In the project A runs-tray run the taste file was merged and deleted by
another session between rounds; round 2's critic reported it missing and used the base
profile. No eval covers this (process step, not a judgement).

## 2026-10-15 — taste: one profile

**Changed:** the second account's taste file merged into the maintainer's and deleted, at the user's
request. The two
accounts (`~/.claude`, `~/.claude-trung`) are the same person. Their later quotes sit under
"**Later quotes:**" on each axis; axes 13 (Layering) and 14 (Desktop is designed) came across.
`knowledge/README.md` and `docs/how-it-works.md` updated.

## v0.10.13 — 2026-10-15

**Changed:** `references/surfaces/web.md` modals/embeds/audio → stale-ref misclick + script
clicks can't start audio; Chrome scrollbar-color vs ::-webkit-scrollbar gotcha. Taste axis 2:
page-wide controls in the first folds.
**Why:** Winamp run: a stale ref restarted the song instead of pausing; the skinned scrollbar
was silently ignored for a round; user moved the player to the top.


## v0.10.12 — 2026-10-15

**Changed:** `references/surfaces/web.md` → "Modals, embeds and audio": modal checklist up
front, status text follows real state, embed ready race + blocked-play fallback, critic must
not start audio.
**Why:** music run: three rounds each found one missing modal behaviour (dead ×, Esc scope,
focus trap); a Spotify `ready` race left the first play stuck; "NOW PLAYING" shown while idle.


## v0.10.11 — 2026-10-15

**Changed:** `references/surfaces/web.md` "Transient effects" → busy labels change layout;
keep them constant and measure height before/during.
**Why:** photobooth run round 1 blocker: the busy label wrapped the button row and jumped the
page on every shot, including the passive first-view flash.


## v0.10.10 — 2026-10-15

**Changed:** `references/surfaces/web.md` → "Transient effects" (position from the subject's
box, test mid-animation against fixed rows) and a pixel-art silhouette-first line.
**Why:** Babi-gotchi run used all 4 rounds: bones unreadable, labels on the egg outline, hearts
moved onto the stats row by a percentage fix, sprite silhouette off for three rounds.


## v0.10.9 — 2026-10-15

**Changed:** `references/surfaces/landing.md` → "Swapping in new copy": measure every text
slot at 360 + 390 per language, keep swapping messages in one grid cell, measure decorations
against text line boxes, restore typography from pandoc'd copy.
**Why:** user-rewritten copy run: card #17 overflowed, the wish message shifted the page by up
to 120px, titles ellipsis-cut at 360, and decorations collided with longer text three times.


## v0.10.8 — 2026-10-15

**Changed:** `references/surfaces/web.md` cursor section widened to "Cursors, stickers and tiny
icons": smooth die-cut via blur+threshold, opaque fills inside die-cuts, photos as critic
reference for likeness.
**Why:** chibi-sticker run: round 1 blocker was a translucent sleeve that read as a glitch;
round 2 noted stepped die-cut edges from feMorphology; likeness notes came from the photo
reference. No eval covers it.


## v0.10.7 — 2026-10-15

**Changed:** `references/surfaces/landing.md` → "Deploying a static page to Vercel" (.vercelignore
`.env*`/`.vercel`, curl-check they 404, CLI deploys aren't git-connected) and "Language switch"
(state in data, stagger animation not state; critic switches mid-state).
**Why:** A personal landing run: `vercel link` dropped an OIDC token file into the deploy folder;
the critic found a switch during "open all" lost card state. No eval covers it.


## v0.10.6 — 2026-10-15

**Changed:** maintainer taste axis 3 → "consistent style" = drawing treatment, not recolouring a
real subject; ask for a reference in the brief. `references/surfaces/web.md` cursor section →
catchlight ≤ 1 px on a pixel centre.
**Why:** user rejected the pastel-pink poodle cursor ("i meant a brown one like this"); the
brown redraw then failed round 1 on grey 1× eyes from a corner-placed catchlight.

## v0.10.5 — 2026-10-15

**Changed:** `references/surfaces/web.md` → "Cursors and tiny icons (≤ 32 px)": asset sheet +
canvas pixel read for the critic; build at 1× (pixel-grid features, ≥1.5 px outline, halo);
state variants differ in colour/silhouette.
**Why:** poodle-cursor run — the critic could only judge via a sheet and canvas reads; its high
note was a hover variant differing by ~4% of pixels, plus uneven eyes at 1× from a scale()
transform. No eval covers it.

## v0.10.4 — 2026-10-15

**Changed:** SKILL.md step 4 → fire the main interaction at 390 (DPR 2) during self-check;
`references/surfaces/web.md` → "Colour fixes: re-measure against every background" and
"The hidden pane freezes animation".
**Why:** birthday-page run: a DPR-only confetti canvas bug reached the critic because the
self-check clicked the CTA at desktop only; a contrast fix regressed on new tints in round 2;
critics twice reported rAF frozen in the hidden pane. No eval covers it.

## v0.10.3 — 2026-10-14

**Changed:** `references/surfaces/web.md` → "Measure in characters, not `ch`"; second-user taste
axis 14 quote ("áp cho các loại trang tương tự").
**Why:** a 68ch cap failed the critic's 65–75 character measure for two rounds (rendered
81–83). No eval covers it.

## v0.10.2 — 2026-10-14

**Changed:** `references/figma.md` → new "Restyling one component across many frames":
copy the style from the approved node per theme, scale shadow alpha (not only size) on
smaller targets, restyle the whole action group including sibling labels' font.
**Why:** a project A Figma restyle run failed round 1 on a full-alpha glow on a small pill and on
Manrope labels, then failed round 2 on the untouched sibling "Not now" button. No eval
covers it.

## v0.9.3 — 2026-10-14

**Changed:** `references/web.md` → "A layout swapped on the client": wait for hydration
before interacting when a media hook picks the desktop layout.
**Why:** an e2e and a capture both set a file before the desktop tree mounted and lost it.
No eval covers it.

## v0.9.2 — 2026-10-14

**Changed:** a second user's taste file ( from their post-hand-off feedback);
SKILL.md brief template names taste files by full path; `references/web.md` warns that a
capture dev server needs an already-ignored `distDir`.
**Why:** critic rounds reported "Read can't list taste/", so they only ever saw the maintainer's taste file; a
`.next-mock` build dir broke the user's dev server through Tailwind's scanner. No eval
covers either yet.

## v0.10.2 — 2026-10-14

**Changed:** SKILL.md step 6: also apply medium-confidence taste notes that are cheap and
inside the brief; hand-off lists only what was deliberately left, with the reason.
**Why:** the user replied "làm ik" to a hand-off's list of the critic's leftover notes —
a round they shouldn't have had to ask for. No eval covers it.

## v0.13 — 2026-10-14

**Changed:** new `flow` surface — check a whole user flow, not one screen.
- `references/surfaces/flow.md`: three kinds — A. live flow (funnel's walking rules + every named
  branch, Back/reload per step), B. Figma flow (graph from connectors), C. spec conformance
  (cases → screens/arrows: present / missing / extra / mismatched; pointer notes must resolve).
- `references/surfaces/flow-graph.js`: **read-only** script, run by the orchestrator through
  `use_figma` (figma-use loaded), so the critic stays read-only. Returns screens, notes, edges
  with exact `connectorStart/End` endpoints, and computed checks: orphan screens, dead ends,
  branches ending in notes, floating arrows, unlabeled arrows, duplicate screen names, screens
  that are not instances, arrow/screen bounding-box overlaps, golden path present.
- `ui-critic`: `flow` mode — computed checks are leads to confirm on screenshots, not verdicts;
  judges pointer notes vs missing screens, missing error/empty/cancel/pending branches; spec table.
- SKILL.md: `flow` in the surface table, `Flow graph:` / `Spec:` lines in the dispatch template,
  Vietnamese triggers ("check luồng", "rà luồng", "thiếu thừa màn", "đối chiếu spec").
- `funnel.md` marked as the live-walking part of `flow`; docs and READMEs updated.

**Why:** user asked whether the loop can check flows. Only live funnels were covered, never run;
yet most of the user's Figma work is flow review ("check lại toàn bộ luồng/design/màn với doc
gần nhất", "rà soát xem thiếu thừa màn gì", "mũi tên vẫn đè qua màn"), and the Figma critic
judged frames one by one.

**Tested (extraction only):** a 13-screen golden-path section of an iOS Figma file — `get_metadata`
shows connectors and labels but **not** their endpoints (elbow arrows can't be resolved from
geometry), so endpoints come from `use_figma`. Script returned 13 screens, 11 notes, 23 edges
and real leads: 8 branches ending in notes (incl. payment Huỷ / Chờ duyệt / Lỗi drawn only as
text, and pointers to CASE Q / T / Z to verify), a duplicated non-instance "Paywall (page 2.2.0,
bản sao)", 2 possible arrow-over-screen overlaps. Two API traps fixed on the way: a connector's
label is `connector.text.characters`, and reading a missing property on a Figma node throws, so
guard with `in`. **No critic flow-mode run yet.**

**Rules updated:** SKILL.md, agents/ui-critic.md, references/surfaces/{flow.md,flow-graph.js}
(new), references/surfaces/funnel.md, references/README.md, docs/how-it-works.md, README.md.

## v0.12.1 — 2026-10-14

**Changed:** `setup/install.sh` installs only files with agent frontmatter (`name:`).
**Why:** v0.12 added `agents/README.md`; the first install copied it into `~/.claude/agents/`,
where Claude Code would read it as a broken agent definition. Removed the stray copy.
**Rules updated:** setup/install.sh.

## v0.12 — 2026-10-14

**Changed:** repo restructured so a newcomer can tell what each file is. **Nothing deleted** —
every move is a `git mv`, so `git log --follow <new path>` shows each file's full history.
Root keeps only README, SKILL.md (must stay at the root to load as a skill), CHANGELOG, USELOG.

| Old path | New path |
|---|---|
| `LINEAGE.md` | `docs/lineage.md` |
| `references/{figma,web,landing,funnel,app}.md` | `references/surfaces/…` |
| `references/variants.md` | `references/modes/variants.md` |
| `taste/` (incl. `taste/mine/`) | `knowledge/taste/` (`…/mining/`) |
| `projects.md` | `knowledge/projects.md` |
| `install.sh` | `setup/install.sh` (now `cd`s to the repo root) |
| `global-CLAUDE.md.snapshot` | `setup/global-CLAUDE.md` |

New, in Vietnamese for the human reader: `docs/how-it-works.md` (what it is, who does what,
one run end to end, surfaces, modes, the three layers of rules and the scope tags, how it
learns, evals, history files, "where to change X", glossary); a `README.md` in every folder;
the root README rewritten as a start page with a folder map. Every path reference in SKILL.md,
agents, references and knowledge updated; `~/.claude/CLAUDE.md` updated to `knowledge/taste/`.
Entries below this one keep the old paths as they were written — use the table to map them.

**Why:** user asked for a structure a beginner can read at a glance, keeping USELOG and
CHANGELOG and nothing thrown away, with a document explaining how it works.

**Risk:** a session that cached the old paths in its context (e.g. a brief listing
the maintainer's taste file) will hit "file not found" once; SKILL.md is re-read on each invocation, so
the next run uses the new paths.

**Rules updated:** SKILL.md, agents/ui-critic.md, agents/ui-builder.md, knowledge/taste/mining/
README.md, docs/lineage.md, setup/install.sh, setup/global-CLAUDE.md + ~/.claude/CLAUDE.md (paths only).

## v0.11 — 2026-10-14

**Changed:** SKILL.md step 6 opens with "a verdict is never where the turn ends while something
is fixable": keep going in the same turn without reporting or asking between rounds; when the
user calls the critic directly ("chấm trang X"), report briefly and go straight into fixing.
Explicit stop list: review-only requests ("chỉ chấm", "đừng sửa"), eval runs, Out-of-scope
findings (offer, don't fix), a decision only the user can make (ask that one, fix the rest),
round cap. Global `~/.claude/CLAUDE.md` repeats it (snapshot updated).

**Why:** user asked whether the loop fixes on its own after grading. Inside a full ui-loop run it
did (step 6), but a direct critic request ended at the report — the first Home check in the
authoring session listed 9 blockers and stopped — and nothing forbade pausing between rounds to
report a FAIL.

**Rules updated:** SKILL.md step 6, ~/.claude/CLAUDE.md + global-CLAUDE.md.snapshot.

## v0.10.1 — 2026-10-14

**Changed:** critic, builder and SKILL step 2 load **the current user's** taste profile (passed
by path, plus any base it references) instead of "every file in `taste/`".
**Why:** v0.9.2 (other session) added a second user's taste file, and switched
the brief to pass taste files by path; three places still said "read every file in taste/",
which would have mixed two people's taste. Found while rebasing v0.10.
**Rules updated:** agents/ui-critic.md, agents/ui-builder.md, SKILL.md.

## v0.10 — 2026-10-14

**Changed:** rules are scoped by platform and medium.
- Tag scheme, two axes (untagged = everywhere): platform `[web]` · `[desktop]` (web ≥ 1024)
  · `[app]`; medium `[live]` (needs a running build) · `[figma]` (about the Figma file
  itself). Replaces the single `[web]` tag, which had silently meant "needs a running page"
  and conflated platform with medium.
- SKILL.md: brief declares platform (`web`/`ios`/`android`) and medium (`live`/`figma`);
  step 2 explains the tags, looks projects up in the new `projects.md` (Figma-only projects
  have no repo to find rules in), and requires new rules to be tagged; new `app` surface;
  dispatch template carries Platform/Medium.
- `references/app.md`: iOS/Android surface — build in Figma or native, capture (Figma nodes or
  simulator PNG paths), platform checklist (44 pt / 48 dp, safe areas, text sizes, tab bar ≤ 5,
  input above keyboard, sheets, both themes), web patterns that don't belong in an app.
- `ui-critic`: filters rules by scope, never blocks out of scope, reports how many it skipped;
  `app` mode.
- the maintainer's taste file: the few web-only points tagged (big canvas outside, hover).
- Project A (`project-a/.claude/design-rules.md`, edited not committed): all 44 rules retagged;
  rules 16, 20, 36, 45 now `[desktop]` (they would have been applied to iOS frames); 18, 26–29,
  32, 41 widened from web-only to every platform; colour section split — dark label on the
  gradient is `[web]`, the iOS app uses white (user, 18/09); new section G with 12 rules for the
  Figma-only iOS app (47–58) mined from the iOS Figma design sessions.

**Why:** user asked whether the agent can tell web rules from mobile-app rules. It couldn't:
judging iOS frames would have applied web desktop margins, the desktop workspace layout and
the dark-label rule, and the iOS app had no rules at all.

**Not yet tested:** no app-surface run yet.

**Rules updated:** SKILL.md, references/app.md (new), references/figma.md, projects.md (new),
agents/ui-critic.md, the maintainer's taste file, README.md; project A design-rules.md (uncommitted).

## v0.9.1 — 2026-10-14

**Changed:** `install.sh` and README no longer say agent changes need a new session.

**Why:** wrong claim, made since v0.1 and repeated to the user. Verified in the authoring
session: `ui-critic`, created mid-session, became dispatchable after a short delay (the first
call right after creation failed "not found"); `ui-builder` likewise; and a probe dispatch of
`ui-critic` after the v0.8 edit quoted v0.6–v0.8 sections verbatim — **edits to an existing
agent file are picked up mid-session too**. Skills are read at invocation, so SKILL.md edits
apply on the next call. What *does* need a new session: `~/.claude/CLAUDE.md`, which is read
once at start — but the retro obligation also lives in SKILL.md step 10, so it already applies.

**Rules updated:** install.sh, README.md (this entry).

## v0.9 — 2026-10-14

**Changed:** SKILL.md step 10 **Retro**, mandatory after every run (full loop, critic-only,
variants, partial, abandoned, and when the user reacts later). Walks four kinds of evidence
from the run — recurring blockers, wrong findings and their cause, the user's reactions,
the builder's own stumbles — and routes each lesson: project → `.claude/design-rules.md`;
how the user sees → `taste/<user>.md`; how the loop works → SKILL / references / agents +
CHANGELOG; one-off → USELOG only. Quality bar: evidenced, general, new (sharpen an existing
rule rather than add; delete or narrow rules that proved wrong). USELOG format gains a
**Rules updated:** line that is never omitted. ui-loop repo is committed and pushed; project
repos are edited, not committed. The reply ends with "Đã cập nhật luật:" so the user can veto.
The global `~/.claude/CLAUDE.md` repeats the obligation (snapshot updated).

**Why:** user's standing rule (2026-10-14): after running the skill or agents, always update
rules or guidelines from the run just finished. Until now learning was triggered only by
user feedback after hand-off (step 8) or by a gap the builder happened to notice (step 9),
so most runs taught the loop nothing durable.

**Risk to watch:** rule bloat. The quality bar and "prefer editing to appending" are the
guard; if `design-rules.md` or `taste/` grows past what a critic reads carefully, consolidate
in a dedicated retro and log it.

## v0.8.1 — 2026-10-14

**Changed:** `references/web.md` → "Capture without the browser tools": hand the critic every
screenshot by absolute path, never a folder.
**Why:** a round on project A's detail pages came back NOT REVIEWED — `Read` can't list a folder
and the critic's guessed file names all missed. No eval covers capture hand-off yet.

## v0.8 — 2026-10-14

**Changed:** a taste profile, measured.
- New: the maintainer's taste file — the user's eye across every project, as 12 axes — emphasis dose,
  primary/secondary, consistency, inner breathing room vs big canvas, alignment, image as
  centre, survives real data, modern-not-AI-looking (with their references), light mode as a
  first-class theme, one message per fold, motion that feels real, and the craft details behind
  a bare "xấu". Each axis: their quotes verbatim, what it means, `[đo]` checks with thresholds
  (accent count per block, chip/card text-to-edge padding, display letter-spacing and
  line-height bounds, icon/text centre ≤ 1 px, one primary per action group, outliers among
  same-type components) and `[gu]` questions.
- `ui-critic`: always reads `taste/`, judges dose relative to the block and the references,
  runs a **taste pass** after the universal checklist, tags every finding with its axis.
- `ui-builder`: reads `taste/`, walks axes 1–6 before reporting.
- SKILL.md step 2 loads the taste profile first; step 8 answers vague feedback ("xấu",
  "chưa đẹp", "thô", "quê") with **one question in the user's own vocabulary** instead of
  guessing, and routes lessons: project-specific → `.claude/design-rules.md`, how-the-user-sees
  → `taste/<user>.md`.
- `taste/mine/extract.py` + README: the script that pulled the user's messages out of every
  session transcript, so the profile can be re-mined and diffed later.

**Why:** eval scored the critic 1/3 on taste, and the /login run passed a card the user then
said didn't lift off the wall. Reading 471 of the user's design messages (2026-06-29 →
2026-10-14, ~250 sessions) showed why: their taste is almost entirely *relative* — "nổi hơn
chút, nhưng không too much" — on a handful of recurring axes, while the critic judged absolute
defects. About a fifth of their feedback was a bare "xấu" with no reason; the reason only
appears in the fix they then accepted.

**Not yet measured.** Next: the taste eval (≈10 of the user's own complaints with screenshots,
replayed before/after) and an exemplar library of approved states — both planned for the
session that re-runs the git-history eval. Baseline to beat: taste 1/3.

## v0.7.1 — 2026-10-14

**Changed:** auto-invocation. A new global `~/.claude/CLAUDE.md` (outside this repo) tells
every session to invoke ui-loop for any visible UI work without waiting for `/ui-loop`, with a
short skip list (one exact string/token change; non-rendering work). The skill's
`description` gains Vietnamese trigger phrases.

**Why:** user asked to stop typing `/ui-loop`. Description matching alone is unreliable —
`building-landing-pages` v0.12 logged a whole run where the skill sat unloaded because its
description didn't match. A standing instruction read at session start is the stronger
lever; a prompt-keyword hook would be stronger still but false-triggers, so not yet.

**Watch for:** runs where the skill should have loaded and didn't (log them), and the
opposite — ui-loop loading for trivial edits and spending a critic round on a one-liner.

## v0.7 — 2026-10-14

**Changed:** variants mode.
- SKILL.md: "Mode: one design, or several directions" under step 0 — when to use variants
  (user asks for options, or the direction of a new page/redesign is open) and when never to
  (fixes, polish, decided direction).
- `references/variants.md`: say the cost first; write N (default 3, 2–4) direction briefs
  that differ on named axes (layout, hierarchy, imagery, density, interaction, tone); dispatch
  N `ui-builder` agents in parallel — worktree per variant for code, page per variant for
  Figma; one `ui-critic` compare round over all N; polish only the winner through the normal
  loop; hand off winner + unpolished others side by side; clean up only after the user
  chooses; log "user chose ≠ critic's rank 1".
- New agent `agents/ui-builder.md`: builds one direction, commits to it instead of hedging,
  self-checks without self-grading, reports where the result is and how to reach each state.
- `ui-critic`: `Mode: compare` — full per-variant verdicts, then a ranking by intent fit,
  what each does best, what would need a redesign, "worth taking" from the others, confidence.
- `install.sh` installs every file in `agents/`.

**Why:** user asked whether one big manager agent should dispatch the rest. Answer: no — the
main session with ui-loop already is the manager, and a subagent can neither dispatch the
critic nor talk to the user. Where more agents genuinely help is parallel work; exploring
several directions at once is the highest-value case.

**Design choices worth testing:** one critic ranks all variants (consistent scale) rather than
N critics; the user sees losers unpolished (cost saving) — if users keep picking a loser, the
polish-only-the-winner saving is costing a round instead.

**Not yet tested:** no variants run has happened.

## v0.6 — 2026-10-14

**Changed:** `ui-critic` `tools:` lists every name the same browser and Figma tools appear
under — built-in pane (`mcp__Claude_Browser__*`), the pane from a cloud session
(`mcp__remote-devices__Claude_Browser__*`), Claude in Chrome (`mcp__claude-in-chrome__*`),
Figma plugin (`mcp__figma__*`) and the claude.ai Figma connector (`mcp__782a24fe-…__*`).
Procedure step 2 "Find your browser": use whichever set exists, prefer the built-in pane, and
return `NOT REVIEWED` rather than guess when there is neither a browser nor screenshots.

**Why:** two runs in other sessions (USELOG: Home/detail pages, /login) got a critic with only
`Read` and `Skill` and had to fall back to builder captures, while all seven runs in the
authoring session had the browser. An agent's `tools:` is an exact-name allowlist; a session
whose browser is exposed under a different server name silently drops it. v0.4's capture
fallback treated the symptom; this removes the likely cause.

**Not verified:** the cause is inferred from the tool-name mismatch, not reproduced. The next
run in a session that previously lacked the browser is the test — log whether the critic had
it. If it still doesn't, the session simply has no browser server, and the v0.4 capture path
remains the answer.

## v0.5 — 2026-10-14

**Changed:** `ui-critic` procedure step 5 gains two mandatory sub-steps: judge every image
with `zoom` on its region (never from the scaled whole-page shot), and test every
sticky/fixed element by scrolling it over content and reading its background/backdrop.
Project A rule 7 scoped to the Get the app page; the Home banner's bleed is intentional.

**Why:** first eval, git-history replay
([evals/2026-10-14-git-history](evals/2026-10-14-git-history/results-v0.3.md)):
- missed C2.1 — a transparent stuck filter bar over the grid — although rule 17 names it:
  the critic listed sticky elements but never tested one over content;
- taste recall 1/3, and all six runs reported the same limit: at 1440 the pane returns
  screenshots at 0.17–0.3 scale, too small to judge faces or illustrations;
- rule 7 produced the same false blocker in four Home runs.

**Score (v0.3 critic, 8 verified defects):** [đo] 4/5 (80%, all as blockers), [gu] 1/3
(33%), overall 5/8 (62%); 1 rule-caused false blocker repeated ×4. Mean cost per run 5.6 min,
47 tool calls, ~98k tokens. **v0.5 not yet re-scored** — re-running C2, C4, C6 is the test of
this change.

## v0.4 — 2026-10-14

**Changed:** SKILL.md step 5 — check the critic has its browser tools before round 1 and fall
back to builder captures if not; the dispatch template gains `Measured:` and `Out of scope:`.
`references/web.md` — "Capture without the browser tools": viewport captures after scroll,
pinned-bar geometry, a `metrics.json` that includes small elements inside changed controls,
one file per state. `ui-critic` — three measurement traps: full-page capture artefacts
(lazy-load black tiles, fixed bars mid-page), a given measurement beats a pixel sample,
out-of-scope items never block.

**Why:** second real run (USELOG 2026-10-14, Home video grid / detail pages). Round 0 was
lost because the critic started without browser tools; of the remaining false blockers, two
were full-page-capture artefacts, one a contrast sampled from pixels when the computed 6.9:1
was in the brief, one a pre-existing site-wide header.

**Score:** not measured — the git-history eval cases drive a browser and don't exercise the
capture-folder path. Next run of this kind is the test.

## v0.3 — 2026-10-14

**Changed:** one entry point for four surfaces. SKILL.md gains step 0 (surface) and
`references/{figma,web,landing,funnel}.md`, each naming the build skills to load, how to
capture for the critic, and what's specific to it. `ui-critic` gains read-only Figma tools and
surface modes: `landing` (runs the `verifying-landing-pages` rubric), `funnel` (walks ordered
steps with test data, never purchases), `figma` (screenshot + node data: contrast from fills,
raw values vs variables, auto-layout, layer names), and code-vs-approved-Figma drift. Project A's
rules gain a `[web]` tag on the 12 rules that only make sense on a running page.

**Why:** user's goal (2026-10-14): one agent that designs in Figma and designs + codes FE for
web app, landing and funnel. v0.2 judged only browser targets.

**Not yet tested:** figma, landing and funnel modes have not had a real run.

## v0.2 — 2026-10-14

**Changed:** SKILL.md step 1 — describe the page from what renders now, not from memory.
Project A rules: rule 13 gets its intended exception (Home cards on phone), new rule 32 (features
behind a flag show "Soon" and aren't clickable — not a defect).

**Why:** first run (USELOG 2026-10-14). Of 9 blockers, 2 were false and traced to rules that
didn't record intentional decisions, and one taste note was a phantom caused by the builder's
brief listing a section that no longer exists. Both are fixes to *inputs* of the critic, not
to the critic.

## v0.1 — 2026-10-14

**Changed:** first version.
- `SKILL.md`: brief → load project rules → build → self-check → `ui-critic` → fix, ≤ 4 rounds
  → hand off (screenshots, critic catches, what's still uncertain) → learn (user corrections
  become rules).
- `ui-critic`: read-only, never reads code, own browser tab, 390/820/1440 × dark/light,
  universal checklist + project rules, `VERDICT: PASS|FAIL`, blockers carry measurements.
  Lifted heavily from `landing-page-auditor` (see LINEAGE).
- Project A `.claude/design-rules.md`: 31 rules from ~45 web commits, tagged `[đo]` (critic
  blocks) / `[gu]` (critic advises).

**Why:** the user had been designing project A web by giving visual feedback round after round.
Asked whether that could become an agent. Two decisions, both the user's push-back on the
first proposal:
1. Agent that self-loops instead of a skill that hands every draft to the user — accepted,
   with the critic split out as its own agent so the builder doesn't grade its own work.
   The loop stays in the main session because subagents can't dispatch subagents.
2. Generic skill + per-project rules instead of a project A-only skill.

## 2026-10-16 — self-check at 390×664
SKILL step 4: shoot phones at 390×664 (Safari with toolbars) as well as 390×844. Funnel 3's offer
passed at 844 and broke on the user's iPhone (ticket over title, title under logo). No eval covers it.
