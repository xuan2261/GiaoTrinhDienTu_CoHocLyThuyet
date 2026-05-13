# Right Inspector Simulation Panel

**Date**: 2026-05-13 23:30
**Severity**: Medium
**Component**: `.sim-container.sim-lab`
**Status**: Resolved

## What Happened

Đã triển khai wide layout chỉ bằng CSS cho simulation lab: scene giữ bên trái, còn readouts, controls, formula, hint nằm ở cột phải. Mobile stack `<=768px` vẫn giữ nguyên, `760x440` canvas logical size không đổi, route renderer/behavior không bị đụng vào. Sau đó thêm Playwright coverage cho wide/mobile layout và kiểm tra rendered canvas aspect/containment.

## The Brutal Truth

Lúc đầu layout trông ổn trên desktop, nhưng vẫn để sót một lỗi clipping ở 1024px. Đây là kiểu lỗi rất dễ lọt qua nếu chỉ nhìn ở breakpoint lớn nhất. Phải sửa lại `.sim-lab .sim-canvas` bằng `width: 100%` và `height: auto` thì canvas mới chịu co đúng, không cắt mép nữa. Khó chịu thật, vì phần còn lại đã pass nhưng chỉ cần một rule CSS cũ là đủ phá layout.

## Technical Details

- Fixed Canvas2D readback warning bằng `willReadFrequently` trong runtime/test helper.
- Reviewer bắt lỗi canvas clipping tại 1024px.
- Sửa `.sim-lab .sim-canvas` để fit container, giữ aspect và containment.
- `npm run test:sim:unit` PASS.
- `npm run test:sim:quality` PASS.
- `npx playwright test tests/simulation-browser.spec.js --grep "right inspector"` PASS.
- `npm run test:sim:browser` PASS `178`.
- `npm run test:sim:visual-quality` PASS `4`.

## What We Tried

- CSS-only wide inspector layout.
- Giữ mobile stack riêng cho `<=768px`.
- Bổ sung browser tests để chặn regression ở breakpoint rộng/hẹp.
- Sửa canvas sizing sau khi reviewer phát hiện clipping.

## Root Cause Analysis

Root cause là CSS cũ của canvas vẫn còn giả định layout một cột, nên khi inspector được tách sang phải ở wide mode, canvas không còn tự fit theo container mới. Đây không phải lỗi route hay renderer; nó là lỗi layout contract giữa container và canvas.

## Lessons Learned

- Breakpoint desktop chưa đủ, phải test ở mức trung gian như `1024px`.
- Canvas sizing phải được khóa theo container, không để implicit width/height cũ kéo layout lệch.
- Khi thay layout shell, cần test containment ngay, không đợi reviewer bắt.

## Next Steps

Không còn việc mở. Giữ Playwright coverage này làm gate cho các thay đổi layout simulation sau.
