#!/bin/sh
# Core files are read on every ui-loop run, so their size is paid every run. Prints each one
# against its cap (references/loop/retro.md, "Size caps"); exit 1 if any is over.
cd "$(dirname "$0")/.."
over=0
check() { # file cap_kb
  [ -f "$1" ] || return 0
  b=$(wc -c < "$1"); cap=$(($2 * 1024))
  if [ "$b" -gt "$cap" ]; then flag="OVER — merge / move / demote (retro.md)"; over=1; else flag=ok; fi
  printf '%-45s %6d / %6d  %s\n' "$1" "$b" "$cap" "$flag"
}
check SKILL.md 14
check agents/ui-critic.md 17
for f in references/surfaces/*.md; do
  case "$f" in *-gotchas.md) ;; *) check "$f" 8 ;; esac
done
check "$HOME/.ui-loop/taste.md" 12
check references/taste-base.md 11
exit $over
