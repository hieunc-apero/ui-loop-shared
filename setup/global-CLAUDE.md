# Global instructions

## UI work → ui-loop, automatically

For any visible UI work, invoke the `ui-loop` skill **before starting**, without waiting for
the user to type `/ui-loop`: designing or changing a page, screen, section or component in
code; drawing or editing frames in Figma; landing pages and funnels; fixing something the user
flagged on a screenshot or described as looking wrong.

Skip it for: changing one string or one token value exactly as the user specified, and work
that doesn't change what renders (logic, backend, tests, build). When unsure, invoke it.

The skill sizes the run first — **small** (one element, direction decided: self-check, no
critic), **medium** (one section: one scoped critic round), **large** (new page, redesign,
funnel, Figma, flows: full loop). It also decides variants mode when the user asks for options.

**A critic verdict is never the end of the turn while something is fixable** — fix and
re-run the critic (ui-loop step 6), also when the user asked "chấm" without saying "chỉ chấm".
Stop at the report only for review-only requests, eval runs, out-of-scope findings, or a
decision only the user can make.

**After every run of ui-loop, ui-critic or ui-builder — including critic-only, partial and
abandoned runs, and whenever the user later reacts to the result — do ui-loop's retro (steps
8–10):** log the run in `~/.ui-loop/USELOG.md` with its lane and a "Rules updated" line; for
medium/large runs, and any run the user reacted to, turn what happened into updated rules
(project `.claude/design-rules.md`, `~/.ui-loop/taste.md` + `taste-archive.md`, or the
skill/agents) within the size caps; commit and push; end the reply with "Đã cập nhật luật:".
