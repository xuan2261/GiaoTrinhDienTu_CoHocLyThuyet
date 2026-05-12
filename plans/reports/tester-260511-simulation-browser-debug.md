# Simulation browser QA/debug report

Work context: `D:/NCKH_2025/GiaoTrinhDienTu_CoHocLyThuyet`

## Kết luận

- Không xác nhận được failure nào trong runtime simulation hiện tại.
- `58/58` routes mount qua Playwright audit.
- Controls, drag handles, animation play/pause, và readability đều pass trên suite hiện có và trên kiểm tra browser thủ công cho route đại diện.
- Console errors không xuất hiện trên các route đại diện đã inspect bằng `agent-browser`.

## Lệnh đã chạy

- `npx playwright test tests/mass-conversion-audit.spec.js --reporter=line`
- `npx playwright test tests/simulation-interaction-engine.spec.js --reporter=line`
- `npx playwright test tests/simulation-visual-quality.spec.js --reporter=line`
- `agent-browser -v open "file:///D:/NCKH_2025/GiaoTrinhDienTu_CoHocLyThuyet/index.html#ch1-2-3" && agent-browser -v snapshot -i -d 2 && agent-browser -v console`
- `agent-browser -v open "file:///D:/NCKH_2025/GiaoTrinhDienTu_CoHocLyThuyet/index.html#ch2-5-2" && agent-browser -v snapshot -i -d 2 && agent-browser -v console --clear`
- `agent-browser -v open "file:///D:/NCKH_2025/GiaoTrinhDienTu_CoHocLyThuyet/index.html#ch2-5-2" && agent-browser -v eval "(() => { const lab = document.querySelector('.sim-container.sim-lab'); const canvas = lab?.querySelector('canvas'); const handles = canvas?.__simInteractionLayer?.handles?.() || []; return { routeId: lab?.dataset.routeId || '', rendererId: lab?.dataset.rendererId || '', behaviorId: lab?.dataset.behaviorId || '', controls: lab?.querySelectorAll('.sim-controls .sim-btn, .sim-controls input[type=range]').length || 0, handleIds: handles.map(h => h.id), handleLabels: handles.map(h => h.label), status: lab?.querySelector('.sim-lab-status')?.textContent?.trim() || '' }; })()"`
- `agent-browser -v open "file:///D:/NCKH_2025/GiaoTrinhDienTu_CoHocLyThuyet/index.html#ch3-3-1" && agent-browser -v eval "(() => { const lab = document.querySelector('.sim-container.sim-lab'); const canvas = lab?.querySelector('canvas'); const handles = canvas?.__simInteractionLayer?.handles?.() || []; return { routeId: lab?.dataset.routeId || '', rendererId: lab?.dataset.rendererId || '', behaviorId: lab?.dataset.behaviorId || '', controls: lab?.querySelectorAll('.sim-controls .sim-btn, .sim-controls input[type=range]').length || 0, handleIds: handles.map(h => h.id), handleLabels: handles.map(h => h.label), status: lab?.querySelector('.sim-lab-status')?.textContent?.trim() || '' }; })()"`
- `agent-browser -v open "file:///D:/NCKH_2025/GiaoTrinhDienTu_CoHocLyThuyet/index.html#ch3-3-1" && agent-browser -v eval "(() => { const btn = [...document.querySelectorAll('button')].find(b => /Chạy/.test(b.textContent)); btn?.click(); return btn?.textContent?.trim() || 'missing'; })()" && agent-browser -v wait 700 && agent-browser -v eval "(() => ({ status: document.querySelector('.sim-lab-status')?.textContent?.trim() || '', playText: [...document.querySelectorAll('button')].find(b => /Dừng/.test(b.textContent))?.textContent?.trim() || '', readout: document.querySelector('.sim-readout-grid')?.textContent?.trim() || '' }))()" && agent-browser -v errors --clear`

## Pass/Fail

### Playwright

- `tests/mass-conversion-audit.spec.js`: `58 passed, 0 failed`
- `tests/simulation-interaction-engine.spec.js`: `14 passed, 0 failed`
- `tests/simulation-visual-quality.spec.js`: `4 passed, 0 failed`

### Browser checks

- `ch1-2-3`: pass
- `ch2-5-2`: pass
- `ch3-3-1`: pass
- Play/pause on `ch3-3-1`: pass
- Console errors on inspected routes: none

## Route coverage

### All 58 routes mounted

- `ch1-1-3`
- `ch1-1-4`
- `ch1-1-5`
- `ch1-1-6`
- `ch1-1-8`
- `ch1-2-1`
- `ch1-2-3`
- `ch1-2-6`
- `ch1-3-1`
- `ch1-3-2`
- `ch1-3-3`
- `ch1-3-4`
- `ch1-3-6`
- `ch1-3-7`
- `ch1-4-1`
- `ch1-4-2`
- `ch1-4-4`
- `ch1-5-1`
- `ch1-5-2`
- `ch1-5-3`
- `ch1-5-4`
- `ch1-6-2`
- `ch1-6-3`
- `ch1-7-1`
- `ch1-7-2`
- `ch2-1-1`
- `ch2-1-2`
- `ch2-1-3`
- `ch2-1-4`
- `ch2-2-2`
- `ch2-3-2`
- `ch2-4-1`
- `ch2-4-2`
- `ch2-4-3`
- `ch2-4-4`
- `ch2-5-1`
- `ch2-5-2`
- `ch2-5-3`
- `ch2-7-1`
- `ch2-7-2`
- `ch3-1-2`
- `ch3-1-3`
- `ch3-2-1`
- `ch3-2-2`
- `ch3-2-3`
- `ch3-2-5`
- `ch3-3-1`
- `ch3-3-2`
- `ch3-4-1`
- `ch3-4-2`
- `ch3-5-1`
- `ch3-5-2`
- `ch3-5-3`
- `ch3-5-4`
- `ch3-6-2`
- `ch3-6-3`
- `ch3-7-1`
- `ch3-7-2`

## Browser observations

### `ch1-2-3`

- Snapshot shows lab region, canvas, 2 sliders, and reset.
- No console error surfaced in browser session.
- Route is usable and the shared shell labels are visible.

### `ch2-5-2`

- Metadata from `eval`:
  - `routeId`: `ch2-5-2`
  - `rendererId`: `ch2-5-2-instant-center-renderer`
  - `behaviorId`: `ch2-5-2-instant-center-behavior`
  - `controls`: `4`
  - `handleIds`: `instant-center-point`
  - `handleLabels`: `IC`
  - `status`: `tương tác trực tiếp`
- Snapshot shows `omega`, `Omega điều khiển`, reset, and `▶ Chạy`.
- No console error surfaced in browser session.

### `ch3-3-1`

- Metadata from `eval`:
  - `routeId`: `ch3-3-1`
  - `rendererId`: `ch3-3-1-ode-solver-renderer`
  - `behaviorId`: `ch3-behavior-ch3-3-1`
  - `controls`: `5`
  - `handleIds`: `spring-mass`
  - `handleLabels`: `m`
  - `status`: `tương tác trực tiếp`
- Play button toggles correctly:
  - before play: `▶ Chạy`
  - after click: `⏸ Dừng`
  - status becomes `đang chạy`
- Readout updated after play; no console error surfaced.

## Likely root-cause areas

Không có root-cause xác nhận vì không có failure. Nếu sau này regression xuất hiện, các vùng cần soi đầu tiên là:

- `js/sim-professional-lab.js:298-307` (`behaviorFor`)
- `js/sim-professional-lab.js:331-349` (`rendererFor` + `setLabMetadata`)
- `js/sim-professional-lab.js:438-470` (`buildControls`)
- `js/sim-professional-lab.js:812-830` (`routeOwnedHandles` + `resolveHandles`)
- `js/sim-lab-ui.js:74-180` (`createLab`)

## Ghi chú

- `agent-browser` CLI dùng được trong workspace.
- `tests/simulation-test-utils.js` lọc console noise hợp lệ từ KaTeX/CDN, nên audit hiện tại tập trung vào lỗi runtime thực sự.
