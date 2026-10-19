# Use Log

One entry per real invocation of ui-loop or `ui-critic` — evidence for the next REFACTOR pass,
not a project changelog. Append at hand-off of every run, including partial, abandoned and
critic-only runs: a run that went wrong is the one that shows the gap.

## Entry format

```markdown
## <date> — <project> · <surface> · <page/frame>

**Version:** ui-loop vX.Y
**Mode:** full loop | critic only | eval case
**Skills loaded:** <build skills loaded with the Skill tool — e.g. `frontend-design`, `figma-use` — or `none: <why>` (named one-property fix · not installed · critic only)>
**Rounds:** n (blockers per round: a → b → 0)
**Cost:** wall time, critic tool calls, tokens if known
**Critic caught:** <the real problems, one line each — what the user didn't have to point out>
**Critic got wrong:** <false blockers, phantom findings — and the cause: rule gap, brief error, tool limit>
**User still flagged after hand-off:** <what got past the loop — the most important line>
**Gap → change:** <what this run turned into, with the CHANGELOG version>
**Rules updated:** <each change and its file (design-rules.md / taste / SKILL / agents) — or `none` + why. Never omitted.>
```

---
