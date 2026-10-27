# A critic round — how to dispatch `ui-critic`

Read before the first critic round of a run (medium and large lanes, SKILL.md step 5).

## Before round 1: can the critic see?

`ui-critic` drives the page through the `Claude_Browser` MCP tools; when that server isn't
connected in this session the agent starts with only `Read`/`Skill` and returns NOT REVIEWED — a
whole round burned (USELOG 2026-10-14). If those tools aren't in your own tool list, don't
dispatch with a URL: capture yourself (`references/surfaces/web.md` → "Capture without the
browser tools") and pass the files.

A local URL must be served by a process that outlives your shell call: a `python -m http.server
&` started inside one Bash call can be dead by the time the critic loads it — a round came back
NOT REVIEWED on `ERR_CONNECTION_REFUSED` (USELOG 2026-10-21). Start it with `run_in_background`,
curl it right before dispatch, or point the critic at a deploy. Never hand it a `file://` URL: Claude in Chrome refuses them ("Can't interact with
browser-internal or unparseable URLs") and the critic falls back to screenshots, unable to fire any
state. **A local file or folder is served automatically, before every dispatch:** `node
~/.claude/skills/ui-loop/tools/ui-check/serve.js <folder|file.html> --port 8765` with
`run_in_background`, curl the printed URL, put that URL in Target. Variants: one port each.

## Every round

- **A fresh capture folder.** Re-capture every state after the fixes, into a new folder; never
  carry a file over from before a fix — copy changes included (a label rename made one capture
  stale twice in one day). A stale screenshot cost a whole round as a false blocker (USELOG
  2026-10-15, Motion Control variant).
- **Check each rule and taste path still exists.** Another session can merge or move a file
  mid-run; the critic then quietly runs without that profile (USELOG 2026-10-15, runs tray).
- **Pick the round type** — it decides most of the cost:

| Round | When | Critic does |
|---|---|---|
| `full` | large lane, round 1 | everything: all widths × themes × states, checklist, taste pass |
| `scoped` | medium lane, round 1 | only the regions in **Scope** and what touches them, at the widths/themes they show in; load check + overflow elsewhere |
| `verify` | every round 2+, any lane | re-measures the previous blockers, looks at the regions the fixes touched; no full checklist |

  Scope = the selectors/regions you changed, plus the widths and themes where they render
  differently. A change to a shared component lists where else it renders.

Dispatch `ui-critic` in the foreground (`run_in_background: false`), a fresh call each round:

```
Surface: web-app | landing | funnel | figma | app | flow
Platform: web | ios | android        Medium: live | figma
Round: full | scoped | verify
Scope: <scoped/verify — regions or selectors, and the widths/themes they show in>
Target: http://localhost:3000/kits/creator
        (figma: fileKey + nodeIds;  funnel: the ordered steps;  native/screenshots: every file's
        absolute path — the critic cannot list a folder, and a folder alone burned a round)
Reference: <optional — approved Figma nodeIds the code must match>
Flow graph: <flow only — absolute path to the JSON from references/surfaces/flow-graph.js>
Spec: <optional — absolute path to the spec/PO doc to check conformance against>
Widths: 390, 820, 1440. Themes: dark, light.   (scoped/verify: only those in Scope)
Intent: <the brief from step 1 — purpose, what changed, states to reach>
Rule files: <absolute paths found in step 2, AND the taste file by full absolute path
            (~/.ui-loop/taste.md expanded) plus the base ~/.claude/skills/ui-loop/references/taste-base.md — the critic has only Read and cannot list folders;
            or "no taste profile yet">
Measured: <the final ui-check output for each width/theme (tools/ui-check) + any other
          computed values — contrast ratios, geometry — so the critic uses them instead of
          sampling pixels. Measure them on THIS round's capture: numbers
          carried from an earlier capture contradict the pixels and send the critic hunting>
Out of scope: <pre-existing defects this change doesn't touch, e.g. a site-wide header — and
            any shared component the change only reuses (a toast, a sheet), with where it
            lands, so a placement decided elsewhere isn't a blocker here>
Previous blockers: <round 2+: paste the last Blockers list verbatim>
```

Give it the brief and the rules — **not** your reasoning about why the design is right, not the
diff, not the code. Its value is that it hasn't been convinced yet.

## After the verdict (SKILL.md step 6)

- **Blockers**: fix every one, self-check, next round as `verify`.
- **Taste notes**: apply the high-confidence ones that fit the project rules, and the medium
  ones that are cheap and inside the brief — this user answered a hand-off's "still open" list
  with "làm ik" (do it). Keep one line on why for any you reject; it goes into the hand-off.
- **A user decision mid-run that overturns a project rule:** rewrite the rule in
  `.claude/design-rules.md` before the next round, or the critic blocks on the old rule again
  (USELOG 2026-10-15: old rule 59 still described the abandoned pill version).
- **Disagree with a blocker?** Only if a project rule explicitly allows it. Record the rule
  number; don't argue the critic down by re-briefing it.
- A verify round that finds something new outside Scope → the next round is `scoped` on it.
