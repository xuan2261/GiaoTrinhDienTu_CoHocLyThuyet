/**
 * Regression guard for visual-physics invariants that pure physics tests miss.
 * Chạy: node tests/sim2-visual-physics-regression.test.js
 */
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');

{
  const src = read('js/sim2/sims/ch3/ch3-1-3.js');
  assert.ok(
    src.includes('pivot.x - L * Math.sin(theta)'),
    'ch3-1-3 bob phải lệch ngược chiều aFrame, cùng chiều lực quán tính F*'
  );
  assert.ok(!src.includes('pivot.x + L * Math.sin(theta)'),
    'ch3-1-3 không được để bob lệch cùng chiều aFrame');
  assert.ok(src.includes('{ stroke: Pal.a, width: 3 }'),
    'ch3-1-3 mũi gia tốc toa phải dùng Pal.a');
  assert.ok(src.includes("color: Pal.a"),
    'ch3-1-3 nhãn/legend gia tốc toa phải dùng Pal.a');
  // framing: thu dead-space DỌC (content y 0..5 lấp ~71% trong worldBox -1..6) — giữ maxX (không clip thân toa).
  assert.ok(src.includes('minY: -0.5') && src.includes('maxY: 5.5'),
    'ch3-1-3 worldBox thu dọc về minY -0.5 / maxY 5.5 (bỏ dead-space, content lấp ~83%)');
  assert.ok(!src.includes('minY: -1,') && !src.includes('maxY: 6'),
    'ch3-1-3 worldBox dọc cũ (-1..6) còn nhiều khoảng trống');
  assert.ok(src.includes('maxX: 5,'),
    'ch3-1-3 GIỮ maxX=5 — thu maxX sẽ clip thân toa (finding #6)');
  // tương phản viền: thân toa giữ gradient 'axis' shared (KHÔNG đổi) nhưng tăng định-rõ viền.
  assert.ok(src.includes("gradient: 'axis'"),
    'ch3-1-3 GIỮ gradient axis shared (ch1-1-8/ch1-3-2/ch1-6-3) — không đụng decision #2');
  assert.ok(src.includes('width: 3.5'),
    'ch3-1-3 viền thân toa dày 3.5 để hộp tách rõ khỏi nền lưới (định-rõ viền, palette-neutral)');
}

{
  const src = read('js/sim2/sims/ch2/ch2-5-2.js');
  assert.ok(src.includes('const minAx = Bx - Llen;'),
    'ch2-5-2 clamp trái phải suy từ Bx - Llen');
  assert.ok(src.includes('Math.max(minAx, wp.x)'),
    'ch2-5-2 không được kéo A qua biên làm thanh dài hơn Llen');
  assert.ok(!src.includes('Math.max(-4.5, wp.x)'),
    'ch2-5-2 clamp -4.5 phá ràng buộc thanh cứng dài 5');
}

{
  const src = read('js/sim2/sims/ch2/ch2-4-4.js');
  assert.ok(src.includes('const radialPhase = params.vRelMax * t / 1.5;'),
    'ch2-4-4 phải dùng v_rel,max làm biên độ vận tốc và phase chung cho chuyển động bán kính');
  assert.ok(src.includes('const radialSpeed = params.vRelMax * Math.cos(radialPhase);'),
    'ch2-4-4 readout v_rel(t) phải là đạo hàm có dấu với biên độ đúng bằng slider v_rel,max');
  assert.ok(src.includes('ur.x * radialSpeed'),
    'ch2-4-4 mũi v_rel phải đổi chiều khi radialSpeed âm');
  assert.ok(src.includes('Math.abs(radialSpeed)'),
    'ch2-4-4 |a_cor| phải lấy độ lớn vận tốc tương đối thực');
  // disk-dominance: đĩa thu nhỏ nhưng VẪN chứa hạt (rRel max = 2+1.5 = 3.5) → đĩa ≥ 3.5.
  assert.ok(!src.includes('render.circle(tf, O, 4,'),
    'ch2-4-4 đĩa cũ r=4 (nuốt khung) phải thu nhỏ');
  assert.ok(src.includes('render.circle(tf, O, 3.6,'),
    'ch2-4-4 đĩa thu về 3.6 (vẫn ≥ rRel max 3.5, không để hạt văng ra ngoài)');
  assert.ok(src.includes('maxX: 6.4'),
    'ch2-4-4 worldBox nới ±6.4 để đĩa-trên-màn còn ~56% (không nuốt khung)');
  assert.ok(!src.includes('maxX: 5.6'),
    'ch2-4-4 worldBox ±5.6 cũ chưa đủ — phải nới rộng hơn');
  assert.ok(src.includes('displayVector({ x: ur.x * radialSpeed, y: ur.y * radialSpeed }, 1.6, 2.2)'),
    'ch2-4-4 mũi v_rel phải tăng tỉ lệ rồi clamp riêng phần hiển thị');
  assert.ok(src.includes('displayVector({ x: ac.ax, y: ac.ay }, 0.42, 2.3)'),
    'ch2-4-4 a_cor phải tăng tỉ lệ rồi clamp riêng phần hiển thị');
  assert.ok(src.includes('vRel: radialSpeed') && src.includes('aCor: { x: ac.ax, y: ac.ay, mag: acMag }'),
    'ch2-4-4 state/readout phải giữ vận tốc và gia tốc Coriolis vật lý');
}

{
  const src = read('js/sim2/sims/ch2/ch2-2-2.js');
  // R=3 dính physics (vt=ωR, px=R·cos) → KHÔNG thu R; thu đĩa-trên-màn bằng worldBox.
  assert.ok(src.includes('R = 3'),
    'ch2-2-2 GIỮ world R=3 (dính physics vt=ωR) — không được thu R');
  assert.ok(src.includes('K.tangentialVelocity(omega, R)'),
    'ch2-2-2 GIỮ coupling vt = ω·R');
  assert.ok(src.includes('maxX: 5.5'),
    'ch2-2-2 worldBox nới ±4.6→±5.5 để đĩa R=3 còn ~55% khung');
  assert.ok(!src.includes('maxX: 4.6'),
    'ch2-2-2 worldBox ±4.6 cũ làm đĩa nuốt khung');
  assert.ok(src.includes('Math.min(Math.abs(vt) * 0.2, 1.8)'),
    'ch2-2-2 mũi v giữ viz-scale 0.2 nhưng phải clamp chiều dài ở ω lớn');
  assert.ok(src.includes('const direction = vt < 0 ? -1 : 1;'),
    'ch2-2-2 clamp hiển thị không được làm mất hướng vận tốc vật lý');
}

{
  const src = read('js/sim2/sims/ch1/ch1-5-3.js');
  assert.ok(src.includes('D = root.SimPhysicsDynamics'),
    'ch1-5-3 phải dùng dynamics helper chung');
  assert.ok(src.includes('D.slipCondition(state.betaDeg, state.mu)'),
    'ch1-5-3 trạng thái trượt phải đi qua slipCondition');
}

// P2 dead-space: thu minY (bottom-only) — content đáy tĩnh (gối/nhãn/trục) không trôi theo slider
// nên không sinh clip ở slider max. KHÔNG đụng maxY (ch1-1-8 P=200 đã sát mép trên). Palette-neutral.
{
  const src = read('js/sim2/sims/ch1/ch1-1-8.js');
  assert.ok(src.includes('minY: -1.2,'),
    'ch1-1-8 thu minY -1.5→-1.2 (bỏ dead-space dưới dầm; gối chân y=-0.8 còn margin 0.4)');
  assert.ok(!src.includes('minY: -1.5,'),
    'ch1-1-8 minY -1.5 cũ để dead-space dưới');
}
{
  const src = read('js/sim2/sims/ch3/ch3-5-4.js');
  assert.ok(src.includes('minY: -0.4,'),
    'ch3-5-4 thu minY -0.8→-0.4 (nét đứt đáy y=-0.3 còn margin 0.1)');
  assert.ok(!src.includes('minY: -0.8,'),
    'ch3-5-4 minY -0.8 cũ để nửa dưới trống');
}
{
  const src = read('js/sim2/sims/ch3/ch3-3-1.js');
  // NGƯỢC chiều: trace x(t) đáy y=-4.6 sát mép minY=-5 (borderline clip) → NỚI margin.
  assert.ok(src.includes('minY: -5.25,'),
    'ch3-3-1 nới minY -5→-5.25 để trace x(t) đáy (y=-4.6) không chạm mép');
  assert.ok(!src.includes('minY: -5,'),
    'ch3-3-1 minY -5 cũ làm trace chạm mép đáy');
}

console.log('sim2-visual-physics-regression: PASS');
