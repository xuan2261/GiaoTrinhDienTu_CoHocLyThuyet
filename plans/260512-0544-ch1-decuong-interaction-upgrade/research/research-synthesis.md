# Ch1 Research Synthesis

## Summary

Ch1 nên nâng theo hướng shared runtime hiện hành, không quay lại Matter.js/SVG standalone. Giá trị chính: thao tác kéo lực/moment/phản lực rõ như DeCuong, readout vật lý cập nhật ngay, visual construction dễ hiểu.

## Evaluated Approaches

| Approach | Pros | Cons | Decision |
|---|---|---|---|
| Full engine rewrite | Có thể đồng nhất từ đầu | Rủi ro lớn, phá 58-route QA, lệch runtime hiện tại | Reject |
| Route-by-route direct polish | Kiểm soát pedagogy từng route | Cần audit kỹ từng renderer/behavior | Select |
| Legacy/pilot revival riêng | Tận dụng pilot DeCuong | Dễ sinh song song 2 runtime | Use as reference only unless needed |

## Ch1 Design Direction

- Force routes: drag vector head/tail, show magnitude/angle/resultant.
- Moment routes: drag force point/line of action, show arm and moment sign.
- Support routes: drag load/support marker, show reaction components.
- Friction/centroid: drag body/contact/centroid input, show threshold/weighted result.
- Solver routes: keep simple, thao tác từng bước, no heavy assessment panels.

## Constraints

- Active route path is `js/sims/ch1/*` and `js/sim-statics.js`.
- `js/routes/pilot-ch1-parallelogram.js` is reference/pilot scope, not active unless explicitly integrated.
- Keep JS files under 220 lines; split renderer/behavior files if needed.

## Recommended Solution

Upgrade Ch1 in two implementation batches: core statics first, applied statics + pilot reconcile second. Add/extend tests only where existing gates cannot express DeCuong-style thao tác.

## Unresolved Questions

Không có.
