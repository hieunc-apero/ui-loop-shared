#!/bin/sh
# Install ui-loop into one or more Claude Code config dirs (one per account).
#
#   sh setup/install.sh                      # $CLAUDE_CONFIG_DIR, or ~/.claude
#   sh setup/install.sh ~/.claude ~/.claude-trung
#   sh setup/install.sh --data <git url>     # also clone your personal data repo to ~/.ui-loop
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
if [ "$1" = "--data" ]; then DATA_URL="$2"; shift 2; fi

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

# Copies go stale on the next pull; re-run this script after every pull/rebase in this repo.
# The list of config dirs accumulates across runs, so installing accounts one at a time works.
if [ "$copied" = yes ] && [ -d "$REPO/.git" ]; then
  list="$REPO/.git/ui-loop-config-dirs"
  for cfg in "$@"; do (cd "$cfg" && pwd -P); done | cat - "$list" 2>/dev/null | sort -u > "$list.tmp"
  mv "$list.tmp" "$list"
  for h in post-merge post-rewrite; do
    cat > "$REPO/.git/hooks/$h" <<EOF
#!/bin/sh
# installed by setup/install.sh: agents are copies in these config dirs, keep them fresh
while IFS= read -r d; do [ -d "\$d" ] && set -- "\$@" "\$d"; done < "$list"
[ \$# -gt 0 ] && sh "$REPO/setup/install.sh" "\$@" >/dev/null
exit 0
EOF
    chmod +x "$REPO/.git/hooks/$h"
  done
  echo "hooks   agents re-copied after every git pull, for: $(tr '\n' ' ' < "$list")"
fi

# Build skills ui-loop loads (setup/skills.txt): report the missing ones, install nothing.
echo
for cfg in "$@"; do
  missing=""
  while IFS='|' read -r name use how; do
    name=$(echo "$name" | tr -d ' ')
    case "$name" in ''|'#'*) continue ;; esac
    [ -f "$cfg/skills/$name/SKILL.md" ] && continue
    find "$cfg/plugins/cache" -path "*/skills/$name/SKILL.md" 2>/dev/null | grep -q . && continue
    missing="$missing
  - $name ($(echo "$use" | sed 's/^ *//;s/ *$//')):$how"
  done < "$REPO/setup/skills.txt"
  if [ -z "$missing" ]; then
    echo "skills  $cfg: all build skills present"
  else
    echo "skills  $cfg: missing — ui-loop still runs, with less build guidance. Install:$missing"
  fi
done

echo
echo "Done. Skills/agents: picked up by running sessions after a short delay."
echo "CLAUDE.md (auto-invoke + retro): from the next new session."
echo "Optional tools ui-loop uses when present: a browser MCP (Claude in Chrome / Claude Browser),"
echo "the Figma MCP. See setup/README.md."
