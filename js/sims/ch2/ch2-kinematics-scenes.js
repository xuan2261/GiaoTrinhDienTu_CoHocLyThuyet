/**
 * Route scenes for Ch2 kinematics — all 15 routes.
 * Uses the row-array + factory pattern.
 */
(function() {
'use strict';

const registry = window.SimSceneRegistry;
if (!registry) {
  console.warn('SimSceneRegistry missing for Ch2 kinematics scenes');
  return;
}

const rows = [
  // [routeId, template, family, title, formula, visualLabel, forceLabel, secondKey, secondLabel, read1, read2]
  ['ch2-1-1', 'trajectory', 'kinematics', 'Quỹ đạo chất điểm', 'v = dr/dt; a = dv/dt', 'Quỹ đạo + vận tốc', 'omega', 'theta', 'Góc quay', '|v|', 'speed'],
  ['ch2-1-2', 'graph-cursor', 'kinematics', 'Đồ thị x(t) v(t) a(t)', 'v = dx/dt; a = dv/dt', 'Đồ thị động học', 'omega', 't', 'Con trỏ t', 'x(t)', 'v(t)'],
  ['ch2-1-3', 'natural-coords', 'kinematics', 'Tọa độ tự nhiên', 'a = at*tau + an*n', 'Tiếp tuyến + pháp tuyến', 'omega', 'rho', 'Bán kính cong', 'a_t', 'a_n'],
  ['ch2-1-4', 'motion-presets', 'kinematics', 'Các dạng chuyển động', 'đều, biến đổi, bài tập', 'Presets động học', 'omega', 'mode', 'Loại chuyển động', 'x', 'v'],
  ['ch2-2-2', 'fixed-axis-rotation', 'kinematics', 'Quay quanh trục cố định', 'phi = omega0*t + ½alpha*t²', 'Thanh quay quanh O', 'omega', 'alpha', 'Omega ban đầu', 'phi', 'omega'],
  ['ch2-3-2', 'belt-gear-transmission', 'kinematics', 'Truyền động bánh răng', 'omega1*r1 = omega2*r2', 'Truyền động dây', 'omega', 'r1', 'Omega vào', 'omega2', 'v'],
  ['ch2-4-1', 'velocity-composition', 'kinematics', 'Hợp chuyển động', 'v_a = v_e + v_r', 'Tam giác vận tốc', 'omega', 've', 'Vận tốc Euler', 'va', 'va=ve+vr'],
  ['ch2-4-2', 'absolute-relative-transport', 'kinematics', 'Ba loại vận tốc', 'v_a, v_r, v_e', 'Phân biệt v_a, v_r, v_e', 'omega', 'mode', 'Chế độ', 'label', 'value'],
  ['ch2-4-3', 'velocity-triangle', 'kinematics', 'Tam giác vận tốc', 'va = ve + vr', 'Dựng tam giác', 'omega', 'phi', 'Góc pha', 'va', 'phi'],
  ['ch2-4-4', 'coriolis-acceleration', 'kinematics', 'Gia tốc Coriolis', 'a_c = 2*omega x v_r', 'Gia tốc Coriolis', 'omega', 'vr', 'Omega đĩa', 'a_c', 'a_e'],
  ['ch2-5-1', 'plane-translation-rotation', 'kinematics', 'Tịnh tiến + quay phẳng', 'v_B = v_A + omega x AB', 'Chuyển động phẳng', 'omega', 'phi', 'Omega thanh', 'v_A', 'v_B'],
  ['ch2-5-2', 'instant-center-velocity', 'kinematics', 'Tâm vận tốc tức thời', 'v_P = omega x r_P/IC', 'Slider-crank IC', 'omega', 'theta', 'Omega điều khiển', 'IC_x', 'IC_y'],
  ['ch2-5-3', 'velocity-distribution', 'kinematics', 'Phân bố vận tốc', 'v_B = v_A + omega x AB', 'Thanh quay', 'omega', 'L', 'Omega thanh', 'v_A', 'v_B'],
  ['ch2-7-1', 'kinematics-solver', 'checker', 'Giải bài động học', 'v = dx/dt; a = dv/dt', 'Giải theo đồ thị', 'omega', 'step', 'Bước', 'result', 'verify'],
  ['ch2-7-2', 'numeric-verifier', 'checker', 'Kiểm tra số liệu x(t)', 'dv/dt = a, dx/dt = v', 'Verify consistency', 'omega', 'x0', 'Điều kiện đầu', 'error', 'status']
];

function scene(row, index) {
  const [routeId, template, family, title, formula, visualLabel, forceLabel, secondKey, secondLabel, read1, read2] = row;
  return {
    routeId,
    sceneId: `${routeId}-${template}`,
    template,
    family,
    title,
    formula,
    visualKey: `${template}-${index + 1}`,
    visualLabel,
    seed: index + 1,
    angle: -0.5 + index * 0.06,
    initialState: buildInitialState(routeId, index),
    controls: buildControls(routeId, forceLabel, secondKey, secondLabel),
    readouts: [
      { label: read1, key: readKey(read1), scale: 1, digits: 2 },
      { label: read2, key: readKey(read2), scale: 1, digits: 2 }
    ]
  };
}

function buildInitialState(routeId, index) {
  const base = { t: 0, omega: 1.5, theta: index * 0.2, trail: [] };
  switch (routeId) {
    case 'ch2-1-1': return Object.assign(base, { mode: 'Elip', currentX: 430, currentY: 170, vx: 0, vy: 150, speed: 150, alpha: 0 });
    case 'ch2-1-2': return Object.assign(base, { cursorX: 82, cursorY: 200, xVal: 10, vVal: 50 * Math.PI, aVal: 0 });
    case 'ch2-1-3': return Object.assign(base, { px: 346, py: 184, vx: 0, vy: 0, an: 0, at: 0 });
    case 'ch2-1-4': return Object.assign(base, { mode: 'Thẳng', px: 100, py: 200 });
    case 'ch2-2-2': return Object.assign(base, { theta: 0, omegaCur: 1.5, alpha: 0, r: 86, _t: 0 });
    case 'ch2-3-2': return Object.assign(base, { phi1: 0, phi2: 0, r1: 50, r2: 90, omega2: 1.0 });
    case 'ch2-4-1': return Object.assign(base, { ve: { vx: 60, vy: -30 }, vr: { vx: 40, vy: 40 }, va: { vx: 0, vy: 0 } });
    case 'ch2-4-2': return Object.assign(base, { mode: 'tuyệt đối', va: { vx: 55, vy: 0 }, ve: { vx: 30, vy: 0 }, vr: { vx: 0, vy: 0 } });
    case 'ch2-4-3': return Object.assign(base, { ve: { vx: 60, vy: 0 }, vr: { vx: 0, vy: 40 }, va: { vx: 0, vy: 0 } });
    case 'ch2-4-4': return Object.assign(base, { theta: 0, px: 360, py: 180, vrx: 30, vry: 0, vr: 30, coriolis: 0 });
    case 'ch2-5-1': return Object.assign(base, { phi: 0, ox: 180, oy: 170, ax: 260, ay: 170, bx: 420, by: 170 });
    case 'ch2-5-2': return Object.assign(base, {
      primary: { x: 270, y: 245 },
      P: { x: 270, y: 245 },
      theta: 0,
      icX: 270,
      icY: 245,
      ax: 220,
      ay: 180,
      bx: 360,
      by: 180
    });
    case 'ch2-5-3': return Object.assign(base, { phi: 0, ex: 338, ey: 238, L: 220 });
    case 'ch2-7-1': return Object.assign(base, { step: 0, xVal: 5, vVal: 0, aVal: 0 });
    case 'ch2-7-2': return Object.assign(base, { xVal: 5, vVal: 0, errorX: 0, errorV: 0, status: 'OK', x0: 5, v0: 0, a0: 0 });
    default: return base;
  }
}

function buildControls(routeId, forceLabel, secondKey, secondLabel) {
  const sliders = [
    { type: 'slider', key: 'omega', label: forceLabel, min: 0.1, max: 4, value: 1.5, step: 0.1, unit: 'rad/s' },
    { type: 'slider', key: secondKey, label: secondLabel, min: 0, max: maxFor(secondKey), value: defaultFor(secondKey), step: stepFor(secondKey), unit: unitFor(secondKey) }
  ];
  if (routeId === 'ch2-1-1') {
    sliders.push({ type: 'buttons', key: 'mode', options: ['Tròn', 'Elip', 'Parabol'] });
  }
  if (routeId === 'ch2-1-4') {
    sliders[1] = { type: 'buttons', key: 'mode', options: ['Thẳng', 'Tròn', 'Parabol'] };
    sliders.push({ type: 'slider', key: 't', label: 'Pha', min: 0, max: 6.28, value: 0, step: 0.05, unit: 'rad' });
  }
  return sliders;
}

function maxFor(key) {
  switch (key) {
    case 'alpha': return 2; case 'r1': return 80; case 'r2': return 90;
    case 'theta': return 360; case 'phi': return 360; case 'L': return 250;
    case 'vr': return 80; case 'step': return 2; case 'x0': return 20;
    default: return 90;
  }
}

function defaultFor(key) {
  switch (key) {
    case 'alpha': return 0; case 'r1': return 50; case 'r2': return 90;
    case 'theta': return 0; case 'phi': return 0; case 'L': return 220;
    case 'vr': return 30; case 'step': return 0; case 'x0': return 5;
    default: return 30;
  }
}

function stepFor(key) {
  switch (key) {
    case 'alpha': return 0.05; case 'L': return 5; case 'step': return 1;
    default: return 1;
  }
}

function unitFor(key) {
  switch (key) {
    case 'alpha': return 'rad/s²'; case 'r1': case 'r2': return 'px';
    case 'theta': case 'phi': return '°'; case 'L': return 'px';
    case 'vr': return 'm/s'; case 'step': return ''; case 'x0': return 'm';
    default: return '';
  }
}

function readKey(label) {
  switch (label) {
    case '|v|': return 'speed';
    case 'phi': return 'theta';
    case 'omega': return 'omega';
    case 'x(t)': return 'xVal';
    case 'v(t)': return 'vVal';
    case 'a(t)': return 'aVal';
    case 'result': return 'step';
    case 'verify': return 'status';
    case 'IC_x': return 'icX';
    case 'IC_y': return 'icY';
    default: return label.toLowerCase().replace(/[^a-z0-9]/g, '');
  }
}

registry.registerMany(rows.map(scene));

})();
