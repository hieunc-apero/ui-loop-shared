---
name: ui-loop
description: Design or build UI — in Figma, as front-end code for a web app, a landing page, or a multi-step funnel — and don't show it to the user until an independent critic passes it. Picks the surface, loads the right build skills (figma-use, impeccable, design-taste-frontend, building-landing-pages…), then runs build → capture → ui-critic agent → fix, up to 4 rounds, with the current project's own design rules (DESIGN.md, .claude/design-rules.md) when they exist. Also bridges Figma → code and code → Figma. Use for any visible UI work: a new page or screen, a redesign, "make this section better", fixing what the user flagged on a screenshot. Vietnamese triggers too: "vẽ", "thiết kế", "làm lại trang/màn/section", "sửa giao diện", "chỉnh UI", "trông xấu", "cho đẹp hơn", "vài phương án", "trên Figma", "check luồng", "rà luồng", "thiếu thừa màn", "đối chiếu spec". Also checks whole user flows (Figma screens + arrows, live journeys, spec conformance).
---

# ui-loop

The user's time is the scarce resource. Every version you show them that has a cropped face,
a wrapped button label or a grey placeholder costs them a round of feedback they shouldn't have
had to give. This skill makes sure the first version they see has already been checked — with
effort sized to the change, because tokens and minutes are the user's too.

```
lane → surface → brief → load rules → build → self-check → [ui-critic → fix]×≤4 → hand off → learn
```

**Two folders.** This skill folder is the shared engine, the same for everyone. What belongs to
one person lives in their **data folder `~/.ui-loop/`** (its own git repo): `taste.md` (their
eye, core — read every run), `taste-archive.md` (every quote behind it — read by topic),
`projects.md` (where each project keeps its rules), `USELOG.md` (one entry per run),
`CHANGELOG.md` (engine changes with their real context), `evals/`, and optionally `engine/` — an
automatic copy of this skill folder (`setup/mirror-engine.sh`); never read or edit it.
Never write a person's quotes, paths or run logs into the skill folder; never read another
person's data folder. "USELOG <date>" citations here point at the maintainer's log.

**Read on demand, not up front.** Files under `references/` are opened only at the step that
names them, and `*-gotchas.md` / `taste-archive.md` only when the work touches one of their
listed topics.

## Lane — size the run first

| Lane | When | What runs |
|---|---|---|
| **small** | One element, or a few properties of one component; the direction is already decided (a colour, gap, size, alignment, copy, icon, a spot the user pointed at). No new element, layout or state. | One-line brief → only the matching rules (below) → change → **self-check of the element and its neighbours** → hand off. **No critic.** One USELOG line. |
| **medium** | One section, or one component across its states; a new element inside an existing layout. | Steps 1–4, then **one `scoped` critic round** on what changed; any further round is `verify`. |
| **large** | New page or screen, redesign, funnel or flow, Figma frames, variants, or the user asks for a thorough check ("chấm kỹ", "rà hết"). | Every step; round 1 `full`, rounds 2+ `verify`. |

- **Small-lane rules:** don't read the whole rule file — search the project's
  `.claude/design-rules.md` and `~/.ui-loop/taste.md` for the component and property you touch
  and read the matching rules. No surface reference, no build skill.
- **Small-lane self-check:** `ui-check --scope <the element's container>` at every width/theme
  where it renders (default 390 + 1440, both themes if the app has them) — zero `block`; screenshot
  it; measure what its rules name (padding, contrast, alignment within 1 px, wrap, overflow); look at its neighbours and at
  every other place the same component renders. Console clean.
- **Escalate** small → medium when the self-check finds anything outside the element, or the
  component is shared and renders elsewhere; medium → large when scope grows. Never shrink a lane
  to save tokens after the fact. The user can set it: "sửa nhanh" → small, "chấm kỹ" → large.
- Say the lane in one line when you start ("làn nhỏ — sửa padding chip, tự kiểm, không gọi
  critic"), so the user can bump it.

## 0. Surface

Decide which one the work is on; in medium/large lanes read its reference (build skills,
capture, what's specific to it):

| Surface | When | Reference |
|---|---|---|
| `figma` | drawing or editing frames in a Figma file | `references/surfaces/figma.md` |
| `web-app` | product UI in code (Next, React, …) | `references/surfaces/web.md` |
| `landing` | marketing site, launch page, app landing | `references/surfaces/landing.md` |
| `funnel` | onboarding, paywall, checkout, wizard — the sequence matters | `references/surfaces/funnel.md` |
| `app` | iOS / Android app screens — in Figma or a native build | `references/surfaces/app.md` |
| `flow` | a whole user flow — Figma screens + arrows, a live journey, conformance to a spec | `references/surfaces/flow.md` |

Work that crosses surfaces runs the loop once per surface (Figma until it passes, then code
with the approved frames as Reference — `figma.md`, "Handoff to code"). A coded funnel also
follows the web or landing reference per page.

**Variants mode** (`references/modes/variants.md`) when the user asks for options ("vài phương
án", "3 hướng", "cho tôi chọn") or a new page's direction is genuinely open. Never for fixes or
polish — there it only multiplies cost.

## 1. Brief

Two to five lines, for yourself (small lane: one):
- **platform** (`web` · `ios` · `android`) and **medium** (`live` · `figma`) — they decide which
  rules apply;
- what the page/section is for, and what "done" looks like in concrete terms;
- which states matter: hover, empty, loading, error, logged-out, long text, phone width.

Describe the page from what renders now, not from memory — a section that no longer exists
becomes a phantom blocker. Too ambiguous to write down → ask the user **now**, once, never
mid-loop.

## 2. Load the taste profile and the project's rules

- **Taste:** `~/.ui-loop/taste.md` (core). Walk its axes before the self-check. Missing or still
  the template → no profile yet: say so at hand-off, run on project rules + the critic's
  checklist, and let the retro start it from this user's feedback.
- **Project rules:** in the repo root, or via `~/.ui-loop/projects.md` (Figma-only work, rules
  kept elsewhere): `DESIGN.md`, `.claude/design-rules.md`, the UI sections of `CLAUDE.md`,
  `docs/design*.md`.
- **Scope tags:** `[web]`, `[desktop]` (web ≥ 1024), `[app]`; `[live]`, `[figma]`; untagged =
  everywhere. Apply only rules matching the brief's platform and medium; pass both to the critic.
- Project rules beat the taste profile where more specific. With neither, the critic's checklist
  still applies; general principles are in the `impeccable` / `design-taste-frontend` skills.

## 3. Build

**Medium and large lanes: load the surface's build skill with the `Skill` tool** — naming it is
not loading it (55 runs to 2026-10-19: `frontend-design` loaded 3 times, `impeccable` 5).

| Surface | Load before building |
|---|---|
| `web-app`, code `funnel` | `design-taste-frontend` for a new screen or page (its app-screen run for product UI) · `impeccable` for refining an existing one, and for a new visual world with no design system |
| `landing` | `building-landing-pages` + `design-taste-frontend` for art direction |
| `figma`, `app` in Figma, `flow` | `figma-use` before every `use_figma` (+ `figma-generate-design` for a new screen) |
| `app` native iOS code | `swiftui-patterns`, `swiftui-layout-components` (+ `swiftui-liquid-glass`, `ios-accessibility`) |

Not installed → carry on, say so in USELOG (hints: `setup/skills.txt`). Project rules and taste
win over the skill — taste-skill's house bans (violet, gradients) yield to a brand that pins them.
Use their build guidance and their measuring scripts (`impeccable detect`, taste-skill `lint`/`inspect`)
as self-check; never their own critique, `live`, hooks or decision pages — ui-critic judges.
`frontend-design` and `ui-ux-pro-max` are not loaded: in a 3-brief comparison they gave templated or
off-subject directions (`ui-ux-pro-max`'s font data still catches fonts without Vietnamese — query it
for that only). Reuse the project's components and tokens; a new colour, radius or shadow
needs a reason. Real content, never placeholders — no real asset → say so at hand-off.
A before/after pair must be one frame with only the tool's change: diff the two files before
building on them (an edit showcase's pair was two framings; USELOG 2026-10-19).

## 4. Self-check (before spending a critic round)

- **Code: run `ui-check` after every change** — `node ~/.claude/skills/ui-loop/tools/ui-check/run.js
  <url> --widths 390,1440 [--themes dark,light] [--scope <sel>] [--ls <json>]` from the project
  folder. It measures the script-measurable `[đo]` rules (overflow, clipping, wrapped buttons, tap
  targets, contrast through gradients, translucent sticky layers, chip padding, lone words…) in
  seconds, no tokens. Fix every `block`; zoom on every `?`; decide each `warn`. Paste the final
  output into the critic brief as **Measured**. IDs and setup: `tools/ui-check/README.md`.
- Code: preview running, reload, `read_console_messages` errors, a screenshot at desktop and at
  390. Fire the main interaction **at 390** too — it runs at DPR 2, where canvas-sizing bugs show
  (USELOG 2026-10-15).
- Phone height: 390×664 (Safari with toolbars) as well as 390×844 — "fill the space left"
  layouts break on the short one (USELOG 2026-10-16).
- Anything reacting to leaving or waiting (background tab, notification, timer): test the path
  people take — stay, then switch tab — not the easiest to script (USELOG 2026-10-15).
- Figma: `get_screenshot` of each touched frame; nothing detached, no "Frame 123" names.
- Build skill loaded (medium/large)? If not, load it now and re-check against it.

Fix what's obviously broken; don't try to be the critic.

## 5. Critic round (medium and large lanes)

Read `references/loop/critic-round.md` before the first round: whether the critic can see,
fresh captures, the round types (`full` · `scoped` · `verify`) and the dispatch template. Give
the critic the brief and the rules — never your reasoning, the diff or the code.

## 6. Act on the verdict

**A verdict is never where the turn ends while something is fixable.** Fix, re-capture, next
round (`verify`) in the same turn, without reporting or asking between rounds — also when the
user called the critic directly ("chấm trang X"): report the verdict in a few lines, then fix.

Stop and hand off without fixing only when:
- the user ends the loop ("k cần loop", "deploy đi") — ship what passed self-check, list open
  notes and unverified changes;
- the user asked for a review only ("chỉ chấm", "đừng sửa", "review thôi");
- it is an eval run — fixing would contaminate the measurement;
- the finding is **Out of scope** (pre-existing) — list it and offer;
- fixing needs a decision only the user can make — ask that one question, fix the rest first;
- **4 rounds** are done — endless loops mean the brief or the rules are wrong; the user's call.

Blockers: fix all. Taste notes: apply high-confidence ones and cheap medium ones inside the
brief (details: `critic-round.md`, "After the verdict"). `PASS` with no high-confidence notes
left → hand off.

## 7. Hand off

1. The final state — screenshots at desktop and phone (`SendUserFile`); Figma frame links.
2. What changed, short. The lane.
3. Rounds run and what the critic caught, one line each (small lane: what the self-check measured).
4. **What's still uncertain** — remaining notes, rejected suggestions and why, "Not checked".
   Never drop this section.

Commit only if the user asked, in the repo's own conventions.

## 8–10. Learn, log, retro

Every run ends by updating what the loop knows — `references/loop/retro.md` has the procedure:
the one question for vague feedback ("xấu" → which axis?), where each lesson goes, the quality
bar, the **size caps** (core files stay short; overflow is merged, moved or demoted to an
archive/topic file — never deleted; protected `🔒` rules never move), and the commit steps.

- **Every lane:** a USELOG entry in `~/.ui-loop/USELOG.md` (format at its top) with `Lane:` and a
  **Rules updated:** line. Small lane: one line, and rules only if the user reacted.
- **Medium/large:** the full retro from `retro.md`.
- The last message ends with **"Đã cập nhật luật:"** (one line each), so the user can veto.
