# Brainstorm Summary — Đánh giá visual + chất lượng thực tế toàn bộ mô phỏng

**Date:** 2026-06-08 15:59
**Mode handoff:** `/ck:plan --deep --tdd`
**Output discipline:** CHỈ đánh giá → báo cáo triage. KHÔNG tự sửa sim.

---

## 1. Problem statement & requirements

User yêu cầu: "kiểm tra visual, chất lượng thực tế… tất cả các mô phỏng".

Chốt qua Discovery:
- **Expected output:** 1 báo cáo triage xếp theo severity + 2 contact-sheet ảnh thật (Sim2, Sim3) + 1 JSON delta tương tác. User tự quyết sửa gì sau đó.
- **Acceptance:** mỗi route (35) có hàng triage 1 dòng phủ 3 trục: visual render đúng, physics/nhãn đúng, tương tác sống. Có ảnh runtime thật kèm.
- **Scope IN:** cả Sim2 (25 SVG) + Sim3 (10 Three.js) = **35 route**. 3 trục: visual + physics/nhãn + tương tác.
- **Scope OUT:** sửa lỗi sim; refactor; thay đổi physics; rollout Sim3 thêm route.
- **Non-negotiable constraints:** dev-only, không vào `test:sim:release` gate; không thêm runtime dependency; không sửa fixture/sim để "đẹp ảnh"; offline (file:// + vendored libs).
- **Touchpoints:** `tools/sim2-visual/*` (tool sẵn), `tools/sim3-visual/*` (tool sẵn), `js/sim2/`, `js/sim3/`, `tools/sim-probe/` (MỚI), `plans/<ts>/reports|visuals`.

## 2. Codebase context (scout)

- 2 engine song song. Sim2 SVG-first = mặc định, 25 route (`js/sim2/sim2-route-manifest.js`). Sim3 3D pilot = 10 route wired live `index.html:336-345` (README nói 6 → **docs drift**, cần docs-manager sync sau).
- Pipeline visual-QA ĐÃ TỒN TẠI, chụp ảnh runtime thật (full card + app CSS), audit nhãn-chồng/safe-crop/route-metric: `npm run test:sim:visual:capture` (Sim2 25), `npm run test:sim3:visual:capture` (Sim3 10).
- Physics ĐÃ KHÓA mức công thức: `test:sim:physics` (9 node test, verified-sticky).
- 9 commit gần nhất toàn Sim3 polish; 3 route target-polish: `ch1-1-5`, `ch2-3-2`, `ch3-6-2`.
- Memory baseline "Sim2 25/25 sạch" là 2026-06-01 (7 ngày, predate Sim3 work) → KHÔNG tin làm current.

## 3. Evaluated approaches (trục tương tác — điểm rẽ chính)

| Approach | Mô tả | Pros | Cons | Verdict |
|---|---|---|---|---|
| Proxy mount-test + soi frame | Dựa `test:sim:mount` + soi ảnh nhiều step | Không code mới, nhanh | KHÔNG chứng minh kéo/slider ra số đúng | Loại (user muốn probe thật) |
| **Probe thật đo delta (A+B)** | Spec Playwright dev-only đo delta readout/công thức/scene khi kích control | Chứng minh binding sống + đúng chiều | Viết code mới, job lớn 35 route | **CHỌN** |
| Oracle lý thuyết đầy đủ (mức C) | Tính lại số đúng so khớp | — | TRÙNG `test:sim:physics` | Loại (lãng phí) |

**Probe 2 mức (đều áp cho cả 35 route — user chốt):**
- **A — Delta tổng quát:** kích từng control → assert readout/output/scene đổi ≠ 0. Bắt control chết, binding đứt, playback không chạy. Đồng nhất mọi route.
- **B — Semantic theo chiều:** assert dấu `d(readout)/d(control)` khớp kỳ vọng đơn điệu. Bắt binding nối NHẦM biến.
  - **Bán cơ học hóa:** dấu kỳ vọng rút từ chính công thức port `js/sim2/physics/` — KHÔNG đoán tay 35 lần. Plan cần 1 bước research enumerate quan hệ đơn điệu/route từ source physics đã verify.

## 4. Recommended solution

Pipeline 3 bước, output gom 1 plan folder:

```
plans/260608-1559-sim-fullquality-triage/
├── reports/triage-report.md          # findings xếp severity, 35 route × 3 trục
├── visuals/sim2-contact-sheet.html   # 25 ảnh (tool sẵn)
├── visuals/sim3-contact-sheet.html   # 10 ảnh (tool sẵn)
└── visuals/interaction-probe.json    # delta A+B / route (code MỚI)
```

1. **Visual (tool sẵn):** chạy 2 capture spec → 35 ảnh → soi multimodal: bố cục, dead-space, nhãn chồng, chiều sâu/màu/tương phản ≥3:1, crop an toàn.
2. **Physics/nhãn (tool sẵn):** `test:sim:physics` + đối chiếu công thức-tô-màu-khớp-vector / readout trên ảnh.
3. **Tương tác (code MỚI dev-only):** spec Playwright `tools/sim-probe/` + config riêng (KHÔNG vào release). Mỗi route mount qua `SIM_MAP` → enumerate control từ DOM thật (phân loại slider / bespoke-drag / playback) → đo delta A + assert dấu B → ghi JSON.

**TDD fit (`--tdd`):** trục 3 là code mới có hành vi kiểm chứng được → viết test-first hợp lý: red (probe chưa enumerate đúng control) → green (enumerate + đo delta) → mở rộng B theo dấu công thức. Trục 1–2 là chạy tool sẵn + soi mắt, không TDD.

## 5. Implementation considerations & risks

- **Control phân lớp:** 5 route bespoke-drag 0 slider (`ch1-1-5, ch1-2-3, ch1-6-3, ch2-1-3, ch2-5-2`); còn lại có slider; sim động có `▶/⏸/⏭/↺`. Probe đọc DOM thật, KHÔNG hardcode.
- **Sim động cần settle:** đo sau khi tua `⏭` deterministic (pattern tool sẵn dùng), tránh đo frame chưa ổn định.
- **WebGL trong Playwright CI:** Sim3 probe cần guard — nếu WebGL fail, route fallback 2D; probe phải phân biệt "fallback hợp lệ" với "lỗi mount".
- **B nối nhầm biến:** A đơn độc che không hết (đổi ≠ 0 vẫn có thể sai biến) → B bắt buộc cho đúng tinh thần user. Rủi ro: route có quan hệ KHÔNG đơn điệu toàn cục (vd cực trị) → research bước enumerate phải đánh dấu route nào chỉ đơn điệu cục bộ, chọn khoảng đo an toàn.
- **Không sửa sim/fixture để đẹp ảnh:** mọi tinh chỉnh chụp ở tầng spec (như Bug A/B/C đã xử lý trước: chụp full `#host`, addStyleTag app CSS, ép `data-theme=light`).
- **Docs drift:** README nói Sim3 6 route, thực 10 → ghi nhận, sync ở docs-manager SAU triage (ngoài scope round này).

## 6. Success metrics & validation

- 35/35 route có hàng triage 3 trục, mỗi finding gắn severity (high/low) + bằng chứng (ảnh / delta số / node-test).
- Contact-sheet mở được offline, ảnh có đủ panel + legend chấm-màu + control (verify trước khi tin triage — bài học baseline cũ).
- `interaction-probe.json`: mỗi route liệt kê control phát hiện + delta A + verdict B; route control chết / dấu sai → flag high.
- Probe spec KHÔNG nằm trong `test:sim:release`; chạy `test:sim:release` vẫn xanh (không hồi quy).

## 7. Next steps & dependencies

1. Bàn giao `/ck:plan --deep --tdd` với report này làm context.
2. Plan cần phase: (P0) research enumerate quan hệ đơn điệu/route từ `js/sim2/physics/`; (P1) scaffold `tools/sim-probe/` + config; (P2) probe A toàn 35; (P3) probe B toàn 35 dựa dấu công thức; (P4) chạy visual capture sẵn + soi; (P5) tổng hợp triage-report.
3. Dependency: Playwright + chromium đã cài (`npm install` + `npx playwright install chromium`); vendored Three.js `lib/three/three.umd.min.js`.

## 8. Unresolved questions

- **Q1:** Route có quan hệ phi-đơn-điệu toàn cục (cực trị) — B đo trên khoảng cục bộ nào? → planner quyết per-route ở P0, không cần user lúc này.
- **Q2:** Sim3 10 route có overlap id với Sim2 (cùng pageId, 3D là mode toggle). Probe tương tác Sim3 đo trên canvas (không có DOM readout như SVG?) — cần P0 xác nhận Sim3 expose readout/label gì để đo delta, hay chỉ đo `__SIM3_DEBUG__` metrics. **Đây là ẩn số kỹ thuật lớn nhất** cho trục 3 phần 3D.
- **Q3:** Docs sync README 6→10 route Sim3 — làm trong round này hay tách? (đề xuất tách, ngoài scope đánh giá).
