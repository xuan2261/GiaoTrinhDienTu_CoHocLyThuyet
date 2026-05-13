---
type: research
date: 2026-05-14
topic: compact-simulation-readout-cards
status: complete
---

# Research Synthesis

## Problem

Readout card hiện tốn 2 dòng cố định: label dòng 1, value dòng 2. Trong right inspector, điều này làm cột phải dài không cần thiết, nhất là các route có nhiều thông số.

## Options

| Option | Summary | Pros | Cons | Verdict |
|---|---|---|---|---|
| CSS-only one-row card | Use CSS grid: label left, value right | Ít rủi ro, no JS, áp dụng 58 routes | Cần wrap tốt cho label dài | Recommended |
| Adaptive compact | Ngắn 1 dòng, dài 2 dòng | Đẹp hơn cho text dài | Cần heuristic/class, dễ phức tạp | Keep as fallback via CSS wrap |
| Table/list readouts | Bỏ card feel, dùng dense list | Dày nhất | Lệch design, mất semantic card feel | Not now |
| JS metadata layout | Thêm compact flag per readout | Kiểm soát cao | Đụng engine, route data, YAGNI | Reject |

## Recommended Design

- Keep DOM unchanged.
- Change `.sim-readout-card` to CSS grid:
  - `grid-template-columns: minmax(0, 1fr) max-content`
  - `align-items: baseline`
  - compact padding
  - lower min-height
- Keep `.sim-readout-label` and `.sim-readout-value` as existing hooks.
- Add wrap rules:
  - label: `min-width:0`, `overflow-wrap:anywhere`
  - value: `text-align:right`, `overflow-wrap:anywhere`
  - at narrow widths, allow value to move under label only if needed.

## Why This Fits

- KISS: one CSS slice.
- DRY: one shared shell rule.
- YAGNI: no route-specific metadata.
- Maintains existing tests that query label/value text.

## Acceptance Interpretation

Done means compact, not cramped. Values must remain readable; no need to force every card into exactly one physical line when text is long.

## Unresolved Questions

- None.
