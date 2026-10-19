# references/ — hướng dẫn chi tiết, SKILL.md trỏ tới khi cần

```
references/
├── surfaces/          ← "đang làm trên cái gì": mỗi bề mặt một file
│   ├── figma.md       vẽ/sửa frame trong Figma; Figma → code
│   ├── web.md         web app bằng code; cách chụp khi critic không có trình duyệt (lõi)
│   ├── web-gotchas.md mẹo web theo chủ đề — chỉ mở đúng mục khi đụng chủ đề đó
│   ├── landing.md     landing page / trang marketing
│   ├── funnel.md      đi một luồng nhiều bước trên bản đang chạy (onboarding, paywall, checkout)
│   ├── flow.md        kiểm cả một luồng: Figma (màn + mũi tên), bản chạy thật, đối chiếu spec
│   ├── flow-graph.js  script CHỈ ĐỌC: rút sơ đồ luồng từ Figma + tính sẵn các phép kiểm
│   └── app.md         app iOS/Android; checklist nền tảng (44pt, vùng an toàn…)
├── loop/              ← chi tiết các bước của vòng lặp, mở khi tới bước đó
│   ├── critic-round.md  gửi critic thế nào; 3 kiểu vòng full / scoped / verify
│   └── retro.md         rút luật, nơi ghi, giới hạn dung lượng, gộp/hạ/nâng luật
├── critic/            ← phần critic chỉ đọc khi cần
│   └── modes.md         cách chấm riêng cho landing, funnel, figma, app, flow, so sánh
└── modes/             ← "làm theo kiểu nào"
    └── variants.md    nhiều phương án song song, critic xếp hạng
```

Mỗi file bề mặt có cùng khung: **Build** (dùng skill nào để vẽ) · **Capture for the critic**
(đưa kết quả cho critic thế nào) · cái gì riêng của bề mặt đó.
