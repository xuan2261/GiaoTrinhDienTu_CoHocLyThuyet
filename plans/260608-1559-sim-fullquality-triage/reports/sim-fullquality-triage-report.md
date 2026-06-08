# Triage report — Đánh giá visual + chất lượng thực tế 35 mô phỏng

**Date:** 2026-06-08 · **Scope:** CHỈ đánh giá → triage. KHÔNG sửa sim. Probe dev-only, KHÔNG vào `test:sim:release`.
**Nguồn:** probe A+B (`visuals/interaction-probe.json`, generatedAt 17:39 — bản final sau fresh-remount fix), visual review (`visuals/visual-review-notes.md`), physics `test:sim:physics`, route-map P0.

---

## 1. Tóm tắt

**35/35 route phủ đủ 3 trục.** Nền tảng rất vững:
- **Physics:** `test:sim:physics` 9/9 PASS.
- **Tương tác A (liveness):** 81/83 control SỐNG. Chỉ **2 dead** — đều là `ch3-6-2/slider:e` (Sim2 + Sim3).
- **Tương tác B (dấu đơn điệu):** 23/23 item match physics, **0 sai dấu**. 14 route skip B (hình học/động, flag minh bạch).
- **Sim3:** 10/10 true-3D (WebGL khởi tạo headless ok), 0 fallback, 0 mount error.
- `test:sim:release` xanh; repo sạch (chỉ thêm probe dev-only, không động file sim). Probe harness qua code-review: clean, 68 assertion unit pass.

**High findings (2) — đều VISUAL, KHÔNG có lỗi physics/binding:**

| # | Route | Trục | Vấn đề | Bằng chứng |
|---|---|---|---|---|
| H1 | ch2-4-4 (Sim2) | visual | Nhãn `a_cor` chồng `v_rel` trên cụm vector nhỏ đỉnh đĩa — che mũi tên nào là gì (Sim3 dùng pill-badge đã fix) | `ch2-4-4__mid.png` |
| H2 | ch3-5-2 (Sim2) | visual | Lệch màu legend↔đồ thị: legend p(t)=lục nhưng đường gắn nhãn "p(t)" vẽ CAM; đường lục đang lên không nhãn | `ch3-5-2__live.png` |

**Medium finding (1) — tương tác:**

| # | Route | Vấn đề | Diễn giải |
|---|---|---|---|
| M1 | ch3-6-2 slider `e` (Sim2+Sim3) | Kéo slider hệ số phục hồi `e` → readout không đổi tức thì (delta=0) | **Deferred-effect theo thiết kế:** `onInput` là `v => { params.e = v; }`, không reset/redraw — `e` chỉ tác động ở lần va chạm kế. Binding TỒN TẠI. User quyết: re-render khi đổi `e`, hay chấp nhận hoãn (scene-delta). |

**Đánh giá tổng:** không route nào lỗi physics hay nối nhầm biến. 2 vấn đề visual thật đáng sửa. Trục tương tác gần như sạch — 81/83 control sống, 2 "dead" là cùng 1 e-slider deferred-effect (không phải binding hỏng).

---

## 2. Bảng triage 35 route × 3 trục

Cột: **V** visual · **P** physics/nhãn-trên-ảnh · **A** liveness (live/tổng) · **B** dấu đơn điệu (match/tổng). Sev: 🔴 high · 🟡 medium · ⚪ low/ok.

| Route | Eng | V | P | A | B | Sev | Ghi chú |
|---|---|---|---|---|---|---|---|
| ch1-1-3 | sim2 | ⚪ | ✓ | 3/3 | 1/1 | ⚪ | sạch; dead-space phải nhẹ |
| ch1-1-4 | sim2 | ⚪ | ✓ | 2/2 | 1/1 | ⚪ | M=F·d coherent |
| ch1-1-5 | sim2 | ⚪ | ✓ | 1/1 | skip(scene) | ⚪ | bespoke-drag, A-only |
| ch1-1-5#sim3 | sim3 | ⚪ | ✓ | 1/1 | skip(scene) | ⚪ | true-3D |
| ch1-1-6 | sim2 | ⚪ | ✓ | 2/2 | 1/1 | ⚪ | sliver 1px header (cosmetic) |
| ch1-1-8 | sim2 | ⚪ | ✓ | 2/2 | 2/2 | ⚪ | FBD dầm sạch |
| ch1-2-3 | sim2 | ⚪ | ✓ | 1/1 | skip(a-only) | ⚪ | hình bình hành, A-only |
| ch1-3-2 | sim2 | ⚪ | ✓ | 2/2 | 1/1 | ⚪ | drag + slider đều sống |
| ch1-3-6 | sim2 | ⚪ | ✓ | 3/3 | 1/1 | ⚪ | dot-M lam vs vẽ tím (low) |
| ch1-5-3 | sim2 | ⚪ | ✓ | 3/3 | 1/1 | ⚪ | nón ma sát |
| ch1-5-3#sim3 | sim3 | ⚪ | ✓ | 3/3 | 1/1 | ⚪ | true-3D, cone depth tốt |
| ch1-6-3 | sim2 | ⚪ | ✓ | 1/1 | skip(a-only) | ⚪ | trọng tâm, A-only; badge §1.3 (Q1) |
| ch2-1-1 | sim2 | ⚪ | ✓ | 3/3 | skip(scene) | ⚪ | α đổi hướng v (scene-delta live) |
| ch2-1-3 | sim2 | ⚪ | ✓ | 1/1 | skip(a-only) | ⚪ | bán kính cong, A-only |
| ch2-1-3#sim3 | sim3 | ⚪ | ✓ | 1/1 | skip(a-only) | ⚪ | true-3D |
| ch2-2-2 | sim2 | ⚪ | ✓ | 3/3 | skip(scene) | ⚪ | quay quanh trục |
| ch2-2-2#sim3 | sim3 | ⚪ | ✓ | 3/3 | skip(scene) | ⚪ | true-3D |
| ch2-3-2 | sim2 | ⚪ | ✓ | 3/3 | 1/1 | ⚪ | truyền động bánh răng |
| ch2-3-2#sim3 | sim3 | ⚪ | ✓ | 3/3 | 1/1 | ⚪ | true-3D, depth răng tốt |
| ch2-4-4 | sim2 | 🔴 | ✓ | 3/3 | skip(scene) | 🔴 | **H1** nhãn chồng a_cor/v_rel |
| ch2-4-4#sim3 | sim3 | ⚪ | ✓ | 3/3 | skip(scene) | ⚪ | pill-badge fix overlap |
| ch2-5-2 | sim2 | ⚪ | ✓ | 1/1 | skip(a-only) | ⚪ | IC, A-only |
| ch2-5-3 | sim2 | ⚪ | ✓ | 2/2 | 1/1 | ⚪ | trường vận tốc |
| ch2-5-3#sim3 | sim3 | ⚪ | ✓ | 2/2 | 1/1 | ⚪ | true-3D |
| ch3-2-2 | sim2 | ⚪ | ✓ | 3/3 | 1/1 | ⚪ | F=ma + đồ thị |
| ch3-2-3 | sim2 | ⚪ | ✓ | 2/2 | 1/1 | ⚪ | lực & phản lực |
| ch3-1-3 | sim2 | ⚪ | ✓ | 2/2 | 2/2 | ⚪ | RK4 ODE |
| ch3-1-3#sim3 | sim3 | ⚪ | ✓ | 2/2 | 1/1 | ⚪ | true-3D |
| ch3-3-1 | sim2 | ⚪ | ✓ | 3/3 | 1/1 | ⚪ | mô men động lượng |
| ch3-5-2 | sim2 | 🔴 | ✓ | 3/3 | 1/1 | 🔴 | **H2** lệch màu p(t) |
| ch3-5-3 | sim2 | ⚪ | ✓ | 3/3 | 1/1 | ⚪ | bảo toàn L |
| ch3-5-3#sim3 | sim3 | ⚪ | ✓ | 3/3 | 1/1 | ⚪ | true-3D |
| ch3-5-4 | sim2 | ⚪ | ✓ | 2/2 | 1/1 | ⚪ | định lý động năng |
| ch3-6-2 | sim2 | ⚪ | ✓ | 3/4 dead:e | skip(scene) | 🟡 | **M1** e-slider deferred-effect |
| ch3-6-2#sim3 | sim3 | ⚪ | ✓ | 3/4 dead:e | skip(scene) | 🟡 | **M1** như trên |

Cross-check: 35 dòng (25 Sim2 + 10 Sim3). ✓

---

## 3. Chi tiết findings

### H1 — ch2-4-4 (Sim2) nhãn chồng [VISUAL, sửa được]
`a_cor` chồng `v_rel`, cụm vector nhỏ đỉnh đĩa. Người đọc không phân biệt mũi tên. **Hướng (không sửa round này):** dời nhãn ra pill-badge như Sim3 ch2-4-4 đã làm tốt — backport pattern.

### H2 — ch3-5-2 (Sim2) lệch màu legend↔đồ thị [VISUAL, sửa được]
Legend khai p(t)=lục; đường gắn nhãn "p(t)" vẽ CAM; đường lục đang lên không nhãn. Phá tin cậy ánh xạ màu. **Hướng:** kiểm code legend vs màu vẽ đường p(t), đồng bộ 1 màu.

### M1 — ch3-6-2 slider `e` deferred-effect [TƯƠNG TÁC, user quyết]
Cả Sim2 + Sim3: kéo `e` (hệ số phục hồi) → không readout nào đổi tức thì. Truy nguyên: `onInput` chỉ gán `params.e = v` không redraw → `e` tác động ở va chạm kế (scene-delta). Binding KHÔNG hỏng; chỉ là hiệu ứng hoãn. Khớp Q4 research. **Hướng:** hoặc re-render khi đổi `e` (để học sinh thấy phản hồi tức thì), hoặc giữ deferral & ghi chú UI. User chốt.

### Ghi chú phương pháp (đã giải quyết, KHÔNG còn là finding)
Bản probe trung gian từng báo 21 control "dead". Nguyên nhân: kéo slider làm dịch drag-handle, đo handle sau slider trên cùng mount → Δ=0 giả. Đã fix bằng **fresh remount mỗi control** (repro: fresh mount handle 60→20; nhiễm 20→20). Bản final 17:39 còn đúng 2 dead (e-slider M1). Không còn artifact đo trong số liệu.

---

## 4. Route bSkipped (14) + lý do — user chốt B cho 35

B đo được trên **21 route (23 item, đều match 100%)**. 14 route skip B (phân loại P0, route-map flag, KHÔNG drop âm thầm):

| Route(s) | bMode | Lý do |
|---|---|---|
| ch1-1-5, ch1-1-5#sim3 | scene-delta | hợp lực hình học, không scalar đơn điệu |
| ch1-2-3, ch1-6-3 | a-only | hình bình hành / trọng tâm — liveness-only |
| ch2-1-1, ch2-2-2, ch2-2-2#sim3 | scene-delta | playback-driven, readout đổi theo thời gian |
| ch2-1-3, ch2-1-3#sim3 | a-only | bán kính cong — liveness-only |
| ch2-4-4, ch2-4-4#sim3 | scene-delta | Coriolis playback |
| ch2-5-2 | a-only | tâm vận tốc tức thời — liveness-only |
| ch3-6-2, ch3-6-2#sim3 | scene-delta | va chạm, readout hậu-va-chạm |

Không route nào `sim3-no-readout` (cả 10 Sim3 expose field số). B chỉ skip do bản chất hình học/động.

---

## 5. Unresolved questions

1. **M1 (ch3-6-2 `e`):** re-render tức thì khi đổi `e`, hay giữ deferral? (UX trade-off — user quyết.)
2. **H2 (ch3-5-2):** lệch màu p(t) là bug sim hay legend chủ ý ngược? Cần kiểm code legend (ngoài scope read-only).
3. **ch1-6-3:** badge thẻ đọc §1.3 vs route id — metadata content-owner, không phải visual.
4. **Docs drift:** README ghi Sim3 6 route, thực 10 wired — docs-manager sync sau (ngoài scope triage).
