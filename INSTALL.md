# Cài đặt ui-loop

Làm theo từ trên xuống, khoảng 5 phút. Mọi lệnh đều chạy lại được nhiều lần mà không hỏng gì.

- [1. Cần có trước](#1-cần-có-trước)
- [2. Bạn thuộc trường hợp nào](#2-bạn-thuộc-trường-hợp-nào)
- [3. Cài](#3-cài)
- [4. Kiểm tra đã cài đúng](#4-kiểm-tra-đã-cài-đúng)
- [5. Cài thêm công cụ (nên có)](#5-cài-thêm-công-cụ-nên-có)
- [6. Mang dữ liệu của bạn sang máy khác](#6-mang-dữ-liệu-của-bạn-sang-máy-khác)
- [7. Cập nhật](#7-cập-nhật)
- [8. Gỡ cài đặt](#8-gỡ-cài-đặt)
- [9. Lỗi thường gặp](#9-lỗi-thường-gặp)

---

## 1. Cần có trước

| Cần | Kiểm tra bằng | Ghi chú |
|---|---|---|
| Claude Code | `claude --version` | bản CLI, app desktop hay extension IDE đều được |
| git | `git --version` | Windows: Claude Code đã kèm Git for Windows |
| tên + email cho git | `git config --global user.email` | trống thì đặt: `git config --global user.name "Tên"` và `git config --global user.email "ban@example.com"` |
| *(không bắt buộc)* GitHub CLI | `gh auth status` | để giữ dữ liệu qua nhiều máy và gửi đề xuất sửa bộ máy |

## 2. Bạn thuộc trường hợp nào

| Trường hợp | Làm |
|---|---|
| **A.** Lần đầu dùng ui-loop | [3a](#3a-lần-đầu-dùng-ui-loop) |
| **B.** Đã dùng ở máy khác, giờ cài máy mới | [3b](#3b-máy-mới-đã-có-dữ-liệu-từ-máy-khác) |
| **C.** Đã cài trên máy này, thêm một tài khoản Claude khác | [3c](#3c-thêm-tài-khoản-claude-trên-cùng-máy) |

Có hai thứ được cài:

- **Bộ máy** (repo này) vào `~/.claude/skills/ui-loop`, giống nhau cho mọi người.
- **Dữ liệu của bạn** vào `~/.ui-loop`: gu, dự án, nhật ký. Chỉ của bạn, nên để private.

`~` là thư mục nhà: `C:\Users\<tên>` trên Windows, `/Users/<tên>` trên macOS.

## 3. Cài

### 3a. Lần đầu dùng ui-loop

Chọn đúng **một** ô theo cửa sổ dòng lệnh bạn đang mở.

**macOS / Linux / Git Bash:**

```sh
git clone https://github.com/hieunc-apero/ui-loop-shared ~/.claude/skills/ui-loop
sh ~/.claude/skills/ui-loop/setup/install.sh
```

**Windows — PowerShell** (dấu nhắc bắt đầu bằng `PS`):

```powershell
git clone https://github.com/hieunc-apero/ui-loop-shared "$HOME\.claude\skills\ui-loop"
& "$env:ProgramFiles\Git\bin\bash.exe" "$HOME/.claude/skills/ui-loop/setup/install.sh"
```

**Windows — Command Prompt / cmd** (dấu nhắc kiểu `C:\Users\...>`):

```bat
git clone https://github.com/hieunc-apero/ui-loop-shared "%USERPROFILE%\.claude\skills\ui-loop"
"%ProgramFiles%\Git\bin\bash.exe" "%USERPROFILE%/.claude/skills/ui-loop/setup/install.sh"
```

Lần đầu bạn chưa có hồ sơ gu: `~/.ui-loop/taste.md` được tạo trống. ui-loop vẫn chạy đủ vòng
(luật của dự án cộng checklist của người chấm). Mỗi lần bạn góp ý, nó ghi thêm vào đó, nên gu
của bạn dần thành hình. Muốn có ngay từ lịch sử chat cũ thì xem `tools/taste-mining/README.md`.

### 3b. Máy mới, đã có dữ liệu từ máy khác

Giống 3a, nhưng thêm `--data` và URL repo dữ liệu private của bạn (xem
[mục 6](#6-mang-dữ-liệu-của-bạn-sang-máy-khác)):

```sh
git clone https://github.com/hieunc-apero/ui-loop-shared ~/.claude/skills/ui-loop
sh ~/.claude/skills/ui-loop/setup/install.sh --data https://github.com/<bạn>/<repo-dữ-liệu>
```

Trên PowerShell hoặc cmd: dùng dòng `bash.exe` như ở 3a, thêm `--data <url>` vào cuối.

### 3c. Thêm tài khoản Claude trên cùng máy

Mỗi tài khoản Claude là một thư mục cấu hình: `~/.claude` là mặc định; các tài khoản khác
thường là `~/.claude-<tên>`, dùng qua biến `CLAUDE_CONFIG_DIR`. **Không clone lần nữa.** Chỉ
chạy lại trình cài và liệt kê các tài khoản:

```sh
sh ~/.claude/skills/ui-loop/setup/install.sh ~/.claude ~/.claude-<tên>
```

Các tài khoản trên cùng máy dùng chung bộ máy và chung `~/.ui-loop`. Như vậy là đúng khi mọi
tài khoản đều là của bạn. **Người khác dùng chung máy** thì nên dùng tài khoản hệ điều hành
riêng, để có thư mục nhà riêng và `~/.ui-loop` riêng.

## 4. Kiểm tra đã cài đúng

**Kết quả của trình cài**, mỗi tài khoản phải có đủ các dòng sau:

```
data    …                         ← đã tạo, hoặc đã có ~/.ui-loop
== /…/.claude
skill   linked … | already this repo
agent   ui-builder: linked | copied
agent   ui-critic:  linked | copied
CLAUDE  block added | refreshed
skills  …: all build skills present | missing — … (xem mục 5)
```

Dòng nào bắt đầu bằng `!` là có lỗi, tra ở [mục 9](#9-lỗi-thường-gặp).

**Trong Claude Code**, mở một **phiên mới** (CLAUDE.md chỉ được đọc lúc khởi động):

1. Gõ `/agents`: phải thấy `ui-critic` và `ui-builder`.
2. Gõ `/ui-loop`: lệnh này phải hiện trong danh sách gợi ý.
3. Nói thử *"chỉ chấm trang http://localhost:3000"* (hoặc một trang bất kỳ đang chạy): Claude
   phải tự gọi ui-loop và người chấm, rồi trả `PASS`/`FAIL` kèm số đo.

## 5. Cài thêm công cụ (nên có)

ui-loop vẫn chạy khi thiếu những thứ này, chỉ yếu hơn ở phần tương ứng.

| Để | Cài | Thiếu thì |
|---|---|---|
| Người chấm tự mở và đo trang web | một MCP trình duyệt: **Claude in Chrome** (extension), hoặc trình duyệt có sẵn trong app desktop | chấm từ ảnh chụp bạn đưa |
| Vẽ / chấm trên Figma, kiểm luồng | **Figma MCP**: `/plugin install figma@claude-plugins-official`, rồi đăng nhập Figma | không làm được việc Figma |
| Hướng dẫn dựng theo từng loại việc | các skill trong dòng `skills … missing` của trình cài, mỗi skill kèm lệnh cài. Danh sách đầy đủ ở `setup/skills.txt` | dựng không có hướng dẫn riêng |

Lệnh bắt đầu bằng `/plugin` thì gõ **trong Claude Code**. Lệnh `npx skills add …` thì chạy
trong cửa sổ dòng lệnh. Cài xong chạy lại trình cài để kiểm tra lại.

## 6. Mang dữ liệu của bạn sang máy khác

`~/.ui-loop` là một git repo trên máy. Muốn dùng nó ở máy khác, đẩy nó lên một repo
**private** của bạn. **Đừng để public**, vì `taste.md` trích nguyên văn lời góp ý của bạn.

Có GitHub CLI:

```sh
cd ~/.ui-loop
gh repo create ui-loop-data --private --source . --push
```

Không có GitHub CLI: tạo một repo private trống trên github.com, rồi:

```sh
cd ~/.ui-loop
git remote add origin https://github.com/<bạn>/ui-loop-data
git push -u origin HEAD
```

Từ đó, sau mỗi lần chạy ui-loop tự commit và đẩy dữ liệu lên. Máy mới cài theo
[3b](#3b-máy-mới-đã-có-dữ-liệu-từ-máy-khác).

### Giữ cả bộ máy trong repo dữ liệu (tuỳ chọn)

Muốn repo private của bạn chứa **đủ mọi thứ** — cả bộ máy, không chỉ dữ liệu:

```sh
sh ~/.claude/skills/ui-loop/setup/install.sh --mirror
```

Từ đó mỗi lần bộ máy có commit mới hay được `git pull`, nó tự chép sang `~/.ui-loop/engine/`,
commit (ghi rõ commit gốc) và đẩy repo dữ liệu. `engine/` chỉ để giữ — sửa bộ máy ở
`~/.claude/skills/ui-loop`.

## 7. Cập nhật

```sh
git -C ~/.claude/skills/ui-loop pull
```

Agent được cập nhật theo (bằng link, hoặc bằng git hook nếu là bản chép). Muốn chắc chắn thì
chạy lại `sh ~/.claude/skills/ui-loop/setup/install.sh`: nó cài lại cho mọi tài khoản đã cài
trên máy. Phiên đang mở tự nhận bản mới sau vài giây; riêng phần CLAUDE.md thì từ phiên mới.

## 8. Gỡ cài đặt

```sh
sh ~/.claude/skills/ui-loop/setup/install.sh --uninstall                    # tài khoản hiện tại
sh ~/.claude/skills/ui-loop/setup/install.sh --uninstall ~/.claude-<tên>    # tài khoản khác
```

Trình gỡ bỏ link skill, hai agent (chỉ khi chúng đúng là của ui-loop) và khối ui-loop trong
CLAUDE.md. Phần còn lại của CLAUDE.md giữ nguyên. Nó **không xoá** bản clone
(`~/.claude/skills/ui-loop`) và dữ liệu của bạn (`~/.ui-loop`); muốn bỏ hẳn thì tự xoá hai thư
mục đó.

## 9. Lỗi thường gặp

| Thấy | Nghĩa là | Làm |
|---|---|---|
| `The filename, directory name, or volume label syntax is incorrect.` | đang ở **cmd** mà dán lệnh của PowerShell | dùng ô **cmd** ở 3a, hoặc gõ `powershell` rồi dùng ô PowerShell |
| `bash.exe` … not recognized / không tìm thấy | Git for Windows cài ở chỗ khác | mở **Git Bash** từ menu Start, chạy lệnh của ô macOS / Linux / Git Bash |
| `skill ! could not symlink` | máy không cho tạo link thư mục | xoá thư mục cũ, clone thẳng vào đúng chỗ đó như lệnh trình cài in ra |
| `skill ! … is another folder, not this repo` | đã có một ui-loop khác ở đó (bản cũ, bản chép tay) | đổi tên hoặc chuyển thư mục đó đi rồi chạy lại |
| `agent …: copied (no symlink permission)` | bình thường trên Windows | không cần làm gì: mỗi lần `git pull`, git hook tự chép lại |
| `data ! first commit failed` | git chưa có tên/email | đặt như ở [mục 1](#1-cần-có-trước), rồi `cd ~/.ui-loop && git add -A && git commit -m init` |
| `$'\r': command not found` khi chạy trình cài | file bị đổi kiểu xuống dòng | xoá bản clone, clone lại (repo đã ép LF cho `.sh`) |
| ui-loop không tự chạy khi nói về giao diện | CLAUDE.md chỉ đọc lúc mở phiên | mở phiên mới; kiểm tra `~/.claude/CLAUDE.md` có dòng `ui-loop:start` |
| Người chấm trả `NOT REVIEWED` | phiên không có công cụ trình duyệt | cài MCP trình duyệt (mục 5), hoặc để ui-loop tự chụp ảnh và chấm từ ảnh |
| Retro báo không đẩy được dữ liệu | `~/.ui-loop` chưa có repo trên GitHub | không sao, dữ liệu vẫn lưu trên máy; làm mục 6 khi cần dùng máy khác |
