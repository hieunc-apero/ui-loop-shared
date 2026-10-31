#!/usr/bin/env node
// coverage.js — how much of a person's repeated design work ui-loop automates, proven from USELOG.
//
//   node coverage.js [--data ~/.ui-loop] [--catalog <file>] [--uselog <file>] [--out <report.md>]
//
// Reads the task catalog (task-catalog.json in the data folder: the repeated tasks, the steps each
// one takes by hand, and who does each step now) and USELOG.md (one entry per run). Each run is
// matched to the first task whose `match` regex hits its heading (+ body for `matchBody`). Prints a
// markdown report: runs per task, step coverage per task, and the frequency-weighted total —
// including catalogued tasks that never reach the loop (`manual`, with a per-week count).
//
// Step status: "auto" (the loop does it), "removed" (no longer exists as human work — e.g. measuring
// contrast by hand, now ui-check), "human" (a person still does it), "na" (doesn't apply; skipped).
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');

const args = process.argv.slice(2);
const opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const home = p => p && p.replace(/^~(?=$|[\\/])/, os.homedir());
const data = home(opt('--data')) || path.join(os.homedir(), '.ui-loop');
const catFile = home(opt('--catalog')) || path.join(data, 'task-catalog.json');
const logFile = home(opt('--uselog')) || path.join(data, 'USELOG.md');
const out = home(opt('--out'));

if (!fs.existsSync(catFile)) {
  console.error(`No catalog at ${catFile}. Copy setup/data-template/task-catalog.json there and edit it.`);
  process.exit(1);
}
const cat = JSON.parse(fs.readFileSync(catFile, 'utf8'));
const log = fs.existsSync(logFile) ? fs.readFileSync(logFile, 'utf8') : '';

// Entries: "## <date> …" headings after the format block.
const entries = log.split(/\n(?=## \d{4}-\d{2}-\d{2})/).slice(1).map(e => {
  const [head, ...rest] = e.split('\n');
  return { head, body: rest.join('\n'), date: head.slice(3, 13) };
});
const dates = entries.map(e => e.date).sort();
const days = dates.length ? (Date.parse(dates[dates.length - 1]) - Date.parse(dates[0])) / 864e5 + 1 : 0;
const weeks = Math.max(days / 7, 1 / 7);

const tasks = cat.tasks.map(t => ({ ...t, re: new RegExp(t.match, 'i'), reBody: t.matchBody ? new RegExp(t.matchBody, 'i') : null, runs: 0, rounds: 0, withRounds: 0 }));
let unmatched = 0;
for (const e of entries) {
  const t = tasks.find(t => t.re.test(e.head) || (t.reBody && t.reBody.test(e.body)));
  if (!t) { unmatched++; continue; }
  t.runs++;
  const r = e.body.match(/\*\*Rounds:\*\*\s*(\d+)/);
  if (r) { t.rounds += +r[1]; t.withRounds++; }
}

const cover = steps => {
  const v = Object.values(steps).filter(s => s !== 'na');
  const done = v.filter(s => s === 'auto' || s === 'removed').length;
  return { done, total: v.length, pct: v.length ? done / v.length : 0, removed: v.filter(s => s === 'removed').length };
};
const pct = x => Math.round(x * 100) + '%';
const rows = [];
let wSum = 0, wCov = 0, wSumLogged = 0, wCovLogged = 0;
for (const t of tasks) {
  const c = cover(t.steps), perWeek = t.runs / weeks;
  wSum += perWeek; wCov += perWeek * c.pct; wSumLogged += perWeek; wCovLogged += perWeek * c.pct;
  const human = Object.entries(t.steps).filter(([, s]) => s === 'human').map(([k]) => cat.steps[k]).join('; ') || '—';
  rows.push(`| ${t.id} ${t.name} | ${t.runs} | ${perWeek.toFixed(1)} | ${c.done}/${c.total} (${pct(c.pct)}) | ${c.removed} | ${t.withRounds ? (t.rounds / t.withRounds).toFixed(1) : '—'} | ${human} |`);
}
const manRows = [];
for (const m of cat.manual || []) {
  wSum += m.perWeek;
  manRows.push(`| ${m.name} | ${m.perWeek}${m.estimate ? ' (ước tính)' : ''} | 0% | ${m.why} |`);
}

const md = [];
md.push(`# Tự động hoá việc lặp — đo từ USELOG`, '');
md.push(`Nguồn: \`${path.basename(catFile)}\` + \`${path.basename(logFile)}\` · ${entries.length} lượt chạy, ${dates[0] || '—'} → ${dates[dates.length - 1] || '—'} (${days} ngày) · tạo bởi \`tools/coverage/coverage.js\`.`, '');
md.push(`**Tỉ lệ tự động (trọng số theo tần suất): ${pct(wCov / wSum)}** của danh mục việc lặp — tính cả việc chưa qua loop.`);
md.push(`Riêng các việc đã qua loop: ${pct(wCovLogged / wSumLogged)}.`, '');
md.push(`Cách tính: mỗi việc có các bước làm tay; bước "máy làm" hoặc "đã bỏ hẳn" tính là tự động. Mỗi việc nhân với số lần/tuần trong log, cộng lại. Đếm theo bước chứ không theo phút — bước người còn giữ thường là bước nặng nhất (duyệt, chọn hướng).`, '');
md.push(`## Việc đã qua loop`, '');
md.push(`| Việc | Lượt | Lượt/tuần | Bước tự động | Bước bỏ hẳn | Vòng chấm TB | Người còn làm |`, `|---|---|---|---|---|---|---|`, ...rows, '');
if (manRows.length) md.push(`## Việc lặp chưa tự động`, '', `| Việc | Lần/tuần | Tự động | Vì sao |`, `|---|---|---|---|`, ...manRows, '');
md.push(`## Các bước`, '', ...Object.entries(cat.steps).map(([k, v]) => `- **${k}** ${v}`), '');
md.push(`Lượt không khớp việc nào: ${unmatched}.`);
const text = md.join('\n') + '\n';
if (out) { fs.writeFileSync(home(out), text); console.log(`wrote ${out} — ${pct(wCov / wSum)}`); } else process.stdout.write(text);
