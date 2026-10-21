# Bootstrap — instructions for Claude, on a new machine or account

The user said something like *"cài ui-loop cho máy này"* and pointed here. Do every step yourself;
stop only for the things marked **user** (logins, browser extensions), and say exactly what to run.
Report at the end with the checklist in step 6.

## 0. Ask once, only what you can't find out

- **Data repo URL** — their private `~/.ui-loop` repo from another machine (e.g.
  `https://github.com/<them>/ui-loop`), or "new" for a first-time user. Skip the question if they
  already gave it, or if `~/.ui-loop` exists.
- **Accounts** — default: this one (`$CLAUDE_CONFIG_DIR`, else `~/.claude`). Ask only if several
  `~/.claude*` folders exist.
- **Mirror** (`--mirror`, a copy of the engine inside their data repo) — on if they bring a data
  repo, off for "new". Don't ask.

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
(`setup/skills.txt`: the Figma plugin, frontend-design, impeccable, ui-ux-pro-max,
building-landing-pages, the SwiftUI skills) and `playwright-core` for ui-check. Read its output: a
line starting with `!` is a failure — fix it or report it; rerunning is safe.

## 4. Verify

1. `sh ~/.claude/skills/ui-loop/setup/install.sh [same account dirs]` again — it should report
   every build skill present and `tools ui-check runner ready`, and no `!` line.
2. `claude plugin list` shows `figma`, `frontend-design`, `impeccable`, `ui-ux-pro-max`.
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
