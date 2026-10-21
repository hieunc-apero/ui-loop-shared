#!/bin/sh
# Install ui-loop into one or more Claude Code config dirs (one per account).
#
#   sh setup/install.sh                      # $CLAUDE_CONFIG_DIR, or ~/.claude
#   sh setup/install.sh ~/.claude ~/.claude-trung
#   sh setup/install.sh --data <git url>     # also clone your personal data repo to ~/.ui-loop
#   sh setup/install.sh --mirror             # also keep a copy of the engine in ~/.ui-loop/engine/
#   sh setup/install.sh --with-skills        # also install the missing build skills (setup/skills.txt)
#                                            # and playwright-core for tools/ui-check; --dry-run: print only
#   sh setup/install.sh --uninstall [dirs]   # undo 1–3 below for these accounts (default: this
#                                            # one); keeps the clone and ~/.ui-loop
#
# Safe to re-run. First, the personal data folder ~/.ui-loop (taste, projects, USELOG, evals —
# see SKILL.md "Two folders"): cloned from --data, or started from setup/data-template/ as a
# local git repo; left alone if it exists. Then, for each config dir it:
#   1. makes <dir>/skills/ui-loop point at this repo (symlink; skipped if it already is this repo)
#   2. links agents/*.md into <dir>/agents/ (copies when the OS refuses symlinks; then a git
#      hook re-copies them after every pull, so they never go stale)
#   3. adds the auto-invoke + retro block from global-CLAUDE.md to <dir>/CLAUDE.md, between
#      markers, replacing an older copy of the block — the rest of the file is untouched
# Running sessions pick up skills and agents after a short delay; CLAUDE.md only at session start.
set -e
REPO=$(cd "$(dirname "$0")/.." && pwd -P)
DATA="$HOME/.ui-loop"
DATA_URL=""
UNINSTALL=no
MIRROR=no
HOOKS=yes
WITH_SKILLS=no
DRY=no
# flags may come before or after the config dirs
dirs=""
while [ $# -gt 0 ]; do
  case "$1" in
    --data) DATA_URL="$2"; shift 2 ;;
    --uninstall) UNINSTALL=yes; shift ;;
    --mirror) MIRROR=yes; shift ;;
    --with-skills) WITH_SKILLS=yes; shift ;;
    --dry-run) DRY=yes; shift ;;
    --no-hooks) HOOKS=no; shift ;;   # used by setup/hooks.sh itself
    -*) echo "unknown option: $1" >&2; exit 1 ;;
    *) dirs="$dirs$1
"; shift ;;
  esac
done
set --
while IFS= read -r d; do [ -n "$d" ] && set -- "$@" "$d"; done <<DIRS
$dirs
DIRS

if [ "$UNINSTALL" = yes ]; then
  [ $# -eq 0 ] && set -- "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
  list="$REPO/.git/ui-loop-config-dirs"
  for cfg in "$@"; do
    [ -d "$cfg" ] || { echo "== $cfg: no such folder"; continue; }
    cfg=$(cd "$cfg" && pwd -P); echo "== $cfg"
    # skill: only ever a link here — never delete a real folder (it may be the clone itself)
    if [ -L "$cfg/skills/ui-loop" ]; then rm -f "$cfg/skills/ui-loop"; echo "skill   link removed"
    else echo "skill   $cfg/skills/ui-loop is a real folder (the clone?) — left alone"; fi
    for f in "$REPO"/agents/*.md; do
      head -5 "$f" | grep -q "^name:" || continue
      a="$cfg/agents/$(basename "$f")"
      if [ -L "$a" ] || { [ -f "$a" ] && cmp -s "$f" "$a"; }; then rm -f "$a"; echo "agent   $(basename "$f" .md) removed"
      elif [ -e "$a" ]; then echo "agent   $(basename "$f" .md): differs from this repo — left alone"; fi
    done
    if [ -f "$cfg/CLAUDE.md" ] && grep -q '^<!-- ui-loop:start' "$cfg/CLAUDE.md"; then
      awk '/^<!-- ui-loop:start/{skip=1;next} /^<!-- ui-loop:end -->/{skip=0;next} !skip' \
        "$cfg/CLAUDE.md" > "$cfg/CLAUDE.md.tmp" && mv "$cfg/CLAUDE.md.tmp" "$cfg/CLAUDE.md"
      echo "CLAUDE  block removed"
    fi
    [ -f "$list" ] && { grep -vxF "$cfg" "$list" > "$list.tmp" || true; mv "$list.tmp" "$list"; }
  done
  echo
  echo "Kept: this clone ($REPO) and your data ($DATA). Delete them yourself if you want them gone."
  exit 0
fi

if [ -d "$DATA" ]; then
  echo "data    $DATA exists — left as is"
elif [ -n "$DATA_URL" ]; then
  git clone -q "$DATA_URL" "$DATA"
  echo "data    cloned $DATA_URL -> $DATA"
else
  cp -r "$REPO/setup/data-template" "$DATA"
  (cd "$DATA" && git init -q && git add -A &&
     git commit -qm "ui-loop data: start from the template" >/dev/null 2>&1) ||
    echo "data    ! first commit failed — set your git name/email (git config --global user.name / user.email), then commit in $DATA" >&2
  echo "data    new $DATA from the template (empty taste profile; ui-loop fills it from your feedback)."
  echo "        To keep it across machines: make a PRIVATE repo, then in $DATA:"
  echo "        git remote add origin <url> && git push -u origin HEAD"
fi

if [ $# -eq 0 ]; then
  # no args: this account, plus every account installed before (so a re-run after editing an
  # agent refreshes all of them)
  set -- "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
  [ -f "$REPO/.git/ui-loop-config-dirs" ] &&
    while IFS= read -r d; do [ -d "$d" ] && set -- "$@" "$d"; done < "$REPO/.git/ui-loop-config-dirs"
fi
# one canonical path per account (C:\Users\x\.claude and /c/Users/x/.claude are the same dir)
seen=""
for cfg in "$@"; do
  mkdir -p "$cfg"; p=$(cd "$cfg" && pwd -P)
  case "$seen" in *"|$p|"*) ;; *) seen="$seen|$p|" ;; esac
done
set --
IFS='|'; for p in $seen; do [ -n "$p" ] && set -- "$@" "$p"; done; unset IFS
# Git Bash on Windows: make real symlinks, or fail (and fall back to copying) instead of
# silently copying. Real symlinks need Developer Mode or an admin shell.
export MSYS=winsymlinks:nativestrict

START='<!-- ui-loop:start — managed by ui-loop/setup/install.sh, edit setup/global-CLAUDE.md instead -->'
END='<!-- ui-loop:end -->'
BLOCK=$(mktemp)
trap 'rm -f "$BLOCK"' EXIT
{ echo "$START"; sed -n '/^## UI work/,$p' "$REPO/setup/global-CLAUDE.md"; echo "$END"; } > "$BLOCK"

copied=no
for cfg in "$@"; do
  echo "== $cfg"
  mkdir -p "$cfg/skills" "$cfg/agents"

  # 1. skill
  dst="$cfg/skills/ui-loop"
  if [ -d "$dst" ] && [ "$(cd "$dst" && pwd -P)" = "$REPO" ]; then
    echo "skill   already this repo"
  elif [ -L "$dst" ] || [ ! -e "$dst" ]; then
    rm -f "$dst"
    if ln -s "$REPO" "$dst" 2>/dev/null; then
      echo "skill   linked -> $REPO"
    elif command -v cygpath >/dev/null &&
         cmd //c mklink //J "$(cygpath -w "$dst")" "$(cygpath -w "$REPO")" >/dev/null 2>&1; then
      # Windows without symlink rights: a directory junction needs none
      echo "skill   linked (junction) -> $REPO"
    else
      echo "skill   ! could not symlink. Clone the repo straight into $dst instead:" >&2
      echo "          git clone https://github.com/hieunc-apero/ui-loop-shared \"$dst\"" >&2
      exit 1
    fi
  else
    echo "skill   ! $dst is another folder, not this repo — left alone. Move it away and re-run." >&2
    exit 1
  fi

  # 2. agents
  for f in "$REPO"/agents/*.md; do
    head -5 "$f" | grep -q "^name:" || continue   # agent definitions only, not README.md
    a="$cfg/agents/$(basename "$f")"
    if [ "$f" -ef "$a" ]; then
      echo "agent   $(basename "$f" .md): already linked"
      continue
    fi
    rm -f "$a"
    if ln -s "$f" "$a" 2>/dev/null; then
      echo "agent   $(basename "$f" .md): linked"
    else
      cp "$f" "$a"; copied=yes
      echo "agent   $(basename "$f" .md): copied (no symlink permission)"
    fi
  done

  # 3. CLAUDE.md block
  md="$cfg/CLAUDE.md"
  touch "$md"
  if grep -q '^<!-- ui-loop:start' "$md"; then
    awk -v blk="$BLOCK" '
      /^<!-- ui-loop:start/ { while ((getline l < blk) > 0) print l; skip=1; next }
      /^<!-- ui-loop:end -->/ { skip=0; next }
      !skip' "$md" > "$md.tmp" && mv "$md.tmp" "$md"
    echo "CLAUDE  block refreshed"
  elif grep -q '^## UI work → ui-loop' "$md"; then
    # written by hand before the markers existed: swap that section for the marked block
    awk -v blk="$BLOCK" '
      /^## UI work → ui-loop/ { while ((getline l < blk) > 0) print l; skip=1; next }
      skip && /^#{1,2} / { skip=0 }
      !skip' "$md" > "$md.tmp" && mv "$md.tmp" "$md"
    echo "CLAUDE  old hand-copied block replaced by the managed one"
  else
    [ -s "$md" ] && printf '\n' >> "$md"
    cat "$BLOCK" >> "$md"
    echo "CLAUDE  block added"
  fi
done

# Git hooks (setup/hooks.sh): after a pull/rebase, re-copy agents where they are copies; after any
# commit/pull, refresh the engine mirror in ~/.ui-loop/engine/ if opted in. The list of config dirs
# accumulates across runs, so installing accounts one at a time works.
if [ -d "$REPO/.git" ] && [ "$HOOKS" = yes ]; then
  list="$REPO/.git/ui-loop-config-dirs"
  if [ "$copied" = yes ]; then
    for cfg in "$@"; do (cd "$cfg" && pwd -P); done | cat - "$list" 2>/dev/null | sort -u > "$list.tmp"
    mv "$list.tmp" "$list"
  fi
  for h in post-commit post-merge post-rewrite; do
    printf '#!/bin/sh
# installed by setup/install.sh
sh "%s/setup/hooks.sh" %s
exit 0
' "$REPO" "$h" > "$REPO/.git/hooks/$h"
    chmod +x "$REPO/.git/hooks/$h"
  done
  [ -f "$list" ] && echo "hooks   agents re-copied after every git pull, for: $(tr '
' ' ' < "$list")"
fi
if [ "$MIRROR" = yes ]; then
  mkdir -p "$DATA/engine" && sh "$REPO/setup/mirror-engine.sh" --push
  echo "mirror  the engine is copied to $DATA/engine/ after every commit and pull (read-only copy)"
elif [ -d "$DATA/engine" ]; then
  echo "mirror  on ($DATA/engine/)"
fi

# Build skills ui-loop loads (setup/skills.txt): report the missing ones; with --with-skills, run
# each missing one's install command (a command shared by several skills runs once).
run() { if [ "$DRY" = yes ]; then echo "        would run: $1"; else echo "        running: $1"; sh -c "$1" || echo "        ! failed: $1" >&2; fi; }
echo
done_cmds=""
for cfg in "$@"; do
  missing=""; cmds=""
  while IFS='|' read -r name use how; do
    name=$(echo "$name" | tr -d ' ')
    case "$name" in ''|'#'*) continue ;; esac
    [ -f "$cfg/skills/$name/SKILL.md" ] && continue
    find "$cfg/plugins/cache" -path "*/skills/$name/SKILL.md" 2>/dev/null | grep -q . && continue
    how=$(echo "$how" | sed 's/^ *//;s/ *$//')
    missing="$missing
  - $name ($(echo "$use" | sed 's/^ *//;s/ *$//')): $how"
    case "$cmds" in *"|$how|"*) ;; *) cmds="$cmds|$how|" ;; esac
  done < "$REPO/setup/skills.txt"
  if [ -z "$missing" ]; then
    echo "skills  $cfg: all build skills present"
  elif [ "$WITH_SKILLS" = yes ]; then
    echo "skills  $cfg: installing the missing ones:$missing"
    IFS='|'; for c in $cmds; do [ -z "$c" ] && continue
      case "$done_cmds" in *"|$c|"*) continue ;; esac; done_cmds="$done_cmds|$c|"
      CLAUDE_CONFIG_DIR="$cfg" run "$c"; done; unset IFS
  else
    echo "skills  $cfg: missing — ui-loop still runs, with less build guidance. Install with --with-skills, or:$missing"
  fi
done

# ui-check's headless runner needs playwright-core (it drives the installed Chrome, no download)
UC="$REPO/tools/ui-check"
if [ -d "$UC/node_modules/playwright-core" ]; then echo "tools   ui-check runner ready"
elif [ "$WITH_SKILLS" = yes ]; then
  if command -v npm >/dev/null; then run "npm i --silent --no-audit --no-fund --prefix \"$UC\" playwright-core"
  else echo "tools   ! npm not found — install Node.js, then: npm i --prefix \"$UC\" playwright-core" >&2; fi
else echo "tools   ui-check runner: uses a project's playwright-core, or run with --with-skills to add one"; fi

echo
echo "Done. Skills/agents: picked up by running sessions after a short delay."
echo "CLAUDE.md (auto-invoke + retro): from the next new session."
echo "Optional tools ui-loop uses when present: a browser MCP (Claude in Chrome / Claude Browser),"
echo "the Figma MCP. See setup/README.md."
