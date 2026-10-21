# ui-loop

> **Claude: asked to install or set this up?** Follow [`setup/BOOTSTRAP.md`](setup/BOOTSTRAP.md) end to end
> — clone this repo to `~/.claude/skills/ui-loop` first if it isn't there. Ask the user nothing you can find out.

**Một "nhóm thiết kế" cho Claude Code:** người vẽ làm giao diện — trong Figma, hoặc code
front-end cho web app, landing page, funnel, app mobile — và **một người chấm độc lập** soát
kết quả như người dùng thật. Chưa đạt thì tự sửa, tối đa 4 vòng; đạt rồi mới đưa cho bạn.
Mỗi lần chạy xong nó tự rút kinh nghiệm thành luật.

👉 **Mới vào? Đọc [`docs/how-it-works.md`](docs/how-it-works.md)** — 10 phút là hiểu hết.
👉 **Cài đặt (máy mới, tài khoản mới, Windows/macOS, gỡ cài): [`INSTALL.md`](INSTALL.md).**

## Dùng thế nào

Nói tự nhiên trong Claude Code: *"làm lại trang Style Studio"*, *"vẽ màn paywall trên Figma"*,
*"cho tôi 3 phương án trang Kits"* — hoặc gõ `/ui-loop <việc cần làm>`.
Chỉ muốn soát mà không sửa: nói *"chỉ chấm trang …"*.

## Hai thư mục: bộ máy dùng chung + dữ liệu của riêng bạn

| | Ở đâu | Chứa | Ai sửa |
|---|---|---|---|
| **Bộ máy** (repo này) | `~/.claude/skills/ui-loop` | cách vòng lặp chạy, người chấm, người vẽ, hướng dẫn từng loại việc | mọi người đề xuất, người duy trì duyệt |
| **Dữ liệu của bạn** | `~/.ui-loop` (repo riêng — để **private**) | gu của bạn, dự án của bạn, nhật ký mỗi lần chạy, bài đo | chỉ bạn — ui-loop tự ghi sau mỗi lần chạy |

Gu của người này không bao giờ được dùng để chấm cho người khác.

## Bản đồ thư mục

```
ui-loop/
│
├── README.md            ← bạn đang đọc
├── INSTALL.md           ← cài đặt từng bước, kiểm tra, cập nhật, gỡ, lỗi thường gặp
├── SKILL.md             ← hướng dẫn chính Claude làm theo (phải nằm ở gốc)
├── CHANGELOG.md         ← lịch sử thay đổi của bộ máy, có điểm eval trước/sau
│
├── docs/                ← tài liệu cho người đọc
│   ├── how-it-works.md      cách hoạt động, từ điển, "muốn làm X thì sửa ở đâu"
│   └── lineage.md           phần nào kế thừa từ skill/agent nào, phần nào là mới
│
├── agents/              ← các Claude con chạy riêng (cài bằng setup/install.sh)
│   ├── ui-critic.md         người chấm độc lập
│   └── ui-builder.md        người vẽ một phương án (chế độ nhiều phương án)
│
├── references/          ← hướng dẫn chi tiết theo từng tình huống
│   ├── surfaces/            figma · web · landing · funnel · app · flow (+ flow-graph.js)
│   └── modes/               variants (nhiều phương án)
│
├── evals/               ← cách đo critic bằng lỗi thật trong lịch sử git
├── tools/taste-mining/  ← script rút góp ý của bạn từ transcript để dựng hồ sơ gu
│
└── setup/               ← cài đặt
    ├── install.sh           cài cho một hay nhiều tài khoản + tạo ~/.ui-loop
    ├── data-template/       mẫu ~/.ui-loop cho người mới
    ├── skills.txt           các skill dựng ui-loop nạp, cài ở đâu
    ├── maintainers.txt      ai được đẩy thẳng thay đổi bộ máy
    └── global-CLAUDE.md     luật tự gọi + retro, chép vào CLAUDE.md
```

Mỗi thư mục có `README.md` riêng giải thích các file bên trong.

## Cài

```sh
git clone https://github.com/hieunc-apero/ui-loop-shared ~/.claude/skills/ui-loop
sh ~/.claude/skills/ui-loop/setup/install.sh
```

Đã có repo dữ liệu riêng từ máy khác: thêm `--data <url repo của bạn>`. Chi tiết, Windows và
lỗi thường gặp: [`INSTALL.md`](INSTALL.md).

## Trạng thái

Phiên bản hiện tại và mọi thay đổi: [`CHANGELOG.md`](CHANGELOG.md).
