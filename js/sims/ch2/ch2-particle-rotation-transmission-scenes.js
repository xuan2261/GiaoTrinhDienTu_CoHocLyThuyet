/**
 * Route scenes for Ch2 particle, rotation, and transmission labs.
 */
(function() {
'use strict';

const registry = window.SimSceneRegistry;
if (!registry) {
  console.warn('SimSceneRegistry missing for Ch2 particle scenes');
  return;
}

const rows = [
  ['ch2-1-1', 'particle-vector-path', 'kinematics', 'Quỹ đạo véc tơ chất điểm', 'v = dr/dt; a = dv/dt', 'Quỹ đạo với v và a', 'Con trỏ thời gian', 't', 'Thời gian', 't', 'Quỹ đạo'],
  ['ch2-1-2', 'cartesian-motion-graphs', 'kinematics', 'Đồ thị chuyển động Đề các', 'x=x(t); y=y(t); vx=dx/dt', 'Đồ thị tọa độ Đề các', 'Con trỏ đồ thị', 't', 'Con trỏ t', 'x(t)', 'Độ dốc v'],
  ['ch2-1-3', 'natural-coordinate-frame', 'kinematics', 'Hệ tọa độ tự nhiên', 'a = at tau + an n; an = v^2/rho', 'Tiếp tuyến - pháp tuyến', 'Con trỏ độ cong', 'radius', 'Bán kính cong', 'at/an', 'rho'],
  ['ch2-1-4', 'motion-preset-gallery', 'kinematics', 'Thư viện chuyển động đặc biệt', 'So sánh thẳng, tròn, parabol', 'Bộ sưu tập chuyển động đặc biệt', 'Dòng thời gian', 't', 'Dòng thời gian t', 'Mẫu thiết lập', 'Dòng thời gian'],
  ['ch2-2-2', 'fixed-axis-rotation', 'rotation', 'Quay quanh trục cố định', 'v = omega r; at = epsilon r; an = omega^2 r', 'Đĩa quay quanh trục cố định', 'omega1', 'omega', 'Tốc độ góc', 'omega', 'at/an'],
  ['ch2-3-2', 'gear-belt-transmission', 'rotation', 'Truyền động bánh và dây', 'omega2 = omega1 r1/r2', 'Truyền động bánh - dây', 'omega vào', 'radius', 'Tỉ số bán kính', 'omega2', 'Không trượt']
];

function scene(row, index) {
  const [routeId, template, family, title, formula, visualLabel, forceLabel, secondKey, secondLabel, read1, read2] = row;
  const modes = routeId === 'ch2-1-1' ? ['Tròn', 'Elip', 'Parabol'] : (routeId === 'ch2-1-4' ? ['Thẳng', 'Tròn', 'Parabol'] : null);
  return {
    routeId,
    sceneId: `${routeId}-${template}`,
    template,
    family,
    title,
    formula,
    visualKey: `${template}-${index + 51}`,
    visualLabel,
    axisLabel: read1,
    seed: index + 51,
    tScale: 120,
    tOrigin: 80,
    angle: -0.35 - index * 0.08,
    initialState: { primary: { x: 150 + index * 26, y: 238 - (index % 3) * 24 }, force: 72 + index * 8, mode: 'Tròn', omega: routeId === 'ch2-5-2' ? 1.2 : 1.1 + index * 0.25, radius: 40 + index * 6 },
    controls: [
      { type: 'slider', key: 'force', label: forceLabel, min: 20, max: 170, value: 80, step: 5, unit: '' },
      { type: 'slider', key: secondKey, label: secondLabel, min: 0, max: secondKey === 'radius' ? 90 : 5.5, value: secondKey === 'radius' ? 55 : 1.2, step: secondKey === 'radius' ? 1 : 0.1, unit: secondKey === 'radius' ? 'px' : 's' }
    ].concat(modes ? [{ type: 'buttons', key: 'mode', options: modes }] : []),
    readouts: [
      { label: read1, key: secondKey === 'omega' ? 'omega' : 't', digits: 2 },
      { label: read2, key: read2 === 'trajectory' ? 'mode' : 'transmission', digits: 2 }
    ]
  };
}

// Legacy draft scenes retained for reference. Canonical Ch2 scenes live in
// ch2-kinematics-scenes.js.

})();
