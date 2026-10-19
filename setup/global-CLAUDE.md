# Global instructions

## UI work → ui-loop, automatically

For any visible UI work, invoke the `ui-loop` skill **before starting**, without waiting for
the user to type `/ui-loop`: designing or changing a page, screen, section or component in
code; drawing or editing frames in Figma; landing pages and funnels; fixing something the user
flagged on a screenshot or described as looking wrong.

Skip it for: changing one string or one token value exactly as the user specified, and work
that doesn't change what renders (logic, backend, tests, build). When unsure, invoke it.

If the user asks for options or the direction is open, ui-loop's variants mode applies —
the skill decides that.

**A critic verdict is never the end of the turn while something is fixable** — fix and
re-run the critic (ui-loop step 6), also when the user asked "chấm" without saying "chỉ chấm".
Stop at the report only for review-only requests, eval runs, out-of-scope findings, or a
decision only the user can make.

**After every run of ui-loop, ui-critic or ui-builder — including critic-only, partial and
abandoned runs, and whenever the user later reacts to the result — do ui-loop's step 10
(Retro):** turn what happened into updated rules (project `.claude/design-rules.md`, the
user's `~/.ui-loop/taste.md`, or the skill/agents themselves), log it in `~/.ui-loop/USELOG.md` with a
"Rules updated" line, commit and push (data folder; skill folder per ui-loop step 10), and end the reply with "Đã cập nhật luật:".
