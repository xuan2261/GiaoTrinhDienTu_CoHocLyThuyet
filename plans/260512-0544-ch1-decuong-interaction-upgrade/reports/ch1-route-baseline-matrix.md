# Ch1 Route Baseline Matrix

Date: 2026-05-12

## Summary

- Active Ch1 routes: 25/25 via `js/sims/ch1/statics-routes.js`.
- Active runtime: `SimProfessionalLab` + route scene/renderer/behavior registries.
- Legacy indexed `js/routes/ch1/*`: deleted in current worktree, not active.
- Pilot `js/routes/pilot-ch1-parallelogram.js`: kept reference-only, no longer self-registers `window.SIM_MAP`.
- Representative visual evidence saved under `reports/screenshots/`: `ch1-2-3.png`, `ch1-3-1.png`, `ch1-5-3.png`, `ch1-7-2.png`.

## Active Route Matrix

| Route | Scene | Renderer | Behavior | Handle | Controls | Readouts |
|---|---|---|---|---|---|---|
| ch1-1-3 | force-vector | force-vector-anatomy | force-vector-anatomy | F | \|F\| phân tích, Góc lực | \|F\|, Fx/Fy |
| ch1-1-4 | moment-arm | moment-arm | moment-arm | P | \|F\| mô men, Tay đòn | MO, d |
| ch1-1-5 | force-system-reducer | force-system-reducer | force-system-reducer | R | \|R\| quy đổi, Tải quy đổi | \|R\|, MO |
| ch1-1-6 | couple-free-vector | couple-free-vector | couple-free-vector | a | \|F\| ngẫu lực, Khoảng cách a | M ngẫu lực, a |
| ch1-1-8 | constraint-release | constraint-release | constraint-release | P | \|F\| chủ động, Khóa bậc tự do | Phản lực, Bậc tự do |
| ch1-2-1 | two-force-body | two-force-body | two-force-body | F2 | \|F\| cặp lực, Độ thẳng hàng | Cân bằng, Đường tác dụng |
| ch1-2-3 | parallelogram-law | parallelogram-law | parallelogram-law | F2 | \|F1\|, Góc F2 | \|R\|, Đường chéo |
| ch1-2-6 | fbd-builder | fbd-builder | fbd-builder | F | \|F\| sơ đồ, Chọn phản lực | Phương trình, MO |
| ch1-3-1 | smooth-support-normal | smooth-support-normal | smooth-normal | N | \|N\|, Góc tiếp tuyến | N, alpha |
| ch1-3-2 | cable-tension | cable-tension | cable-tension | T | \|T\|, Hướng dây | Lực căng, Dây |
| ch1-3-3 | support-component-selector | hinge-reaction-components | hinge-components | P | \|R\| bản lề, Chọn loại | Rx/Ry, Loại liên kết |
| ch1-3-4 | roller-pin-builder | roller-pin-builder | roller-pin | N | \|R\| liên kết, Góc gối di động | Phản lực R, Chế độ |
| ch1-3-6 | fixed-support | fixed-support | fixed-support | P | \|R\| ngàm, Mô men ngàm | MA, Rx/Ry |
| ch1-3-7 | two-force-member | two-force-member | two-force-member | N | \|N\| dọc trục, Trục thanh | N dọc trục, Đường trục |
| ch1-4-1 | spatial-resultant | spatial-resultant | spatial-resultant | R | \|R\| 3D, Tỉ lệ Fz | Rxyz, Hình chiếu |
| ch1-4-2 | spatial-moment | spatial-moment-projection | spatial-moment | M | \|F\| theo trục, Góc trục | M_axis, MO |
| ch1-4-4 | spatial-equilibrium-board | spatial-equilibrium-board | spatial-equilibrium | P | \|R\| cân bằng, Tải phương trình | ΣF, ΣM |
| ch1-5-1 | contact-force-decomposition | contact-force-decomposition | contact-force | R | \|R\| tiếp xúc, Hệ số ma sát | N/Fms, mu |
| ch1-5-2 | friction-mode-tabs | friction-mode-tabs | friction-mode | Fms | \|Fms\|, Chế độ ma sát | Fms, Chế độ |
| ch1-5-3 | friction-cone-incline | friction-cone-incline | friction-cone | α | \|F\| mặt nghiêng, Ngưỡng bám mu | alpha, Trạng thái trượt |
| ch1-5-4 | self-locking-wedge | self-locking-wedge | self-locking | α | \|F\| nêm, Biên phi | phi, alpha |
| ch1-6-2 | centroid-composite | centroid-composite | centroid-composite | G | Con trỏ diện tích, Tỉ lệ diện tích | xC/yC, Diện tích |
| ch1-6-3 | centroid-hole-shift | centroid-hole-shift | centroid-hole | G | Con trỏ lỗ khoét, Kích thước lỗ | Dịch xC, Lỗ khoét |
| ch1-7-1 | guided-equilibrium-solver | guided-equilibrium-solver | guided-solver | P | \|F\| từng bước, Bước | Bước, Sai lệch |
| ch1-7-2 | statics-numeric-checker | statics-numeric-checker | numeric-checker | P | \|R\| số liệu, Bước | RA/RB, Sai số |

## Legacy/Pilot Reconcile

| Item | Current State | Decision |
|---|---|---|
| `js/routes/ch1/*` indexed files | Deleted in worktree | Keep deleted; active runtime is `js/sims/ch1/*`. |
| `js/deprecated/pilot-ch1-parallelogram.js` | Deleted in worktree | Keep deleted; stale Matter.js/SVG V2 path. |
| `js/routes/pilot-ch1-parallelogram.js` | Untracked/reference file | Keep reference-only; removed `window.SIM_MAP` self-registration. |
| `ch1-2-3` active route | Registry renderer + behavior | Active implementation for parallelogram UX. |

## Gap Status

- Generic Ch1 handle label `điểm`: resolved.
- `legacy-primary` Ch1 handle: not present.
- Route-filter smoke gates comparing against global 58 routes: resolved in QA tools.
- Representative browser drag/readout: passing for `ch1-2-3`, `ch1-3-1`, `ch1-5-3`.

## Unresolved Questions

Không có.
