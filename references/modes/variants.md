# Mode: variants

Several design directions in parallel, judged side by side, the best one polished. Use it
when the direction is open; see SKILL.md "Mode" for when not to.

```
brief + rules → N direction briefs → N × ui-builder (parallel, isolated)
  → serve/capture each → ui-critic compare round (all N)
  → winner through the normal loop (steps 4–6, ≤ 3 more rounds)
  → hand off: winner polished + the others as-is, side by side
```

## 0. Say the cost first

One line before starting: how many variants, and that it costs roughly N builds plus N critic
judgements on top of a normal loop (a critic judgement has run ~5 min / ~100k tokens). N is
**3** by default, **2–4** allowed. More than 4 stops being comparable by anyone.

## 1. Write the directions — this is where the mode succeeds or fails

Parallel agents given the same brief converge on the same page. Divergence has to be
designed in. After the normal brief (SKILL.md step 1) and rules (step 2), write N direction
briefs that differ on **one or two named axes**, chosen for this page:

| Axis | Example poles |
|---|---|
| Layout / structure | single hero column ↔ dense grid ↔ split workspace |
| Hierarchy | one dominant entry ↔ equal peers ↔ guided sequence |
| Imagery | full-bleed photo ↔ product UI fragments ↔ illustration/diagram |
| Density | airy, few words ↔ information-rich |
| Interaction | static, everything visible ↔ progressive reveal on hover/scroll |
| Tone | quiet/editorial ↔ bold/expressive (inside the brand tokens) |

Each direction brief: a one-line name ("A — Guided sequence"), the axis positions, what this
direction bets on and what it gives up. Every direction obeys the project rules and tokens —
directions vary the design, not the brand. If two directions would look alike in a thumbnail,
replace one.

## 2. Dispatch the builders

One `ui-builder` agent per direction, **all in one message**, `run_in_background: true`. Pass
each: surface, the shared brief, **its** direction brief, rule file paths, and where to put the
result:

- **Code** (web-app / landing / funnel): `isolation: "worktree"` on each Agent call, so every
  variant is its own branch and checkout. Tell the builder to install dependencies in its
  worktree and commit its work there; it reports the worktree path and branch.
- **Figma**: one file, one **page per variant** (`Variant A — Guided sequence`, …) so parallel
  writes don't collide. Builders report the page and frame nodeIds.

Builders build and self-check; they don't judge each other and don't know the other
directions exist beyond their names (so they don't drift toward each other).

## 3. Serve and judge — one compare round

- **Code**: add a launch config per worktree on its own port (same shape as an `eval` config:
  `npx --yes yarn@1.22.22 --cwd <worktree>/apps/web dev -p <port>`, or the project's
  equivalent), `preview_start` each. Copy untracked env files (`.env`, `apps/web/.env`) into
  each worktree first — they don't come with it.
- **Figma**: nothing to serve.

Dispatch **one** `ui-critic` in compare mode (`Mode: compare`, targets labelled A, B, C…,
same widths/themes for all). One critic seeing all variants ranks consistently; N separate
critics each grade on their own curve.

## 4. Pick, polish, keep the rest

- **Winner** = the critic's rank 1, unless it has a blocker that would take a redesign to fix
  and rank 2 doesn't. Note any "worth taking from B" items the critic named and fold them into
  the winner only if they fit its direction.
- Run the winner through SKILL.md steps 4–6 (normal rounds, ≤ 3 more). The others are **not**
  polished — that's the cost saving — but their screenshots are kept.

## 5. Hand off

Show, in this order:
1. The winner, polished — screenshots desktop + phone (Figma: frame links).
2. Each other variant — same screenshots, labelled **unpolished**, one line on its direction
   and the critic's verdict on it.
3. Why the winner won, in the critic's words, and what was taken from the others.
4. What's still uncertain (as SKILL.md step 7).

If the user picks a different variant, that one goes through steps 4–6 next; nothing is
rebuilt.

## 6. Clean up — only after the user has chosen

- Code: merge or cherry-pick the chosen variant's branch into the user's working branch the
  way the repo expects (feature branch, PR — follow the project's CLAUDE.md). Ask before
  removing the other worktrees and branches; list them with their paths.
- Figma: ask before deleting the unchosen pages; often the user wants them kept as history.
- Remove the per-variant launch configs you added.

## 7. Log

USELOG entry as usual, plus: N, the axes chosen, the critic's ranking, which variant the user
actually chose. **User chose ≠ critic's rank 1** is the most useful line in the entry — it is
direct evidence of where the critic's taste and the user's differ.
