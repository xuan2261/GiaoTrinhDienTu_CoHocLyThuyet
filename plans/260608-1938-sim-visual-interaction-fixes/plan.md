# Plan — Sửa visual + tương tác 3 route (ch3-5-2, ch2-4-4, ch3-6-2)

**Status:** ✅ complete (2026-06-08)
**Mode:** `--deep --tdd`
**Nguồn:** triage [../260608-1559-sim-fullquality-triage/reports/sim-fullquality-triage-report.md](../260608-1559-sim-fullquality-triage/reports/sim-fullquality-triage-report.md)
**blockedBy:** [] · **blocks:** []

## Mục tiêu

Sửa 3 finding từ triage round trước: 2 high visual + 1 medium tương tác. CHỈ sửa 3 file sim mục tiêu; KHÔNG đổi physics (đã verify 9/9); giữ `test:sim:release` xanh.

## Phát hiện chốt (từ scout code thật)

- **H2 ch3-5-2 KHÔNG phải lỗi gán màu** (sửa lại mô tả triage): `pLine` p(t) + nhãn "p(t)" đều `Pal.v` lục (nhất quán). Đường CAM là `impulseSpan` (`Pal.resultant`) — guide riêng, KHÔNG có nhãn. Bug thật = **vị trí nhãn**: "p(t)" đặt baseline `(9,-2)` trùng chỗ đường cam; đường lục dâng lên (~-0.5) không nhãn gần. Fix = dời nhãn p(t) bám đỉnh đường lục + thêm nhãn cho đường cam (xung lượng).
- **H1 ch2-4-4**: `lblVr`/`lblAc` offset 0.9 / 1.15 dọc hướng vuông góc → chồng khi vector ngắn (`ch2-4-4.js:59-60`). Fix = tăng tách nhãn + đẩy nhãn `a_cor` ra xa hơn theo dấu hướng.
- **M1 ch3-6-2**: `onInput: v => { params.e = v; }` không redraw (`ch3-6-2.js:138`) → e chỉ hiện ở va chạm kế. Fix = preview T-mất hậu-va-chạm tính từ `D.resolveCollision2D` (physics đã verify) ngay khi đổi e. Biến 2 cờ "dead" của probe → live.

## Phases

| Phase | Tên | TDD | Status | Blocked by |
|---|---|---|---|---|
| P1 | [Fix ch3-5-2 nhãn đồ thị p(t)](phase-01-fix-ch3-5-2-graph-label.md) | ✅ | ✅ done | — |
| P2 | [Fix ch2-4-4 nhãn Coriolis chồng](phase-02-fix-ch2-4-4-coriolis-overlap.md) | ✅ | ✅ done | — |
| P3 | [Thêm ch3-6-2 e-slider live feedback](phase-03-ch3-6-2-e-slider-feedback.md) | ✅ | ✅ done | — |
| P4 | [Verify probe + capture + release](phase-04-verify-probe-capture-release.md) | — | ✅ done | P1, P2, P3 |

## Kết quả (2026-06-08)

3 fix xong, verify xanh: **physics 9/9 không đổi**, `test:sim:mount` 104 pass, `test:sim:release` xanh, `test:sim:probe` **tổng dead 2→0** (ch3-6-2 e-slider chuyển live), B 23/23 match. Capture xác nhận mắt: ch3-5-2 nhãn p(t) ở đường lục + J=F·t ở đường cam; ch2-4-4 a_cor/v_rel tách rõ; ch3-6-2 "ΔT dự đoán" cập nhật khi kéo e. Regression mount (substring "T mất" va label test) đã fix bằng đổi tên row "ΔT dự đoán". Chỉ sửa 3 file sim, không đụng physics.

P1–P3 độc lập (3 file khác nhau), chạy song song được. P4 gom verify cuối.

## Rủi ro chính

- **Sửa nhãn làm hỏng test mount/coverage**: `test:sim:mount` assert nhãn DOM không chồng + canvas khớp SVG. Mỗi phase chạy lại mount sau sửa.
- **M1 thêm readout đổi schema readout**: probe B đọc theo rowIndex — P3 thêm row "T mất (dự đoán)" có thể dịch index. P4 chạy `test:sim:probe` xác nhận không vỡ probe B.
- **Cám dỗ refactor rộng**: chỉ sửa đúng 3 finding, KHÔNG đụng physics/transform/palette.

## Success

3 finding fixed; `test:sim:physics` 9/9 giữ nguyên; `test:sim:mount` + `test:sim:release` xanh; `test:sim:probe` xác nhận ch3-6-2 e-slider chuyển live (2 dead → 0); capture lại 3 route cho thấy nhãn rõ, không chồng.
