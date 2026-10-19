# Critic surface modes

Read by `ui-critic` for every surface except a plain `web-app` page — only the section for the
surface (or mode) in the brief. The procedure in `agents/ui-critic.md` is written for a browser
target; these sections adjust it. Moved here verbatim from the agent file on 2026-10-19 (v0.25).

**`landing`** — call `Skill(verifying-landing-pages)` first and work its rubric on top of the
universal checklist below. Use widths 390 / 820 / 1400. Open image files with `Read`: text baked
into mockups is invisible to every other check. If you can't name the primary CTA from the
first screenful at 390, that is a blocker.

**`funnel`** — walk the steps in order, in one tab, with the test input given. Never submit
real payment or personal data; stop at any purchase/confirm control and judge it without
pressing. On top of per-page checks: wording, prices and plan names identical across steps;
the user can tell where they are and how much is left; Back at every step works and keeps the
input; Close/Skip present where allowed and not hidden; one primary action per step. Report
which step each finding is on.

**`figma`** — no browser. For each nodeId:
- `get_screenshot` and look at it (first impression, as in step 5). Skip the browser steps.
- `get_metadata` for boxes: equal siblings, 44 px targets, text boxes too small for their
  content, frame widths matching the project's breakpoints.
- `get_design_context` / `get_variable_defs` for values: compute contrast from the actual
  fills (text fill vs the fill of the nearest opaque ancestor); flag colours, radii, spacing
  and type that are raw values while the file defines variables/styles for them. A raw hex
  that equals a token is still a finding — it won't follow a theme change.
- Auto-layout missing on containers that hold content; layers named `Frame 123`/`Rectangle 4`;
  detached instances of library components.
- Rules tagged `[web]` in the rule file don't apply. Hover, motion and prototype flows can't
  be judged — list them under Not checked.

**Reference given** (code vs approved Figma) — screenshot both at the same width and compare
section by section. Unrequested drift in layout, copy, imagery or tokens is a blocker; say
which frame and where.

**`app`** — iOS/Android screens, as Figma frames or simulator screenshots. Read
`~/.claude/skills/ui-loop/references/surfaces/app.md` and run its platform checklist (44 pt / 48 dp
targets, safe areas, text sizes, tab bar ≤ 5, input above the keyboard, sheets, dark and light
separately). On Figma, measure from node data as in `figma` mode; motion and gestures go under
Not checked. Flag web-only patterns carried into an app (hover reveals, desktop dropdowns,
page-width layouts).

**`flow`** — a whole user flow. Read `~/.claude/skills/ui-loop/references/surfaces/flow.md`.
- *Figma flow:* read the flow-graph JSON you were given (screens, notes, edges with exact
  from/to, and computed `checks`). Treat each computed check as a lead, not a verdict: screenshot
  the section (`get_screenshot`, then zoom on regions) to confirm arrow overlaps; for every
  `branchesEndingInNotes`, decide whether the note is a pointer to another case (then verify that
  case/screen exists — in this graph or in sections you were given) or a branch written as text
  where screens are missing (finding). A dead-end screen is fine only if it is a real end state.
  Duplicate names and non-instance screens are `[figma]` findings when the project rules say so.
  Also judge what the graph can't: does every screen that calls a server have an error branch,
  every list an empty state, every payment a cancelled and a pending branch?
- *Live flow:* walk it as in `funnel` mode, plus every branch the brief names (error, empty,
  out of credit, cancelled payment, expired session); Back and reload at each step.
- *Spec given:* list the spec's cases / screen IDs, map each to screens and arrows, and report a
  table: present / **missing** / **extra** / **mismatched**. Every pointer note must resolve.
Report flow findings with the screen or arrow label they're on (e.g. `arrow "Lỗi" → PW-01`).

**`Mode: compare`** (variants) — several targets labelled A, B, C…, each a different design
direction for the same brief, with each direction's name and bet. Judge every variant with the
full procedure at the same widths and themes — a blocker is a blocker in every variant. Then,
after the per-variant sections, add a **Ranking**:
1. Order the variants by how well each serves the brief's intent for its user — not by which
   has fewest blockers, and not by which you'd have designed. A bold direction with two fixable
   blockers can outrank a safe one with none.
2. For each, one line: what it does best, what would take a redesign (not a fix) to repair.
3. **Worth taking:** specific elements from lower-ranked variants that would strengthen the
   winner without breaking its direction.
4. Your confidence in the ranking (high / medium / low), and what the user should look at
   themselves because you can't judge it (usually: taste calls between close variants).
Report each variant's VERDICT separately; there's no overall PASS in compare mode.
