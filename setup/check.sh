#!/bin/sh
# What of ui-loop is installed on this machine — prints one line per part, changes nothing.
# Used by setup/BOOTSTRAP.md (and safe to run any time). Exit 0 = everything in place, 1 = something missing.
#   sh setup/check.sh [account dirs]     default: $CLAUDE_CONFIG_DIR or ~/.claude
REPO=$(cd "$(dirname "$0")/.." && pwd -P)
[ $# -eq 0 ] && set -- "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
miss=0
ok() { echo "ok      $*"; }
no() { echo "MISSING $*"; miss=1; }

ver=$(grep -m1 '^## v' "$REPO/CHANGELOG.md" 2>/dev/null | sed 's/^## //;s/ —.*//')
ok "engine $REPO ($ver, $(git -C "$REPO" rev-parse --short HEAD 2>/dev/null))"

D="$HOME/.ui-loop"
if [ -f "$D/taste.md" ]; then
  r=$(git -C "$D" remote get-url origin 2>/dev/null)
  if [ -n "$r" ]; then ok "data $D ← $r"; else ok "data $D (local only, no remote)"; fi
  [ -d "$D/engine" ] && ok "mirror $D/engine/"
else no "data ~/.ui-loop (install.sh creates it, or --data <url> clones it)"; fi

for cfg in "$@"; do
  [ -d "$cfg/skills/ui-loop" ] && [ "$(cd "$cfg/skills/ui-loop" && pwd -P)" = "$REPO" ] && ok "skill linked in $cfg" || no "skill link $cfg/skills/ui-loop"
  for a in ui-critic ui-builder; do [ -f "$cfg/agents/$a.md" ] && ok "agent $a in $cfg" || no "agent $a in $cfg"; done
  grep -q '^<!-- ui-loop:start' "$cfg/CLAUDE.md" 2>/dev/null && ok "CLAUDE.md block in $cfg" || no "CLAUDE.md block in $cfg"
  n=0; list=""
  while IFS='|' read -r name rest; do
    name=$(echo "$name" | tr -d ' '); case "$name" in ''|'#'*) continue ;; esac
    [ -f "$cfg/skills/$name/SKILL.md" ] && continue
    find "$cfg/plugins/cache" -path "*/skills/$name/SKILL.md" 2>/dev/null | grep -q . && continue
    n=$((n + 1)); list="$list $name"
  done < "$REPO/setup/skills.txt"
  [ $n -eq 0 ] && ok "build skills in $cfg" || no "$n build skills in $cfg:$list"
done

[ -d "$REPO/tools/ui-check/node_modules/playwright-core" ] && ok "ui-check runner" || no "ui-check runner (playwright-core)"
for t in git node npm; do command -v $t >/dev/null && ok "$t" || no "$t (install it)"; done
chrome=""; for c in "$CHROME" "C:/Program Files/Google/Chrome/Application/chrome.exe" "/Applications/Google Chrome.app" /usr/bin/google-chrome; do [ -n "$c" ] && [ -e "$c" ] && chrome=$c && break; done
[ -n "$chrome" ] && ok "Chrome $chrome" || no "Chrome (ui-check drives it)"
exit $miss
