# coverage — how much of the repeated work the loop takes

```sh
node ~/.claude/skills/ui-loop/tools/coverage/coverage.js            # report to stdout
node ~/.claude/skills/ui-loop/tools/coverage/coverage.js --out ~/.ui-loop/evals/<date>-automation/report.md
```

Inputs, both in the data folder (`--data` to point elsewhere):

- `task-catalog.json` — your repeated tasks, the steps each one takes by hand, and who does each
  step now (`auto` · `removed` · `human` · `na`), plus `manual`: repeated tasks that never reach the
  loop, with a per-week count. Start from `setup/data-template/task-catalog.json`.
- `USELOG.md` — every run. A run counts toward the first task whose `match` regex hits its heading.

Output: runs and runs/week per task, steps automated, steps removed outright, average critic rounds,
what people still do — and the frequency-weighted share of all catalogued repeated work.

It counts steps, not minutes: the steps people keep (approving, picking a direction) are usually the
heaviest. Say so when quoting the number. A `manual` count marked `estimate` is a guess — replace it
with a real count when you have one.
