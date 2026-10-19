# Learn, log, retro — the detail behind SKILL.md steps 8–10

## Vague feedback gets one question back

When the user says only "xấu", "chưa đẹp", "thô", "quê", "chưa ưng" — about a fifth of all
past feedback — don't guess and redo the whole thing. Ask once, offering the taste axes:

> Xấu ở chỗ nào: **chìm** (chưa đủ nổi), **quá đà** (too much), **ríu** (chật, sát),
> **lệch** (không cân đối), **không đồng bộ** với phần còn lại, **chưa rõ chính/phụ**, hay
> **ảnh** (nhỏ, cắt, giống nhau)? Hay chỗ khác?

If a screenshot makes the problem obvious, skip the question and say which axis you think it
is while fixing it. Either way the answer is data for the retro.

## Evidence to walk (all from this run)

1. Blockers the critic raised — especially any that came back in a later round.
2. Findings that were wrong, and their cause (rule gap, brief error, tool limit, capture artefact).
3. Everything the user said about the result — corrections after hand-off above all.
4. The builder's own stumbles: wrong assumption, tool gotcha, a fix that didn't apply.

Small lane: only 3 — and only if the user reacted. Otherwise the USELOG line is the retro.

## Where each lesson goes

| Lesson | Destination |
|---|---|
| About this project (a token, component, page intent, intentional exception) | the project's `.claude/design-rules.md` (create it if missing), in its format — tagged `[đo]`/`[gu]` + scope, with the date or commit. Tell the user in one line |
| About how the user sees — would hold in another project | the quote, dated, under its axis in `~/.ui-loop/taste-archive.md`; and edit the axis in `~/.ui-loop/taste.md` (core) only if the quote changes a principle or a threshold |
| A project with no repo yet (Figma only) | a row in `~/.ui-loop/projects.md` |
| How the loop should work, true for any user | `SKILL.md`, `references/`, `agents/` + a `CHANGELOG.md` entry. No names, quotes or paths of one user: "the user", cite the USELOG date. A one-situation trick goes in the topic file (e.g. `web-gotchas.md`), not in a core file |
| A one-off | nowhere — USELOG only |

**Quality bar** — a rule goes in only if it is **evidenced** in this run (quote, measurement,
commit — cited next to it), **general** enough to change next time, and **new** (otherwise
sharpen the existing rule). A rule that turned out **wrong** (false blocker, overruled by the
user) is narrowed or deleted in the same retro, with the reason — the only case where a rule is
deleted.

## Size caps — core files stay short; nothing is lost

Core files are read on every run, so their length is paid every run. Archives and topic files
are read only when the work touches their topic, so they have no cap.

| Core file (read every run) | Cap | Overflow goes to (read by topic) |
|---|---|---|
| `SKILL.md` | 14 KB | `references/loop/*.md` |
| `agents/ui-critic.md` | 17 KB | `references/critic/*.md` |
| `references/surfaces/<surface>.md` | 8 KB each | `references/surfaces/<surface>-gotchas.md` |
| `~/.ui-loop/taste.md` | 12 KB | `~/.ui-loop/taste-archive.md` |

`sh tools/size-check.sh` prints every core file against its cap. Run it in every retro that
edited a core file. **Project `design-rules.md` files have no cap** — they are the user's
reviewed rules, and the critic already filters them by scope tags.

**Over a cap, before adding anything, make room in this order:**

1. **Merge** duplicates into one sharper rule that keeps every citation and date of both, and
   says "merged from …".
2. **Move a story out**: a rule line keeps the principle and the threshold; the example, quote
   and backstory go to the archive/topic file, linked.
3. **Demote** a rule to the archive/topic file — never delete it — but only one that is:
   - not `🔒`. Protected, never demoted: a `[đo]` rule that has blocked a real defect; a rule the
     user stated in their own words; anything about payments, personal data, fake content or
     asset rights;
   - not cited in the last 30 USELOG entries (search USELOG for its axis/rule number/topic);
   - still reachable: its topic file is listed in the core file's index under the right topic.

**Promote back** when the problem a demoted rule covers comes back (the user flags it, or a
critic blocker matches it): move it into the core in the same retro and mark it `🔒` — it has
now proved it matters.

**Every merge, move and demotion is its own commit** and its own line under "Đã cập nhật luật:"
(what, from where to where), so the user can veto it; git keeps the old text.

## Then

- USELOG entry (step 9) — also for critic-only, partial and abandoned runs. The line that matters
  most is **what the user still flagged after hand-off**: that is what the loop missed. Record
  the build skills loaded (`Skills loaded:`). When a run exposes a gap in the engine, fix it and
  add a `CHANGELOG.md` entry, with the eval score before and after if the user's `evals/` covers
  it. The entry includes a **Rules updated:** line — every change and its file, or
  `none` with the reason. Never left out. Add `Lane:` and `Cost:` (tokens if known).
- Data folder `~/.ui-loop`: commit; if it has a remote, `git pull --rebase` and push.
- Skill folder (only if the engine changed): GitHub login (`gh api user --jq .login`) listed in
  `setup/maintainers.txt` → commit, `git pull --rebase`, push to the default branch. Anyone else
  → commit on a branch `proposal/<login>-<date>` and open a pull request (`gh repo fork --remote`
  first if they can't push), then switch the folder back to the default branch. No `gh` → leave
  the commit on the branch and tell the user how to send it. Run `setup/install.sh` if `agents/`
  changed.
- Project repo: edit `.claude/design-rules.md` but don't commit on the user's branch unless they
  ask — say it's there, uncommitted.
- **Both repos, every time:** before the last message run `git status -sb` in the skill folder
  and in `~/.ui-loop`; anything changed is committed and pushed in each, and the reply names both
  commits. An engine change often has a data side (USELOG, handoff) and the reverse.
- The last message ends with a short **"Đã cập nhật luật:"** list (one line each), so the user
  can veto a lesson.
