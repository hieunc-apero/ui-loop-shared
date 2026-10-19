# evals/ — đo critic bằng lỗi thật

Thư mục này chỉ giữ **cách đo**. Đề bài và kết quả của mỗi người nằm trong thư mục dữ liệu của
người đó: `~/.ui-loop/evals/` (vì đề bài lấy từ dự án và lời góp ý của chính họ).

## Cách đo (git-history replay)

1. Tìm trong lịch sử git những commit sửa lỗi giao diện mà **người dùng tự bắt bằng mắt**
   (commit `fix(...)` đi sau một lời chê trong transcript).
2. Với mỗi lỗi, ghi đáp án vào `~/.ui-loop/evals/<ngày>-<tên>/cases.md` — lỗi là gì, đo được
   ra sao, mong critic bắt được hay không — rồi **commit đáp án trước khi critic chạy**, để
   không thể chỉnh cho khớp về sau.
3. Dựng lại code ở `<commit sửa>^` trong một git worktree riêng, chạy trang lên, **tự tái hiện
   lỗi trước** (lỗi không tái hiện được thì bỏ khỏi đề).
4. Gửi critic brief như một lượt thường, chế độ eval (critic không sửa gì).
5. Chấm từng lỗi: **B** bắt được · **T** trượt · **—** không áp dụng. Ghi
   `results-v<phiên bản>.md`; chạy lại sau khi sửa critic thì thêm file mới, không ghi đè.
6. Chép điểm trước/sau vào mục tương ứng trong `CHANGELOG.md` của skill.

Kết quả đã có của người duy trì (critic v0.3: lỗi đo được 80%, lỗi gu 33%; chạy lại 16/10:
2/5) được trích trong `CHANGELOG.md`.
