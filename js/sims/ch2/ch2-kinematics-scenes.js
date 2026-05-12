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
  ['ch2-1-1', 'trajectory', 'kinematics', 'Quỹ đạo chất điểm', '\\vec{a}=a_\\tau\\vec{\\tau}+a_n\\vec{n};\\ a_n=\\frac{v^2}{\\rho}', 'Quỹ đạo + vận tốc', 'omega', 't', 'Pha', '|v|', 'a_n'],
  ['ch2-1-2', 'graph-cursor', 'kinematics', 'Đồ thị x(t) v(t) a(t)', 'v=\\dot{x};\\ a=\\ddot{x}', 'Đồ thị động học', 'omega', 't', 'Con trỏ t', 'x(t)', 'v(t)'],
  ['ch2-1-3', 'natural-coords', 'kinematics', 'Tọa độ tự nhiên', '\\vec{v}=v\\vec{\\tau};\\ \\vec{a}=\\dot{v}\\vec{\\tau}+\\frac{v^2}{\\rho}\\vec{n}', 'Tiếp tuyến + pháp tuyến', 'omega', 'rho', 'Bán kính cong', 'a_t', 'a_n'],
  ['ch2-1-4', 'motion-presets', 'kinematics', 'Các dạng chuyển động', '\\vec{r}=\\vec{r}(t);\\ v=\\left|\\dot{\\vec{r}}\\right|', 'Mẫu quỹ đạo', 'omega', 'mode', 'Loại chuyển động', 'x', 'v'],
  ['ch2-2-2', 'fixed-axis-rotation', 'kinematics', 'Quay quanh trục cố định', '\\omega=\\dot{\\varphi};\\ \\varepsilon=\\dot{\\omega}', 'Đĩa quay quanh O', 'omega', 'alpha', 'Tốc độ góc đầu', 'phi', 'omega'],
  ['ch2-3-2', 'belt-gear-transmission', 'kinematics', 'Truyền động bánh răng', '\\omega_2=\\omega_1\\frac{r_1}{r_2}', 'Truyền động bánh - dây', 'omega', 'r1', 'Bán kính r1', 'omega2', 'v'],
  ['ch2-4-1', 'velocity-composition', 'kinematics', 'Hợp chuyển động', '\\vec{v}_a=\\vec{v}_e+\\vec{v}_r', 'Tam giác vận tốc', 'omega', 't', 'Pha vận tốc', '|v_a|', '|v_r|'],
  ['ch2-4-2', 'absolute-relative-transport', 'kinematics', 'Ba loại vận tốc', '\\vec{v}_a=\\vec{v}_e+\\vec{v}_r', 'Phân biệt v_a, v_r, v_e', 'omega', 't', 'Pha định nghĩa', '|v_a|', '|v_e|'],
  ['ch2-4-3', 'velocity-triangle', 'kinematics', 'Tam giác vận tốc', '\\vec{v}_a=\\vec{v}_e+\\vec{v}_r', 'Dựng tam giác', 'omega', 'phi', 'Góc pha', '|v_a|', '|v_r|'],
  ['ch2-4-4', 'coriolis-acceleration', 'kinematics', 'Gia tốc Coriolis', '\\vec{a}_c=2\\vec{\\omega}\\times\\vec{v}_r', 'Gia tốc Coriolis', 'omega', 'vrMag', 'Vận tốc tương đối', '|a_c|', 'a_e'],
  ['ch2-5-1', 'plane-translation-rotation', 'kinematics', 'Tịnh tiến + quay phẳng', '\\vec{v}_B=\\vec{v}_A+\\vec{\\omega}\\times\\overrightarrow{AB}', 'Chuyển động phẳng', 'omega', 'phi', 'Tốc độ góc thanh', '|v_A|', '|v_B|'],
  ['ch2-5-2', 'instant-center-velocity', 'kinematics', 'Tâm vận tốc tức thời', '\\vec{v}_A=\\vec{\\omega}\\times\\overrightarrow{IA}', 'Tâm tức thời cơ cấu trượt-quay', 'omega', 'theta', 'Tốc độ góc điều khiển', 'IC_x', 'IC_y'],
  ['ch2-5-3', 'velocity-distribution', 'kinematics', 'Phân bố vận tốc', '\\vec{v}_A=\\vec{\\omega}\\times\\overrightarrow{IA}', 'Thanh quay', 'omega', 'L', 'Chiều dài thanh', '|v_A|', '|v_B|'],
  ['ch2-7-1', 'kinematics-solver', 'checker', 'Giải bài động học', 'v = dx/dt; a = dv/dt', 'Giải theo đồ thị', 'omega', 'step', 'Bước', 'Bước giải', 'Kiểm tra'],
  ['ch2-7-2', 'numeric-verifier', 'checker', 'Kiểm tra số liệu x(t)', 'dv/dt = a, dx/dt = v', 'Kiểm tra nhất quán', 'omega', 'x0', 'Điều kiện đầu', 'Sai số', 'Trạng thái']
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
    case 'ch2-1-1': return Object.assign(base, {
      mode: 'Elip', currentX: 492, currentY: 224, vx: 0, vy: 138, ax: -319.5, ay: 0,
      speed: 138, at: 0, an: 319.5, rho: 59.6, atx: 0, aty: 0, anx: -319.5, any: 0, alpha: 0
    });
    case 'ch2-1-2': return Object.assign(base, { cursorX: 56, cursorY: 130, xVal: 0, vVal: 54, aVal: 0 });
    case 'ch2-1-3': return Object.assign(base, { px: 454, py: 224, vx: 0, vy: 104, an: 104, at: 0, rho: 104 });
    case 'ch2-1-4': return Object.assign(base, { mode: 'Elip', px: 492, py: 224, speed: 138 });
    case 'ch2-2-2': return Object.assign(base, { theta: 0, omegaCur: 1.5, alpha: 0, r: 92, _t: 0 });
    case 'ch2-3-2': return Object.assign(base, { phi1: 0, phi2: 0, r1: 50, r2: 90, omega2: 1.0 });
    case 'ch2-4-1': return Object.assign(base, { ve: { vx: 60, vy: -30 }, vr: { vx: 40, vy: 40 }, va: { vx: 100, vy: 10 }, vaMag: 100.5, vrMag: 56.6, veMag: 67.1 });
    case 'ch2-4-2': return Object.assign(base, { mode: 'tuyệt đối', va: { vx: 55, vy: 0 }, ve: { vx: 30, vy: 0 }, vr: { vx: 25, vy: 0 }, vaMag: 55, vrMag: 25, veMag: 30 });
    case 'ch2-4-3': return Object.assign(base, { phi: 0, ve: { vx: 60, vy: 0 }, vr: { vx: 0, vy: 40 }, va: { vx: 60, vy: 40 }, vaMag: 72.1, vrMag: 40 });
    case 'ch2-4-4': return Object.assign(base, { theta: 0, px: 360, py: 180, vrx: 30, vry: 0, vrMag: 30, vr: { vx: 30, vy: 0 }, ac: { vx: 0, vy: 90 }, coriolis: 90 });
    case 'ch2-5-1': return Object.assign(base, { phi: 0, ox: 180, oy: 170, ax: 260, ay: 170, bx: 420, by: 170, vAMag: 46.7, vBMag: 245 });
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
    case 'ch2-5-3': return Object.assign(base, { phi: 0, ex: 338, ey: 238, L: 220, vAMag: 0, vBMag: 330 });
    case 'ch2-7-1': return Object.assign(base, { step: 0, xVal: 5, vVal: 0, aVal: 0 });
    case 'ch2-7-2': return Object.assign(base, { xVal: 5, vVal: 0, errorX: 0, errorV: 0, status: 'Đúng', x0: 5, v0: 0, a0: 0 });
    default: return base;
  }
}

function buildControls(routeId, forceLabel, secondKey, secondLabel) {
  const sliders = [
    { type: 'slider', key: 'omega', label: forceLabel, min: 0.1, max: 4, value: 1.5, step: 0.1, unit: 'rad/s' },
    { type: 'slider', key: secondKey, label: secondLabel, min: minFor(secondKey), max: maxFor(secondKey), value: defaultFor(secondKey), step: stepFor(secondKey), unit: unitFor(secondKey) }
  ];
  if (routeId === 'ch2-1-1') {
    sliders.push({ type: 'buttons', key: 'mode', options: ['Tròn', 'Elip', 'Parabol'] });
  }
  if (routeId === 'ch2-1-4') {
    sliders[1] = { type: 'buttons', key: 'mode', label: 'Quỹ đạo', options: ['Tròn', 'Elip', 'Parabol'] };
    sliders.push({ type: 'slider', key: 't', label: 'Pha', min: 0, max: 6.28, value: 0, step: 0.05, unit: 'rad' });
  }
  return sliders;
}

function maxFor(key) {
  switch (key) {
    case 'alpha': return 2; case 'r1': return 80; case 'r2': return 90;
    case 'theta': return 360; case 'phi': return 360; case 't': return 6.28; case 'L': return 260; case 'rho': return 180;
    case 'vr': case 'vrMag': return 80; case 'step': return 2; case 'x0': return 20;
    default: return 90;
  }
}

function minFor(key) {
  switch (key) {
    case 'L': return 80;
    case 'rho': return 60;
    default: return 0;
  }
}

function defaultFor(key) {
  switch (key) {
    case 'alpha': return 0; case 'r1': return 50; case 'r2': return 90;
    case 'theta': return 0; case 'phi': return 0; case 't': return 0; case 'L': return 220; case 'rho': return 104;
    case 'vr': case 'vrMag': return 30; case 'step': return 0; case 'x0': return 5;
    default: return 30;
  }
}

function stepFor(key) {
  switch (key) {
    case 'alpha': return 0.05; case 't': return 0.05; case 'L': return 5; case 'step': return 1;
    default: return 1;
  }
}

function unitFor(key) {
  switch (key) {
    case 'alpha': return 'rad/s²'; case 'r1': case 'r2': return 'px';
    case 'theta': case 'phi': return '°'; case 't': return 'rad'; case 'L': return 'px';
    case 'vr': case 'vrMag': return 'm/s'; case 'step': return ''; case 'x0': return 'm';
    default: return '';
  }
}

function readKey(label) {
  switch (label) {
    case '|v|': return 'speed';
    case 'a_n': return 'an';
    case 'a_t': return 'at';
    case 'phi': return 'theta';
    case 'omega': return 'omega';
    case 'x(t)': return 'xVal';
    case 'v(t)': return 'vVal';
    case 'a(t)': return 'aVal';
    case 'result': return 'step';
    case 'verify': return 'status';
    case 'Bước giải': return 'step';
    case 'Kiểm tra': return 'status';
    case 'Sai số': return 'errorV';
    case 'Trạng thái': return 'status';
    case 'IC_x': return 'icX';
    case 'IC_y': return 'icY';
    case '|v_a|': return 'vaMag';
    case '|v_e|': return 'veMag';
    case '|v_r|': return 'vrMag';
    case '|v_A|': return 'vAMag';
    case '|v_B|': return 'vBMag';
    case '|a_c|': return 'coriolis';
    default: return label.toLowerCase().replace(/[^a-z0-9]/g, '');
  }
}

registry.registerMany(rows.map(scene));

})();
