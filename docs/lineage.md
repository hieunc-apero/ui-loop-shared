# Lineage

What `ui-loop` and `ui-critic` were built from, at which version, and what was taken from
each. The point is to be able to show later which behaviour was inherited and which was
earned by this skill's own runs — so a CHANGELOG entry can say "new" honestly.

When an ancestor changes in a way that matters here (a new checklist item, a renamed skill),
add a line under its entry with the date and the version, and note in CHANGELOG whether
ui-loop picked it up.

Snapshot taken 2026-10-14.

## Direct ancestors — behaviour copied in

### `landing-page-auditor` (agent) — file dated 2026-09-14
`~/.claude/agents/landing-page-auditor.md`, no version field, no changelog.
Taken into `ui-critic`, nearly verbatim in spirit:
- read-only role: "you change nothing — your output is findings";
- fresh context as an advantage: never read source and infer how it renders;
- **every finding carries a measured number**; the two measurement traps (gradient
  `background-color` reads transparent → measure the darkest stop; centring against
  `clientWidth`, never `innerWidth`);
- prove the page loaded first (broken-image query) before any other check;
- open image files, because text baked into mockups is invisible to grep;
- report shape: ranked findings with measurement and severity, then **Clean** and
  **Not checked** as mandatory closing sections.
Not taken: its fixed 3-width set (390/820/1400) was changed to 390/820/1440 for web apps;
landing mode keeps 1400.

### `verifying-landing-pages` (skill) — v0.8, 2026-09-21
`~/.claude/skills/verifying-landing-pages/`, has CHANGELOG + USELOG.
- Called **by reference**, not copied: `ui-critic` in `landing` mode runs
  `Skill(verifying-landing-pages)` and works its 30-item rubric. Improvements to that rubric
  flow into ui-loop automatically.
- Principle inherited: "measure, don't look" — each checklist item exists because a bug
  actually shipped. ui-loop's `.claude/design-rules.md` applies the same idea per project:
  every rule cites the commit that fixed it.

### `building-landing-pages` (skill) — v0.14, 2026-09-21
`~/.claude/skills/building-landing-pages/`, has CHANGELOG + USELOG.
- Called **by reference** as the builder for the `landing` surface.
- **Process inherited:** this CHANGELOG / USELOG pair and their split (skill history vs real
  runs, USELOG as evidence for the next `writing-skills` REFACTOR pass) copies its format,
  including "log a failed or partial run — it reveals more than a clean one".
- Its v0.12–v0.13 lesson — a skill whose `description` doesn't name the case never loads —
  shaped ui-loop's description, which names every surface and the trigger phrases.

### Figma plugin skills — `figma@claude-plugins-official` 2.2.127 (updated 2026-10-08)
`figma-use`, `figma-generate-design`, `figma-generate-library`, `figma-design-to-code`,
`figma-code-connect`. Called by reference as builders for the `figma` surface and for the
Figma ↔ code bridge. The rule "load `figma-use` before every `use_figma`" comes from the Figma
MCP server's own instructions.

## Builders called, not adapted

| Skill | Installed | Role in ui-loop |
|---|---|---|
| `frontend-design` | 2026-05-22 (Anthropic, LICENSE.txt) | builder for new web-app surfaces — demoted 2026-10-27 (not loaded) |
| `impeccable` | 2026-05-22 (Apache 2.0, "based on Anthropic's frontend-design") | builder when refining an existing UI; general design principles |
| `ui-ux-pro-max` | 2026-05-22 | fallback reference for general principles — demoted 2026-10-27 to font-subset lookups |
| `design-taste-frontend` (taste-skill v2) | 2026-10-27 | builder for new screens, pages and landing art direction |

ui-loop deliberately does **not** restate general design principles; it points at these.

## Method

### `writing-skills` (skill) — file dated 2026-07-03
The RED → GREEN → REFACTOR discipline: a skill is tested against cases where it should
change behaviour, and the USELOG feeds the REFACTOR pass. ui-loop's git-history eval
(`evals/`) is the RED/GREEN test for the critic.

## Project knowledge — the first project

Not part of the skill; loaded per project. Recorded here because the first version of the
critic was calibrated on it.
- `DESIGN.md` — tokens and intent, written before ui-loop existed.
- `.claude/design-rules.md` — 31 rules mined on 2026-10-14 from ~45 `feat(web)` /
  `fix(web)` commits (2026-09 → 2026-10-14), i.e. from corrections the user made by eye
  before any critic existed. Its own history is that project's git log.

## The user's own corrections — taste source (v0.8)

The maintainer's taste profile (since v0.22 in their own data folder, `~/.ui-loop/taste.md`;
before that the maintainer's taste file in this repo) is not inherited from any skill. It was mined from 471 design-feedback
messages the user typed in ~250 Claude sessions between 2026-06-29 and 2026-10-14 (the first
project's app, web, landing and funnels; three other client projects; Figma work), using
`tools/taste-mining/extract.py`. Of everything ui-loop knows, this is the part that came from the
user rather than from another skill or a general design canon.

## New in ui-loop (not inherited)

- The **builder / critic split** with a critic that never sees code or the builder's
  reasoning, and a bounded loop (≤ 4 rounds) before anything reaches the user.
- **Surface routing** (figma / web-app / landing / funnel) under one entry point.
- **Figma critic mode**: contrast from fills, raw values vs variables, auto-layout and naming.
- **Funnel critic mode**: continuity, progress, exits across steps.
- **Code-vs-approved-Figma** drift as a blocker.
- **Rule tags** `[đo]` / `[gu]` / `[web]` deciding what the critic may block on.
- The **learn step**: user corrections after hand-off become project rules.
- The **git-history eval**: replaying the user's own past fixes to score the critic.
- **Variants mode** (v0.7): designed divergence via direction briefs on named axes, parallel
  `ui-builder` agents in isolated worktrees / Figma pages, one critic ranking all of them.
  Uses the harness's `isolation: "worktree"`; the parallel-dispatch pattern itself is the
  one `dispatching-parallel-agents` describes.
