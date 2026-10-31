# Các phiên bản

Bản hiện tại: **v3.0** (file [`VERSION`](../VERSION)). Mỗi phiên bản lớn có một mục tiêu, một
khoảng thời gian, và một git tag ở cả repo bộ máy lẫn repo dữ liệu, nên mở lại được đúng bản cũ.

## Quy ước

- **Lên số lớn** (v3 → v4) khi đổi *cách loop chạy* với người dùng: thêm bước, thêm tầng luật,
  thêm file người dùng phải có, đổi skill dựng. Có mục tiêu đo được và hạn chót **trước khi** bắt đầu.
- **Giữa hai số lớn** chỉ ghi mục có ngày trong `CHANGELOG.md`, không đánh số nhỏ: luật mới từ
  một lượt chạy, bẫy mới, sửa chữ. Không dùng v3.1.2.
- **Đóng một phiên bản:** ghi kết quả so với mục tiêu ở bảng dưới, gắn `git tag -a vN.0` ở cả hai
  repo, rồi push tag.
- Nhãn `v0.1`…`v0.28` trong CHANGELOG là cách đánh số cũ. Chúng thuộc v1 và v2 như bảng dưới.

## Mở lại bản cũ

```sh
git -C ~/.claude/skills/ui-loop tag -l 'v*'                        # các bản có tag
git -C ~/.claude/skills/ui-loop worktree add ../ui-loop-v2 v2.0   # bản v2 ở thư mục riêng, bản đang dùng không đổi
git -C ~/.claude/skills/ui-loop diff v2.0 v3.0 --stat             # v3 đổi những gì
```

Muốn *chạy* bản cũ: trỏ thư mục skill sang worktree đó, rồi chạy lại `setup/install.sh` để
chép agent tương ứng. Muốn quay lại: chạy `install.sh` từ bản mới.

## Lịch sử

| Bản | Thời gian | Mục tiêu | Có gì | Kết quả |
|---|---|---|---|---|
| **v1.0** "Bản đầu người xem đã được chấm" | 14–19/10/2026 · nhãn cũ v0.1–v0.21 | Người không phải chỉ lỗi mà máy tự thấy được | Vòng dựng → critic → sửa (≤4 vòng); agent critic không đọc code; gu thành luật có ngưỡng đo; eval từ lịch sử git | Critic bắt lại lỗi cũ trong lịch sử git; tag chỉ ở repo dữ liệu của người duy trì (lúc đó chưa tách bộ máy) |
| **v2.0** "Bộ máy dùng chung" | 19–21/10/2026 · nhãn cũ v0.22–v0.28 | Người khác cài một câu là dùng được; mỗi lượt rẻ hơn | Tách bộ máy public + dữ liệu private từng người; cài bằng một câu; làn nhỏ/vừa/lớn; vòng chấm scoped/verify; giới hạn dung lượng; `ui-check` đo 19 luật trong 1 giây | Lỗi người còn phải chỉ sau bàn giao giảm từ 1,13 xuống 0,61 mỗi lượt; vòng chấm từ 2,8 xuống 2,4 (`evals/2026-10-26-effectiveness` trong repo dữ liệu) |
| **v3.0** "Chọn skill bằng đo, gu dùng chung" | 22–31/10/2026 | Người mới không có gu vẫn ra bản tốt; chọn skill dựng bằng eval chứ không theo cảm tính | Eval 4 skill dựng → impeccable + design-taste-frontend; gu nền ẩn danh cho mọi người; `ui-check` U20–U34 rút từ gu; tự dựng server cục bộ cho critic; luật "desktop từ app là bản riêng"; đo tỉ lệ tự động hoá (`tools/coverage`) | 81% danh mục việc lặp tự động (đếm theo bước, có trọng số tần suất) |

## Đang làm: v4.0 — hạn 14/11/2026

| Mục tiêu | Đo bằng | Hiện tại → đích |
|---|---|---|
| Hết "lệch": trục thẳng hàng không còn đứng yên | % câu chê thuộc trục thẳng hàng (taste-mining) | ~10% → < 5% |
| Lấp hai bước người còn làm trong funnel/landing | `tools/coverage` | 81% → ≥ 85% |
| Cập nhật ui-loop thì cập nhật luôn các skill dựng | `install.sh --update-skills` + báo skill cũ trong `check.sh` | chưa có → có |
| File gu cốt lõi về dưới giới hạn | `tools/size-check.sh` | vượt → đạt |
