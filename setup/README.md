# setup/ — cài đặt

**Muốn cài? Đọc [`../INSTALL.md`](../INSTALL.md)** — từng bước theo trường hợp. File này giải thích
các file trong `setup/` và trình cài làm gì bên trong.

| File | Làm gì |
|---|---|
| `install.sh` | tạo thư mục dữ liệu riêng `~/.ui-loop` (nếu chưa có), rồi cài ui-loop vào một hay nhiều tài khoản Claude Code: nối skill, nối/chép agent, thêm khối tự gọi + retro vào `CLAUDE.md`. Chạy lại bao nhiêu lần cũng được; chạy sau mỗi lần sửa agent. |
| `data-template/` | mẫu `~/.ui-loop` cho người mới: hồ sơ gu trống, bảng dự án trống, USELOG trống. |
| `hooks.sh`, `mirror-engine.sh` | git hook của repo này: sau mỗi pull chép lại agent (nếu là bản chép); sau mỗi commit/pull, nếu bật `--mirror`, chép cả bộ máy sang `~/.ui-loop/engine/` và commit + đẩy repo dữ liệu. |
| `check.sh` | in `ok` / `MISSING` cho từng phần (bộ máy, dữ liệu, skill, agent, CLAUDE.md, skill dựng, ui-check, git/node/Chrome); không đổi gì. |
| `BOOTSTRAP.md` | hướng dẫn **cho Claude**: trên máy mới, bạn bảo Claude làm theo file này là nó tự cài hết, tự kiểm, rồi báo. |
| `skills.txt` | các skill dựng mà ui-loop nạp (Figma, frontend-design, impeccable, landing, SwiftUI…), dùng cho việc gì, cài ở đâu. `install.sh` đối chiếu và in ra cái nào còn thiếu; `--with-skills` thì tự cài (mỗi lệnh một lần). |
| `maintainers.txt` | tên GitHub của người duy trì — được đẩy thẳng thay đổi bộ máy. Người khác gửi pull request (fork nếu cần). |
| `global-CLAUDE.md` | nguồn của khối luật toàn cục (tự gọi ui-loop, không dừng sau khi chấm, retro sau mỗi lần chạy). Sửa ở đây rồi chạy lại `install.sh` — đừng sửa thẳng trong `~/.claude/CLAUDE.md`. |

## Người mới trong team

Cần trước: `git`. Repo `hieunc-apero/ui-loop-shared` là public — clone không cần quyền gì.
Muốn retro tự gửi đề xuất sửa bộ máy thì cài thêm GitHub CLI và đăng nhập (`gh auth login`).

**macOS / Linux / Git Bash trên Windows:**

```sh
git clone https://github.com/hieunc-apero/ui-loop-shared ~/.claude/skills/ui-loop
sh ~/.claude/skills/ui-loop/setup/install.sh
```

**PowerShell trên Windows** (Claude Code trên Windows luôn kèm Git for Windows):

```powershell
git clone https://github.com/hieunc-apero/ui-loop-shared "$HOME\.claude\skills\ui-loop"
& "$env:ProgramFiles\Git\bin\bash.exe" "$HOME/.claude/skills/ui-loop/setup/install.sh"
```

Lần đầu, `install.sh` tạo `~/.ui-loop` từ mẫu: hồ sơ gu **trống**. ui-loop vẫn chạy đủ vòng
(luật dự án + checklist của critic), và mỗi lần bạn góp ý nó ghi vào `~/.ui-loop/taste.md` —
gu của bạn dần thành hình. Muốn có ngay từ đầu: chạy `tools/taste-mining/` trên lịch sử chat của
bạn (xem README trong đó).

**Giữ dữ liệu của bạn qua nhiều máy:** tạo một repo **private** của riêng bạn trên GitHub, rồi

```sh
cd ~/.ui-loop && git remote add origin <url> && git push -u origin HEAD
```

Máy sau cài bằng `sh setup/install.sh --data <url>`.

## Người đã có dữ liệu (máy thứ hai của cùng một người)

```sh
git clone https://github.com/hieunc-apero/ui-loop-shared ~/.claude/skills/ui-loop
sh ~/.claude/skills/ui-loop/setup/install.sh --data https://github.com/<bạn>/<repo dữ liệu>
```

## Nhiều tài khoản trên cùng một máy

Mỗi tài khoản là một thư mục cấu hình (ví dụ `~/.claude-trung`, dùng qua `CLAUDE_CONFIG_DIR`).
Chỉ clone **một lần**, rồi truyền mọi thư mục cho `install.sh`:

```sh
sh ~/.claude/skills/ui-loop/setup/install.sh ~/.claude ~/.claude-trung
```

Không truyền gì thì nó cài vào `$CLAUDE_CONFIG_DIR` (nếu đang đặt, không thì `~/.claude`) **và**
mọi tài khoản đã cài trước đó trên máy này — nên sau khi sửa agent chỉ cần `sh setup/install.sh`.
`~/.ui-loop` nằm ở thư mục nhà, nên mọi tài khoản trên máy dùng chung một bộ dữ liệu — đúng khi
các tài khoản đều là của bạn.

## install.sh làm gì

0. **Dữ liệu** — `~/.ui-loop` đã có thì để nguyên. Chưa có: clone từ `--data`, hoặc chép mẫu
   `data-template/` và `git init`.
1. **Skill** — `<tài khoản>/skills/ui-loop` trỏ về repo vừa clone (symlink; trên Windows không có
   quyền symlink thì dùng junction). Nếu đã là repo này thì bỏ qua. Nếu chỗ đó là một thư mục
   khác thì dừng, không đè.
2. **Agent** — `ui-critic`, `ui-builder` vào `<tài khoản>/agents/`. Được thì symlink (sửa một
   chỗ, mọi tài khoản nhận). Windows không cho symlink file thì chép, và cài git hook để
   **mỗi lần `git pull` tự chép lại** — bản chép không bao giờ cũ.
3. **CLAUDE.md** — thêm khối luật giữa hai dấu `<!-- ui-loop:start … -->` / `<!-- ui-loop:end -->`.
   Lần sau chạy lại thì thay đúng khối đó, phần còn lại của file giữ nguyên. Nếu file có bản
   chép tay cũ (trước khi có dấu) thì thay bằng bản có dấu.
4. **Skill dựng** — đối chiếu `skills.txt`, in ra cái nào thiếu và lệnh cài.

Skill và agent: phiên đang chạy tự nhận sau vài giây. `CLAUDE.md`: từ phiên mới.

## Công cụ ui-loop dùng khi có (không bắt buộc để cài)

| Để làm | Cần |
|---|---|
| Critic xem trang web đang chạy | một MCP trình duyệt: Claude in Chrome, hoặc Claude Browser (app desktop) |
| Vẽ / chấm trên Figma, kiểm luồng | Figma MCP (đăng nhập Figma) |
| Build theo skill khác (`frontend-design`, `figma-use`, `building-landing-pages`…) | xem `skills.txt` — `install.sh` in ra cái nào thiếu và lệnh cài; thiếu thì ui-loop vẫn chạy, ít hướng dẫn dựng hơn |

Không có trình duyệt thì critic chấm từ ảnh chụp bạn đưa (thư mục ảnh).

## Sửa bộ máy khi không phải người duy trì

Retro của bạn vẫn sửa được bộ máy (SKILL.md, agents, references) khi một lần chạy lộ ra lỗ hổng
chung — nhưng gửi thành pull request từ nhánh `proposal/<tên>-<ngày>` (tự fork nếu bạn không có
quyền đẩy), không đẩy thẳng `master`. Người duy trì (`maintainers.txt`) xem và gộp. Gu, dự án, USELOG của bạn thì luôn vào `~/.ui-loop`, không
bao giờ vào repo này.
