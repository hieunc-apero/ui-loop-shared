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

**Làm một phương án (mặc định): không có agent nào vẽ** — chính phiên chat của bạn vẽ/code, và
chỉ gọi `ui-critic` để chấm (làn vừa, lớn; làn nhỏ không gọi agent nào). `ui-builder` chỉ xuất
hiện khi cần nhiều hướng chạy song song.

| Làn / chế độ | Ai vẽ | Ai chấm |
|---|---|---|
| Nhỏ | phiên chính | không agent — phiên chính tự chụp + đo |
| Vừa | phiên chính | `ui-critic`, 1 vòng `scoped` |
| Lớn | phiên chính | `ui-critic`, vòng 1 `full`, sau đó `verify` |
| Nhiều phương án | N × `ui-builder` song song | `ui-critic` `compare` → phương án thắng về phiên chính sửa tiếp |

### Người chấm `ui-critic` làm việc thế nào

Mỗi vòng chấm là **một Claude mới tinh**, không nhớ gì vòng trước ngoài danh sách lỗi được
dán vào. Nó **không bao giờ sửa** gì và **không đọc code** — chỉ nhìn cái hiện ra.

**Nhận vào** (phiên chính gửi, mẫu ở `references/loop/critic-round.md`):

| Mục | Ví dụ |
|---|---|
| Bề mặt + nền tảng + hình thức | `web-app`, `web`, `live` |
| Kiểu vòng | `full` (chấm hết) · `scoped` (chỉ vùng vừa đổi) · `verify` (vòng 2+: soát lại lỗi cũ) |
| Đích | URL đang chạy · fileKey + nodeId Figma · thư mục ảnh chụp (đường dẫn từng file) |
| Ý đồ | trang để làm gì, vừa đổi gì, trạng thái nào cần xem |
| Luật | đường dẫn `DESIGN.md`, `design-rules.md`, gu `~/.ui-loop/taste.md` |
| Số đã đo sẵn | độ tương phản, kích thước… để nó không phải đoán từ pixel |
| Ngoài phạm vi | lỗi có sẵn từ trước, không phải của lần đổi này — không được chặn |
| Lỗi vòng trước | (vòng 2+) dán nguyên văn |

**Các bước:**

1. **Đọc luật** + gu, **lọc theo nhãn**: chấm frame iOS thì bỏ luật `[web]`, `[live]`…
2. **Tìm trình duyệt** trong công cụ của nó (khung trình duyệt của app, hoặc Claude in Chrome),
   mở **tab riêng**. Không có trình duyệt → chấm từ ảnh chụp; không có cả hai → trả
   `NOT REVIEWED` chứ không đoán.
3. **Chứng minh trang đã tải**: ảnh hỏng, lỗi console.
4. **Nhìn** ở các độ rộng (mặc định 390 / 820 / 1440) × sáng/tối × các trạng thái — `scoped`/`verify`
   thì chỉ những chỗ trong phạm vi.
5. **Nhìn trước, đo sau**: ghi ấn tượng đầu (mắt dừng ở đâu, chỗ nào trông dở), rồi xác nhận hoặc
   bác từng ấn tượng bằng số đo. Ảnh luôn **phóng to** mới chấm; thanh dính (sticky) luôn thử
   **đè lên nội dung**.
6. **Checklist chung** — chặn: ảnh hỏng, tràn ngang, chữ bị cắt/xuống dòng ở nút, lớp dính đè nhau,
   tương phản dưới chuẩn AA, nội dung giả (ô xám, lorem, `undefined`), mặt người bị cắt, thẻ cùng
   cấp lệch cỡ, nút < 44px trên điện thoại, sheet che kín màn mà không có nút đóng.
7. **Lượt gu**: đi từng trục trong `taste.md`, đo cái đo được (đếm điểm nhấn mỗi khối, padding
   chữ–mép, độ lệch icon–chữ…), gắn số trục vào từng nhận xét.
8. Bề mặt khác web (landing, funnel, figma, app, flow, so sánh phương án) → mở thêm đúng mục
   trong `references/critic/modes.md` (ví dụ funnel: đi từng bước, không bao giờ bấm thanh toán thật).
9. **Kiểm lỗi vòng trước** từng cái: đã sửa / chưa / sửa nhưng làm hỏng chỗ khác.

**Trả về** (≤ ~600 chữ, `verify` ~250):

```
VERDICT: PASS | FAIL | NOT REVIEWED
Blockers     — lỗi chặn: sai gì · ở đâu (độ rộng, theme, selector) · số đo · luật nào
Taste notes  — góp ý gu, kèm độ chắc chắn (cao/vừa/thấp) và một gợi ý cụ thể
Previous     — lỗi vòng trước: đã sửa / chưa / làm hỏng chỗ khác
Clean        — đã kiểm gì thấy đúng (kèm selector + giá trị đo, để không "tưởng là đúng")
Not checked  — không kiểm được gì, vì sao (không bao giờ bỏ trống mục này)
```

`[đo]` vượt ngưỡng = **chặn**; `[gu]` = **góp ý**. Còn một lỗi chặn là `FAIL`. Phiên chính đọc
kết quả, sửa hết lỗi chặn rồi gọi vòng tiếp — không dừng hỏi bạn giữa chừng (tối đa 4 vòng).

### Người vẽ phụ `ui-builder` làm việc thế nào

Chỉ dùng ở **chế độ nhiều phương án** (`references/modes/variants.md`). Phiên chính viết N hướng
thiết kế cố tình khác nhau, rồi gọi N `ui-builder` **chạy song song**, mỗi cái một hướng:

1. **Nhận vào**: brief chung + **brief hướng của mình** (tên, đặt cược vào gì, chịu bỏ gì) + luật +
   chỗ làm (code: một git worktree riêng; Figma: một page riêng). Nó không thấy hướng của người khác.
2. **Đọc luật + gu**, nạp skill dựng của bề mặt (ví dụ `impeccable`, `design-taste-frontend`, `figma-use`).
3. **Đi hết hướng của mình** — không lén kéo về "an toàn ở giữa". Hướng thất bại thì vẫn làm xong và
   nói rõ vì sao: một hướng hỏng rõ ràng có ích hơn một hướng nhạt.
4. **Tự kiểm** (không tự chấm): đi trục gu 1–6, chạy/type-check được, không lỗi console, đủ trạng
   thái, điện thoại không tràn. Code thì commit trên nhánh worktree của nó — không push, không merge.
5. **Báo cáo**: hướng gì · ở đâu (worktree + commit, hoặc page + nodeId) · cách mở từng trạng thái ·
   đã bỏ gì · chưa làm gì.

Sau đó **một** `ui-critic` chấm cả N cùng lúc ở chế độ `compare`: từng phương án có verdict riêng,
rồi **xếp hạng** theo mức phục vụ ý đồ (không theo ít lỗi nhất), kèm "đáng lấy" từ các phương án
thua. Chỉ phương án thắng được đưa qua vòng sửa bình thường; bạn nhận cả N để so.

## 3. Một lần chạy, từ đầu tới cuối

```
Bạn: "làm lại trang Style Studio"            (hoặc gõ /ui-loop …)
        │
        ▼
 Chọn làn ── nhỏ │ vừa │ lớn  (xem bảng dưới — quyết định tốn bao nhiêu)
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

### Ba làn — tốn công theo đúng cỡ việc

| Làn | Khi nào | Chạy gì | Tốn khoảng |
|---|---|---|---|
| **Nhỏ** | sửa 1 phần tử / vài thuộc tính, hướng đã rõ (màu, khoảng cách, cỡ, căn, chữ, icon) | tự chụp + đo đúng phần tử và xung quanh ở các độ rộng nó hiện; **không gọi critic**; USELOG 1 dòng | 1–2 phút |
| **Vừa** | một section, một component qua các trạng thái | **1 vòng critic thu hẹp** (`scoped`): chỉ vùng vừa đổi | vài phút |
| **Lớn** | trang mới, làm lại, funnel, Figma, luồng | đủ vòng: vòng 1 `full`, vòng sau `verify` (chỉ soát lỗi cũ + chỗ vừa sửa) | như trước, vòng sau rẻ hơn |

Nó nói làn khi bắt đầu. Muốn đổi: *"sửa nhanh"* → nhỏ, *"chấm kỹ"* → lớn. Tự kiểm ở làn nhỏ thấy
vấn đề lan ra ngoài phần tử thì tự lên làn vừa.

### Kiểm ngay lúc dựng — `ui-check`

Một script đo các luật **đo được** ngay trên trang trong vài chục mili-giây, không tốn token:
tràn ngang, chữ bị cắt, nút xuống dòng, nút bấm < 44px, tương phản (kể cả chữ trên gradient), lớp
dính trong suốt đè nội dung, padding chip, chữ mồ côi ở tiêu đề, thẻ cùng cấp lệch cỡ… (19 phép
đo, danh sách ở `tools/ui-check/README.md`). Người vẽ chạy nó **sau mỗi lần sửa**, sửa hết `block`
trước khi gọi critic; kết quả được dán cho critic để nó dành vòng chấm cho việc **nhìn** (gu, ảnh,
mặt người, cảm giác) thay vì đo lại. Khoảng 1/3 lỗi critic từng bắt là loại script đo được.
Luật `[đo]` mới mà đo được bằng script thì retro thêm thành một phép đo — script giỏi dần lên.

### Đọc khi cần, không đọc hết

Mỗi lần chạy chỉ đọc **file lõi** (ngắn, có trần dung lượng): `SKILL.md`, gu lõi `taste.md`,
file bề mặt. Mẹo theo chủ đề (`web-gotchas.md`), lời trích gu (`taste-archive.md`), cách chấm
riêng từng bề mặt (`references/critic/modes.md`) chỉ mở khi việc đụng đúng chủ đề.
Retro không được để file lõi phình mãi: quá trần thì **gộp** luật trùng, **dời** câu chuyện
sang file lưu trữ, hoặc **hạ** luật lâu không dùng xuống file lưu trữ — **không xoá**; luật có
dấu 🔒 (đã chặn lỗi thật, bạn tự đặt, về thanh toán/dữ liệu) không bao giờ bị hạ; lỗi quay lại
thì luật được nâng lên lõi. `sh tools/size-check.sh` in dung lượng từng file lõi so với trần.

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
| cách bạn nhìn (đúng ở mọi dự án) | lời trích → `~/.ui-loop/taste-archive.md`; nguyên tắc/ngưỡng đo → `~/.ui-loop/taste.md` (lõi) |
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
