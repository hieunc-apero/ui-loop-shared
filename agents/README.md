# agents/ — các "Claude con" chạy riêng

| File | Vai | Khi nào được gọi |
|---|---|---|
| `ui-critic.md` | người chấm độc lập: chỉ nhìn kết quả (trình duyệt, Figma, ảnh chụp), không đọc code; đo đạc; trả `PASS`/`FAIL` | mỗi vòng của ui-loop; hoặc khi bạn bảo "chấm trang X" |
| `ui-builder.md` | vẽ **một** hướng thiết kế | chỉ ở chế độ nhiều phương án, vài cái chạy song song |

**Đây là bản gốc.** Claude Code chỉ nạp agent từ `~/.claude/agents/`, nên sau khi sửa file ở
đây phải chạy `sh setup/install.sh` để nối/chép sang (mọi tài khoản đã cài). Phiên đang chạy tự nhận bản mới sau ít giây.

Phần đầu mỗi file (giữa hai dòng `---`) là cấu hình: tên, mô tả, công cụ được dùng. Phần dưới
là hướng dẫn agent làm theo.
