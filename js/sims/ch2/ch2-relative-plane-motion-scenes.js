/**
 * Route scenes for Ch2 relative and plane motion labs.
 */
(function() {
'use strict';

const registry = window.SimSceneRegistry;
if (!registry) {
  console.warn('SimSceneRegistry missing for Ch2 relative/plane scenes');
  return;
}

const rows = [
  ['ch2-4-1', 'moving-frame-scenario', 'relative', 'Kịch bản hệ quy chiếu chuyển động', 'r = re + rr', 'Hệ quy chiếu chuyển động', 'Kéo hệ quy chiếu', 't', 'Thời gian kịch bản', 've/vr', 'Hệ quy chiếu'],
  ['ch2-4-2', 'motion-definition-toggle', 'relative', 'Chuyển động tuyệt đối - tương đối - kéo theo', 'va = ve + vr', 'Tuyệt đối - tương đối - kéo theo', 'Con trỏ định nghĩa', 't', 'Pha định nghĩa', 'va', 'vr'],
  ['ch2-4-3', 'velocity-composition-triangle', 'relative', 'Tam giác hợp vận tốc', 'vabs = vrel + vtrans', 'Tam giác vận tốc', 'Đầu mút vận tốc', 't', 'Pha véc tơ', '|v|', 'Tam giác'],
  ['ch2-4-4', 'coriolis-acceleration', 'relative', 'Gia tốc Coriolis', 'a = ae + ar + ac; ac = 2 omega x vr', 'Thành phần Coriolis', 'Đầu mút Coriolis', 'omega', 'Hệ quay omega', 'ac', 'Điều kiện triệt tiêu'],
  ['ch2-5-1', 'plane-motion-rigid-body', 'plane', 'Chuyển động phẳng vật rắn', 'vB = vA + omega x AB', 'Tịnh tiến cộng quay', 'Con trỏ vật', 'omega', 'Omega của vật', 'vB', 'omega'],
  ['ch2-5-2', 'instant-center-finder', 'plane', 'Tìm tâm vận tốc tức thời', 'v = omega r từ IC', 'Tâm vận tốc tức thời', 'Con trỏ IC', 'omega', 'Omega IC', 'P/IC', 'omega'],
  ['ch2-5-3', 'velocity-distribution', 'plane', 'Phân bố vận tốc', 'vB = vA + omega x AB', 'Phân bố vận tốc trên vật', 'Con trỏ điểm B', 'omega', 'Omega thanh', 'vB', 'Hình chiếu']
];

function scene(row, index) {
  const [routeId, template, family, title, formula, visualLabel, forceLabel, secondKey, secondLabel, read1, read2] = row;
  const instant = routeId === 'ch2-5-2';
  return {
    routeId,
    sceneId: `${routeId}-${template}`,
    template,
    family,
    title,
    formula,
    visualKey: `${template}-${index + 71}`,
    visualLabel,
    frameLabel: visualLabel,
    centerLabel: instant ? 'IC' : 'C',
    equation: formula,
    seed: index + 71,
    tScale: 90,
    tOrigin: 80,
    angle: -0.5 - index * 0.04,
    initialState: { primary: instant ? { x: 270, y: 245 } : { x: 148 + (index % 5) * 26, y: 236 - (index % 3) * 22 }, force: 76 + index * 7, omega: instant ? 1.2 : 1 + index * 0.18 },
    controls: [
      { type: 'slider', key: 'force', label: forceLabel, min: 20, max: 170, value: 78, step: 5, unit: '' },
      { type: 'slider', key: secondKey, label: secondLabel, min: 0, max: secondKey === 'omega' ? 4 : 5.5, value: instant ? 1.2 : 1.4, step: secondKey === 'omega' ? 0.1 : 0.1, unit: secondKey === 'omega' ? 'rad/s' : 's' }
    ],
    readouts: [
      { label: read1, key: read1 === 'P/IC' ? 'primary' : 'resultantMagnitude', digits: 1 },
      { label: read2, key: secondKey, digits: 2 }
    ]
  };
}

// Legacy draft scenes retained for reference. Canonical Ch2 scenes live in
// ch2-kinematics-scenes.js.

})();
