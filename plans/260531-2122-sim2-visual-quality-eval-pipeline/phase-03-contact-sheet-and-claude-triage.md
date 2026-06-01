# Phase 03 — Contact-sheet generator + Claude soi lỗi thô

## Context links
- Plan: [plan.md](plan.md) · blockedBy: Phase 02 (cần `capture-manifest.json` + PNG).
- Lib: `tools/sim2-visual/contact-sheet.js` (Phase 01).

## Overview
- Priority: P1 · Status: completed
- Sinh contact-sheet HTML từ ảnh đã chụp, rồi Claude (đa phương thức) đọc trực tiếp từng PNG để gắn cờ lỗi thô.

## Key Insights
- Contact-sheet = lưới thumbnail nhóm theo chương; mỗi route 1 hàng (các frame cạnh nhau) + badge §mục + chỗ chèn cờ Claude.
- Claude soi lỗi THÔ bằng Read tool trên PNG: canvas trắng/đen toàn phần · vector sai hướng/độ dài lộ rõ · nhãn tràn khung/đè · màu lệch legend · sim động không nhúc nhích giữa t0→end. KÈM nghi vấn physics-visual (Claude biết outline).
- Cờ Claude là GỢI Ý giảm tải, KHÔNG phải kết luận — user là trọng tài cuối (brutal honesty từ brainstorm §4.1).

## Requirements
- `tools/sim2-visual/build-contact-sheet.js` (Node): đọc `visuals/capture-manifest.json` → gọi `renderContactSheet` → ghi `visuals/contact-sheet.html` (img src trỏ PNG cùng thư mục, mở được offline).
- Claude triage: đọc tuần tự PNG, ghi `visuals/claude-triage.json` = `[{route,label,severity:'high'|'low'|'ok',note}]`; merge cờ vào contact-sheet (re-render với flags).

## Architecture
```
capture-manifest.json + PNG/*
   ↓ build-contact-sheet.js
contact-sheet.html (mở browser xem lưới)
   ↓ Claude đọc PNG (Read tool) → claude-triage.json
   ↓ re-render merge flags
contact-sheet.html (kèm cờ nghi vấn) → cho user duyệt (Phase 04)
```

## Related code files
- Create: `tools/sim2-visual/build-contact-sheet.js`, `visuals/claude-triage.json` (sinh khi chạy).
- Reuse: `renderContactSheet` (Phase 01).

## Implementation Steps
1. Implement `build-contact-sheet.js`: load json → render → ghi html. Verify mở được, đủ N route, ảnh hiện.
2. Claude đọc lần lượt PNG theo nhóm chương (batch để tiết kiệm token: ưu tiên sim động + sim nghi ngờ trước). Ghi triage json.
3. Re-render contact-sheet với flags (high=đỏ, low=vàng, ok=xám).
4. Per-sim frame override: nếu sim động bị wrap sớm (ảnh end == t0), Claude điền `overrides[route]={N1,N2}` → báo Phase 02 chụp lại riêng route đó (vòng nhỏ, không chạy lại cả bộ).

## Todo
- [x] build-contact-sheet.js → html mở được
- [x] Claude soi PNG → claude-triage.json
- [x] Re-render merge flags
- [x] Override mốc frame cho sim wrap sớm (không cần — 0 route wrap-around)

## Success Criteria
- contact-sheet.html hiển thị đủ N route × frame, có cờ Claude phân mức.
- claude-triage.json bao phủ mọi route (kể cả 'ok').

## Risk Assessment
- Token: đọc 43+ PNG tốn. Mitigation: batch theo chương, sim tĩnh giống nhau soi nhanh, tập trung sim đng.
- Claude bỏ sót lỗi tinh vi → đó CHÍNH là lý do user duyệt mắt ở Phase 04.

## Security Considerations
- Escape route/section khi nhúng HTML (Phase 01 đã lo). Ảnh local, không upload.

## Next steps
- Phase 04: user duyệt → báo cáo lỗi cuối.
