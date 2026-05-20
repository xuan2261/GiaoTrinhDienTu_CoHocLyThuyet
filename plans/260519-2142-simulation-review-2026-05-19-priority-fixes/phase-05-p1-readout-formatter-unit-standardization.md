---
phase: 5
title: "P1 Readout Formatter And Unit Standardization"
status: pending
priority: P1
effort: "8h"
dependencies: [1, 4]
---

# Phase 5: P1 Readout Formatter And Unit Standardization

## Overview

10+ route có readout thiếu đơn vị (`MO: 0`, `ΣM: 152`, `L: 2`) hoặc dùng raw number cho discrete (`Loại liên kết: 98`, `Bài toán: 0`). Tạo formatter helper trung tâm, áp dụng đồng nhất 58 route. Phase này cũng nhận ch1-3-3 từ Phase 04 (discrete chooser) — pin ordering: P4 widget choice → P5 mapper → P9 scene refresh.

## Requirements

**Functional:**
- Helper `formatReadout(value, { unit, kind, mapper, precision })`:
  - `kind: 'scalar' | 'angle' | 'energy' | 'discrete'`
  - `mapper` cho discrete: `0 → 'Tựa'`, `1 → 'Dây'`, ... — keys MUST match upstream slider/widget value space (xác định ở P04 trước, P05 build mapper sau)
  - Em-dash khi value undefined (giữ behavior hiện có cho `J: —N·s`)
- Mọi readout card có suffix unit nếu kind=scalar/angle/energy

**Non-functional:**
- Một file utility duy nhất: `js/sim-readout-format.js`
- Không thay đổi readout card layout (giữ contract phase 260514-compact)

## Architecture

```
Behavior contract → state object → formatReadout() → readout card text
                                       ↑
                                       └─ Phase 05 thêm helper
```

**ch1-3-3 ordering (red-team M4 fix):**
1. P04 quyết định widget cho ch1-3-3 (button-group hoặc dropdown) + value space `{0..N}`.
2. P05 build mapper với keys khớp value space đã chốt.
3. P09 redesign scene (tách khỏi P05 để tránh cross-phase coupling).

Nếu P04 chốt value space `{0,1,2,3,4}`, mapper là `{0:'Tựa',1:'Dây',2:'Bản lề',3:'Gối',4:'Ngàm'}`. Capture batch 2026-05-19 hiển thị `Loại liên kết: 98` — đó là old slider raw value, sẽ biến mất khi P04 done.

## Related Code Files

- Create: `js/sim-readout-format.js` (helper + unit map + discrete mapper registry)
- Modify per-route readout bindings (real shared files, grep `readout.text\|state.readouts` to locate):
  - `js/sims/ch1/ch1-support-spatial-behaviors.js` — ch1-3-3 (discrete via P04 widget value space), ch1-4-2 `MO`, ch1-4-4 `ΣM`
  - `js/sims/ch1/ch1-support-renderers.js` — readout draw cho ch1 statics nếu có inline render
  - `js/sims/ch3/ch3-dynamics-theorem-collision-behaviors.js` — ch3-5-2 `J`, `Δp`, ch3-5-3 `L`, ch3-5-4 `E = T+V` panel
  - `js/sims/ch3/ch3-theorems-renderers.js` — readout draw cho ch3 dynamics
  - Per-chapter route files cho ch3-7-1 discrete `định lý`, ch2-2-2, ch2-3-2, ch2-7-2
- Modify: `tests/sim-review-2026-05-19/readout-unit-audit.spec.js` (RED → GREEN)

## Implementation Steps (TDD)

### RED
- `readout-unit-audit.spec.js` confirm fail.

### GREEN
1. Tạo `js/sim-readout-format.js`:
   ```js
   export function formatReadout(value, { unit = '', kind = 'scalar', mapper, precision = 1 } = {}) {
     if (value == null || Number.isNaN(value)) return `—${unit ? ' ' + unit : ''}`;
     if (kind === 'discrete' && mapper) return mapper[value] ?? String(value);
     if (kind === 'angle') return `${Math.round(value)}°`;
     return `${value.toFixed(precision)} ${unit}`.trim();
   }
   export const DISCRETE_MAPPERS = {
     'ch1-3-3-link-type': { 0: 'Tựa', 1: 'Dây', 2: 'Bản lề', 3: 'Gối', 4: 'Ngàm' },
     'ch3-7-1-theorem':   { 0: 'Định lý khối tâm', 1: 'Định lý động năng', /* ... */ },
   };
   ```
2. Audit từng route trong S3 list, đổi binding từ `readout.text = state.x.toString()` sang `formatReadout(state.x, { unit: 'N·m' })`.
3. **ch1-3-3 discrete mapper**: confirm with P04 callsite that value space is `{0..4}` not `{0..98}`. Nếu P04 chưa migrate ch1-3-3 (punted to P05/P09), Phase 05 đảm nhận: thay slider value space thành `{0..4}` qua widget choice + bind mapper.
4. Em-dash placeholder: `formatReadout(undefined, {unit:'N·s'})` → `'— N·s'`.

### REFACTOR
- Sau khi 10+ route ổn, audit toàn bộ 58 route bằng grep `readout.text =` — thay nốt nếu phát hiện thêm.

## Success Criteria

- [ ] `js/sim-readout-format.js` exists, có JSDoc + unit list + DISCRETE_MAPPERS registry
- [ ] 10+ route migrate; `tests/sim-review-2026-05-19/readout-unit-audit.spec.js` PASS
- [ ] ch1-3-3 widget value space khớp mapper key — confirmed via P04 callsite OR tự handle trong P05
- [ ] Audit toàn 58 route: 0 readout missing-unit (grep + spec)
- [ ] `npm run test:sim:browser` PASS
- [ ] Visual baseline refresh cho route ảnh hưởng qua `npm run test:sim:visual-quality:update`

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Em-dash `—` với encoding (UTF-8 vs CP1252) | Test cụ thể em-dash byte; CI build check |
| ch1-3-3 mapper key không match P04 widget value space | Hard-pin ordering P04 → P05; nếu P04 chưa quyết, P05 chốt cả widget và mapper trong cùng commit |
| Một số readout muốn không hiển thị unit (e.g., ratio) | Cho `unit: ''` vẫn work; test case riêng |

## Verification Gate

Phase 05 đóng khi: 0 readout-audit failure, 58-route grep clean, baseline refresh, ch1-3-3 discrete value space khớp mapper.
