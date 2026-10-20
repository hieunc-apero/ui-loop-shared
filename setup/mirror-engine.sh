#!/bin/sh
# Copy the engine's committed tree into ~/.ui-loop/engine/ and commit it there: a read-only mirror,
# so the user's private data repo also holds the whole engine at every version. Opt in with
# `install.sh --mirror` (creates the folder); a git hook then runs this after every engine commit,
# pull and rebase. Never edit the mirror — edit the skill folder; the next sync overwrites it.
REPO=$(cd "$(dirname "$0")/.." && pwd -P)
DATA="$HOME/.ui-loop"
M="$DATA/engine"
[ -d "$M" ] && [ -d "$DATA/.git" ] || exit 0
[ -f "$DATA/.git/index.lock" ] && exit 0   # another session is committing there; the next sync catches up
sha=$(git -C "$REPO" rev-parse --short HEAD) || exit 0
subj=$(git -C "$REPO" log -1 --format=%s)
find "$M" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
git -C "$REPO" archive HEAD | tar -x -C "$M"
cat > "$M/MIRROR.md" <<MD
# engine/ — bản chép tự động của bộ máy ui-loop (đừng sửa ở đây)

Bản chép nguyên vẹn của \`~/.claude/skills/ui-loop\` (repo public
\`$(git -C "$REPO" remote get-url origin 2>/dev/null)\`), tại commit **$sha** — "$subj".
Được \`setup/mirror-engine.sh\` ghi lại sau mỗi commit / pull của bộ máy, để repo dữ liệu này cũng
giữ toàn bộ bộ máy ở mọi phiên bản. Sửa bộ máy ở skill folder; lần đồng bộ sau sẽ ghi đè thư mục này.
MD
cd "$DATA" || exit 0
git add -A engine
git diff --cached --quiet -- engine && exit 0
git commit -q -m "engine mirror: $sha $subj" -- engine || exit 0
[ "$1" = "--push" ] && git remote get-url origin >/dev/null 2>&1 && git push -q >/dev/null 2>&1
exit 0
