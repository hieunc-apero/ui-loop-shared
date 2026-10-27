# Bootstrap — instructions for Claude, on a new machine or account

The user said something like *"cài ui-loop cho máy này"*, or opened Claude Code in the engine folder
with ui-loop not installed (the engine's `CLAUDE.md` sends you here). Do every step yourself, in one
go; stop only for the things marked **user** (logins, browser extensions), and say exactly what to
run — with the `!` prefix so it runs in this session.
Report at the end with the checklist in step 6.

## 0. Find out, don't ask

Run `sh ~/.claude/skills/ui-loop/setup/check.sh` (after step 2 if the engine isn't cloned yet): it
prints `ok` / `MISSING` per part and changes nothing. Then work out, without asking:

- **Data repo.** `~/.ui-loop` exists → keep it. Else, if the user named a URL, use it. Else, if `gh`
  is logged in: `gh repo list --json name,isPrivate,url --limit 100`, and for each **private** repo
  whose name contains `ui-loop`, check it holds `taste.md` and `USELOG.md` at the root
  (`gh api repos/<owner>/<name>/contents --jq '.[].name'`). Exactly one → that's theirs: use it
  and say which. None → "new" (a fresh, empty profile). Several → the one asked here is the only
  question you may ask.
- **Accounts.** This one (`$CLAUDE_CONFIG_DIR`, else `~/.claude`), plus every other `~/.claude*`
  folder that has a `.credentials.json` or `settings.json` *and* whose `skills` points at the same
  folder (a symlink) — those are the same person's accounts on this machine. Otherwise only this one.
- **Mirror** (`--mirror`): on when the data comes from a repo, off for "new".

## 1. Prerequisites

Check, in one shell call: `git --version`, `node --version`, `npm --version`, an installed Chrome
(Windows `C:/Program Files/Google/Chrome/Application/chrome.exe`, macOS `/Applications/Google
Chrome.app`), and — only when a private data repo URL was given — `gh auth status` or a plain
`git ls-remote <url>`. Shell: on Windows use Git Bash (`bash`), not cmd/PowerShell syntax.

| Missing | Do |
|---|---|
| git | **user**: install Git (Windows: Git for Windows) |
| node / npm | **user**: install Node.js LTS — needed for build skills and ui-check |
| Chrome | **user**: install Chrome — ui-check's runner drives it |
| access to the data repo | **user**: `! gh auth login` (the `!` runs it in this session), then retry |

## 2. The engine

If `~/.claude/skills/ui-loop/SKILL.md` doesn't exist:
`git clone https://github.com/hieunc-apero/ui-loop-shared ~/.claude/skills/ui-loop`.
If it exists and is a git clone of that repo: `git -C ~/.claude/skills/ui-loop pull --rebase`.
If it exists and is something else: stop and ask — never overwrite it.

## 3. Install everything

```sh
sh ~/.claude/skills/ui-loop/setup/install.sh [account dirs] [--data <url>] [--mirror] --with-skills
```

This creates or clones `~/.ui-loop`, links the skill, installs the agents, writes the auto-invoke +
retro block into each account's `CLAUDE.md`, installs git hooks, installs every missing build skill
(`setup/skills.txt`: the Figma plugin, impeccable, design-taste-frontend,
building-landing-pages, the SwiftUI skills) and `playwright-core` for ui-check. Read its output: a
line starting with `!` is a failure — fix it or report it; rerunning is safe.

## 4. Verify

1. `sh ~/.claude/skills/ui-loop/setup/check.sh [same account dirs]` — every line `ok`, exit 0.
2. `claude plugin list` shows `figma` and `impeccable`; `design-taste-frontend` is under `~/.claude/skills/`.
3. `ls ~/.ui-loop` shows `taste.md`, `USELOG.md`, `CHANGELOG.md` (and `engine/` with `--mirror`).
4. ui-check works: `node ~/.claude/skills/ui-loop/tools/ui-check/run.js
   'data:text/html,<button style="width:20px">Go now please</button>' --widths 390` prints a
   `U5` tap-target and a `U4` wrap finding.
5. The agents are in place: `ls <account>/agents/ui-critic.md <account>/agents/ui-builder.md`.

## 5. What only the user can do

- **Figma**: in Claude Code run `/mcp`, pick `figma`, authenticate in the browser.
- **A browser for the critic**: the Claude desktop app has one built in; otherwise install the
  **Claude in Chrome** extension and sign in. Without either the critic judges from screenshots.
- **Start a new session** — `CLAUDE.md` (auto-invoke, retro) is read only at session start; the
  skill and agents work in this one already.
- **Pushing their data**: a first-time user with "new" data keeps it local until they make a
  *private* repo for it (`cd ~/.ui-loop && gh repo create ui-loop-data --private --source . --push`).
- **Changing the engine**: only maintainers in `setup/maintainers.txt` push to it; others' retros
  open pull requests (fork first if needed — `gh auth login` makes that automatic).

## 6. Report

A short table, one line each, ✅ / ⚠️ / ❌ and what to do:
engine (version from the top of `CHANGELOG.md`) · data folder (cloned from … / new) · accounts
installed · agents · CLAUDE.md block · build skills · ui-check runner · mirror · Figma login ·
browser for the critic · new session needed. Then one line: "Gõ việc UI bất kỳ — ui-loop tự chạy."
