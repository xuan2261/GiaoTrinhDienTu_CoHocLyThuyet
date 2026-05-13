/**
 * All 18 Ch3 dynamics route scenes — registered with SimSceneRegistry.
 * Covers: Newton's laws (ch3-1-2..ch3-2-5), ODE solvers (ch3-3-1..ch3-3-2),
 * D'Alembert (ch3-4-1..ch3-4-2), theorems (ch3-5-1..ch3-5-4),
 * collisions (ch3-6-2..ch3-6-3), checkers (ch3-7-1..ch3-7-2).
 */
(function() {
'use strict';

const registry = window.SimSceneRegistry;
if (!registry) {
  console.warn('SimSceneRegistry missing for Ch3 dynamics scenes');
  return;
}

const rows = [
  ['ch3-1-2', 'force-to-acceleration', 'dynamics',
   'Lực tổng → gia tốc', 'F = ma',
   'Lực tổng tạo gia tốc', 'Lực F', 'm', 'Khối lượng m'],
  ['ch3-1-3', 'inertial-frame', 'dynamics',
   'Hệ quy chiếu quán tính', 'F* = -ma',
   'Hệ quy chiếu quán tính', 'a_frame', 'm', 'Khối lượng m'],
  ['ch3-2-1', 'inertia-law', 'dynamics',
   'Định luật quán tính', 'F=0 → v=const',
   'Quán tính', 'F', 'alpha', 'Góc lực'],
  ['ch3-2-2', 'newton-second', 'dynamics',
   'Định luật Newton II', 'F = ma',
   'F = ma', 'F', 'm', 'Lực F'],
  ['ch3-2-3', 'newton-third', 'dynamics',
   'Định luật Newton III', 'F_AB = -F_BA',
   'Tương tác', 'F', 'm2', 'Lực F'],
  ['ch3-2-5', 'dynamic-fbd', 'dynamics',
   'Sơ đồ FBD động lực', 'F + F* = 0',
   'FBD với lực quán tính', 'F', 'm', 'Lực F'],
  ['ch3-3-1', 'ode-solver', 'dynamics',
   'Tích phân phương trình vi phân', 'x″ + k/m·x = 0',
   'Spring-mass RK4', 'k', 'm', 'Hệ số lò xo'],
  ['ch3-3-2', 'coupled-spring', 'dynamics',
   'Cơ hệ 2 khối nối lò xo', 'x1″ = k(x2-x1)/m1',
   'Hai khối dao động', 'k', 'm1', 'Hệ số lò xo'],
  ['ch3-4-1', 'dalembert-equilibrium', 'dynamics',
   'Cân bằng động D’Alembert', 'F + F* = 0',
   'D’Alembert', 'F', 'm', 'Lực F'],
  ['ch3-4-2', 'inverse-dynamics', 'dynamics',
   'Ngược từ chuyển động suy lực', 'a → F',
   'Suy lực từ a(t)', 'a', 'm', 'Gia tốc a(t)'],
  ['ch3-5-1', 'center-of-mass', 'dynamics',
   'Định lý khối tâm', 'm·a_CM = ΣF_ext',
   'Khối tâm hệ', 'm1', 'm2', 'Khối lượng 1'],
  ['ch3-5-2', 'impulse-momentum', 'dynamics',
   'Xung lượng - động lượng', 'J = Δp',
   'Impulse-Momentum', 'J', 'm', 'Xung lượng'],
  ['ch3-5-3', 'angular-momentum', 'dynamics',
   'Mô men động lượng', 'L = Iω',
   'Mô men động lượng', 'I', 'omega', 'Mô men quán tính'],
  ['ch3-5-4', 'work-energy-theorem', 'dynamics',
   'Định lý động năng', 'A = ΔT',
   'Work-Energy', 'T', 'V', 'Động năng'],
  ['ch3-6-2', 'collision-2d', 'dynamics',
   'Va chạm 2D', 'p_1+p_2=const',
   'Va chạm 2D', 'e', 'm1', 'Hệ số e'],
  ['ch3-6-3', 'collision-solver', 'dynamics',
   'Giải bài va chạm', 'bảo toàn p, e',
   'Numeric collision', 'v1', 'v2', 'Vận tốc 1'],
  ['ch3-7-1', 'theorem-selector', 'dynamics',
   'Chọn định lý phù hợp', 'I/M, W/E, L',
   'Chọn định lý', 'loai', 'problem', 'Loại bài toán'],
  ['ch3-7-2', 'dynamics-numeric', 'dynamics',
   'Kiểm tra số liệu động lực', 'kiểm tra định lý',
   'Kiểm tra', 'T', 'V', 'Động năng']
];

function buildInitial(routeId) {
  const base = {
    x: 0, v: 0, t: 0, _t: 0,
    trajectory: [], trajectory2: [],
    F: 50, m: 5, k: 20, e: 1,
    m1: 1, m2: 1,
    impulseT: 0, impulseF: 0,
    I: 1, omega: 2, r: 60,
    selectedTheorem: null, problemType: 0,
    v0: 3,
    a_frame: 2,
    alpha: 0
  };
  if (routeId === 'ch3-3-1') Object.assign(base, { x: 0.8, spring: 0.8 });
  if (routeId === 'ch3-3-2') Object.assign(base, { x: 0.45, x2: -0.25, m2: 2 });
  if (routeId === 'ch3-5-1') Object.assign(base, { masses: [
    { x: 130, y: 188, m: 2 },
    { x: 238, y: 130, m: 1.5 },
    { x: 332, y: 204, m: 1 }
  ] });
  if (routeId === 'ch3-5-4') Object.assign(base, { v: 3, kineticEnergy: 22.5, potentialEnergy: 0 });
  if (routeId === 'ch3-6-2') Object.assign(base, {
    ball1: { x: 150, y: 180, vx: 8, vy: 0 },
    ball2: { x: 380, y: 180, vx: -3, vy: 0 },
    collision: false, collisionX: 0, collisionY: 0
  });
  if (routeId === 'ch3-7-2') Object.assign(base, { residualScale: 0, score: 100, residual1: 0, residual2: 0, residual3: 0, residual4: 0 });
  return base;
}

function buildControls(routeId) {
  const ctrls = [
    { type: 'slider', key: 'F', label: 'Lực F', min: 0, max: 200, value: 50, step: 5, unit: 'N' }
  ];
  switch (routeId) {
    case 'ch3-1-2':
    case 'ch3-2-2':
    case 'ch3-2-3':
    case 'ch3-2-5':
    case 'ch3-4-1':
    case 'ch3-4-2':
      ctrls.push({ type: 'slider', key: 'm', label: 'm', min: 0.5, max: 10, value: 5, step: 0.5, unit: 'kg' });
      break;
    case 'ch3-1-3':
      ctrls.push({ type: 'slider', key: 'a_frame', label: 'a', min: 0, max: 5, value: 2, step: 0.1, unit: 'm/s²' });
      break;
    case 'ch3-2-1':
      ctrls.push({ type: 'slider', key: 'alpha', label: 'Góc', min: 0, max: 90, value: 0, step: 1, unit: 'deg' });
      break;
    case 'ch3-3-1':
    case 'ch3-3-2':
      ctrls.push({ type: 'slider', key: 'k', label: 'k', min: 1, max: 50, value: 20, step: 1, unit: 'N/m' });
      ctrls.push({ type: 'slider', key: 'm', label: 'm', min: 0.5, max: 10, value: 2, step: 0.5, unit: 'kg' });
      break;
    case 'ch3-5-1':
      ctrls.push({ type: 'slider', key: 'm1', label: 'm1', min: 0.5, max: 5, value: 2, step: 0.5, unit: 'kg' });
      ctrls.push({ type: 'slider', key: 'm2', label: 'm2', min: 0.5, max: 5, value: 1.5, step: 0.5, unit: 'kg' });
      break;
    case 'ch3-5-2':
      ctrls.push({ type: 'slider', key: 'J', label: 'J', min: 0, max: 100, value: 20, step: 1, unit: 'N·s' });
      ctrls.push({ type: 'slider', key: 'm', label: 'm', min: 0.5, max: 5, value: 2, step: 0.5, unit: 'kg' });
      break;
    case 'ch3-5-3':
      ctrls.push({ type: 'slider', key: 'I', label: 'I', min: 0.1, max: 5, value: 1, step: 0.1, unit: 'kg·m²' });
      ctrls.push({ type: 'slider', key: 'omega', label: 'ω', min: 0.1, max: 5, value: 2, step: 0.1, unit: 'rad/s' });
      break;
    case 'ch3-5-4':
      ctrls.push({ type: 'slider', key: 'v0', label: 'v0', min: 0, max: 10, value: 3, step: 0.5, unit: 'm/s' });
      break;
    case 'ch3-6-2':
      ctrls.push({ type: 'slider', key: 'e', label: 'e', min: 0, max: 1, value: 1, step: 0.05, unit: '' });
      ctrls.push({ type: 'slider', key: 'm1', label: 'm1', min: 0.5, max: 10, value: 1, step: 0.5, unit: 'kg' });
      ctrls.push({ type: 'slider', key: 'm2', label: 'm2', min: 0.5, max: 10, value: 1, step: 0.5, unit: 'kg' });
      break;
    case 'ch3-6-3':
      ctrls.push({ type: 'slider', key: 'v1', label: 'v1', min: -10, max: 10, value: 5, step: 0.5, unit: 'm/s' });
      ctrls.push({ type: 'slider', key: 'v2', label: 'v2', min: -10, max: 10, value: -3, step: 0.5, unit: 'm/s' });
      ctrls.push({ type: 'slider', key: 'e', label: 'e', min: 0, max: 1, value: 0.8, step: 0.05, unit: '' });
      break;
    case 'ch3-7-1':
      ctrls.push({ type: 'slider', key: 'problemType', label: 'Bài toán', min: 0, max: 3, value: 0, step: 1, unit: '' });
      break;
    case 'ch3-7-2':
      ctrls.push({ type: 'slider', key: 'residualScale', label: 'Độ nhiễu', min: 0, max: 2, value: 1, step: 0.1, unit: '' });
      break;
  }
  return ctrls;
}

function readoutsFor(routeId) {
  switch (routeId) {
    case 'ch3-2-3':
      return [{ label: 'a1', key: 'a1', digits: 2, unit: 'm/s²' }, { label: 'a2', key: 'a2', digits: 2, unit: 'm/s²' }];
    case 'ch3-3-1':
      return [{ label: 'T', key: 'kinetic', digits: 2, unit: 'J' }, { label: 'V', key: 'potential', digits: 2, unit: 'J' }];
    case 'ch3-3-2':
      return [{ label: 'x1', key: 'x1', digits: 2 }, { label: 'x2', key: 'x2', digits: 2 }];
    case 'ch3-5-1':
      return [{ label: 'a_CM', key: 'aCM', digits: 2, unit: 'm/s²' }, { label: 'x_C', key: 'xCM', digits: 0 }];
    case 'ch3-5-2':
      return [{ label: 'p trước', key: 'pBefore', digits: 1 }, { label: 'Δp', key: 'deltaP', digits: 1 }];
    case 'ch3-5-3':
      return [{ label: 'L', key: 'L', digits: 2 }, { label: 'ω', key: 'omega', digits: 2, unit: 'rad/s' }];
    case 'ch3-5-4':
      return [{ label: 'T', key: 'kineticEnergy', digits: 2, unit: 'J' }, { label: 'V', key: 'potentialEnergy', digits: 2, unit: 'J' }];
    case 'ch3-6-2':
    case 'ch3-6-3':
      return [{ label: 'p trước', key: 'pBefore', digits: 1 }, { label: 'p sau', key: 'pAfter', digits: 1 }];
    case 'ch3-7-1':
      return [{ label: 'định lý', key: 'selectedTheorem' }, { label: 'F', key: 'force', digits: 1, unit: 'N' }];
    case 'ch3-7-2':
      return [{ label: 'điểm', key: 'score', digits: 0 }, { label: 'r1', key: 'residual1', digits: 3 }];
    default:
      return [{ label: 'a', key: 'accel', scale: 1, digits: 2, unit: 'm/s²' }, { label: 'v', key: 'v', scale: 1, digits: 2, unit: 'm/s' }];
  }
}

function scene(row, index) {
  const [routeId, template, family, title, formula, visualLabel, forceLabel, secondKey, secondLabel] = row;
  return {
    routeId,
    sceneId: `${routeId}-${template}`,
    template,
    family,
    title,
    formula,
    visualKey: `${template}-${index + 31}`,
    visualLabel,
    seed: index + 31,
    initialState: buildInitial(routeId),
    controls: buildControls(routeId),
    readouts: readoutsFor(routeId)
  };
}

registry.registerMany(rows.map(scene));

})();
