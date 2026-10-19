# ui-loop hoạt động thế nào

Tài liệu này dành cho người mới: đọc xong biết bộ này là gì, chạy ra sao, file nào làm gì,
và muốn sửa thì sửa ở đâu. Hướng dẫn mà Claude thực sự làm theo nằm ở [`SKILL.md`](../SKILL.md)
và [`agents/`](../agents/) (tiếng Anh); file này giải thích chúng bằng lời thường.

---

## 1. Một câu

**ui-loop là một "nhóm thiết kế" gồm một người vẽ và một người chấm độc lập:** người vẽ làm
giao diện (trong Figma, hoặc code front-end), người chấm xem kết quả như người dùng thật, chặn
lỗi, người vẽ sửa — lặp tới khi đạt rồi mới đưa cho bạn. Mỗi lần chạy xong, nó tự rút kinh
nghiệm thành luật để lần sau ít sai hơn.

## 2. Ai là ai

| Vai | Là gì về kỹ thuật | File | Làm gì |
|---|---|---|---|
| **Người vẽ + điều phối** | một **skill** — bộ hướng dẫn mà phiên chat chính đọc và làm theo | [`SKILL.md`](../SKILL.md) | hiểu yêu cầu, vẽ/code, gọi người chấm, sửa, bàn giao, ghi log, rút luật |
| **Người chấm** | một **agent** — một Claude con chạy riêng, mỗi lần chấm khởi động mới | [`agents/ui-critic.md`](../agents/ui-critic.md) | chỉ nhìn kết quả (không đọc code), đo đạc, trả `PASS`/`FAIL` kèm số đo |
| **Người vẽ phụ** | một **agent**, chỉ dùng ở chế độ nhiều phương án | [`agents/ui-builder.md`](../agents/ui-builder.md) | vẽ **một** hướng thiết kế; nhiều cái chạy song song |

**Dữ liệu của riêng bạn** không nằm trong bộ máy mà ở `~/.ui-loop/` (một git repo riêng):
`taste.md` (gu), `projects.md` (dự án để luật ở đâu), `USELOG.md` (nhật ký), `evals/` (bài đo).
Bộ máy giống nhau cho cả team; gu thì mỗi người một bản, không bao giờ dùng lẫn.

Vì sao tách người chấm ra riêng: người vẽ nhìn ảnh chụp của chính mình sẽ thấy cái mình *định*
vẽ, không thấy cái thật sự hiện ra. Người chấm khởi động mới, không biết code, không nghe lý lẽ
của người vẽ — nên nhìn giống người dùng.

Vì sao người vẽ là skill chứ không phải agent: agent con không gọi được agent con khác, và không
nói chuyện được với bạn giữa chừng. Phiên chính thì làm được cả hai.

## 3. Một lần chạy, từ đầu tới cuối

```
Bạn: "làm lại trang Style Studio"            (hoặc gõ /ui-loop …)
        │
        ▼
 0. Chọn bề mặt ── figma │ web-app │ landing │ funnel │ app
    Chọn chế độ ── một thiết kế │ nhiều phương án
 1. Brief ── trang để làm gì, "xong" là gì, nền tảng + hình thức, các trạng thái cần xem
 2. Nạp luật ── hồ sơ gu của bạn + luật của dự án (lọc theo nhãn [web]/[app]/…)
 3. Vẽ / code
 4. Tự kiểm nhanh ── chạy được không, có lỗi console không, chụp 2 ảnh
        │
        ▼
 5. ui-critic chấm ──► FAIL? ──► 6. sửa ──► quay lại 4  (tối đa 4 vòng, không dừng hỏi giữa chừng)
        │ PASS
        ▼
 7. Bàn giao cho bạn ── ảnh chụp, đã đổi gì, critic đã bắt gì, còn gì chưa chắc
 8. Bạn góp ý? ── nếu chỉ "xấu" thì hỏi lại 1 câu: chìm / quá đà / ríu / lệch / không đồng bộ …?
 9. Ghi USELOG
10. Retro ── biến những gì vừa xảy ra thành luật mới (hoặc sửa luật cũ), commit + push
```

Chi tiết từng bước: [`SKILL.md`](../SKILL.md), mục `## 0` tới `## 10`.

## 4. Bề mặt (surface) — đang làm trên cái gì

| Bề mặt | Khi nào | Hướng dẫn riêng |
|---|---|---|
| `figma` | vẽ/sửa frame trong Figma | [`references/surfaces/figma.md`](../references/surfaces/figma.md) |
| `web-app` | giao diện sản phẩm bằng code (Next, React…) | [`references/surfaces/web.md`](../references/surfaces/web.md) |
| `landing` | trang marketing, landing page | [`references/surfaces/landing.md`](../references/surfaces/landing.md) |
| `funnel` | onboarding, paywall, checkout — nhiều bước nối nhau | [`references/surfaces/funnel.md`](../references/surfaces/funnel.md) |
| `app` | màn app iOS/Android (Figma hoặc code native) | [`references/surfaces/app.md`](../references/surfaces/app.md) |
| `flow` | cả một luồng: màn + mũi tên trong Figma, luồng chạy thật, đối chiếu spec | [`references/surfaces/flow.md`](../references/surfaces/flow.md) |

Mỗi file nói: dùng skill nào để vẽ, chụp/đưa kết quả cho critic thế nào, và cái gì riêng của
bề mặt đó.

**Kiểm luồng (`flow`)** trong Figma: một script chỉ đọc (`flow-graph.js`) rút ra mọi màn và mọi
mũi tên (nối từ màn nào tới màn nào), tính sẵn: màn mồ côi, màn cụt, nhánh dừng ở ghi chú mà
chưa có màn, mũi tên lơ lửng, màn trùng tên, màn là bản sao thay vì instance, mũi tên đè lên màn.
Critic xem các kết quả đó cùng ảnh chụp, và nếu có spec thì lập bảng case nào có / thiếu / thừa.

Làm Figma xong muốn code luôn thì chạy vòng lặp hai lần (Figma → code), lần sau
critic so bản code với frame đã duyệt.

## 5. Chế độ — một thiết kế hay nhiều phương án

- **Một thiết kế** (mặc định): như mục 3.
- **Nhiều phương án** ([`references/modes/variants.md`](../references/modes/variants.md)): khi bạn
  muốn chọn, hoặc hướng còn để ngỏ. Viết 3 hướng *cố tình khác nhau* (bố cục, thứ bậc, hình
  ảnh…), 3 `ui-builder` vẽ song song (code: mỗi cái một worktree; Figma: mỗi cái một page),
  **một** critic xếp hạng cả 3, chỉ phương án thắng được sửa tới đạt, bạn nhận cả 3 để so.
  Tốn hơn nhiều — không dùng cho việc sửa lỗi.

## 6. Luật đến từ đâu — ba tầng

Critic chấm theo ba tầng, tầng dưới cụ thể hơn thì thắng tầng trên:

```
┌─ Checklist chung ──────── trong agents/ui-critic.md: ảnh hỏng, tràn ngang, chữ bị cắt,
│                            tương phản AA, nút < 44px, mặt bị cắt, đồ giả (ô xám, lorem)…
├─ Hồ sơ gu của bạn ─────── ~/.ui-loop/taste.md: các trục rút từ chính lời bạn góp ý
│                            (liều nhấn "nổi nhưng không too much", ríu, lệch, đồng bộ…);
│                            người mới bắt đầu trống, tự đầy dần
└─ Luật của dự án ───────── nằm trong repo dự án: DESIGN.md + .claude/design-rules.md
                             (dự án đầu tiên: 58 luật, mỗi luật có commit gốc)
                             Dự án chỉ có Figma? → tra ~/.ui-loop/projects.md
```

**Hai loại luật:** `[đo]` — đo được, critic **chặn**; `[gu]` — cần phán đoán, critic **góp ý**
kèm độ chắc chắn.

**Nhãn phạm vi** (không có nhãn = áp mọi nơi):

| Nền tảng | `[web]` chỉ web · `[desktop]` web ≥ 1024px · `[app]` chỉ app |
|---|---|
| **Hình thức** | `[live]` chỉ chấm được trên bản đang chạy (hover, cuộn, URL) · `[figma]` về chính file Figma |

Ví dụ: chấm frame iOS trong Figma thì critic tự bỏ các luật `[web]`, `[desktop]`, `[live]`.

## 7. Nó tự học thế nào

Ba đường, đều ghi ra file để lần sau critic đọc được:

1. **Bạn góp ý sau bàn giao** → thành luật (bước 8).
2. **Retro sau mỗi lần chạy** (bước 10, bắt buộc) → lỗi critic bắt lặp lại, lỗi critic báo sai,
   chỗ người vẽ vấp → luật mới hoặc sửa luật cũ. Luật chỉ được thêm khi có bằng chứng từ lần
   chạy đó; trùng thì sửa luật cũ cho sắc hơn thay vì thêm; luật gây chặn sai thì thu hẹp/xoá.
3. **Eval** → đo critic bằng số (mục 8).

Bài học đi đâu:

| Bài học về… | Ghi vào |
|---|---|
| dự án này (token, component, ngoại lệ có chủ ý) | `.claude/design-rules.md` trong repo dự án |
| cách bạn nhìn (đúng ở mọi dự án) | `~/.ui-loop/taste.md` (của riêng bạn) |
| cách vòng lặp nên chạy | `SKILL.md` / `references/` / `agents/` + một mục `CHANGELOG.md` |
| chuyện một lần | chỉ `~/.ui-loop/USELOG.md` |

## 8. Đo xem có tốt lên không — `evals/`

Lấy những lỗi bạn từng tự bắt bằng mắt trong lịch sử git, dựng lại code **trước khi sửa**, cho
critic chấm, đếm xem bắt được bao nhiêu. Đáp án được commit **trước** khi critic chạy, để không
chỉnh cho khớp sau. Cách đo ở [`evals/`](../evals/); đề và kết quả của mỗi người ở
`~/.ui-loop/evals/`. Lần đầu của người duy trì (critic v0.3): lỗi đo được **80%**, lỗi gu **33%**.

## 9. Lịch sử — chứng minh nó tiến hoá

| File | Trả lời câu hỏi |
|---|---|
| [`CHANGELOG.md`](../CHANGELOG.md) | bộ này đã đổi gì, vì sao, điểm eval trước/sau — mỗi phiên bản một mục |
| `~/.ui-loop/USELOG.md` | mỗi lần chạy thật của **bạn**: bắt được gì, sai gì, bạn còn chê gì sau bàn giao, luật nào được cập nhật |
| [`docs/lineage.md`](lineage.md) | phần nào kế thừa từ skill/agent nào (phiên bản mấy), phần nào là mới |
| `git log` | ngày giờ thật của từng thay đổi (bộ máy: `hieunc-apero/ui-loop-shared`; dữ liệu: repo riêng của bạn) |

## 10. Muốn làm X thì sửa ở đâu

| Muốn… | Làm |
|---|---|
| gọi nó | nói tự nhiên ("sửa cái header", "vẽ màn paywall trên Figma") hoặc gõ `/ui-loop …` |
| chỉ chấm, không sửa | nói rõ "chỉ chấm" / "đừng sửa" |
| nhiều phương án | "cho tôi 3 phương án …" |
| thêm luật cho một dự án | sửa `.claude/design-rules.md` trong repo dự án (có nhãn `[đo]`/`[gu]` + phạm vi) |
| thêm dự án chỉ có Figma | thêm một dòng vào `~/.ui-loop/projects.md` |
| thêm người dùng mới | người đó tự cài (`setup/README.md`) — họ có `~/.ui-loop` riêng, gu riêng |
| sửa bộ máy khi không phải người duy trì | retro tự đẩy lên nhánh `proposal/…` + PR; người duy trì gộp |
| đổi cách critic chấm | sửa `agents/ui-critic.md`, chạy `sh setup/install.sh`, ghi `CHANGELOG.md` |
| cài sang máy khác | xem [`setup/README.md`](../setup/README.md) |
| tắt tự gọi | xoá khối "UI work → ui-loop" trong `~/.claude/CLAUDE.md` |

## 11. Từ điển nhanh

| Từ | Nghĩa |
|---|---|
| **skill** | bộ hướng dẫn Claude đọc khi làm một loại việc; ở đây là `SKILL.md` |
| **agent / subagent** | một Claude con chạy riêng với hướng dẫn riêng; ở đây là `ui-critic`, `ui-builder` |
| **vòng (round)** | một lượt: vẽ/sửa → critic chấm |
| **verdict** | kết luận của critic: `PASS`, `FAIL`, hoặc `NOT REVIEWED` (không chấm được) |
| **blocker** | lỗi chặn — phải sửa trước khi bàn giao |
| **taste note** | góp ý về gu, kèm độ chắc chắn — không tự chặn |
| **surface** | bề mặt đang làm: figma / web-app / landing / funnel / app / flow |
| **platform / medium** | nền tảng (web, ios, android) / hình thức (bản đang chạy hay frame Figma) |
| **retro** | bước tự rút kinh nghiệm sau mỗi lần chạy |
| **eval** | bài đo critic bằng lỗi thật trong lịch sử git |
