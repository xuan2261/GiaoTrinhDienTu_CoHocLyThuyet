/**
 * TDD — buildCapturePlan + artifactName (pure logic, Node).
 * Count đọc từ manifest.length (KHÔNG hardcode 25). Chạy: node tests/sim2-visual-capture-plan.test.js
 */
'use strict';

const assert = require('assert');
const { buildCapturePlan, artifactName } = require('../tools/sim2-visual/capture-plan.js');
const manifest = require('../js/sim2/sim2-route-manifest.js');

// 1. Count khớp manifest — đổi manifest → test phản ánh, không hardcode.
const planAll = buildCapturePlan(manifest, {});
assert.strictEqual(planAll.length, manifest.length, 'plan phải phủ đủ mọi route manifest');

// 2. Mọi job: ≥1 shot, kind hợp lệ, section suy được, name giữ nguyên.
for (let i = 0; i < planAll.length; i++) {
  const job = planAll[i];
  assert.ok(job.shots.length >= 1, `${job.route} phải có ≥1 shot`);
  assert.ok(['static', 'dynamic'].includes(job.kind), `${job.route} kind hợp lệ`);
  assert.ok(job.section && job.section.length > 0, `${job.route} có section`);
  assert.strictEqual(job.route, manifest[i].id, `${job.route} route = manifest id`);
  assert.strictEqual(job.chapter, manifest[i].chapter, `${job.route} chapter giữ nguyên`);
}

// 3. Không classify → static mặc định: shots = init(frame 0) + live(frame null).
assert.strictEqual(planAll[0].kind, 'static', 'không classify → static');
assert.deepStrictEqual(planAll[0].shots.map(s => s.label), ['init', 'live'], 'static shots = init+live');
assert.strictEqual(planAll[0].shots[0].frame, 0, 'static init frame = 0');
assert.strictEqual(planAll[0].shots[1].frame, null, 'static live frame = null');

// 4. Dynamic → ≥3 shot t0/mid/end với N1/N2 mặc định (60/120).
const dynPlan = buildCapturePlan(manifest, { [manifest[0].id]: 'dynamic' });
const dyn = dynPlan[0];
assert.strictEqual(dyn.kind, 'dynamic', 'classify dynamic → kind dynamic');
assert.ok(dyn.shots.length >= 3, 'dynamic có ≥3 shot');
assert.deepStrictEqual(dyn.shots.map(s => s.label), ['t0', 'mid', 'end'], 'dynamic shots = t0/mid/end');
assert.strictEqual(dyn.shots[0].frame, 0, 't0 frame = 0');
assert.strictEqual(dyn.shots[1].frame, 60, 'mid frame mặc định = 60');
assert.strictEqual(dyn.shots[2].frame, 120, 'end frame mặc định = 120');

// 5. overrides áp đúng N1/N2 cho route cụ thể.
const ovPlan = buildCapturePlan(manifest, { [manifest[0].id]: 'dynamic' },
  { overrides: { [manifest[0].id]: { N1: 20, N2: 45 } } });
assert.strictEqual(ovPlan[0].shots[1].frame, 20, 'override N1');
assert.strictEqual(ovPlan[0].shots[2].frame, 45, 'override N2');

// 6. stepDefaults tuỳ biến áp cho mọi dynamic chưa override.
const sdPlan = buildCapturePlan(manifest, { [manifest[0].id]: 'dynamic' },
  { stepDefaults: { N1: 30, N2: 90 } });
assert.strictEqual(sdPlan[0].shots[1].frame, 30, 'stepDefaults N1');
assert.strictEqual(sdPlan[0].shots[2].frame, 90, 'stepDefaults N2');

// 7. artifactName định dạng <route>__<label>.png.
assert.strictEqual(artifactName({ route: 'ch1-1-3', label: 'init' }), 'ch1-1-3__init.png');
assert.strictEqual(artifactName({ route: 'ch3-6-2', label: 'end' }), 'ch3-6-2__end.png');

// 8. section suy từ id: bỏ tiền tố ch{chapter}- → thay '-' bằng '.'.
const j163 = planAll.find(j => j.route === 'ch1-6-3');
assert.strictEqual(j163.section, '6.3', 'ch1-6-3 → section 6.3');
const j362 = buildCapturePlan(manifest, {}).find(j => j.route === 'ch3-6-2');
assert.strictEqual(j362.section, '6.2', 'ch3-6-2 → section 6.2');

// 9. interactionTargets rỗng/không truyền → shots y hệt hành vi cũ (regression guard).
const id0 = manifest[0].id;
const noIT = buildCapturePlan(manifest, {}, { interactionTargets: {} });
assert.deepStrictEqual(noIT[0].shots.map(s => s.label), ['init', 'live'],
  'interactionTargets rỗng → shots không đổi');

// 10. slider-far: route có entry kind slider → shot cuối label 'slider-far', giữ control.
const sliderPlan = buildCapturePlan(manifest, {},
  { interactionTargets: { [id0]: { kind: 'slider', control: 'F', lo: null, hi: null } } });
const sJob = sliderPlan[0];
assert.strictEqual(sJob.shots.length, 3, 'static + slider-far → 3 shots (init/live/slider-far)');
const sLast = sJob.shots[sJob.shots.length - 1];
assert.strictEqual(sLast.label, 'slider-far', 'shot cuối label slider-far');
assert.strictEqual(sLast.kind, 'slider', 'shot slider-far kind slider');
assert.strictEqual(sLast.control, 'F', 'shot slider-far giữ control');
assert.strictEqual(sLast.frame, undefined, 'shot tương tác KHÔNG có frame (spec set control rồi chụp)');

// 11. drag-far: route có entry kind drag → shot cuối label 'drag-far', giữ selector.
const dragPlan = buildCapturePlan(manifest, {},
  { interactionTargets: { [id0]: { kind: 'drag', selector: '.sim2-handle' } } });
const dLast = dragPlan[0].shots[dragPlan[0].shots.length - 1];
assert.strictEqual(dLast.label, 'drag-far', 'shot cuối label drag-far');
assert.strictEqual(dLast.kind, 'drag', 'shot drag-far kind drag');
assert.strictEqual(dLast.selector, '.sim2-handle', 'shot drag-far giữ selector');

// 12. interaction-far áp được cho dynamic route: shots = t0/mid/end + slider-far.
const dynIT = buildCapturePlan(manifest, { [id0]: 'dynamic' },
  { interactionTargets: { [id0]: { kind: 'slider', control: 'k' } } });
assert.deepStrictEqual(dynIT[0].shots.map(s => s.label), ['t0', 'mid', 'end', 'slider-far'],
  'dynamic + slider-far → t0/mid/end/slider-far');

// 13. lo/hi override giữ nguyên trong shot slider (local-monotonic clamp).
const clampPlan = buildCapturePlan(manifest, {},
  { interactionTargets: { [id0]: { kind: 'slider', control: 'mu', lo: 0.1, hi: 1.0 } } });
const cLast = clampPlan[0].shots[clampPlan[0].shots.length - 1];
assert.strictEqual(cLast.lo, 0.1, 'shot slider-far giữ lo override');
assert.strictEqual(cLast.hi, 1.0, 'shot slider-far giữ hi override');

console.log(`sim2-visual-capture-plan: PASS (${planAll.length} route)`);
