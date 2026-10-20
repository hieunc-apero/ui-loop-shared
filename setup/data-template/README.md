# ~/.ui-loop — dữ liệu ui-loop của riêng một người

Bộ máy ui-loop (skill + agent) là bản dùng chung, nằm ở `~/.claude/skills/ui-loop`. Thư mục này
giữ những gì **chỉ thuộc về bạn** — ui-loop đọc và ghi vào đây sau mỗi lần chạy:

| File | Là gì |
|---|---|
| `taste.md` | gu của bạn (bản lõi, ngắn): mỗi trục một nguyên tắc + cách đo — critic chấm theo đó ở mọi dự án. Bắt đầu trống, tự đầy dần từ góp ý của bạn |
| `taste-archive.md` | nguyên văn mọi lời góp ý đứng sau `taste.md`, có ngày — chỉ mở khi đụng đúng chủ đề; không bao giờ bị xoá |
| `projects.md` | mỗi dự án để luật ở đâu (repo, Figma fileKey) — cần cho dự án chỉ có Figma |
| `CHANGELOG.md` | mỗi thay đổi bộ máy sinh ra từ các lần chạy của bạn, có ngữ cảnh thật (dự án, lời bạn nói) |
| `USELOG.md` | nhật ký mỗi lần chạy: critic bắt được gì, bạn còn chê gì sau bàn giao |
| `engine/` | *(nếu bật `install.sh --mirror`)* bản chép tự động của cả bộ máy, mỗi phiên bản một commit — đừng sửa ở đây |
| `evals/` | bài đo critic bằng lỗi thật của bạn (cách đo: `~/.claude/skills/ui-loop/evals/README.md`) |

Đây là một git repo riêng. Muốn dùng trên máy khác: tạo một repo **private** trên GitHub,
`git remote add origin <url>` rồi `git push -u origin HEAD`; máy kia cài bằng
`sh setup/install.sh --data <url>`. Đừng để repo này public: `taste.md` trích nguyên văn lời bạn.
