#!/bin/sh
# Run by this repo's .git/hooks/{post-commit,post-merge,post-rewrite} (written by install.sh).
#  - after a commit, pull or rebase: re-copy agents into accounts where they are copies, not links;
#  - after any of them: refresh the engine mirror in ~/.ui-loop/engine/ if the user opted in.
hook="$1"
REPO=$(cd "$(dirname "$0")/.." && pwd -P)
case "$hook" in
  post-commit|post-merge|post-rewrite)
    list="$REPO/.git/ui-loop-config-dirs"
    if [ -f "$list" ]; then
      set --
      while IFS= read -r d; do [ -d "$d" ] && set -- "$@" "$d"; done < "$list"
      [ $# -gt 0 ] && sh "$REPO/setup/install.sh" --no-hooks "$@" >/dev/null 2>&1
    fi ;;
esac
( sh "$REPO/setup/mirror-engine.sh" --push >/dev/null 2>&1 & )
exit 0
