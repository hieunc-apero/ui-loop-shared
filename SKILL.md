---
name: ui-loop
description: Design or build UI — in Figma, as front-end code for a web app, a landing page, or a multi-step funnel — and don't show it to the user until an independent critic passes it. Picks the surface, loads the right build skills (figma-use, frontend-design, building-landing-pages…), then runs build → capture → ui-critic agent → fix, up to 4 rounds, with the current project's own design rules (DESIGN.md, .claude/design-rules.md) when they exist. Also bridges Figma → code and code → Figma. Use for any visible UI work: a new page or screen, a redesign, "make this section better", fixing what the user flagged on a screenshot. Vietnamese triggers too: "vẽ", "thiết kế", "làm lại trang/màn/section", "sửa giao diện", "chỉnh UI", "trông xấu", "cho đẹp hơn", "vài phương án", "trên Figma", "check luồng", "rà luồng", "thiếu thừa màn", "đối chiếu spec". Also checks whole user flows (Figma screens + arrows, live journeys, spec conformance).
---

# ui-loop

The user's time is the scarce resource. Every version you show them that has a cropped face,
a wrapped button label or a grey placeholder costs them a round of feedback they shouldn't have
had to give. This skill makes sure the first version they see has already survived a critic.

```
surface → brief → load rules → build → self-check → ui-critic → fix → (repeat ≤ 4) → hand off → learn
```

**Two folders.** This skill folder is the shared engine — the same for everyone who installs it.
What belongs to one person lives in their **data folder `~/.ui-loop/`** (its own git repo, set up
by `setup/install.sh`):

| `~/.ui-loop/…` | What |
|---|---|
| `taste.md` | how this user judges UI, in every project (step 2) |
| `projects.md` | where each project keeps its rules — repo paths, Figma fileKeys |
| `USELOG.md` | one entry per run (step 9) |
| `evals/` | this user's eval cases and results |

Never write a person's quotes, paths or run logs into the skill folder; never read another
person's data folder. "USELOG <date>" citations in this file point at the maintainer's log.

## 0. Surface

Decide which one the work is on, then read its reference file in `references/` — it says which
skills to load for building, how to capture for the critic, and what's specific to it:

| Surface | When | Reference |
|---|---|---|
| `figma` | drawing or editing frames in a Figma file | `references/surfaces/figma.md` |
| `web-app` | product UI in code (Next, React, …) | `references/surfaces/web.md` |
| `landing` | marketing site, launch page, app landing | `references/surfaces/landing.md` |
| `funnel` | onboarding, paywall, checkout, wizard — the sequence matters | `references/surfaces/funnel.md` |
| `app` | iOS / Android app screens — in Figma or a native build | `references/surfaces/app.md` |
| `flow` | a whole user flow — Figma screens joined by arrows, a live multi-step journey, and/or conformance to a spec | `references/surfaces/flow.md` |

Work that crosses surfaces runs the loop once per surface: design in Figma until the critic
passes, then code it and run the loop again with the approved frames as the reference
(`references/surfaces/figma.md`, "Handoff to code"). A funnel built in code also follows the web or
landing reference for each page.

### Mode: one design, or several directions

Default is **one design** — the steps below as written.

Switch to **variants** (`references/modes/variants.md`) when the user asks for options ("vài
phương án", "3 hướng", "explore", "cho tôi chọn"), or when the brief is a new page or a
redesign whose direction is genuinely open and the user hasn't picked one. Never for fixes,
polish, or anything where the direction is already decided — there it only multiplies cost.
Variants runs N builder agents in parallel on deliberately different directions, has the
critic judge and rank them, polishes the winner through the normal loop, and shows the user
all of them.

## 1. Brief

Before touching code, write down (for yourself, in two to five lines):
- **platform** (`web` · `ios` · `android`) and **medium** (`live` running build · `figma`
  frames) — these decide which project rules apply (see the tags below),
- what the page/section is for and who looks at it,
- what "done" looks like — the change the user asked for, in concrete terms,
- which states matter: hover, empty, loading, error, logged-out, long text, phone width.

Describe the page from what the code renders now, not from memory: a section you list that no
longer exists, or a feature flag you forget to mention, becomes a phantom blocker in the
critic's report and burns a round.

If the request is too ambiguous to write that down, ask the user **now**, once. Do not ask
mid-loop; the point is that the loop runs without them.

## 2. Load the taste profile and the project's rules

First the user's **taste profile**: `~/.ui-loop/taste.md`. It says how this user judges UI in
every project, mined from their own corrections. Walk its axes yourself before the self-check
(step 4); most first-round rejections in the past were on them. No file, or still the empty
template → there is no profile yet: say so in the hand-off, run on the project rules and the
critic's checklist, and let step 8 start filling it from this user's own feedback.

Find the project's rules: in the repo root, or — for Figma-only work or rules kept elsewhere —
by looking the repo path or Figma fileKey up in `~/.ui-loop/projects.md`. Read in
full if present:
- `DESIGN.md` (tokens and intent),
- `.claude/design-rules.md` (rules learned from past corrections),
- the UI sections of `CLAUDE.md`,
- any `docs/design*.md`.

**Scope tags.** Rules may carry platform tags — `[web]`, `[desktop]` (web ≥ 1024), `[app]` —
and medium tags — `[live]` (needs a running build: hover, scroll, URL, playback, live data),
`[figma]` (about the Figma file itself: components/instances, sections, flow arrows). No tag
means everywhere. Apply only the rules that match the brief's platform and medium; pass both
to the critic so it filters the same way. When you add a rule (steps 8 and 10), tag it.

Project rules override the taste profile where they are more specific; both override general
taste. If none exist, the critic's universal checklist still applies;
general principles live in the `impeccable` / `ui-ux-pro-max` skills if you need them.

## 3. Build

**Load the surface's build skill first, with the `Skill` tool** — reading the surface reference
that names it is not loading it. Until 2026-10-19 the references said "load X" and runs mostly
didn't: 55 ui-loop runs, `frontend-design` loaded 3 times, `impeccable` 5.

| Surface | Load before building |
|---|---|
| `web-app`, code `funnel` | `frontend-design` for a new page or section · `impeccable` for refining an existing one |
| `landing` | `building-landing-pages` |
| `figma`, `app` in Figma, `flow` | `figma-use` before every `use_figma` (+ `figma-generate-design` for a new screen) |
| `app` native iOS code | `swiftui-patterns`, `swiftui-layout-components` (+ `swiftui-liquid-glass`, `ios-accessibility`) |

- Skip only for a fix of one or two properties the user named exactly (a colour, a gap, a
  string). Anything that changes layout or adds an element loads the skill.
- Not installed → carry on without it, and say so in the USELOG line (install hints:
  `setup/skills.txt`).
- Project rules and the taste profile still win where the skill disagrees with them.
- Record what you loaded — the USELOG entry's **Skills loaded:** line (step 9).

- Reuse the project's components and tokens before writing new ones (DESIGN.md usually lists
  them). New colours, radii or shadows outside the token set need a reason.
- Real content over placeholders, always. If real assets don't exist, say so at hand-off
  rather than shipping a grey box.

## 4. Self-check (cheap, before spending a critic round)

- Code: make sure the preview is running (see the surface reference), reload, check
  `read_console_messages` for errors, take one screenshot at desktop and one at 390px.
  Fire the page's main interaction (the CTA, the toggle, the animation trigger) **at 390** too,
  not only at desktop: the 390 preview runs at devicePixelRatio 2, which desktop doesn't, and
  DPR bugs (a canvas sized in device pixels with no CSS size) only show there (USELOG 2026-10-15).
- Phone height: shoot 390×664 (iPhone Safari with its toolbars) as well as 390×844. Layouts that
  fill "the space left" (flex scenes, fixed CTAs) break on the short one — a ticket rode up over
  the title and the title under the logo, only on the user's real phone (USELOG 2026-10-16).
- Anything that reacts to the person leaving or waiting (background tab, notification, timer,
  "you can leave"): test the path they actually take — stay on the screen, then switch tab —
  not only the one that is easiest to script. A notification tested by navigating away first
  never fired for someone who just switched tabs from the waiting screen (USELOG 2026-10-15).
- Figma: `get_screenshot` of each frame you touched; check nothing is detached or left at
  default "Frame 123" naming.
- Build skill (step 3): loaded this run? If not and the change wasn't a named one-property fix,
  load it now and re-check the build against it before the critic sees it.

Fix anything obviously broken.

Do not skip straight to "looks good" here — but also don't try to be the critic. That's the
next step's job.

## 5. Critic round

**Before round 1, check the critic can see.** `ui-critic` drives the page through the
`Claude_Browser` MCP tools; when that server isn't connected in this session the agent starts
with only `Read`/`Skill` and returns NOT REVIEWED — a whole round burned (USELOG 2026-10-14).
If those tools aren't in your own tool list, don't dispatch with a URL: capture yourself
(`references/surfaces/web.md` → "Capture without the browser tools") and pass the folder.

**Every round gets a fresh capture folder.** Re-capture every state after the fixes, into a new
folder; never carry a file over from before a fix — copy changes included (a label rename
made one capture stale twice in one day). A stale screenshot cost a whole round as a
false blocker (USELOG 2026-10-15, Motion Control variant).

**Before every round, check each rule and taste path still exists.** Another session can merge
or move a file mid-run; the critic then quietly runs without that profile (USELOG
2026-10-15, runs tray: two taste files were merged into one between rounds 1 and 2).

Dispatch the `ui-critic` agent, foreground (`run_in_background: false`), with a fresh call
every round:

```
Surface: web-app | landing | funnel | figma | app | flow
Platform: web | ios | android        Medium: live | figma
Target: http://localhost:3000/kits/creator
        (figma: fileKey + nodeIds;  funnel: the ordered steps;  native: screenshot paths)
Reference: <optional — approved Figma nodeIds the code must match>
Flow graph: <flow only — absolute path to the JSON from references/surfaces/flow-graph.js>
Spec: <optional — absolute path to the spec/PO doc to check conformance against>
Widths: 390, 820, 1440. Themes: dark, light.
Intent: <the brief from step 1 — purpose, what changed, states to reach>
Rule files: <absolute paths found in step 2, AND the taste file by full absolute path
            (~/.ui-loop/taste.md expanded) — the critic has only Read and cannot list folders;
            or "no taste profile yet">
Measured: <computed values you already have — contrast ratios, geometry — so the critic
          uses them instead of sampling pixels. Measure them on THIS round's capture: numbers
          carried from an earlier capture contradict the pixels and send the critic hunting>
Out of scope: <pre-existing defects this change doesn't touch, e.g. a site-wide header — and
            any shared component the change only reuses (a toast, a sheet), with where it
            lands, so a placement decided elsewhere isn't a blocker here>
Previous blockers: <round 2+: paste the last Blockers list verbatim>
```

Give it the brief and the rules — **not** your reasoning about why the design is right, not the
diff, not the code. Its value is that it hasn't been convinced yet.

## 6. Act on the verdict

**A verdict is never where the turn ends while something is fixable.** Read it and keep going
in the same turn — fix, re-capture, next critic round — without stopping to report or ask
between rounds. The user sees the result at hand-off (step 7), not the intermediate FAILs.
The same holds when the user called the critic directly ("chấm trang X", "review cái này"):
report the verdict in a few lines, then go straight into fixing the blockers through this loop.

Stop and hand off without fixing only when:
- the user ends the loop ("k cần loop", "deploy đi"): ship what passed self-check, list the open
  round-1 notes and any unverified changes made since the last critic round in the hand-off;
- the user asked for a review only ("chỉ chấm", "đừng sửa", "review thôi");
- it is an eval run (`evals/`) — fixing would contaminate the measurement;
- the finding is listed under **Out of scope** (pre-existing, not this change) — list it in the
  hand-off and offer, don't fix;
- fixing needs a decision only the user can make (copy the PO owns, a direction change) — ask
  that one question, fix everything else first;
- the round cap below is hit.

- **Blockers**: fix every one, then go to step 4 and start the next round.
- **Taste notes**: apply the high-confidence ones that fit the project rules, and the
  medium ones that are cheap and inside the brief — this user answered a hand-off's "still
  open" list with "làm ik" (do it). List only what you deliberately left, with why. For any you
  reject, keep one line on why — it goes into the hand-off.
- **A user decision mid-run that overturns a project rule:** rewrite the rule in
  `.claude/design-rules.md` before the next critic round. Don't leave it to the retro, or
  the critic blocks on the old rule again. Writing "judge its intent" in the brief
  isn't enough (USELOG 2026-10-15: old rule 59 still described the abandoned pill version).
- **Disagree with a blocker?** Only if a project rule explicitly allows it. Record the rule
  number; don't argue the critic down by re-briefing it.
- **Stop after 4 rounds** even if blockers remain. Endless loops mean the brief or the rules
  are wrong, and that's the user's call.

`VERDICT: PASS` with no high-confidence taste notes left → hand off.

## 7. Hand off

Show the user, in this order:
1. The final state — screenshots at desktop and phone at minimum (`SendUserFile` or the
   preview screenshot); for Figma, the frame links as well.
2. What changed, short.
3. Rounds run, and what the critic caught along the way (one line each) — so the user can see
   the loop earned its keep.
4. **What's still uncertain**: remaining taste notes, rejected suggestions with the reason,
   anything the critic listed under "Not checked". Never drop this section.

Commit only if the user asked, following the repo's own commit conventions.

## 8. Learn

**Vague feedback gets one question back.** When the user says only "xấu", "chưa đẹp", "thô",
"quê", "chưa ưng" — about a fifth of all their past feedback — don't guess and redo the whole
thing. Ask once, in their vocabulary, offering the axes from the taste profile:

> Xấu ở chỗ nào: **chìm** (chưa đủ nổi), **quá đà** (too much), **ríu** (chật, sát),
> **lệch** (không cân đối), **không đồng bộ** với phần còn lại, **chưa rõ chính/phụ**, hay
> **ảnh** (nhỏ, cắt, giống nhau)? Hay chỗ khác?

If they've attached a screenshot and the problem is obvious from it, skip the question and say
which axis you think it is while fixing it. Either way, the answer is data: record it in step 9.

Then ask yourself whether it's a **rule** (would apply
to the next card/page too) or a **one-off** (only this element). For a rule, append it to
`.claude/design-rules.md` under the right section, in the file's existing format: a `[đo]` or
`[gu]` tag, the rule, why, and the date or commit. Create the file if the project has none.
Tell the user in one line that you added it, so they can strike it in the diff if it's wrong.

**Where a lesson goes:**
- About *this project* (a token, a component, a page's intent) → `.claude/design-rules.md`.
- About *how this user sees* — would hold in another project too (dose, spacing, alignment,
  consistency, imagery, light mode, wording, motion) → add the quote under the matching axis
  in `~/.ui-loop/taste.md`, with the date; a new axis if none fits. Commit it in `~/.ui-loop`.

This is how the critic gets better: it only knows what's written down.

## 9. Log the run

Append an entry to `~/.ui-loop/USELOG.md` (format at its top) at every hand-off — also for
critic-only, partial and abandoned runs. The line that matters most is **what the user still
flagged after hand-off**: that is what the loop missed. When a run exposes a gap in this skill
(not in a project's rules), fix it, add a `CHANGELOG.md` entry (in this skill folder) with the
eval score before and after if the user's `evals/` covers it, and commit — both folders are git
repos so the history is provable. Edit the critic in `agents/ui-critic.md`, then run
`setup/install.sh`.

## 10. Retro — after every run, no exceptions

Every run ends by updating what the loop knows. Not optional, not only when the user complains:
after a full loop, a critic-only check, a variants run, a partial or abandoned run, and again
whenever the user reacts later to something this run produced.

**Evidence to walk** (all from this run):
1. Blockers the critic raised — especially any that came back in a later round.
2. Findings that were wrong, and their cause (rule gap, brief error, tool limit, capture artefact).
3. Everything the user said about the result — corrections after hand-off above all.
4. The builder's own stumbles: wrong assumption, tool gotcha, a fix that didn't apply.

**Where each lesson goes:**

| Lesson | Destination |
|---|---|
| About this project (a token, component, page intent, intentional exception) | the project's `.claude/design-rules.md` |
| About how the user sees — would hold in another project | `~/.ui-loop/taste.md`, under its axis, with the quote and date |
| A project with no repo yet (Figma only) | a row in `~/.ui-loop/projects.md` |
| About how the loop should work (process, brief template, capture recipe, measurement trap, critic/builder behaviour) — true for any user | `SKILL.md`, `references/`, `agents/` + a `CHANGELOG.md` entry. No names, quotes or paths of one user: say "the user" and cite the USELOG date |
| A one-off | nowhere — USELOG only |

**Quality bar** — a rule only goes in if it is:
- **evidenced** by something in this run (a quote, a measurement, a commit), cited next to it;
- **general** enough to change what happens next time;
- **new** — if an existing rule covers it, sharpen that rule instead of adding one. Merge
  duplicates when you see them. Prefer editing to appending; these files are read every run,
  so length costs.

A rule that turned out wrong (it produced a false blocker, or the user overruled it) is
narrowed or deleted in the same retro, with the reason.

**Then:**
- USELOG entry (step 9) includes a **Rules updated:** line listing every change and its file —
  or `none`, with the reason. The line is never left out.
- Data folder `~/.ui-loop`: commit; if it has a remote, `git pull --rebase` and push.
- Skill folder (only if the engine changed): GitHub login (`gh api user --jq .login`) listed in
  `setup/maintainers.txt` → commit, `git pull --rebase`, push to the default branch. Anyone
  else → commit on a branch `proposal/<login>-<date>` and open a pull request: `gh repo fork
  --remote` first if they can't push to the repo, then push the branch and `gh pr create`. No
  `gh` → leave the commit on the branch and tell the user how to send it. Either way say a
  maintainer has to merge it, and switch the folder back to the default branch afterwards so
  the next run uses the shared version. Run
  `setup/install.sh` if `agents/` changed.
- Project repo: edit `.claude/design-rules.md` but don't commit on the user's branch unless they
  ask — say it's there, uncommitted.
- Last message to the user ends with a short **"Đã cập nhật luật:"** list (one line each), so
  they can veto a lesson they disagree with.

