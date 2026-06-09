---
phase: 3
title: "Vẽ nón ma sát 2D ch1-5-3"
status: completed
priority: P2
effort: "2.5h"
dependencies: [2]
---

# Phase 3: Vẽ nón ma sát 2D — ch1-5-3

## Overview
MEDIUM-3: khái niệm "nón ma sát góc φ" ở 2D hiện chỉ là 1 tia + con số φ. User chốt thêm hình nón vào 2D (giữ Sim2 default). **Nón vẽ ĐÚNG vật lý** (red-team C1): nón cố định quanh pháp tuyến, nửa-góc φ; vector ra/vào nón là **PHẢN LỰC** (thẳng đứng = −trọng lực), KHÔNG phải pháp tuyến (pháp tuyến là TRỤC nón → luôn ở giữa, không bao giờ ra).

## Requirements
- Functional: tại khối, vẽ nón ma sát = vùng ±φ quanh PHÁP TUYẾN mặt nghiêng (2 cạnh + cung/fill). Vẽ **vector phản lực R thẳng đứng (BẮT BUỘC, không optional — red-team C1/M)**: R lệch pháp tuyến góc β → nằm TRONG nón khi β≤φ (cân bằng), CHẠM cạnh khi β≈φ, RA NGOÀI khi β>φ (trượt). Đổi màu trạng thái. φ cập nhật theo μ.
- Non-functional: KHÔNG đụng physics `slipCondition`; KHÔNG đổi readout row (probe ch1-5-3 rowIndex 1=φ; red-team H4); arc/fill inline `el('path')` (H6); màu `Sim2Palette`; Sim3 attach giữ nguyên.

## Architecture
Root cause verified (`ch1-5-3.js:27,57-63`): `frictionCone` là 1 `line` từ `mid` tới góc `β+φ` đo từ trục x ngang — chỉ 1 tia, không phải nón, và tham chiếu sai (đáng lẽ quanh pháp tuyến). φ đúng (`dynamics.js:22` φ=atan μ, đo từ pháp tuyến).

Fix (THAY tia cũ, không bổ sung song song — tránh 2 nón mâu thuẫn; red-team C1/assumption):
1. Pháp tuyến mặt nghiêng tại khối: mặt nghiêng góc β → pháp tuyến hướng `(−sinβ, cosβ)` (vuông góc mặt, hướng ra khỏi mặt).
2. 2 cạnh nón = pháp tuyến xoay ±φ. Cung nối 2 cạnh + fill mờ (`rgba` whitelist) = miền nón.
3. **Vector phản lực R thẳng đứng** (hướng `(0, +1)`, = chống trọng lực): góc giữa R và pháp tuyến = β. Vẽ R từ khối. Khi β≤φ R trong nón; β>φ R ngoài → đổi màu (Pal.v cân bằng / Pal.force trượt, khớp lblState hiện có).
4. Cập nhật cạnh + cung + R trong `render2` theo β, μ→φ.

## Related Code Files
- Modify: `js/sim2/sims/ch1/ch1-5-3.js` (thay frictionCone 1-tia → 2 cạnh + cung + vector R)
- Read (verify): `js/sim2/physics/dynamics.js` (slipCondition, φ đo từ pháp tuyến)
- Modify: `tests/sim2-ch1-mount.spec.js` (cạnh nón + R + góc đổi theo μ)
- Read (đừng vỡ): `tools/sim-probe/probe-targets.js` (ch1-5-3 rowIndex 1=φ — KHÔNG đổi)

## Implementation Steps
1. **(TDD trước)** Test: mount ch1-5-3, assert tồn tại 2 cạnh nón (`sim2-friction-cone-edge`) + vector R (`sim2-reaction-line`); đổi μ (0.45→0.9) → góc mở nón (khoảng 2 cạnh / readout φ) TĂNG; tại β>φ R nằm NGOÀI nón (góc R-pháp tuyến > nửa góc nón). Fail trên code 1-tia.
2. Verify φ đo từ pháp tuyến trong physics.
3. Sửa `render2`: pháp tuyến + 2 cạnh ±φ + cung + vector R thẳng đứng, đổi màu theo slips.
4. Mount ch1 (sau P2, cùng spec — nối tiếp). Capture soi `ch1-5-3__live.png` ở vài μ + so Sim3 `ch1-5-3-sim3.png` cùng kể 1 câu chuyện.

## Success Criteria
- [ ] Test cạnh-nón + R + góc-theo-μ + R-ra-ngoài-khi-trượt fail trước, pass sau.
- [ ] Nón mở theo μ; R thẳng đứng ra/vào nón đúng β vs φ; capture xác nhận.
- [ ] readout φ row giữ index; `test:sim:ch1-mount` + coverage hex xanh; Sim3 attach không vỡ.

## Risk Assessment
- **Chỉ-điểm sai vector → nón vô nghĩa** (C1): vector ra/vào BẮT BUỘC là R thẳng đứng, không phải pháp tuyến. Test assert R-ngoài-nón khi trượt.
- Hình học pháp tuyến sai dấu → nón lệch phía. Mitigation: test hướng + soi nhiều μ.
- Fill nón che khối/nhãn. Mitigation: opacity thấp, vẽ dưới khối (z-order), test no-overlap.
- **blockedBy P2**: cùng sửa `sim2-ch1-mount.spec.js` → chạy sau P2 (red-team H3).
- KHÔNG đổi default sang Sim3 (user chốt).
