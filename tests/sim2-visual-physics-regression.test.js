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
  assert.ok(src.includes('const radialPhase = params.vRel * t * 0.5;'),
    'ch2-4-4 phải dùng phase radial chung cho rRel và vận tốc tương đối');
  assert.ok(src.includes('const radialSpeed = 0.75 * params.vRel * Math.cos(radialPhase);'),
    'ch2-4-4 v_rel phải là đạo hàm có dấu của rRel');
  assert.ok(src.includes('ur.x * radialSpeed'),
    'ch2-4-4 mũi v_rel phải đổi chiều khi radialSpeed âm');
  assert.ok(src.includes('Math.abs(radialSpeed)'),
    'ch2-4-4 |a_cor| phải lấy độ lớn vận tốc tương đối thực');
}

{
  const src = read('js/sim2/sims/ch1/ch1-5-3.js');
  assert.ok(src.includes('D = root.SimPhysicsDynamics'),
    'ch1-5-3 phải dùng dynamics helper chung');
  assert.ok(src.includes('D.slipCondition(state.betaDeg, state.mu)'),
    'ch1-5-3 trạng thái trượt phải đi qua slipCondition');
}

console.log('sim2-visual-physics-regression: PASS');
