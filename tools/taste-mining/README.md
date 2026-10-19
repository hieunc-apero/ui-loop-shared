# Re-mining the taste profile

`extract.py` reads every session transcript under `~/.claude/projects/*/*.jsonl` and writes
`user_msgs.json`: only what the user typed (tool results, system reminders and task
notifications stripped), with the last assistant text before each message as context.

Run it from a scratch folder (it writes to the current directory; the output contains
private conversation text — don't commit it):

```sh
python ~/.claude/skills/ui-loop/tools/taste-mining/extract.py
```

2026-10-14 run: 3,533 user messages → 790 matching design vocabulary → 498 after removing
duplicates from forked sessions → 471 after dropping pasted agent reports and skill bodies.
Those 471 were read in full to write the maintainer's `~/.ui-loop/taste.md`. Re-run when the profile feels stale and
diff the new axes against the old ones in a CHANGELOG entry.
